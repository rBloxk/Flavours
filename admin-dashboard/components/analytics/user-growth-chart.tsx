'use client'

import React from 'react'
import { Chart, ChartContainer, ChartTooltip, ChartTooltipContent, ChartTooltipLabel, ChartTooltipValue } from '@/components/ui/chart'

interface UserGrowthChartProps {
  data: {
    date: string
    users: number
    creators: number
  }[]
  className?: string
}

export function UserGrowthChart({ data, className }: UserGrowthChartProps) {
  const maxValue = Math.max(...data.map(d => Math.max(d.users, d.creators)))
  
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
                {Math.round(maxValue * (4 - i) / 4).toLocaleString()}
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
                {new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </text>
            ))}
            
            {/* Users line */}
            <polyline
              points={data.map((d, i) => 
                `${60 + i * (300 / (data.length - 1))},${240 - (d.users / maxValue) * 180}`
              ).join(' ')}
              fill="none"
              stroke="hsl(var(--primary))"
              strokeWidth="2"
            />
            
            {/* Creators line */}
            <polyline
              points={data.map((d, i) => 
                `${60 + i * (300 / (data.length - 1))},${240 - (d.creators / maxValue) * 180}`
              ).join(' ')}
              fill="none"
              stroke="hsl(var(--chart-2))"
              strokeWidth="2"
            />
            
            {/* Data points */}
            {data.map((d, i) => (
              <g key={i}>
                <circle
                  cx={60 + i * (300 / (data.length - 1))}
                  cy={240 - (d.users / maxValue) * 180}
                  r="3"
                  fill="hsl(var(--primary))"
                />
                <circle
                  cx={60 + i * (300 / (data.length - 1))}
                  cy={240 - (d.creators / maxValue) * 180}
                  r="3"
                  fill="hsl(var(--chart-2))"
                />
              </g>
            ))}
          </svg>
        </div>
      </ChartContainer>
    </Chart>
  )
}
