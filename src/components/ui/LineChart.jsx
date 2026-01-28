import { useMemo } from 'react'

const COLORS = [
  '#f59e0b', // amber (accent)
  '#10b981', // green
  '#3b82f6', // blue
  '#ec4899', // pink
  '#8b5cf6', // purple
  '#ef4444', // red
  '#06b6d4', // cyan
  '#f97316', // orange
]

export function LineChart({ datasets, height = 220 }) {
  const chartData = useMemo(() => {
    if (!datasets || datasets.length === 0) return null

    // Count total data points
    const totalPoints = datasets.reduce((sum, ds) => sum + ds.data.length, 0)
    if (totalPoints === 0) return null

    // Combine all dates and get unique sorted dates
    const allDates = new Set()
    datasets.forEach(ds => {
      ds.data.forEach(point => allDates.add(point.date.toISOString().split('T')[0]))
    })
    const sortedDates = Array.from(allDates).sort()

    if (sortedDates.length === 0) return null

    // Find min/max values across all datasets
    let minVal = Infinity
    let maxVal = -Infinity
    datasets.forEach(ds => {
      ds.data.forEach(point => {
        minVal = Math.min(minVal, point.value)
        maxVal = Math.max(maxVal, point.value)
      })
    })

    // Ensure we have a reasonable range (minimum 10kg range)
    const range = maxVal - minVal
    if (range < 10) {
      const midPoint = (maxVal + minVal) / 2
      minVal = Math.max(0, midPoint - 5)
      maxVal = midPoint + 5
    } else {
      // Add padding to range
      minVal = Math.max(0, minVal - range * 0.1)
      maxVal = maxVal + range * 0.1
    }

    return { sortedDates, minVal, maxVal, totalPoints }
  }, [datasets])

  // Empty state
  if (!chartData || !datasets || datasets.length === 0) {
    return (
      <div
        className="flex flex-col items-center justify-center bg-midnight-700/50 rounded-xl"
        style={{ height }}
      >
        <span className="text-3xl mb-2">📈</span>
        <p className="text-gray-400 text-sm">Select exercises to view progress</p>
      </div>
    )
  }

  const { sortedDates, minVal, maxVal, totalPoints } = chartData

  // Single data point - show a nice card instead
  if (totalPoints === 1 || sortedDates.length === 1) {
    return (
      <div
        className="flex flex-col items-center justify-center bg-midnight-700/50 rounded-xl p-4"
        style={{ height }}
      >
        <span className="text-3xl mb-3">📊</span>
        <p className="text-gray-300 text-center mb-4">Need more data for a chart</p>
        <div className="flex flex-wrap justify-center gap-3">
          {datasets.map((ds, i) => (
            ds.data.length > 0 && (
              <div key={i} className="bg-midnight-800 rounded-lg px-4 py-2 text-center">
                <p className="text-xs text-gray-400">{ds.label}</p>
                <p className="text-xl font-bold" style={{ color: COLORS[i % COLORS.length] }}>
                  {ds.data[0].value}kg
                </p>
                <p className="text-xs text-gray-500">
                  {ds.data[0].date.toLocaleDateString('en-AU', { day: 'numeric', month: 'short' })}
                </p>
              </div>
            )
          ))}
        </div>
        <p className="text-xs text-gray-500 mt-4">Complete more workouts to see trends</p>
      </div>
    )
  }

  const padding = { top: 20, right: 15, bottom: 35, left: 45 }
  const chartHeight = height - padding.top - padding.bottom
  const chartWidth = 100 - padding.left - padding.right

  const getX = (dateStr) => {
    const index = sortedDates.indexOf(dateStr)
    if (sortedDates.length === 1) return padding.left + chartWidth / 2
    return padding.left + (index / (sortedDates.length - 1)) * chartWidth
  }

  const getY = (value) => {
    const normalized = (value - minVal) / (maxVal - minVal)
    return padding.top + chartHeight * (1 - normalized)
  }

  // Generate Y axis labels (4 steps)
  const yLabels = []
  const ySteps = 4
  for (let i = 0; i <= ySteps; i++) {
    const value = minVal + (maxVal - minVal) * (i / ySteps)
    yLabels.push({
      value: Math.round(value),
      y: getY(value)
    })
  }

  // Generate X axis labels (show max 5)
  const xLabelStep = Math.max(1, Math.floor(sortedDates.length / 5))
  const xLabels = sortedDates
    .filter((_, i) => i % xLabelStep === 0 || i === sortedDates.length - 1)
    .map(dateStr => ({
      label: new Date(dateStr).toLocaleDateString('en-AU', { day: 'numeric', month: 'short' }),
      x: getX(dateStr)
    }))

  return (
    <div className="bg-midnight-700/50 rounded-xl p-3">
      <svg
        viewBox={`0 0 100 ${height}`}
        preserveAspectRatio="none"
        className="w-full"
        style={{ height }}
      >
        {/* Grid lines */}
        {yLabels.map((label, i) => (
          <line
            key={i}
            x1={padding.left}
            y1={label.y}
            x2={100 - padding.right}
            y2={label.y}
            stroke="#374151"
            strokeWidth="0.15"
            strokeDasharray="0.5,0.5"
          />
        ))}

        {/* Y axis */}
        <line
          x1={padding.left}
          y1={padding.top}
          x2={padding.left}
          y2={height - padding.bottom}
          stroke="#4b5563"
          strokeWidth="0.2"
        />

        {/* X axis */}
        <line
          x1={padding.left}
          y1={height - padding.bottom}
          x2={100 - padding.right}
          y2={height - padding.bottom}
          stroke="#4b5563"
          strokeWidth="0.2"
        />

        {/* Y axis labels */}
        {yLabels.map((label, i) => (
          <text
            key={i}
            x={padding.left - 2}
            y={label.y}
            fill="#9ca3af"
            fontSize="2.8"
            textAnchor="end"
            dominantBaseline="middle"
          >
            {label.value}
          </text>
        ))}

        {/* X axis labels */}
        {xLabels.map((label, i) => (
          <text
            key={i}
            x={label.x}
            y={height - 12}
            fill="#9ca3af"
            fontSize="2.5"
            textAnchor="middle"
          >
            {label.label}
          </text>
        ))}

        {/* Data lines and points */}
        {datasets.map((dataset, dsIndex) => {
          const sortedData = [...dataset.data].sort((a, b) => a.date - b.date)
          const color = COLORS[dsIndex % COLORS.length]

          if (sortedData.length === 0) return null

          // Create path
          const pathData = sortedData
            .map((point, i) => {
              const dateStr = point.date.toISOString().split('T')[0]
              const x = getX(dateStr)
              const y = getY(point.value)
              return `${i === 0 ? 'M' : 'L'} ${x} ${y}`
            })
            .join(' ')

          // Create gradient fill path
          const areaPath = sortedData.length > 1
            ? `${pathData} L ${getX(sortedData[sortedData.length - 1].date.toISOString().split('T')[0])} ${height - padding.bottom} L ${getX(sortedData[0].date.toISOString().split('T')[0])} ${height - padding.bottom} Z`
            : null

          return (
            <g key={dsIndex}>
              {/* Gradient fill under line */}
              {areaPath && (
                <>
                  <defs>
                    <linearGradient id={`gradient-${dsIndex}`} x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor={color} stopOpacity="0.3" />
                      <stop offset="100%" stopColor={color} stopOpacity="0.05" />
                    </linearGradient>
                  </defs>
                  <path
                    d={areaPath}
                    fill={`url(#gradient-${dsIndex})`}
                  />
                </>
              )}

              {/* Line */}
              <path
                d={pathData}
                fill="none"
                stroke={color}
                strokeWidth="0.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* Points */}
              {sortedData.map((point, i) => {
                const dateStr = point.date.toISOString().split('T')[0]
                return (
                  <g key={i}>
                    <circle
                      cx={getX(dateStr)}
                      cy={getY(point.value)}
                      r="1.5"
                      fill="#1f2937"
                      stroke={color}
                      strokeWidth="0.5"
                    />
                    <circle
                      cx={getX(dateStr)}
                      cy={getY(point.value)}
                      r="0.8"
                      fill={color}
                    />
                  </g>
                )
              })}
            </g>
          )
        })}
      </svg>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 mt-2 px-1">
        {datasets.map((dataset, i) => (
          <div key={i} className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: COLORS[i % COLORS.length] }}
            />
            <span className="text-sm text-gray-300">{dataset.label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
