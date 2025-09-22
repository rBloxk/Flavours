'use client'

import React, { useState, useRef, useEffect, useCallback } from 'react'
import { cn } from '@/lib/utils'

// Intersection Observer hook for lazy loading
function useIntersectionObserver(
  elementRef: React.RefObject<Element>,
  options: IntersectionObserverInit = {}
) {
  const [isIntersecting, setIsIntersecting] = useState(false)
  const [hasIntersected, setHasIntersected] = useState(false)

  useEffect(() => {
    const element = elementRef.current
    if (!element) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsIntersecting(entry.isIntersecting)
        if (entry.isIntersecting && !hasIntersected) {
          setHasIntersected(true)
        }
      },
      {
        threshold: 0.1,
        rootMargin: '50px',
        ...options
      }
    )

    observer.observe(element)

    return () => {
      observer.unobserve(element)
    }
  }, [elementRef, hasIntersected, options])

  return { isIntersecting, hasIntersected }
}

// Lazy Image Component
interface LazyImageProps {
  src: string
  alt: string
  className?: string
  placeholder?: string
  blurDataURL?: string
  width?: number
  height?: number
  priority?: boolean
  onLoad?: () => void
  onError?: () => void
}

export function LazyImage({
  src,
  alt,
  className,
  placeholder = '/placeholder-image.jpg',
  blurDataURL,
  width,
  height,
  priority = false,
  onLoad,
  onError
}: LazyImageProps) {
  const [imageSrc, setImageSrc] = useState(priority ? src : placeholder)
  const [isLoaded, setIsLoaded] = useState(priority)
  const [hasError, setHasError] = useState(false)
  const imgRef = useRef<HTMLImageElement>(null)
  const { hasIntersected } = useIntersectionObserver(imgRef, {
    threshold: priority ? 0 : 0.1
  })

  useEffect(() => {
    if (hasIntersected && !isLoaded && !hasError) {
      setImageSrc(src)
    }
  }, [hasIntersected, src, isLoaded, hasError])

  const handleLoad = useCallback(() => {
    setIsLoaded(true)
    onLoad?.()
  }, [onLoad])

  const handleError = useCallback(() => {
    setHasError(true)
    setImageSrc(placeholder)
    onError?.()
  }, [placeholder, onError])

  return (
    <div className={cn("relative overflow-hidden", className)}>
      <img
        ref={imgRef}
        src={imageSrc}
        alt={alt}
        width={width}
        height={height}
        onLoad={handleLoad}
        onError={handleError}
        className={cn(
          "transition-all duration-300",
          isLoaded ? "opacity-100 scale-100" : "opacity-0 scale-105",
          hasError && "opacity-50"
        )}
        loading={priority ? "eager" : "lazy"}
        decoding="async"
      />
      
      {/* Blur placeholder */}
      {blurDataURL && !isLoaded && (
        <img
          src={blurDataURL}
          alt=""
          className="absolute inset-0 w-full h-full object-cover filter blur-sm scale-110"
          aria-hidden="true"
        />
      )}
      
      {/* Loading skeleton */}
      {!isLoaded && !hasError && (
        <div className="absolute inset-0 bg-gray-200 dark:bg-gray-700 animate-pulse" />
      )}
    </div>
  )
}

// Lazy Video Component
interface LazyVideoProps {
  src: string
  poster?: string
  className?: string
  width?: number
  height?: number
  controls?: boolean
  autoPlay?: boolean
  muted?: boolean
  loop?: boolean
  onLoad?: () => void
  onError?: () => void
}

export function LazyVideo({
  src,
  poster,
  className,
  width,
  height,
  controls = true,
  autoPlay = false,
  muted = true,
  loop = false,
  onLoad,
  onError
}: LazyVideoProps) {
  const [videoSrc, setVideoSrc] = useState<string | null>(null)
  const [isLoaded, setIsLoaded] = useState(false)
  const [hasError, setHasError] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const { hasIntersected } = useIntersectionObserver(videoRef, {
    threshold: 0.1
  })

  useEffect(() => {
    if (hasIntersected && !videoSrc && !hasError) {
      setVideoSrc(src)
    }
  }, [hasIntersected, src, videoSrc, hasError])

  const handleLoadedData = useCallback(() => {
    setIsLoaded(true)
    onLoad?.()
  }, [onLoad])

  const handleError = useCallback(() => {
    setHasError(true)
    onError?.()
  }, [onError])

  return (
    <div className={cn("relative overflow-hidden", className)}>
      {videoSrc ? (
        <video
          ref={videoRef}
          src={videoSrc}
          poster={poster}
          width={width}
          height={height}
          controls={controls}
          autoPlay={autoPlay}
          muted={muted}
          loop={loop}
          onLoadedData={handleLoadedData}
          onError={handleError}
          className={cn(
            "transition-all duration-300",
            isLoaded ? "opacity-100" : "opacity-0"
          )}
          preload="metadata"
        />
      ) : (
        <div className="w-full h-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-gray-100" />
        </div>
      )}
      
      {/* Loading skeleton */}
      {!isLoaded && !hasError && (
        <div className="absolute inset-0 bg-gray-200 dark:bg-gray-700 animate-pulse" />
      )}
    </div>
  )
}

