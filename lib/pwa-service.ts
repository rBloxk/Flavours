// Progressive Web App service for enhanced mobile experience
import React from 'react'

export class PWAService {
  private registration: ServiceWorkerRegistration | null = null
  private deferredPrompt: any = null
  private isInstalled = false

  constructor() {
    this.initializePWA()
  }

  // Initialize PWA features
  private async initializePWA() {
    if (typeof window === 'undefined') return

    // Register service worker
    if ('serviceWorker' in navigator) {
      try {
        this.registration = await navigator.serviceWorker.register('/sw.js')
        console.log('Service Worker registered successfully')
      } catch (error) {
        console.error('Service Worker registration failed:', error)
      }
    }

    // Listen for beforeinstallprompt event
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault()
      this.deferredPrompt = e
      this.showInstallPrompt()
    })

    // Check if app is already installed
    window.addEventListener('appinstalled', () => {
      this.isInstalled = true
      console.log('PWA was installed')
    })

    // Handle app updates
    if (this.registration) {
      this.registration.addEventListener('updatefound', () => {
        const newWorker = this.registration!.installing
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              this.showUpdatePrompt()
            }
          })
        }
      })
    }

    // Setup offline handling
    this.setupOfflineHandling()
  }

  // Show install prompt
  private showInstallPrompt() {
    // Create install banner
    const banner = document.createElement('div')
    banner.id = 'pwa-install-banner'
    banner.className = 'fixed bottom-4 left-4 right-4 z-50 bg-blue-500 text-white p-4 rounded-lg shadow-lg flex items-center justify-between'
    banner.innerHTML = `
      <div class="flex items-center space-x-3">
        <div class="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
          📱
        </div>
        <div>
          <p class="font-semibold">Install Flavours</p>
          <p class="text-sm opacity-90">Get the full app experience</p>
        </div>
      </div>
      <div class="flex items-center space-x-2">
        <button id="pwa-install-btn" class="bg-white text-blue-500 px-4 py-2 rounded font-semibold">
          Install
        </button>
        <button id="pwa-dismiss-btn" class="text-white/80 hover:text-white">
          ✕
        </button>
      </div>
    `

    document.body.appendChild(banner)

    // Handle install button click
    document.getElementById('pwa-install-btn')?.addEventListener('click', () => {
      this.installApp()
    })

    // Handle dismiss button click
    document.getElementById('pwa-dismiss-btn')?.addEventListener('click', () => {
      this.dismissInstallPrompt()
    })

    // Auto-dismiss after 10 seconds
    setTimeout(() => {
      this.dismissInstallPrompt()
    }, 10000)
  }

  // Install the app
  async installApp(): Promise<boolean> {
    if (!this.deferredPrompt) return false

    try {
      this.deferredPrompt.prompt()
      const { outcome } = await this.deferredPrompt.userChoice
      
      if (outcome === 'accepted') {
        console.log('User accepted the install prompt')
        this.dismissInstallPrompt()
        return true
      } else {
        console.log('User dismissed the install prompt')
        this.dismissInstallPrompt()
        return false
      }
    } catch (error) {
      console.error('Install prompt error:', error)
      return false
    }
  }

  // Dismiss install prompt
  private dismissInstallPrompt() {
    const banner = document.getElementById('pwa-install-banner')
    if (banner) {
      banner.remove()
    }
  }

  // Show update prompt
  private showUpdatePrompt() {
    const banner = document.createElement('div')
    banner.id = 'pwa-update-banner'
    banner.className = 'fixed top-4 left-4 right-4 z-50 bg-green-500 text-white p-4 rounded-lg shadow-lg flex items-center justify-between'
    banner.innerHTML = `
      <div class="flex items-center space-x-3">
        <div class="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
          🔄
        </div>
        <div>
          <p class="font-semibold">Update Available</p>
          <p class="text-sm opacity-90">New features and improvements</p>
        </div>
      </div>
      <div class="flex items-center space-x-2">
        <button id="pwa-update-btn" class="bg-white text-green-500 px-4 py-2 rounded font-semibold">
          Update
        </button>
        <button id="pwa-update-dismiss-btn" class="text-white/80 hover:text-white">
          ✕
        </button>
      </div>
    `

    document.body.appendChild(banner)

    document.getElementById('pwa-update-btn')?.addEventListener('click', () => {
      this.updateApp()
    })

    document.getElementById('pwa-update-dismiss-btn')?.addEventListener('click', () => {
      this.dismissUpdatePrompt()
    })
  }

  // Update the app
  private updateApp() {
    if (this.registration && this.registration.waiting) {
      this.registration.waiting.postMessage({ type: 'SKIP_WAITING' })
      window.location.reload()
    }
  }

  // Dismiss update prompt
  private dismissUpdatePrompt() {
    const banner = document.getElementById('pwa-update-banner')
    if (banner) {
      banner.remove()
    }
  }

  // Setup offline handling
  private setupOfflineHandling() {
    // Show offline indicator
    window.addEventListener('online', () => {
      this.showOnlineIndicator()
    })

    window.addEventListener('offline', () => {
      this.showOfflineIndicator()
    })

    // Check initial connection status
    if (!navigator.onLine) {
      this.showOfflineIndicator()
    }
  }

  // Show online indicator
  private showOnlineIndicator() {
    const indicator = document.createElement('div')
    indicator.id = 'pwa-online-indicator'
    indicator.className = 'fixed top-4 right-4 z-50 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg flex items-center space-x-2'
    indicator.innerHTML = `
      <div class="w-2 h-2 bg-white rounded-full"></div>
      <span class="text-sm font-medium">Back online</span>
    `

    document.body.appendChild(indicator)

    setTimeout(() => {
      indicator.remove()
    }, 3000)
  }

  // Show offline indicator
  private showOfflineIndicator() {
    const indicator = document.createElement('div')
    indicator.id = 'pwa-offline-indicator'
    indicator.className = 'fixed top-4 right-4 z-50 bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg flex items-center space-x-2'
    indicator.innerHTML = `
      <div class="w-2 h-2 bg-white rounded-full"></div>
      <span class="text-sm font-medium">You're offline</span>
    `

    document.body.appendChild(indicator)
  }

  // Request notification permission
  async requestNotificationPermission(): Promise<boolean> {
    if (!('Notification' in window)) {
      console.log('This browser does not support notifications')
      return false
    }

    if (Notification.permission === 'granted') {
      return true
    }

    if (Notification.permission === 'denied') {
      console.log('Notification permission denied')
      return false
    }

    const permission = await Notification.requestPermission()
    return permission === 'granted'
  }

  // Send notification
  sendNotification(title: string, options: NotificationOptions = {}) {
    if (Notification.permission === 'granted') {
      new Notification(title, {
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        ...options
      })
    }
  }

  // Setup push notifications
  async setupPushNotifications(): Promise<boolean> {
    if (!this.registration) return false

    try {
      const subscription = await this.registration.pushManager.getSubscription()
      
      if (!subscription) {
        const newSubscription = await this.registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
        })
        
        // Send subscription to server
        await fetch('/api/v1/notifications/subscribe', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify(newSubscription)
        })
        
        return true
      }
      
      return true
    } catch (error) {
      console.error('Push notification setup failed:', error)
      return false
    }
  }

  // Share content
  async shareContent(data: ShareData): Promise<boolean> {
    if (navigator.share) {
      try {
        await navigator.share(data)
        return true
      } catch (error) {
        console.error('Share failed:', error)
        return false
      }
    } else {
      // Fallback to clipboard
      if (data.url) {
        try {
          await navigator.clipboard.writeText(data.url)
          this.showToast('Link copied to clipboard')
          return true
        } catch (error) {
          console.error('Clipboard write failed:', error)
          return false
        }
      }
    }
    
    return false
  }

  // Show toast notification
  private showToast(message: string, type: 'success' | 'error' | 'info' = 'info') {
    const toast = document.createElement('div')
    toast.className = `fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50 px-4 py-2 rounded-lg shadow-lg text-white text-sm font-medium ${
      type === 'success' ? 'bg-green-500' :
      type === 'error' ? 'bg-red-500' :
      'bg-blue-500'
    }`
    toast.textContent = message

    document.body.appendChild(toast)

    setTimeout(() => {
      toast.remove()
    }, 3000)
  }

  // Get app info
  getAppInfo() {
    return {
      isInstalled: this.isInstalled,
      isOnline: navigator.onLine,
      hasServiceWorker: !!this.registration,
      canInstall: !!this.deferredPrompt,
      supportsNotifications: 'Notification' in window,
      supportsShare: 'share' in navigator,
      supportsClipboard: 'clipboard' in navigator
    }
  }

  // Clear app data
  async clearAppData() {
    if ('caches' in window) {
      const cacheNames = await caches.keys()
      await Promise.all(cacheNames.map(name => caches.delete(name)))
    }

    if ('indexedDB' in window) {
      // Clear IndexedDB
      const databases = await indexedDB.databases()
      await Promise.all(databases.map(db => {
        return new Promise((resolve, reject) => {
          const deleteReq = indexedDB.deleteDatabase(db.name!)
          deleteReq.onsuccess = () => resolve(true)
          deleteReq.onerror = () => reject(deleteReq.error)
        })
      }))
    }

    // Clear localStorage
    localStorage.clear()
    sessionStorage.clear()

    this.showToast('App data cleared', 'success')
  }
}

