import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/shared/utils/cn'

// ============================================
// Common Types
// ============================================

export interface ChartDataPoint {
  label: string
  value: number
  color?: string
}

// ============================================
// Bar Chart Component
// ============================================

interface BarChartProps {
  data: ChartDataPoint[]
  /** Chart height in pixels */
  height?: number
  /** Show value labels */
  showValues?: boolean
  /** Show bar labels */
  showLabels?: boolean
  /** Format value for display */
  formatValue?: (value: number) => string
  /** Horizontal orientation */
  horizontal?: boolean
  /** Bar color (default uses data color or primary) */
  barColor?: string
  /** Enable animation */
  animated?: boolean
  className?: string
}

export function BarChart({
  data,
  height = 200,
  showValues = true,
  showLabels = true,
  formatValue = (v) => v.toLocaleString(),
  horizontal = false,
  barColor,
  animated = true,
  className,
}: BarChartProps) {
  const maxValue = Math.max(...data.map((d) => d.value))

  if (horizontal) {
    return (
      <div className={cn('space-y-3', className)}>
        {data.map((item, index) => (
          <div key={item.label} className="space-y-1">
            {showLabels && (
              <div className="flex justify-between text-sm">
                <span className="text-stone-600 dark:text-stone-400">{item.label}</span>
                {showValues && (
                  <span className="font-medium text-stone-900 dark:text-stone-100">
                    {formatValue(item.value)}
                  </span>
                )}
              </div>
            )}
            <div className="h-3 w-full overflow-hidden rounded-full bg-stone-100 dark:bg-stone-700">
              <motion.div
                className={cn('h-full rounded-full', item.color || barColor || 'bg-primary-500')}
                initial={animated ? { width: 0 } : undefined}
                animate={{ width: `${(item.value / maxValue) * 100}%` }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              />
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className={className}>
      <div className="flex items-end gap-2" style={{ height }}>
        {data.map((item, index) => {
          const barHeight = (item.value / maxValue) * 100

          return (
            <div key={item.label} className="flex flex-1 flex-col items-center gap-1">
              {showValues && (
                <span className="text-xs font-medium text-stone-600 dark:text-stone-400">
                  {formatValue(item.value)}
                </span>
              )}
              <motion.div
                className={cn(
                  'w-full rounded-t-lg',
                  item.color || barColor || 'bg-primary-500'
                )}
                initial={animated ? { height: 0 } : undefined}
                animate={{ height: `${barHeight}%` }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              />
            </div>
          )
        })}
      </div>
      {showLabels && (
        <div className="mt-2 flex gap-2">
          {data.map((item) => (
            <div
              key={item.label}
              className="flex-1 text-center text-xs text-stone-500 dark:text-stone-400 truncate"
            >
              {item.label}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ============================================
// Pie/Donut Chart Component
// ============================================

interface PieChartProps {
  data: ChartDataPoint[]
  /** Size in pixels */
  size?: number
  /** Donut hole size (0-1, 0 = pie, >0 = donut) */
  donutRatio?: number
  /** Show legend */
  showLegend?: boolean
  /** Show values in legend */
  showValues?: boolean
  /** Format value for display */
  formatValue?: (value: number) => string
  /** Enable animation */
  animated?: boolean
  /** Center content (for donut charts) */
  centerContent?: React.ReactNode
  className?: string
}

const DEFAULT_COLORS = [
  '#3b82f6', // blue
  '#10b981', // green
  '#f59e0b', // amber
  '#ef4444', // red
  '#8b5cf6', // purple
  '#ec4899', // pink
  '#06b6d4', // cyan
  '#84cc16', // lime
]

export function PieChart({
  data,
  size = 200,
  donutRatio = 0,
  showLegend = true,
  showValues = true,
  formatValue = (v) => v.toLocaleString(),
  animated = true,
  centerContent,
  className,
}: PieChartProps) {
  const total = data.reduce((sum, d) => sum + d.value, 0)

  const segments = useMemo(() => {
    let currentAngle = -90 // Start from top

    return data.map((item, index) => {
      const angle = (item.value / total) * 360
      const startAngle = currentAngle
      currentAngle += angle

      return {
        ...item,
        color: item.color || DEFAULT_COLORS[index % DEFAULT_COLORS.length],
        startAngle,
        endAngle: currentAngle,
        percentage: (item.value / total) * 100,
      }
    })
  }, [data, total])

  const radius = size / 2
  const innerRadius = radius * donutRatio
  const center = size / 2

  // Create SVG arc path
  const createArcPath = (startAngle: number, endAngle: number, outerR: number, innerR: number) => {
    const startRad = (startAngle * Math.PI) / 180
    const endRad = (endAngle * Math.PI) / 180

    const x1 = center + outerR * Math.cos(startRad)
    const y1 = center + outerR * Math.sin(startRad)
    const x2 = center + outerR * Math.cos(endRad)
    const y2 = center + outerR * Math.sin(endRad)

    const x3 = center + innerR * Math.cos(endRad)
    const y3 = center + innerR * Math.sin(endRad)
    const x4 = center + innerR * Math.cos(startRad)
    const y4 = center + innerR * Math.sin(startRad)

    const largeArc = endAngle - startAngle > 180 ? 1 : 0

    if (innerR === 0) {
      return `M ${center} ${center} L ${x1} ${y1} A ${outerR} ${outerR} 0 ${largeArc} 1 ${x2} ${y2} Z`
    }

    return `M ${x1} ${y1} A ${outerR} ${outerR} 0 ${largeArc} 1 ${x2} ${y2} L ${x3} ${y3} A ${innerR} ${innerR} 0 ${largeArc} 0 ${x4} ${y4} Z`
  }

  return (
    <div className={cn('flex flex-col items-center gap-4', className)}>
      {/* Chart */}
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          {segments.map((segment, index) => (
            <motion.path
              key={segment.label}
              d={createArcPath(
                segment.startAngle,
                segment.endAngle,
                radius - 4,
                innerRadius
              )}
              fill={segment.color}
              initial={animated ? { opacity: 0, scale: 0.8 } : undefined}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="hover:opacity-80 transition-opacity cursor-pointer"
            />
          ))}
        </svg>

        {/* Center Content (for donut charts) */}
        {donutRatio > 0 && centerContent && (
          <div
            className="absolute inset-0 flex items-center justify-center"
            style={{ padding: radius - innerRadius }}
          >
            {centerContent}
          </div>
        )}
      </div>

      {/* Legend */}
      {showLegend && (
        <div className="flex flex-wrap justify-center gap-x-4 gap-y-2">
          {segments.map((segment) => (
            <div key={segment.label} className="flex items-center gap-2">
              <div
                className="h-3 w-3 rounded-full"
                style={{ backgroundColor: segment.color }}
              />
              <span className="text-sm text-stone-600 dark:text-stone-400">
                {segment.label}
              </span>
              {showValues && (
                <span className="text-sm font-medium text-stone-900 dark:text-stone-100">
                  {formatValue(segment.value)} ({segment.percentage.toFixed(1)}%)
                </span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ============================================
// Line Chart Component (Simplified)
// ============================================

interface LineChartProps {
  data: ChartDataPoint[]
  /** Chart height in pixels */
  height?: number
  /** Show data points */
  showPoints?: boolean
  /** Show area fill */
  showArea?: boolean
  /** Line color */
  lineColor?: string
  /** Area color */
  areaColor?: string
  /** Show labels */
  showLabels?: boolean
  /** Enable animation */
  animated?: boolean
  className?: string
}

export function LineChart({
  data,
  height = 200,
  showPoints = true,
  showArea = true,
  lineColor = '#3b82f6',
  areaColor,
  showLabels = true,
  animated = true,
  className,
}: LineChartProps) {
  const maxValue = Math.max(...data.map((d) => d.value))
  const minValue = Math.min(...data.map((d) => d.value))
  const range = maxValue - minValue || 1

  const width = 100 // Percentage based
  const padding = 10

  const points = data.map((item, index) => {
    const x = padding + ((width - padding * 2) / (data.length - 1)) * index
    const y = height - padding - ((item.value - minValue) / range) * (height - padding * 2)
    return { x, y, ...item }
  })

  const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x}% ${p.y}`).join(' ')

  const areaPath = `${linePath} L ${points[points.length - 1].x}% ${height - padding} L ${points[0].x}% ${height - padding} Z`

  return (
    <div className={className}>
      <svg
        width="100%"
        height={height}
        viewBox={`0 0 100 ${height}`}
        preserveAspectRatio="none"
        className="overflow-visible"
      >
        {/* Area Fill */}
        {showArea && (
          <motion.path
            d={areaPath}
            fill={areaColor || `${lineColor}20`}
            initial={animated ? { opacity: 0 } : undefined}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          />
        )}

        {/* Line */}
        <motion.path
          d={linePath}
          fill="none"
          stroke={lineColor}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={animated ? { pathLength: 0 } : undefined}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1 }}
        />

        {/* Data Points */}
        {showPoints &&
          points.map((point, index) => (
            <motion.circle
              key={point.label}
              cx={`${point.x}%`}
              cy={point.y}
              r="4"
              fill="white"
              stroke={lineColor}
              strokeWidth="2"
              initial={animated ? { scale: 0 } : undefined}
              animate={{ scale: 1 }}
              transition={{ delay: 0.5 + index * 0.1 }}
              className="cursor-pointer hover:r-6"
            />
          ))}
      </svg>

      {/* Labels */}
      {showLabels && (
        <div className="mt-2 flex justify-between">
          {data.map((item) => (
            <span
              key={item.label}
              className="text-xs text-stone-500 dark:text-stone-400"
            >
              {item.label}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}

// ============================================
// Stat Comparison Chart
// ============================================

interface StatComparisonProps {
  label: string
  current: number
  previous: number
  formatValue?: (value: number) => string
  /** Show percentage change */
  showChange?: boolean
  /** Good if positive */
  positiveIsGood?: boolean
  className?: string
}

export function StatComparison({
  label,
  current,
  previous,
  formatValue = (v) => v.toLocaleString(),
  showChange = true,
  positiveIsGood = true,
  className,
}: StatComparisonProps) {
  const change = previous !== 0 ? ((current - previous) / previous) * 100 : 0
  const isPositive = change >= 0
  const isGood = positiveIsGood ? isPositive : !isPositive

  return (
    <div className={cn('space-y-2', className)}>
      <div className="flex items-center justify-between">
        <span className="text-sm text-stone-600 dark:text-stone-400">{label}</span>
        {showChange && (
          <span
            className={cn(
              'text-sm font-medium',
              isGood ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
            )}
          >
            {isPositive ? '+' : ''}
            {change.toFixed(1)}%
          </span>
        )}
      </div>
      <div className="flex items-end gap-2">
        <span className="text-2xl font-bold text-stone-900 dark:text-stone-100">
          {formatValue(current)}
        </span>
        <span className="mb-1 text-sm text-stone-400 dark:text-stone-500">
          이전: {formatValue(previous)}
        </span>
      </div>
      {/* Visual comparison bar */}
      <div className="flex gap-1 h-2">
        <motion.div
          className="h-full rounded-full bg-stone-300 dark:bg-stone-600"
          initial={{ width: 0 }}
          animate={{ width: `${Math.min(50, (previous / Math.max(current, previous)) * 50)}%` }}
          transition={{ duration: 0.5 }}
        />
        <motion.div
          className={cn('h-full rounded-full', isGood ? 'bg-green-500' : 'bg-red-500')}
          initial={{ width: 0 }}
          animate={{ width: `${Math.min(50, (current / Math.max(current, previous)) * 50)}%` }}
          transition={{ duration: 0.5, delay: 0.2 }}
        />
      </div>
    </div>
  )
}

// ============================================
// Mini Sparkline Chart
// ============================================

interface SparklineProps {
  data: number[]
  /** Width in pixels */
  width?: number
  /** Height in pixels */
  height?: number
  /** Line color */
  color?: string
  /** Show area fill */
  showArea?: boolean
  className?: string
}

export function Sparkline({
  data,
  width = 100,
  height = 30,
  color = '#3b82f6',
  showArea = false,
  className,
}: SparklineProps) {
  if (data.length === 0) return null

  const max = Math.max(...data)
  const min = Math.min(...data)
  const range = max - min || 1

  const points = data.map((value, index) => {
    const x = (index / (data.length - 1)) * width
    const y = height - ((value - min) / range) * (height - 4) - 2
    return `${x},${y}`
  })

  const linePath = `M ${points.join(' L ')}`
  const areaPath = `${linePath} L ${width},${height} L 0,${height} Z`

  return (
    <svg width={width} height={height} className={className}>
      {showArea && (
        <path d={areaPath} fill={`${color}20`} />
      )}
      <path
        d={linePath}
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