// Lazy Content Component
interface LazyContentProps {
  children: React.ReactNode
  className?: string
  placeholder?: React.ReactNode
  threshold?: number
  rootMargin?: string
  onIntersect?: () => void
}

export function LazyContent({
  children,
  className,
  placeholder,
  threshold = 0.1,
  rootMargin = '50px',
  onIntersect
}: LazyContentProps) {
  const [hasLoaded, setHasLoaded] = useState(false)
  const contentRef = useRef<HTMLDivElement>(null)
  const { hasIntersected } = useIntersectionObserver(contentRef, {
    threshold,
    rootMargin
  })

  useEffect(() => {
    if (hasIntersected && !hasLoaded) {
      setHasLoaded(true)
      onIntersect?.()
    }
  }, [hasIntersected, hasLoaded, onIntersect])

  return (
    <div ref={contentRef} className={className}>
      {hasLoaded ? (
        children
      ) : (
        placeholder || (
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2" />
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2 w-3/4" />
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
          </div>
        )
      )}
    </div>
  )
}

// Virtual Scrolling Hook
export function useVirtualScroll<T>(
  items: T[],
  itemHeight: number,
  containerHeight: number,
  overscan: number = 5
) {
  const [scrollTop, setScrollTop] = useState(0)

  const visibleStart = Math.floor(scrollTop / itemHeight)
  const visibleEnd = Math.min(
    items.length - 1,
    Math.ceil((scrollTop + containerHeight) / itemHeight)
  )

  const startIndex = Math.max(0, visibleStart - overscan)
  const endIndex = Math.min(items.length - 1, visibleEnd + overscan)

  const visibleItems = items.slice(startIndex, endIndex + 1)
  const totalHeight = items.length * itemHeight
  const offsetY = startIndex * itemHeight

  return {
    visibleItems,
    totalHeight,
    offsetY,
    setScrollTop
  }
}

// Virtual List Component
interface VirtualListProps<T> {
  items: T[]
  itemHeight: number
  containerHeight: number
  renderItem: (item: T, index: number) => React.ReactNode
  className?: string
  overscan?: number
}

export function VirtualList<T>({
  items,
  itemHeight,
  containerHeight,
  renderItem,
  className,
  overscan = 5
}: VirtualListProps<T>) {
  const { visibleItems, totalHeight, offsetY, setScrollTop } = useVirtualScroll(
    items,
    itemHeight,
    containerHeight,
    overscan
  )

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop)
  }

  return (
    <div
      className={cn("overflow-auto", className)}
      style={{ height: containerHeight }}
      onScroll={handleScroll}
    >
      <div style={{ height: totalHeight, position: 'relative' }}>
        <div
          style={{
            transform: `translateY(${offsetY}px)`,
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0
          }}
        >
          {visibleItems.map((item, index) => (
            <div key={index} style={{ height: itemHeight }}>
              {renderItem(item, index)}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// Image Gallery with Lazy Loading
interface LazyImageGalleryProps {
  images: Array<{
    src: string
    alt: string
    thumbnail?: string
  }>
  className?: string
  columns?: number
  gap?: number
}

export function LazyImageGallery({
  images,
  className,
  columns = 3,
  gap = 4
}: LazyImageGalleryProps) {
  return (
    <div
      className={cn("grid", className)}
      style={{
        gridTemplateColumns: `repeat(${columns}, 1fr)`,
        gap: `${gap * 0.25}rem`
      }}
    >
      {images.map((image, index) => (
        <LazyImage
          key={index}
          src={image.src}
          alt={image.alt}
          className="aspect-square object-cover rounded-lg"
          placeholder={image.thumbnail}
        />
      ))}
    </div>
  )
}

