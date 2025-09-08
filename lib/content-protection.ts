/**
 * Content Protection System
 * Prevents unauthorized access, downloading, and piracy of paid content
 */

export class ContentProtection {
  private static instance: ContentProtection
  private isProtected = false
  private watermark: string | null = null
  private accessToken: string | null = null

  static getInstance(): ContentProtection {
    if (!ContentProtection.instance) {
      ContentProtection.instance = new ContentProtection()
    }
    return ContentProtection.instance
  }

  /**
   * Initialize content protection
   */
  initialize(watermark?: string, accessToken?: string): void {
    this.watermark = watermark || null
    this.accessToken = accessToken || null
    this.isProtected = true
    
    this.applyProtection()
  }

  /**
   * Apply comprehensive protection measures
   */
  private applyProtection(): void {
    if (typeof window === 'undefined') return

    // Disable right-click context menu
    this.disableContextMenu()
    
    // Disable keyboard shortcuts
    this.disableKeyboardShortcuts()
    
    // Disable drag and drop
    this.disableDragDrop()
    
    // Disable text selection
    this.disableTextSelection()
    
    // Disable image saving
    this.disableImageSaving()
    
    // Detect developer tools
    this.detectDevTools()
    
    // Add watermark overlay
    if (this.watermark) {
      this.addWatermarkOverlay()
    }
    
    // Monitor for suspicious activity
    this.monitorSuspiciousActivity()
  }

  /**
   * Disable right-click context menu
   */
  private disableContextMenu(): void {
    document.addEventListener('contextmenu', (e) => {
      e.preventDefault()
      this.logSuspiciousActivity('Right-click attempt')
      return false
    })
  }

  /**
   * Disable keyboard shortcuts
   */
  private disableKeyboardShortcuts(): void {
    document.addEventListener('keydown', (e) => {
      // Disable common shortcuts
      const blockedShortcuts = [
        { key: 'F12' }, // Developer tools
        { ctrl: true, shift: true, key: 'I' }, // Developer tools
        { ctrl: true, shift: true, key: 'C' }, // Developer tools
        { ctrl: true, key: 'u' }, // View source
        { ctrl: true, key: 's' }, // Save
        { ctrl: true, key: 'a' }, // Select all
        { ctrl: true, key: 'c' }, // Copy
        { ctrl: true, key: 'v' }, // Paste
        { ctrl: true, key: 'p' }, // Print
        { ctrl: true, key: 'f' }, // Find (might reveal content)
        { ctrl: true, key: 'g' }, // Find next
        { ctrl: true, key: 'h' }, // Find and replace
      ]

      const isBlocked = blockedShortcuts.some(shortcut => {
        const ctrlMatch = shortcut.ctrl ? e.ctrlKey : !e.ctrlKey
        const shiftMatch = shortcut.shift ? e.shiftKey : !e.shiftKey
        const keyMatch = shortcut.key === e.key
        
        return ctrlMatch && shiftMatch && keyMatch
      })

      if (isBlocked) {
        e.preventDefault()
        this.logSuspiciousActivity(`Blocked shortcut: ${e.key}`)
        return false
      }
    })
  }

  /**
   * Disable drag and drop
   */
  private disableDragDrop(): void {
    document.addEventListener('dragstart', (e) => {
      e.preventDefault()
      this.logSuspiciousActivity('Drag attempt')
      return false
    })

    document.addEventListener('drop', (e) => {
      e.preventDefault()
      this.logSuspiciousActivity('Drop attempt')
      return false
    })

    document.addEventListener('dragover', (e) => {
      e.preventDefault()
      return false
    })
  }

  /**
   * Disable text selection
   */
  private disableTextSelection(): void {
    document.addEventListener('selectstart', (e) => {
      e.preventDefault()
      this.logSuspiciousActivity('Text selection attempt')
      return false
    })

    // Add CSS to prevent selection
    const style = document.createElement('style')
    style.textContent = `
      * {
        -webkit-user-select: none !important;
        -moz-user-select: none !important;
        -ms-user-select: none !important;
        user-select: none !important;
        -webkit-touch-callout: none !important;
        -webkit-tap-highlight-color: transparent !important;
      }
    `
    document.head.appendChild(style)
  }

  /**
   * Disable image saving
   */
  private disableImageSaving(): void {
    // Disable image context menu
    document.addEventListener('contextmenu', (e) => {
      const target = e.target as HTMLElement
      if (target.tagName === 'IMG' || target.tagName === 'VIDEO') {
        e.preventDefault()
        this.logSuspiciousActivity('Image/Video context menu attempt')
        return false
      }
    })

    // Add CSS to prevent image dragging
    const style = document.createElement('style')
    style.textContent = `
      img, video {
        -webkit-user-drag: none !important;
        -khtml-user-drag: none !important;
        -moz-user-drag: none !important;
        -o-user-drag: none !important;
        user-drag: none !important;
        pointer-events: none !important;
      }
    `
    document.head.appendChild(style)
  }

