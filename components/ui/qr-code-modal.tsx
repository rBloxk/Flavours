"use client"

import React, { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { 
  QrCode, 
  Download, 
  Share2, 
  Copy, 
  Check, 
  Crown,
  Shield,
  Sparkles,
  Smartphone,
  Monitor,
  Printer
} from 'lucide-react'
import QRCode from 'qrcode'
import { toast } from 'sonner'

interface QRCodeModalProps {
  children: React.ReactNode
  profileUrl: string
  profileData: {
    displayName: string
    username: string
    avatarUrl?: string
    isVerified?: boolean
    isCreator?: boolean
    bio?: string
  }
}

export function QRCodeModal({ children, profileUrl, profileData }: QRCodeModalProps) {
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [isLinkCopied, setIsLinkCopied] = useState(false)
  const [isOpen, setIsOpen] = useState(false)

  // Generate QR code when modal opens
  useEffect(() => {
    if (isOpen && !qrCodeDataUrl) {
      generateQRCode()
    }
  }, [isOpen])

  const generateQRCode = async () => {
    setIsGenerating(true)
    try {
      // Create QR code with profile URL
      const qrCodeUrl = await QRCode.toDataURL(profileUrl, {
        width: 256,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        },
        errorCorrectionLevel: 'M'
      })
      setQrCodeDataUrl(qrCodeUrl)
    } catch (error) {
      console.error('Error generating QR code:', error)
      toast.error('Failed to generate QR code')
    } finally {
      setIsGenerating(false)
    }
  }

  const downloadQRCode = () => {
    if (!qrCodeDataUrl) return
    
    const link = document.createElement('a')
    link.download = `flavours-profile-${profileData.username}-qr.png`
    link.href = qrCodeDataUrl
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    
    toast.success('QR code downloaded successfully!')
  }

  const copyProfileLink = async () => {
    try {
      await navigator.clipboard.writeText(profileUrl)
      setIsLinkCopied(true)
      setTimeout(() => setIsLinkCopied(false), 2000)
      toast.success('Profile link copied to clipboard!')
    } catch (error) {
      console.error('Failed to copy link:', error)
      toast.error('Failed to copy link')
    }
  }

  const shareProfile = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${profileData.displayName} - Flavours Profile`,
          text: `Check out ${profileData.displayName}'s profile on Flavours!`,
          url: profileUrl
        })
      } catch (error) {
        console.error('Error sharing:', error)
        // Fallback to copy link
        copyProfileLink()
      }
    } else {
      // Fallback to copy link
      copyProfileLink()
    }
  }

  const printQRCode = () => {
    if (!qrCodeDataUrl) return
    
    const printWindow = window.open('', '_blank')
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Flavours Profile QR Code</title>
            <style>
              body { 
                font-family: Arial, sans-serif; 
                text-align: center; 
                padding: 20px;
                background: white;
              }
              .header { 
                margin-bottom: 20px; 
              }
              .profile-info {
                margin-bottom: 20px;
                padding: 20px;
                border: 1px solid #ddd;
                border-radius: 10px;
                background: #f9f9f9;
              }
              .qr-code { 
                margin: 20px 0; 
              }
              .instructions {
                margin-top: 20px;
                font-size: 14px;
                color: #666;
              }
            </style>
          </head>
          <body>
            <div class="header">
              <h1>Flavours Profile QR Code</h1>
            </div>
            <div class="profile-info">
              <h2>${profileData.displayName}</h2>
              <p>@${profileData.username}</p>
              ${profileData.bio ? `<p>${profileData.bio}</p>` : ''}
            </div>
            <div class="qr-code">
              <img src="${qrCodeDataUrl}" alt="QR Code" />
            </div>
            <div class="instructions">
              <p>Scan this QR code to visit ${profileData.displayName}'s profile on Flavours</p>
              <p>Or visit: ${profileUrl}</p>
            </div>
          </body>
        </html>
      `)
      printWindow.document.close()
      printWindow.print()
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <QrCode className="h-5 w-5" />
            Share Profile QR Code
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Profile Preview */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-3 mb-3">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={profileData.avatarUrl} alt={profileData.displayName} />
                  <AvatarFallback className="text-lg">
                    {profileData.displayName?.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <h3 className="font-semibold">{profileData.displayName}</h3>
                    {profileData.isVerified && (
                      <Shield className="h-4 w-4 text-blue-600" />
                    )}
                    {profileData.isCreator && (
                      <Crown className="h-4 w-4 text-purple-600" />
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">@{profileData.username}</p>
                  {profileData.bio && (
                    <p className="text-sm text-muted-foreground mt-1">{profileData.bio}</p>
                  )}
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Badge variant="secondary" className="bg-gradient-to-r from-purple-100 to-pink-100 text-purple-800">
                  <Sparkles className="h-3 w-3 mr-1" />
                  Flavours Profile
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* QR Code Display */}
          <div className="text-center">
            <div className="inline-block p-4 bg-white rounded-lg shadow-lg border">
              {isGenerating ? (
                <div className="w-64 h-64 flex items-center justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : qrCodeDataUrl ? (
                <img 
                  src={qrCodeDataUrl} 
                  alt="Profile QR Code" 
                  className="w-64 h-64"
                />
              ) : (
                <div className="w-64 h-64 flex items-center justify-center bg-muted rounded">
                  <QrCode className="h-16 w-16 text-muted-foreground" />
                </div>
              )}
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              Scan with your phone to visit this profile
            </p>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-3">
            <Button
              variant="outline"
              onClick={downloadQRCode}
              disabled={!qrCodeDataUrl || isGenerating}
              className="flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              Download
            </Button>
            
            <Button
              variant="outline"
              onClick={shareProfile}
              className="flex items-center gap-2"
            >
              <Share2 className="h-4 w-4" />
              Share
            </Button>
            
            <Button
              variant="outline"
              onClick={copyProfileLink}
              className={`flex items-center gap-2 ${
                isLinkCopied ? 'bg-green-50 border-green-200' : ''
              }`}
            >
              {isLinkCopied ? (
                <>
                  <Check className="h-4 w-4" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4" />
                  Copy Link
                </>
              )}
            </Button>
            
            <Button
              variant="outline"
              onClick={printQRCode}
              disabled={!qrCodeDataUrl || isGenerating}
              className="flex items-center gap-2"
            >
              <Printer className="h-4 w-4" />
              Print
            </Button>
          </div>

          {/* Profile URL Display */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Profile URL</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={profileUrl}
                readOnly
                className="flex-1 px-3 py-2 text-sm border rounded-md bg-muted"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={copyProfileLink}
                className="px-3"
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Instructions */}
          <div className="bg-muted/50 rounded-lg p-4">
            <h4 className="font-medium mb-2 flex items-center gap-2">
              <Smartphone className="h-4 w-4" />
              How to use this QR code
            </h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Open your phone's camera app</li>
              <li>• Point it at the QR code</li>
              <li>• Tap the notification to open the profile</li>
              <li>• Or save the image and scan it later</li>
            </ul>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