// Singleton instance
export const pwaService = new PWAService()

// React hooks for PWA features
export function usePWA() {
  const [appInfo, setAppInfo] = React.useState<any>(null)
  const [isOnline, setIsOnline] = React.useState(navigator.onLine)

  React.useEffect(() => {
    setAppInfo(pwaService.getAppInfo())

    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  const installApp = React.useCallback(() => pwaService.installApp(), [])
  const requestNotificationPermission = React.useCallback(() => pwaService.requestNotificationPermission(), [])
  const setupPushNotifications = React.useCallback(() => pwaService.setupPushNotifications(), [])
  const shareContent = React.useCallback((data: ShareData) => pwaService.shareContent(data), [])
  const clearAppData = React.useCallback(() => pwaService.clearAppData(), [])

  return {
    appInfo,
    isOnline,
    installApp,
    requestNotificationPermission,
    setupPushNotifications,
    shareContent,
    clearAppData
  }
}

// Mobile optimization utilities
export const mobileUtils = {
  // Detect mobile device
  isMobile: () => {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
  },

  // Detect touch device
  isTouchDevice: () => {
    return 'ontouchstart' in window || navigator.maxTouchPoints > 0
  },

  // Get device info
  getDeviceInfo: () => {
    const userAgent = navigator.userAgent
    const isMobile = mobileUtils.isMobile()
    const isTouch = mobileUtils.isTouchDevice()
    
    return {
      isMobile,
      isTouch,
      userAgent,
      screenWidth: window.screen.width,
      screenHeight: window.screen.height,
      viewportWidth: window.innerWidth,
      viewportHeight: window.innerHeight,
      pixelRatio: window.devicePixelRatio
    }
  },

  // Optimize images for mobile
  getOptimizedImageUrl: (url: string, width?: number, quality: number = 80) => {
    if (!width) {
      const deviceInfo = mobileUtils.getDeviceInfo()
      width = deviceInfo.isMobile ? 400 : 800
    }
    
    return `${url}?w=${width}&q=${quality}&f=auto`
  },

  // Handle mobile gestures
  setupSwipeGestures: (element: HTMLElement, callbacks: {
    onSwipeLeft?: () => void
    onSwipeRight?: () => void
    onSwipeUp?: () => void
    onSwipeDown?: () => void
  }) => {
    let startX = 0
    let startY = 0
    let endX = 0
    let endY = 0

    element.addEventListener('touchstart', (e) => {
      startX = e.touches[0].clientX
      startY = e.touches[0].clientY
    })

    element.addEventListener('touchend', (e) => {
      endX = e.changedTouches[0].clientX
      endY = e.changedTouches[0].clientY
      
      const diffX = startX - endX
      const diffY = startY - endY
      const minSwipeDistance = 50

      if (Math.abs(diffX) > Math.abs(diffY)) {
        if (Math.abs(diffX) > minSwipeDistance) {
          if (diffX > 0) {
            callbacks.onSwipeLeft?.()
          } else {
            callbacks.onSwipeRight?.()
          }
        }
      } else {
        if (Math.abs(diffY) > minSwipeDistance) {
          if (diffY > 0) {
            callbacks.onSwipeUp?.()
          } else {
            callbacks.onSwipeDown?.()
          }
        }
      }
    })
  }
}