  /**
   * Detect developer tools
   */
  private detectDevTools(): void {
    let devtools = false
    
    const checkDevTools = () => {
      const threshold = 160
      
      if (
        window.outerHeight - window.innerHeight > threshold ||
        window.outerWidth - window.innerWidth > threshold
      ) {
        if (!devtools) {
          devtools = true
          this.logSuspiciousActivity('Developer tools detected')
          this.handleDevToolsDetection()
        }
      } else {
        devtools = false
      }
    }

    // Check on resize
    window.addEventListener('resize', checkDevTools)
    
    // Check periodically
    setInterval(checkDevTools, 1000)
    
    // Check on focus (dev tools might open)
    window.addEventListener('focus', checkDevTools)
  }

  /**
   * Handle developer tools detection
   */
  private handleDevToolsDetection(): void {
    // Show warning
    this.showWarning('Developer tools detected. Content protection may be compromised.')
    
    // In a real implementation, you might:
    // - Blur the content
    // - Redirect to a warning page
    // - Log the incident
    // - Disable the content
  }

  /**
   * Add watermark overlay
   */
  private addWatermarkOverlay(): void {
    if (!this.watermark) return

    const overlay = document.createElement('div')
    overlay.id = 'content-protection-watermark'
    overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      z-index: 9999;
      background: repeating-linear-gradient(
        45deg,
        transparent,
        transparent 100px,
        rgba(255, 255, 255, 0.05) 100px,
        rgba(255, 255, 255, 0.05) 200px
      );
      background-image: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="100"><text x="50%" y="50%" text-anchor="middle" dy=".3em" fill="rgba(255,255,255,0.1)" font-family="Arial" font-size="12">${this.watermark}</text></svg>');
    `
    
    document.body.appendChild(overlay)
  }

  /**
   * Monitor for suspicious activity
   */
  private monitorSuspiciousActivity(): void {
    // Monitor for iframe embedding
    if (window !== window.top) {
      this.logSuspiciousActivity('Iframe embedding detected')
      this.handleIframeEmbedding()
    }

    // Monitor for screenshot attempts (simplified)
    document.addEventListener('keydown', (e) => {
      if (e.key === 'PrintScreen') {
        e.preventDefault()
        this.logSuspiciousActivity('Screenshot attempt')
        return false
      }
    })

    // Monitor for window blur (might indicate screenshot tools)
    let blurCount = 0
    window.addEventListener('blur', () => {
      blurCount++
      if (blurCount > 3) {
        this.logSuspiciousActivity('Multiple window blur events')
      }
    })
  }

  /**
   * Handle iframe embedding
   */
  private handleIframeEmbedding(): void {
    this.showWarning('This content cannot be embedded in other websites.')
    
    // In a real implementation, you might redirect or blur content
  }

  /**
   * Log suspicious activity
   */
  private logSuspiciousActivity(activity: string): void {
    const logData = {
      timestamp: new Date().toISOString(),
      activity,
      userAgent: navigator.userAgent,
      url: window.location.href,
      watermark: this.watermark,
      accessToken: this.accessToken ? this.accessToken.substring(0, 8) + '...' : null
    }

    console.warn('Suspicious activity detected:', logData)
    
    // In a real implementation, send to monitoring service
    // this.sendToMonitoringService(logData)
  }

  /**
   * Show warning message
   */
  private showWarning(message: string): void {
    // Create warning overlay
    const warning = document.createElement('div')
    warning.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: rgba(0, 0, 0, 0.9);
      color: white;
      padding: 20px;
      border-radius: 8px;
      z-index: 10000;
      text-align: center;
      max-width: 400px;
    `
    warning.innerHTML = `
      <h3 style="margin: 0 0 10px 0; color: #ff6b6b;">⚠️ Security Warning</h3>
      <p style="margin: 0;">${message}</p>
    `
    
    document.body.appendChild(warning)
    
    // Remove after 5 seconds
    setTimeout(() => {
      if (warning.parentNode) {
        warning.parentNode.removeChild(warning)
      }
    }, 5000)
  }

  /**
   * Disable protection (for cleanup)
   */
  disable(): void {
    this.isProtected = false
    
    // Remove watermark overlay
    const watermark = document.getElementById('content-protection-watermark')
    if (watermark) {
      watermark.remove()
    }
    
    // Remove event listeners would require more complex implementation
    // In a real app, you'd store references to remove them
  }

  /**
   * Check if protection is active
   */
  isActive(): boolean {
    return this.isProtected
  }

  /**
   * Get protection status
   */
  getStatus(): any {
    return {
      isProtected: this.isProtected,
      watermark: this.watermark,
      hasAccessToken: !!this.accessToken,
      timestamp: new Date().toISOString()
    }
  }
}

// Export singleton instance
export const contentProtection = ContentProtection.getInstance()
