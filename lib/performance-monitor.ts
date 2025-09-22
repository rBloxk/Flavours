// Performance monitoring and analytics service
export class PerformanceMonitor {
  private metrics: Map<string, any> = new Map()
  private observers: PerformanceObserver[] = []
  private isEnabled = true

  constructor() {
    this.initializeObservers()
  }

  // Initialize performance observers
  private initializeObservers() {
    if (typeof window === 'undefined') return

    // Navigation timing
    if ('PerformanceObserver' in window) {
      try {
        const navObserver = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            this.recordMetric('navigation', entry)
          }
        })
        navObserver.observe({ entryTypes: ['navigation'] })
        this.observers.push(navObserver)
      } catch (error) {
        console.warn('Navigation timing observer failed:', error)
      }

      // Resource timing
      try {
        const resourceObserver = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            this.recordMetric('resource', entry)
          }
        })
        resourceObserver.observe({ entryTypes: ['resource'] })
        this.observers.push(resourceObserver)
      } catch (error) {
        console.warn('Resource timing observer failed:', error)
      }

      // Largest Contentful Paint
      try {
        const lcpObserver = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            this.recordMetric('lcp', entry)
          }
        })
        lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] })
        this.observers.push(lcpObserver)
      } catch (error) {
        console.warn('LCP observer failed:', error)
      }

      // First Input Delay
      try {
        const fidObserver = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            this.recordMetric('fid', entry)
          }
        })
        fidObserver.observe({ entryTypes: ['first-input'] })
        this.observers.push(fidObserver)
      } catch (error) {
        console.warn('FID observer failed:', error)
      }

      // Cumulative Layout Shift
      try {
        const clsObserver = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            this.recordMetric('cls', entry)
          }
        })
        clsObserver.observe({ entryTypes: ['layout-shift'] })
        this.observers.push(clsObserver)
      } catch (error) {
        console.warn('CLS observer failed:', error)
      }
    }
  }

  // Record a performance metric
  private recordMetric(type: string, entry: PerformanceEntry) {
    if (!this.isEnabled) return

    const timestamp = Date.now()
    const metric = {
      type,
      name: entry.name,
      startTime: entry.startTime,
      duration: entry.duration,
      timestamp,
      ...this.extractMetricData(entry)
    }

    this.metrics.set(`${type}-${timestamp}`, metric)
    
    // Send to analytics if configured
    this.sendToAnalytics(metric)
  }

  // Extract specific data from performance entries
  private extractMetricData(entry: PerformanceEntry): any {
    const data: any = {}

    if ('transferSize' in entry) {
      data.transferSize = (entry as any).transferSize
    }
    if ('encodedBodySize' in entry) {
      data.encodedBodySize = (entry as any).encodedBodySize
    }
    if ('decodedBodySize' in entry) {
      data.decodedBodySize = (entry as any).decodedBodySize
    }
    if ('initiatorType' in entry) {
      data.initiatorType = (entry as any).initiatorType
    }
    if ('renderBlockingStatus' in entry) {
      data.renderBlockingStatus = (entry as any).renderBlockingStatus
    }

    return data
  }

  // Send metrics to analytics service
  private sendToAnalytics(metric: any) {
    // In a real implementation, this would send to your analytics service
    console.log('📊 Performance Metric:', metric)
  }

  // Measure custom performance
  measure(name: string, fn: () => void | Promise<void>): void {
    const start = performance.now()
    
    const result = fn()
    
    if (result instanceof Promise) {
      result.then(() => {
        const duration = performance.now() - start
        this.recordCustomMetric(name, duration)
      })
    } else {
      const duration = performance.now() - start
      this.recordCustomMetric(name, duration)
    }
  }

  // Record custom metric
  recordCustomMetric(name: string, duration: number, metadata?: any) {
    const metric = {
      type: 'custom',
      name,
      duration,
      timestamp: Date.now(),
      metadata
    }

    this.metrics.set(`custom-${name}-${Date.now()}`, metric)
    this.sendToAnalytics(metric)
  }

  // Get Core Web Vitals
  getCoreWebVitals(): {
    lcp?: number
    fid?: number
    cls?: number
    fcp?: number
    ttfb?: number
  } {
    const vitals: any = {}

    for (const [key, metric] of this.metrics) {
      if (metric.type === 'lcp') {
        vitals.lcp = metric.startTime
      } else if (metric.type === 'fid') {
        vitals.fid = metric.duration
      } else if (metric.type === 'cls') {
        vitals.cls = (vitals.cls || 0) + metric.value
      }
    }

    // Get FCP and TTFB from navigation timing
    const navigation = performance.getEntriesByType('navigation')[0] as any
    if (navigation) {
      vitals.fcp = navigation.responseEnd - navigation.requestStart
      vitals.ttfb = navigation.responseStart - navigation.requestStart
    }

    return vitals
  }

  // Get performance summary
  getPerformanceSummary(): {
    totalMetrics: number
    averageLoadTime: number
    slowestResources: any[]
    coreWebVitals: any
    recommendations: string[]
  } {
    const resources = Array.from(this.metrics.values())
      .filter(m => m.type === 'resource')
      .sort((a, b) => b.duration - a.duration)

    const averageLoadTime = resources.length > 0
      ? resources.reduce((sum, r) => sum + r.duration, 0) / resources.length
      : 0

    const slowestResources = resources.slice(0, 5)

    const coreWebVitals = this.getCoreWebVitals()

    const recommendations = this.generateRecommendations(coreWebVitals, resources)

    return {
      totalMetrics: this.metrics.size,
      averageLoadTime,
      slowestResources,
      coreWebVitals,
      recommendations
    }
  }

  // Generate performance recommendations
  private generateRecommendations(vitals: any, resources: any[]): string[] {
    const recommendations: string[] = []

    if (vitals.lcp > 2500) {
      recommendations.push('LCP is slow (>2.5s). Consider optimizing images and critical resources.')
    }

    if (vitals.fid > 100) {
      recommendations.push('FID is high (>100ms). Consider reducing JavaScript execution time.')
    }

    if (vitals.cls > 0.1) {
      recommendations.push('CLS is high (>0.1). Consider fixing layout shifts.')
    }

    if (vitals.ttfb > 600) {
      recommendations.push('TTFB is slow (>600ms). Consider optimizing server response time.')
    }

    const largeResources = resources.filter(r => r.transferSize > 100000)
    if (largeResources.length > 0) {
      recommendations.push(`${largeResources.length} large resources detected. Consider compression or lazy loading.`)
    }

    const slowResources = resources.filter(r => r.duration > 1000)
    if (slowResources.length > 0) {
      recommendations.push(`${slowResources.length} slow resources detected. Consider optimization.`)
    }

    return recommendations
  }

  // Enable/disable monitoring
  setEnabled(enabled: boolean) {
    this.isEnabled = enabled
  }

  // Clear metrics
  clear() {
    this.metrics.clear()
  }

  // Destroy observers
  destroy() {
    this.observers.forEach(observer => observer.disconnect())
    this.observers = []
  }
}

