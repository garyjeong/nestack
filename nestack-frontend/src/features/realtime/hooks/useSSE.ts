import { useEffect, useRef, useCallback, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useAppStore } from '@/app/store'
import { showToast } from '@/shared/components/feedback/Toast'
import { MISSIONS_QUERY_KEY } from '@/features/mission/hooks/useMissions'
import { BADGES_QUERY_KEY } from '@/features/badge/hooks'

// SSE Event Types
export type SSEEventType =
  | 'mission_updated'
  | 'mission_completed'
  | 'transaction_synced'
  | 'badge_earned'
  | 'family_updated'
  | 'connected'
  | 'heartbeat'

interface SSEEvent {
  type: SSEEventType
  data: Record<string, unknown>
  timestamp: string
}

interface UseSSEOptions {
  enabled?: boolean
  reconnectInterval?: number
  maxReconnectAttempts?: number
}

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:6001/api'

export function useSSE(options: UseSSEOptions = {}) {
  const {
    enabled = true,
    reconnectInterval = 5000,
    maxReconnectAttempts = 10,
  } = options

  const queryClient = useQueryClient()
  const { user, isAuthenticated } = useAppStore()
  const [isConnected, setIsConnected] = useState(false)
  const [connectionError, setConnectionError] = useState<string | null>(null)

  const eventSourceRef = useRef<EventSource | null>(null)
  const reconnectAttemptsRef = useRef(0)
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Handle incoming SSE events
  const handleEvent = useCallback(
    (event: SSEEvent) => {
      switch (event.type) {
        case 'connected':
          setIsConnected(true)
          setConnectionError(null)
          reconnectAttemptsRef.current = 0
          break

        case 'mission_updated':
          queryClient.invalidateQueries({ queryKey: MISSIONS_QUERY_KEY })
          queryClient.invalidateQueries({ queryKey: ['mission-summary'] })
          break

        case 'mission_completed':
          queryClient.invalidateQueries({ queryKey: MISSIONS_QUERY_KEY })
          queryClient.invalidateQueries({ queryKey: ['mission-summary'] })
          showToast.success(
            '미션 완료',
            event.data.missionName
              ? `${event.data.missionName} 미션이 완료되었습니다!`
              : '미션이 완료되었습니다!'
          )
          break

        case 'transaction_synced':
          queryClient.invalidateQueries({ queryKey: ['transactions'] })
          queryClient.invalidateQueries({ queryKey: ['accounts'] })
          queryClient.invalidateQueries({ queryKey: ['finance-summary'] })
          break

        case 'badge_earned':
          queryClient.invalidateQueries({ queryKey: BADGES_QUERY_KEY })
          showToast.success(
            '뱃지 획득',
            event.data.badgeName
              ? `${event.data.badgeName} 뱃지를 획득했습니다!`
              : '새로운 뱃지를 획득했습니다!'
          )
          break

        case 'family_updated':
          queryClient.invalidateQueries({ queryKey: ['family'] })
          break

        case 'heartbeat':
          // Keep-alive, no action needed
          break

        default:
          console.log('[SSE] Unknown event type:', event.type)
      }
    },
    [queryClient]
  )

  // Connect to SSE endpoint
  const connect = useCallback(() => {
    if (!isAuthenticated || !user?.id) {
      return
    }

    // Close existing connection
    if (eventSourceRef.current) {
      eventSourceRef.current.close()
    }

    try {
      // Create SSE connection with credentials
      const url = `${API_BASE_URL}/sse/events`
      const eventSource = new EventSource(url, { withCredentials: true })

      eventSource.onopen = () => {
        console.log('[SSE] Connection opened')
        setIsConnected(true)
        setConnectionError(null)
        reconnectAttemptsRef.current = 0
      }

      eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data) as SSEEvent
          handleEvent(data)
        } catch (error) {
          console.error('[SSE] Failed to parse event:', error)
        }
      }

      eventSource.onerror = (error) => {
        console.error('[SSE] Connection error:', error)
        setIsConnected(false)
        setConnectionError('Connection lost')
        eventSource.close()

        // Attempt to reconnect
        if (reconnectAttemptsRef.current < maxReconnectAttempts) {
          reconnectAttemptsRef.current += 1
          console.log(
            `[SSE] Reconnecting... attempt ${reconnectAttemptsRef.current}/${maxReconnectAttempts}`
          )

          reconnectTimeoutRef.current = setTimeout(() => {
            connect()
          }, reconnectInterval)
        } else {
          console.error('[SSE] Max reconnection attempts reached')
          setConnectionError('Unable to connect. Please refresh the page.')
        }
      }

      // Listen for specific event types
      eventSource.addEventListener('mission_updated', (event) => {
        try {
          const data = JSON.parse(event.data)
          handleEvent({ type: 'mission_updated', data, timestamp: new Date().toISOString() })
        } catch (error) {
          console.error('[SSE] Failed to parse mission_updated event:', error)
        }
      })

      eventSource.addEventListener('transaction_synced', (event) => {
        try {
          const data = JSON.parse(event.data)
          handleEvent({ type: 'transaction_synced', data, timestamp: new Date().toISOString() })
        } catch (error) {
          console.error('[SSE] Failed to parse transaction_synced event:', error)
        }
      })

      eventSource.addEventListener('badge_earned', (event) => {
        try {
          const data = JSON.parse(event.data)
          handleEvent({ type: 'badge_earned', data, timestamp: new Date().toISOString() })
        } catch (error) {
          console.error('[SSE] Failed to parse badge_earned event:', error)
        }
      })

      eventSourceRef.current = eventSource
    } catch (error) {
      console.error('[SSE] Failed to create EventSource:', error)
      setConnectionError('Failed to establish connection')
    }
  }, [isAuthenticated, user?.id, handleEvent, maxReconnectAttempts, reconnectInterval])

  // Disconnect from SSE endpoint
  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current)
      reconnectTimeoutRef.current = null
    }

    if (eventSourceRef.current) {
      eventSourceRef.current.close()
      eventSourceRef.current = null
    }

    setIsConnected(false)
    reconnectAttemptsRef.current = 0
  }, [])

  // Connect when component mounts and user is authenticated
  useEffect(() => {
    if (enabled && isAuthenticated && user?.id) {
      connect()
    }

    return () => {
      disconnect()
    }
  }, [enabled, isAuthenticated, user?.id, connect, disconnect])

  return {
    isConnected,
    connectionError,
    connect,
    disconnect,
  }
}
