"use client"

import React from 'react'
import Link from 'next/link'
import { FlavoursLogo } from '@/components/ui/flavours-logo'
import { Heart, MapPin, Mail, Phone, Globe } from 'lucide-react'

export function ResourceFooter() {
  return (
    <footer className="bg-muted/50 border-t">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Brand Section */}
          <div className="lg:col-span-1">
            <div className="flex items-center space-x-2 mb-4">
              <FlavoursLogo className="h-8 w-8" />
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Empowering creators to build meaningful connections and sustainable businesses.
            </p>
            <div className="border-t border-muted-foreground/20 pt-4">
                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                  <Globe className="w-4 h-4" />
                  <select className="bg-transparent border-none outline-none text-sm text-muted-foreground cursor-pointer pr-6">
                    <option value="en">English</option>
                    <option value="es">Español</option>
                    <option value="fr">Français</option>
                    <option value="de">Deutsch</option>
                    <option value="it">Italiano</option>
                    <option value="pt">Português</option>
                    <option value="ru">Русский</option>
                    <option value="ja">日本語</option>
                    <option value="ko">한국어</option>
                    <option value="zh">中文</option>
                    <option value="ar">العربية</option>
                    <option value="hi">हिन्दी</option>
                    <option value="tr">Türkçe</option>
                    <option value="nl">Nederlands</option>
                    <option value="sv">Svenska</option>
                  </select>
                </div>
              </div>
          </div>

          {/* Support Section */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-foreground">Support</h3>
            <div className="space-y-2">
              <Link 
                href="/resources/support/help" 
                className="block text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Help
              </Link>
              <Link 
                href="/resources/support/store" 
                className="block text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Store
              </Link>
              <Link 
                href="/resources/support/cookie-notice" 
                className="block text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Cookie Notice
              </Link>
              <Link 
                href="/resources/support/safety-center" 
                className="block text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Flavours Safety & Transparency Center
              </Link>
            </div>
          </div>

          {/* Legal Section */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-foreground">Legal</h3>
            <div className="space-y-2">
              <Link 
                href="/resources/legal/about" 
                className="block text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                About
              </Link>
              <Link 
                href="/resources/legal/terms" 
                className="block text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Terms of Service
              </Link>
              <Link 
                href="/resources/legal/dmca" 
                className="block text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                DMCA
              </Link>
              <Link 
                href="/resources/legal/anti-slavery" 
                className="block text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Anti-Slavery and Anti-Trafficking Statement
              </Link>
            </div>
          </div>

          {/* Resources Section */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-foreground">Resources</h3>
            <div className="space-y-2">
              <Link 
                href="/resources/resources/blog" 
                className="block text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Blog
              </Link>
              <Link 
                href="/resources/resources/privacy" 
                className="block text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Privacy
              </Link>
              <Link 
                href="/resources/resources/usc-2257" 
                className="block text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                USC 2257
              </Link>
              <Link 
                href="/resources/resources/acceptable-use" 
                className="block text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Acceptable Use Policy
              </Link>
            </div>
          </div>

          {/* Business Section */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-foreground">Business</h3>
            <div className="space-y-2">
              <Link 
                href="/resources/business/branding" 
                className="block text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Branding
              </Link>
              <Link 
                href="/resources/business/complaints" 
                className="block text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Complaints Policy
              </Link>
              <Link 
                href="/resources/business/contract" 
                className="block text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Contract between Fan and Creator
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-muted-foreground/20 pt-6 mt-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-sm text-muted-foreground">
              <p>&copy; 2025 Flavours Platform. A rBloxk Product. All rights reserved.</p>
            </div>
            <div className="flex items-center space-x-4 text-sm text-muted-foreground">
              <span className="flex items-center space-x-1">
               
                <span>Made with ❤️ for Creators and Flavours</span>
              </span>
            </div>
          </div>
          
          {/* Contact Information */}
          <div className="mt-4 pt-4 border-t border-muted-foreground/10">
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6 text-xs text-muted-foreground">
              <div className="flex items-center space-x-1">
                <Mail className="h-3 w-3" />
                <span>hello@flavours.club</span>
              </div>
              <div className="flex items-center space-x-1">
                <Phone className="h-3 w-3" />
                <span>+1 (555) 123-4567</span>
              </div>
              <div className="flex items-center space-x-1">
                <MapPin className="h-3 w-3" />
                <span>San Francisco, CA, USA</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