// Singleton instance
export const performanceMonitor = new PerformanceMonitor()

// React hook for performance monitoring
export function usePerformanceMonitor() {
  const [metrics, setMetrics] = React.useState<any[]>([])
  const [coreWebVitals, setCoreWebVitals] = React.useState<any>({})

  React.useEffect(() => {
    const updateMetrics = () => {
      const summary = performanceMonitor.getPerformanceSummary()
      setCoreWebVitals(summary.coreWebVitals)
      setMetrics(Array.from(performanceMonitor.metrics.values()))
    }

    // Update metrics every 5 seconds
    const interval = setInterval(updateMetrics, 5000)
    updateMetrics()

    return () => clearInterval(interval)
  }, [])

  return {
    metrics,
    coreWebVitals,
    measure: (name: string, fn: () => void | Promise<void>) => performanceMonitor.measure(name, fn),
    recordCustomMetric: (name: string, duration: number, metadata?: any) => 
      performanceMonitor.recordCustomMetric(name, duration, metadata),
    getPerformanceSummary: () => performanceMonitor.getPerformanceSummary()
  }
}

// Performance optimization utilities
export const performanceUtils = {
  // Debounce function
  debounce<T extends (...args: any[]) => any>(
    func: T,
    wait: number
  ): (...args: Parameters<T>) => void {
    let timeout: NodeJS.Timeout
    return (...args: Parameters<T>) => {
      clearTimeout(timeout)
      timeout = setTimeout(() => func(...args), wait)
    }
  },

  // Throttle function
  throttle<T extends (...args: any[]) => any>(
    func: T,
    limit: number
  ): (...args: Parameters<T>) => void {
    let inThrottle: boolean
    return (...args: Parameters<T>) => {
      if (!inThrottle) {
        func(...args)
        inThrottle = true
        setTimeout(() => (inThrottle = false), limit)
      }
    }
  },

  // Request idle callback
  requestIdleCallback: (callback: () => void, timeout?: number) => {
    if ('requestIdleCallback' in window) {
      return window.requestIdleCallback(callback, { timeout })
    } else {
      return setTimeout(callback, 1)
    }
  },

  // Cancel idle callback
  cancelIdleCallback: (id: number) => {
    if ('cancelIdleCallback' in window) {
      window.cancelIdleCallback(id)
    } else {
      clearTimeout(id)
    }
  },

  // Preload resource
  preloadResource: (href: string, as: string, type?: string) => {
    const link = document.createElement('link')
    link.rel = 'preload'
    link.href = href
    link.as = as
    if (type) link.type = type
    document.head.appendChild(link)
  },

  // Prefetch resource
  prefetchResource: (href: string) => {
    const link = document.createElement('link')
    link.rel = 'prefetch'
    link.href = href
    document.head.appendChild(link)
  }
}

