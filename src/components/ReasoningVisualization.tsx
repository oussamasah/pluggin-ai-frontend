'use client'

import React from 'react'
import { cn } from '@/lib/utils'
import parseContent from './parseContent'

const ACCENT_GREEN = '#006239'

interface ReasoningVisualizationProps {
  content: string
  metadata?: {
    type: 'table' | 'bar_chart' | 'line_chart' | 'pie_chart' | 'none'
    config?: {
      xAxisKey?: string
      yAxisKey?: string
      title?: string
      [key: string]: any
    }
    data: any[]
    [key: string]: any
  }
  className?: string
}

/**
 * ReasoningVisualization Component
 * 
 * Displays reasoning search type messages with optional data visualizations.
 * Supports tables, bar charts, line charts, and pie charts based on metadata.
 */
export function ReasoningVisualization({
  content,
  metadata,
  className
}: ReasoningVisualizationProps) {
  // If no metadata or metadata type is 'none', just render the content
  if (!metadata || metadata.type === 'none' || !metadata.data || metadata.data.length === 0) {
    return (
      <div className={cn('space-y-3', className)}>
        <div className="text-sm leading-relaxed text-gray-700 dark:text-[#D1D5DB] font-light tracking-wide">
          {parseContent(content)}
        </div>
      </div>
    )
  }

  return (
    <div className={cn('space-y-5', className)}>
      {/* Render the narrative content */}
      <div className="space-y-3">
        <div className="text-sm leading-relaxed text-gray-700 dark:text-[#D1D5DB] font-light tracking-wide">
          {parseContent(content)}
        </div>
      </div>

      {/* Render visualization based on metadata type */}
      {metadata.type === 'table' && (
        <DataTable data={metadata.data} config={metadata.config} />
      )}

      {metadata.type === 'bar_chart' && (
        <BarChart data={metadata.data} config={metadata.config} />
      )}

      {metadata.type === 'line_chart' && (
        <LineChart data={metadata.data} config={metadata.config} />
      )}

      {metadata.type === 'pie_chart' && (
        <PieChart data={metadata.data} config={metadata.config} />
      )}
    </div>
  )
}

