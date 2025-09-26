'use client'

import React from 'react'
import { Chart, ChartContainer } from '@/components/ui/chart'

interface ActivityHeatmapProps {
  data: {
    day: string
    hour: number
    activity: number
  }[]
  className?: string
  height?: string
}

export function ActivityHeatmap({ data, className, height = "400px" }: ActivityHeatmapProps) {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
  const hours = Array.from({ length: 24 }, (_, i) => i)
  
  const maxActivity = Math.max(...data.map(d => d.activity))
  
  const getActivityLevel = (day: string, hour: number) => {
    const item = data.find(d => d.day === day && d.hour === hour)
    return item ? item.activity : 0
  }
  
  const getIntensity = (activity: number) => {
    if (activity === 0) return 0
    return Math.min(activity / maxActivity, 1)
  }
  
  return (
    <Chart className={className}>
      <ChartContainer style={{ height }}>
        <div className="h-full w-full p-6">
          <div className="grid grid-cols-8 gap-2 h-full">
            {/* Hour labels */}
            <div className="flex flex-col justify-between text-xs text-muted-foreground">
              {hours.map(hour => (
                <div key={hour} className="h-4 flex items-center">
                  {hour % 4 === 0 ? hour : ''}
                </div>
              ))}
            </div>
            
            {/* Heatmap grid */}
            {days.map(day => (
              <div key={day} className="flex flex-col gap-1">
                <div className="text-xs text-muted-foreground text-center mb-2 font-medium">{day}</div>
                {hours.map(hour => {
                  const activity = getActivityLevel(day, hour)
                  const intensity = getIntensity(activity)
                  
                  return (
                    <div
                      key={`${day}-${hour}`}
                      className="w-full h-4 rounded-sm border hover:scale-105 transition-transform cursor-pointer"
                      style={{
                        backgroundColor: intensity > 0 
                          ? `hsl(var(--primary) / ${0.1 + intensity * 0.9})`
                          : 'hsl(var(--muted))',
                        borderColor: 'hsl(var(--border))'
                      }}
                      title={`${day} ${hour}:00 - ${activity} activities`}
                    />
                  )
                })}
              </div>
            ))}
          </div>
          
          {/* Legend */}
          <div className="flex items-center justify-between mt-6 text-sm text-muted-foreground">
            <span className="font-medium">Less</span>
            <div className="flex gap-2">
              {[0, 0.25, 0.5, 0.75, 1].map(intensity => (
                <div
                  key={intensity}
                  className="w-4 h-4 rounded-sm border"
                  style={{
                    backgroundColor: `hsl(var(--primary) / ${0.1 + intensity * 0.9})`,
                    borderColor: 'hsl(var(--border))'
                  }}
                />
              ))}
            </div>
            <span className="font-medium">More</span>
          </div>
        </div>
      </ChartContainer>
    </Chart>
  )
}
