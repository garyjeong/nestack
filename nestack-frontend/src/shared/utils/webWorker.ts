import { useRef, useCallback, useEffect, useState } from 'react'

// ============================================
// Types
// ============================================

interface WorkerMessage<T = unknown> {
  id: string
  type: 'task' | 'result' | 'error' | 'progress'
  payload: T
}

interface WorkerTask<TOutput> {
  id: string
  resolve: (value: TOutput) => void
  reject: (error: Error) => void
  onProgress?: (progress: number) => void
}

// ============================================
// Create Worker from Function
// ============================================

/**
 * Creates a Web Worker from a function
 * The function will be serialized and run in a worker context
 */
export function createWorkerFromFunction<TInput, TOutput>(
  fn: (input: TInput, reportProgress?: (progress: number) => void) => TOutput
): Worker {
  const workerCode = `
    const workerFn = ${fn.toString()};

    self.onmessage = function(e) {
      const { id, payload } = e.data;

      try {
        const reportProgress = (progress) => {
          self.postMessage({ id, type: 'progress', payload: progress });
        };

        const result = workerFn(payload, reportProgress);

        // Handle promises
        if (result && typeof result.then === 'function') {
          result
            .then((value) => {
              self.postMessage({ id, type: 'result', payload: value });
            })
            .catch((error) => {
              self.postMessage({ id, type: 'error', payload: error.message });
            });
        } else {
          self.postMessage({ id, type: 'result', payload: result });
        }
      } catch (error) {
        self.postMessage({ id, type: 'error', payload: error.message });
      }
    };
  `

  const blob = new Blob([workerCode], { type: 'application/javascript' })
  const url = URL.createObjectURL(blob)
  const worker = new Worker(url)

  // Cleanup URL after worker is created
  URL.revokeObjectURL(url)

  return worker
}

// ============================================
// Worker Pool
// ============================================

interface WorkerPoolOptions {
  /** Maximum number of workers (default: navigator.hardwareConcurrency or 4) */
  maxWorkers?: number
  /** Worker factory function */
  createWorker: () => Worker
}

interface PooledTask<TOutput> {
  id: string
  resolve: (value: TOutput) => void
  reject: (error: Error) => void
}

export class WorkerPool<TInput, TOutput> {
  private workers: Worker[] = []
  private taskQueue: Array<{ input: TInput; task: PooledTask<TOutput> }> = []
  private activeTasks = new Map<string, PooledTask<TOutput>>()
  private workerAvailability: boolean[] = []
  private maxWorkers: number
  private createWorker: () => Worker

  constructor(options: WorkerPoolOptions) {
    this.maxWorkers = options.maxWorkers || (typeof navigator !== 'undefined' ? navigator.hardwareConcurrency : 4) || 4
    this.createWorker = options.createWorker
  }

  private getAvailableWorkerIndex(): number {
    // Find available worker
    for (let i = 0; i < this.workers.length; i++) {
      if (this.workerAvailability[i]) {
        return i
      }
    }

    // Create new worker if under limit
    if (this.workers.length < this.maxWorkers) {
      const worker = this.createWorker()
      const index = this.workers.length
      this.workers.push(worker)
      this.workerAvailability.push(true)

      worker.onmessage = (e: MessageEvent<WorkerMessage<TOutput>>) => {
        const { id, type, payload } = e.data
        const task = this.activeTasks.get(id)

        if (task) {
          if (type === 'result') {
            task.resolve(payload)
            this.activeTasks.delete(id)
            this.workerAvailability[index] = true
            this.processQueue()
          } else if (type === 'error') {
            task.reject(new Error(payload as unknown as string))
            this.activeTasks.delete(id)
            this.workerAvailability[index] = true
            this.processQueue()
          }
        }
      }

      return index
    }

    return -1
  }

  private processQueue(): void {
    while (this.taskQueue.length > 0) {
      const workerIndex = this.getAvailableWorkerIndex()
      if (workerIndex === -1) break

      const queuedTask = this.taskQueue.shift()!
      this.executeTask(workerIndex, queuedTask.input, queuedTask.task)
    }
  }

  private executeTask(
    workerIndex: number,
    input: TInput,
    task: PooledTask<TOutput>
  ): void {
    this.workerAvailability[workerIndex] = false
    this.activeTasks.set(task.id, task)
    this.workers[workerIndex].postMessage({
      id: task.id,
      type: 'task',
      payload: input,
    })
  }

  exec(input: TInput): Promise<TOutput> {
    return new Promise((resolve, reject) => {
      const task: PooledTask<TOutput> = {
        id: Math.random().toString(36).slice(2),
        resolve,
        reject,
      }

      const workerIndex = this.getAvailableWorkerIndex()

      if (workerIndex !== -1) {
        this.executeTask(workerIndex, input, task)
      } else {
        this.taskQueue.push({ input, task })
      }
    })
  }

  terminate(): void {
    this.workers.forEach((worker) => worker.terminate())
    this.workers = []
    this.workerAvailability = []
    this.activeTasks.clear()
    this.taskQueue = []
  }
}

// ============================================
// useWorker Hook
// ============================================

interface UseWorkerOptions<TInput, TOutput> {
  /** Worker function */
  workerFn: (input: TInput, reportProgress?: (progress: number) => void) => TOutput
}

interface UseWorkerResult<TInput, TOutput> {
  /** Execute the worker function */
  exec: (input: TInput) => Promise<TOutput>
  /** Current progress (0-100) */
  progress: number
  /** Whether the worker is currently busy */
  isLoading: boolean
  /** Last error if any */
  error: Error | null
  /** Terminate the worker */
  terminate: () => void
}

/**
 * Hook for using Web Workers
 */