// Data Table Component
function DataTable({ data, config }: { data: any[]; config?: any }) {
  if (!data || data.length === 0) return null

  // Get headers from first data object or config
  const headers = config?.headers || (data[0] ? Object.keys(data[0]) : [])

  return (
    <div className="my-4 rounded-lg border border-gray-200 dark:border-[#2A2A2A] overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-[#2A2A2A]">
          <thead className="bg-gray-50 dark:bg-[#1A1A1A]">
            <tr>
              {headers.map((header: string, idx: number) => (
                <th
                  key={`th-${idx}`}
                  className="px-4 py-3 text-left text-xs font-semibold text-gray-700 dark:text-[#9CA3AF] uppercase tracking-wider"
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-[#2A2A2A] bg-white dark:bg-[#0F0F0F]">
            {data.map((row, rowIdx) => (
              <tr
                key={`row-${rowIdx}`}
                className={cn(
                  'hover:bg-gray-50 dark:hover:bg-[#1A1A1A]/50',
                  rowIdx % 2 === 0 ? 'bg-white dark:bg-[#0F0F0F]' : 'bg-gray-50/50 dark:bg-[#1A1A1A]/30'
                )}
              >
                {headers.map((header: string, cellIdx: number) => (
                  <td
                    key={`cell-${rowIdx}-${cellIdx}`}
                    className="px-4 py-3 text-sm text-gray-800 dark:text-[#EDEDED]"
                  >
                    {row[header] ?? '-'}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// Bar Chart Component (Simple CSS-based)
function BarChart({ data, config }: { data: any[]; config?: any }) {
  if (!data || data.length === 0) return null

  const xAxisKey = config?.xAxisKey || Object.keys(data[0])[0]
  const yAxisKey = config?.yAxisKey || Object.keys(data[0])[1]
  const title = config?.title || 'Bar Chart'

  // Calculate max value for scaling
  const maxValue = Math.max(...data.map(item => Number(item[yAxisKey]) || 0))

  return (
    <div className="my-4 p-4 rounded-lg border border-gray-200 dark:border-[#2A2A2A] bg-white dark:bg-[#0F0F0F]">
      <h3 className="text-sm font-semibold text-gray-900 dark:text-[#EDEDED] mb-4">
        {title}
      </h3>
      <div className="space-y-3">
        {data.map((item, idx) => {
          const value = Number(item[yAxisKey]) || 0
          const percentage = maxValue > 0 ? (value / maxValue) * 100 : 0

          return (
            <div key={`bar-${idx}`} className="space-y-1">
              <div className="flex justify-between text-xs text-gray-600 dark:text-[#9CA3AF]">
                <span>{item[xAxisKey]}</span>
                <span className="font-medium">{value}</span>
              </div>
              <div className="w-full h-6 bg-gray-200 dark:bg-[#2A2A2A] rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${percentage}%`,
                    backgroundColor: ACCENT_GREEN
                  }}
                />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// Line Chart Component (Simple CSS-based)
function LineChart({ data, config }: { data: any[]; config?: any }) {
  if (!data || data.length === 0) return null

  const xAxisKey = config?.xAxisKey || Object.keys(data[0])[0]
  const yAxisKey = config?.yAxisKey || Object.keys(data[0])[1]
  const title = config?.title || 'Line Chart'

  // Calculate max value for scaling
  const maxValue = Math.max(...data.map(item => Number(item[yAxisKey]) || 0))
  const minValue = Math.min(...data.map(item => Number(item[yAxisKey]) || 0))
  const range = maxValue - minValue || 1

  // Calculate points for the line
  const points = data.map((item, idx) => {
    const value = Number(item[yAxisKey]) || 0
    const x = (idx / (data.length - 1 || 1)) * 100
    const y = 100 - ((value - minValue) / range) * 100
    return { x, y, label: item[xAxisKey], value }
  })

  // Create SVG path
  const pathData = points
    .map((point, idx) => `${idx === 0 ? 'M' : 'L'} ${point.x} ${point.y}`)
    .join(' ')

  return (
    <div className="my-4 p-4 rounded-lg border border-gray-200 dark:border-[#2A2A2A] bg-white dark:bg-[#0F0F0F]">
      <h3 className="text-sm font-semibold text-gray-900 dark:text-[#EDEDED] mb-4">
        {title}
      </h3>
      <div className="relative h-64">
        <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
          <defs>
            <linearGradient id="lineGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor={ACCENT_GREEN} stopOpacity="0.3" />
              <stop offset="100%" stopColor={ACCENT_GREEN} stopOpacity="0" />
            </linearGradient>
          </defs>
          {/* Grid lines */}
          {[0, 25, 50, 75, 100].map(y => (
            <line
              key={`grid-${y}`}
              x1="0"
              y1={y}
              x2="100"
              y2={y}
              stroke="currentColor"
              strokeWidth="0.5"
              className="text-gray-200 dark:text-[#2A2A2A]"
            />
          ))}
          {/* Area under line */}
          <path
            d={`${pathData} L 100 100 L 0 100 Z`}
            fill="url(#lineGradient)"
          />
          {/* Line */}
          <path
            d={pathData}
            fill="none"
            stroke={ACCENT_GREEN}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Data points */}
          {points.map((point, idx) => (
            <circle
              key={`point-${idx}`}
              cx={point.x}
              cy={point.y}
              r="1.5"
              fill={ACCENT_GREEN}
              className="hover:r-2 transition-all"
            />
          ))}
        </svg>
        {/* X-axis labels */}
        <div className="absolute bottom-0 left-0 right-0 flex justify-between text-xs text-gray-500 dark:text-[#6B7280] px-2">
          {points.map((point, idx) => (
            <span key={`label-${idx}`} className="truncate max-w-[20%]">
              {point.label}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}

// Pie Chart Component (Simple CSS-based)
function PieChart({ data, config }: { data: any[]; config?: any }) {
  if (!data || data.length === 0) return null

  const labelKey = config?.labelKey || Object.keys(data[0])[0]
  const valueKey = config?.valueKey || Object.keys(data[0])[1]
  const title = config?.title || 'Pie Chart'

  // Calculate total for percentages
  const total = data.reduce((sum, item) => sum + (Number(item[valueKey]) || 0), 0)

  // Calculate angles for each segment
  let currentAngle = -90 // Start from top
  const segments = data.map((item, idx) => {
    const value = Number(item[valueKey]) || 0
    const percentage = total > 0 ? (value / total) * 100 : 0
    const angle = (percentage / 100) * 360
    const startAngle = currentAngle
    currentAngle += angle

    // Generate color based on index
    const hue = (idx * 137.5) % 360 // Golden angle for color distribution
    const color = `hsl(${hue}, 70%, 50%)`

    return {
      label: item[labelKey],
      value,
      percentage,
      startAngle,
      angle,
      color
    }
  })

  // Create SVG path for pie chart
  const radius = 40
  const centerX = 50
  const centerY = 50

  const createArcPath = (startAngle: number, endAngle: number) => {
    const start = (startAngle * Math.PI) / 180
    const end = (endAngle * Math.PI) / 180
    const x1 = centerX + radius * Math.cos(start)
    const y1 = centerY + radius * Math.sin(start)
    const x2 = centerX + radius * Math.cos(end)
    const y2 = centerY + radius * Math.sin(end)
    const largeArc = endAngle - startAngle > 180 ? 1 : 0

    return `M ${centerX} ${centerY} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} Z`
  }

  return (
    <div className="my-4 p-4 rounded-lg border border-gray-200 dark:border-[#2A2A2A] bg-white dark:bg-[#0F0F0F]">
      <h3 className="text-sm font-semibold text-gray-900 dark:text-[#EDEDED] mb-4">
        {title}
      </h3>
      <div className="flex items-center gap-6">
        <div className="flex-shrink-0">
          <svg className="w-32 h-32" viewBox="0 0 100 100">
            {segments.map((segment, idx) => {
              const endAngle = segment.startAngle + segment.angle
              return (
                <path
                  key={`segment-${idx}`}
                  d={createArcPath(segment.startAngle, endAngle)}
                  fill={segment.color}
                  stroke="white"
                  strokeWidth="1"
                  className="hover:opacity-80 transition-opacity"
                />
              )
            })}
          </svg>
        </div>
        <div className="flex-1 space-y-2">
          {segments.map((segment, idx) => (
            <div key={`legend-${idx}`} className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full flex-shrink-0"
                style={{ backgroundColor: segment.color }}
              />
              <div className="flex-1 flex items-center justify-between text-xs">
                <span className="text-gray-700 dark:text-[#D1D5DB]">{segment.label}</span>
                <span className="text-gray-600 dark:text-[#9CA3AF] font-medium">
                  {segment.value} ({segment.percentage.toFixed(1)}%)
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default ReasoningVisualization

