'use client'

import React from 'react'
import { Chart, ChartContainer, ChartLegend, ChartLegendItem, ChartLegendIcon } from '@/components/ui/chart'

interface ContentDistributionChartProps {
  data: {
    type: string
    count: number
    color: string
  }[]
  className?: string
}

export function ContentDistributionChart({ data, className }: ContentDistributionChartProps) {
  const total = data.reduce((sum, item) => sum + item.count, 0)
  const colors = ['hsl(var(--primary))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))', 'hsl(var(--chart-5))']
  
  let currentAngle = 0
  
  return (
    <Chart className={className}>
      <ChartContainer>
        <div className="h-full w-full flex items-center justify-center">
          <svg viewBox="0 0 200 200" className="h-48 w-48">
            {data.map((item, index) => {
              const percentage = (item.count / total) * 100
              const angle = (item.count / total) * 360
              const startAngle = currentAngle
              const endAngle = currentAngle + angle
              
              const startAngleRad = (startAngle - 90) * (Math.PI / 180)
              const endAngleRad = (endAngle - 90) * (Math.PI / 180)
              
              const x1 = 100 + 80 * Math.cos(startAngleRad)
              const y1 = 100 + 80 * Math.sin(startAngleRad)
              const x2 = 100 + 80 * Math.cos(endAngleRad)
              const y2 = 100 + 80 * Math.sin(endAngleRad)
              
              const largeArcFlag = angle > 180 ? 1 : 0
              
              const pathData = [
                `M 100 100`,
                `L ${x1} ${y1}`,
                `A 80 80 0 ${largeArcFlag} 1 ${x2} ${y2}`,
                'Z'
              ].join(' ')
              
              currentAngle += angle
              
              return (
                <path
                  key={index}
                  d={pathData}
                  fill={colors[index % colors.length]}
                  stroke="hsl(var(--background))"
                  strokeWidth="2"
                />
              )
            })}
            
            {/* Center text */}
            <text
              x="100"
              y="95"
              textAnchor="middle"
              className="text-sm font-medium fill-foreground"
            >
              {total.toLocaleString()}
            </text>
            <text
              x="100"
              y="110"
              textAnchor="middle"
              className="text-xs fill-muted-foreground"
            >
              Total Posts
            </text>
          </svg>
        </div>
      </ChartContainer>
      
      <ChartLegend>
        {data.map((item, index) => (
          <ChartLegendItem key={index}>
            <ChartLegendIcon color={colors[index % colors.length]} />
            <span className="text-sm">{item.type}</span>
            <span className="text-sm text-muted-foreground">({item.count})</span>
          </ChartLegendItem>
        ))}
      </ChartLegend>
    </Chart>
  )
}
