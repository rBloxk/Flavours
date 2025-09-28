"use client"

import Image from 'next/image'
import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'

interface FlavoursLogoProps {
  className?: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
}

export function FlavoursLogo({ className = '', size = 'md' }: FlavoursLogoProps) {
  const { theme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [imageError, setImageError] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }

  const sizeClasses = {
    sm: 'h-6 w-auto',
    md: 'h-8 w-auto', 
    lg: 'h-12 w-auto',
    xl: 'h-16 w-auto'
  }

  const textSizeClasses = {
    sm: 'text-sm',
    md: 'text-base', 
    lg: 'text-xl',
    xl: 'text-2xl'
  }

  const isDark = theme === 'dark'

  // If image fails to load, show text fallback
  if (imageError) {
    return (
      <div className={`${sizeClasses[size]} ${className} flex items-center`}>
        <span className={`font-bold ${textSizeClasses[size]}`}>
          <span className="text-black dark:text-white">Flav</span>
          <span className="text-red-600">ours</span>
        </span>
      </div>
    )
  }

  // Load PNG images from /images/ folder
  const logoSrc = isDark ? '/images/white-flav.png' : '/images/black-flav.png'

  return (
    <div className={`${sizeClasses[size]} ${className} flex items-center`}>
      <Image
        src={logoSrc}
        alt="Flavours"
        width={797}
        height={184}
        className="h-full w-auto object-contain"
        onError={() => setImageError(true)}
        priority
      />
    </div>
  )
}
