'use client'

import React from 'react'
import { Chart, ChartContainer, ChartTooltip, ChartTooltipContent, ChartTooltipLabel, ChartTooltipValue } from '@/components/ui/chart'

interface RevenueChartProps {
  data: {
    month: string
    revenue: number
    subscriptions: number
    tips: number
  }[]
  className?: string
}

export function RevenueChart({ data, className }: RevenueChartProps) {
  const maxRevenue = Math.max(...data.map(d => d.revenue))
  
  return (
    <Chart className={className}>
      <ChartContainer>
        <div className="h-full w-full">
          <svg viewBox="0 0 400 300" className="h-full w-full">
            {/* Grid lines */}
            {[0, 1, 2, 3, 4].map(i => (
              <line
                key={i}
                x1="40"
                y1={60 + i * 45}
                x2="360"
                y2={60 + i * 45}
                stroke="currentColor"
                strokeWidth="0.5"
                opacity="0.1"
              />
            ))}
            
            {/* Y-axis labels */}
            {[0, 1, 2, 3, 4].map(i => (
              <text
                key={i}
                x="35"
                y={65 + i * 45}
                textAnchor="end"
                className="text-xs fill-muted-foreground"
              >
                ${Math.round(maxRevenue * (4 - i) / 4).toLocaleString()}
              </text>
            ))}
            
            {/* X-axis labels */}
            {data.map((d, i) => (
              <text
                key={i}
                x={60 + i * (300 / (data.length - 1))}
                y="290"
                textAnchor="middle"
                className="text-xs fill-muted-foreground"
              >
                {d.month}
              </text>
            ))}
            
            {/* Revenue bars */}
            {data.map((d, i) => {
              const barHeight = (d.revenue / maxRevenue) * 180
              const barWidth = 300 / data.length * 0.6
              const barX = 60 + i * (300 / (data.length - 1)) - barWidth / 2
              
              return (
                <g key={i}>
                  <rect
                    x={barX}
                    y={240 - barHeight}
                    width={barWidth}
                    height={barHeight}
                    fill="hsl(var(--primary))"
                    opacity="0.8"
                  />
                  <text
                    x={60 + i * (300 / (data.length - 1))}
                    y={230 - barHeight}
                    textAnchor="middle"
                    className="text-xs fill-muted-foreground"
                  >
                    ${d.revenue.toLocaleString()}
                  </text>
                </g>
              )
            })}
          </svg>
        </div>
      </ChartContainer>
    </Chart>
  )
}