export function useWorker<TInput, TOutput>(
  options: UseWorkerOptions<TInput, TOutput>
): UseWorkerResult<TInput, TOutput> {
  const workerRef = useRef<Worker | null>(null)
  const tasksRef = useRef<Map<string, WorkerTask<TOutput>>>(new Map())
  const [isLoading, setIsLoading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState<Error | null>(null)

  // Initialize worker
  useEffect(() => {
    workerRef.current = createWorkerFromFunction(options.workerFn)

    workerRef.current.onmessage = (e: MessageEvent<WorkerMessage>) => {
      const { id, type, payload } = e.data
      const task = tasksRef.current.get(id)

      if (!task) return

      switch (type) {
        case 'result':
          task.resolve(payload as TOutput)
          tasksRef.current.delete(id)
          setIsLoading(tasksRef.current.size > 0)
          setProgress(0)
          break
        case 'error':
          const err = new Error(payload as string)
          task.reject(err)
          setError(err)
          tasksRef.current.delete(id)
          setIsLoading(tasksRef.current.size > 0)
          break
        case 'progress':
          setProgress(payload as number)
          task.onProgress?.(payload as number)
          break
      }
    }

    workerRef.current.onerror = (e) => {
      const err = new Error(e.message)
      setError(err)
      setIsLoading(false)
    }

    return () => {
      workerRef.current?.terminate()
    }
  }, [options.workerFn])

  const exec = useCallback((input: TInput): Promise<TOutput> => {
    return new Promise((resolve, reject) => {
      if (!workerRef.current) {
        reject(new Error('Worker not initialized'))
        return
      }

      const id = Math.random().toString(36).slice(2)
      const task: WorkerTask<TOutput> = {
        id,
        resolve,
        reject,
        onProgress: setProgress,
      }

      tasksRef.current.set(id, task)
      setIsLoading(true)
      setError(null)

      workerRef.current.postMessage({
        id,
        type: 'task',
        payload: input,
      })
    })
  }, [])

  const terminate = useCallback(() => {
    workerRef.current?.terminate()
    workerRef.current = null
    tasksRef.current.clear()
    setIsLoading(false)
    setProgress(0)
  }, [])

  return {
    exec,
    progress,
    isLoading,
    error,
    terminate,
  }
}

// ============================================
// useWorkerPool Hook
// ============================================

interface UseWorkerPoolOptions<TInput, TOutput> {
  /** Worker function */
  workerFn: (input: TInput) => TOutput
  /** Maximum number of workers */
  maxWorkers?: number
}

interface UseWorkerPoolResult<TInput, TOutput> {
  /** Execute the worker function */
  exec: (input: TInput) => Promise<TOutput>
  /** Execute multiple inputs in parallel */
  execAll: (inputs: TInput[]) => Promise<TOutput[]>
  /** Number of pending tasks */
  pendingCount: number
  /** Terminate all workers */
  terminate: () => void
}

/**
 * Hook for using a pool of Web Workers
 */
export function useWorkerPool<TInput, TOutput>(
  options: UseWorkerPoolOptions<TInput, TOutput>
): UseWorkerPoolResult<TInput, TOutput> {
  const poolRef = useRef<WorkerPool<TInput, TOutput> | null>(null)
  const [pendingCount, setPendingCount] = useState(0)

  useEffect(() => {
    poolRef.current = new WorkerPool<TInput, TOutput>({
      maxWorkers: options.maxWorkers,
      createWorker: () => createWorkerFromFunction(options.workerFn),
    })

    return () => {
      poolRef.current?.terminate()
    }
  }, [options.workerFn, options.maxWorkers])

  const exec = useCallback((input: TInput): Promise<TOutput> => {
    if (!poolRef.current) {
      return Promise.reject(new Error('Worker pool not initialized'))
    }

    setPendingCount((c) => c + 1)

    return poolRef.current.exec(input).finally(() => {
      setPendingCount((c) => c - 1)
    })
  }, [])

  const execAll = useCallback((inputs: TInput[]): Promise<TOutput[]> => {
    return Promise.all(inputs.map(exec))
  }, [exec])

  const terminate = useCallback(() => {
    poolRef.current?.terminate()
    setPendingCount(0)
  }, [])

  return {
    exec,
    execAll,
    pendingCount,
    terminate,
  }
}

// ============================================
// Utility Functions
// ============================================

/**
 * Run a function off the main thread
 */
export async function runOffMainThread<TInput, TOutput>(
  fn: (input: TInput) => TOutput,
  input: TInput
): Promise<TOutput> {
  const worker = createWorkerFromFunction(fn)

  return new Promise((resolve, reject) => {
    const id = Math.random().toString(36).slice(2)

    worker.onmessage = (e: MessageEvent<WorkerMessage>) => {
      const { type, payload } = e.data

      if (type === 'result') {
        resolve(payload as TOutput)
      } else if (type === 'error') {
        reject(new Error(payload as string))
      }

      worker.terminate()
    }

    worker.onerror = (e) => {
      reject(new Error(e.message))
      worker.terminate()
    }

    worker.postMessage({ id, type: 'task', payload: input })
  })
}

/**
 * Check if Web Workers are supported
 */
export function isWorkerSupported(): boolean {
  return typeof Worker !== 'undefined'
}

/**
 * Run heavy computation with automatic fallback
 */
export async function runHeavyTask<TInput, TOutput>(
  fn: (input: TInput) => TOutput,
  input: TInput,
  options: { useWorker?: boolean } = {}
): Promise<TOutput> {
  const { useWorker = true } = options

  if (useWorker && isWorkerSupported()) {
    return runOffMainThread(fn, input)
  }

  // Fallback to main thread with yielding
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(fn(input))
    }, 0)
  })
}
