'use client'

import React from 'react'
import { cn } from '@/lib/utils'

interface ChartProps {
  className?: string
  children: React.ReactNode
}

export function Chart({ className, children, ...props }: ChartProps) {
  return (
    <div className={cn('w-full', className)} {...props}>
      {children}
    </div>
  )
}

interface ChartContainerProps {
  className?: string
  children: React.ReactNode
}

export function ChartContainer({ className, children, ...props }: ChartContainerProps) {
  return (
    <div className={cn('h-[300px] w-full', className)} {...props}>
      {children}
    </div>
  )
}

interface ChartTooltipProps {
  className?: string
  children: React.ReactNode
}

export function ChartTooltip({ className, children, ...props }: ChartTooltipProps) {
  return (
    <div className={cn('rounded-lg border bg-background p-2 shadow-md', className)} {...props}>
      {children}
    </div>
  )
}

interface ChartTooltipContentProps {
  className?: string
  children: React.ReactNode
}

export function ChartTooltipContent({ className, children, ...props }: ChartTooltipContentProps) {
  return (
    <div className={cn('grid gap-1.5', className)} {...props}>
      {children}
    </div>
  )
}

interface ChartTooltipLabelProps {
  className?: string
  children: React.ReactNode
}

export function ChartTooltipLabel({ className, children, ...props }: ChartTooltipLabelProps) {
  return (
    <div className={cn('font-medium', className)} {...props}>
      {children}
    </div>
  )
}

interface ChartTooltipValueProps {
  className?: string
  children: React.ReactNode
}

export function ChartTooltipValue({ className, children, ...props }: ChartTooltipValueProps) {
  return (
    <div className={cn('text-sm text-muted-foreground', className)} {...props}>
      {children}
    </div>
  )
}

interface ChartLegendProps {
  className?: string
  children: React.ReactNode
}

export function ChartLegend({ className, children, ...props }: ChartLegendProps) {
  return (
    <div className={cn('flex items-center justify-center gap-4', className)} {...props}>
      {children}
    </div>
  )
}

interface ChartLegendItemProps {
  className?: string
  children: React.ReactNode
}

export function ChartLegendItem({ className, children, ...props }: ChartLegendItemProps) {
  return (
    <div className={cn('flex items-center gap-2', className)} {...props}>
      {children}
    </div>
  )
}

interface ChartLegendIconProps {
  className?: string
  color?: string
}

export function ChartLegendIcon({ className, color, ...props }: ChartLegendIconProps) {
  return (
    <div 
      className={cn('h-3 w-3 rounded-full', className)} 
      style={{ backgroundColor: color }}
      {...props} 
    />
  )
}
