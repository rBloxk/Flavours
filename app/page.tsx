"use client"

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/providers/auth-provider'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { FlavoursLogo } from '@/components/ui/flavours-logo'
import { Crown, Users, DollarSign, Shield, Zap, Star } from 'lucide-react'

export default function LandingPage() {
  const { user, loading } = useAuth()
  const router = useRouter()

  console.log('LandingPage: loading:', loading, 'user:', user)

  useEffect(() => {
    console.log('LandingPage useEffect: loading:', loading, 'user:', user)
    if (!loading) {
      if (typeof window !== 'undefined') {
        const isAuthenticated = localStorage.getItem('isAuthenticated')
        console.log('LandingPage: isAuthenticated from localStorage:', isAuthenticated)
        if (isAuthenticated === 'true' || user) {
          console.log('LandingPage: Redirecting to /feed')
          router.push('/feed')
        }
      }
    }
  }, [user, loading, router])

  if (loading) {
    console.log('LandingPage: Showing loading spinner')
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (user) {
    return null // Will redirect to feed
  }

  const features = [
    {
      icon: Crown,
      title: 'Premium Content',
      description: 'Unlock exclusive content from your favorite creators with subscription tiers and pay-per-view posts.',
    },
    {
      icon: DollarSign,
      title: 'Creator Monetization',
      description: 'Multiple revenue streams including subscriptions, tips, and premium content sales.',
    },
    {
      icon: Shield,
      title: 'Trust & Safety',
      description: 'Advanced moderation tools and compliance features ensure a safe platform for everyone.',
    },
    {
      icon: Users,
      title: 'Community Building',
      description: 'Direct messaging, live interactions, and fan engagement tools to build lasting relationships.',
    },
    {
      icon: Zap,
      title: 'Real-time Features',
      description: 'Live notifications, instant messaging, and real-time content updates.',
    },
    {
      icon: Star,
      title: 'Premium Experience',
      description: 'High-quality streaming, advanced analytics, and professional creator tools.',
    },
  ]

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-700">
        <div className="container mx-auto px-6 py-24 text-center">
          <div className="flex items-center justify-center space-x-2 mb-6">
            <FlavoursLogo size="xl" />
          </div>
          
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
            Connect with Creators.
            <br />
            <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Unlock Exclusive Content.
            </span>
          </h1>
          
          <p className="text-lg sm:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto px-4">
            The premium platform where creators share exclusive content and fans get closer to their favorite personalities through subscriptions, tips, and direct interactions.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 px-4">
            <Button size="lg" onClick={() => router.push('/auth')} className="text-lg px-8 w-full sm:w-auto">
              Get Started
            </Button>
            <Button size="lg" variant="outline" onClick={() => router.push('/auth')} className="text-lg px-8 w-full sm:w-auto">
              Learn More
            </Button>
          </div>
          
          <div className="mt-16 grid gap-8 grid-cols-1 sm:grid-cols-3 max-w-4xl mx-auto px-4">
            <div className="text-center">
              <div className="text-2xl sm:text-3xl font-bold text-primary">50K+</div>
              <div className="text-sm text-muted-foreground">Active Creators</div>
            </div>
            <div className="text-center">
              <div className="text-2xl sm:text-3xl font-bold text-primary">2M+</div>
              <div className="text-sm text-muted-foreground">Community Members</div>
            </div>
            <div className="text-center">
              <div className="text-2xl sm:text-3xl font-bold text-primary">$10M+</div>
              <div className="text-sm text-muted-foreground">Creator Earnings</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 sm:py-24 bg-background">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight mb-4">
              Everything You Need to Succeed
            </h2>
            <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto px-4">
              Whether you're a creator looking to monetize your content or a fan wanting exclusive access, 
              Flavours provides all the tools you need.
            </p>
          </div>
          
          <div className="grid gap-6 sm:gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, index) => (
              <Card key={index} className="p-4 sm:p-6 text-center hover:shadow-lg transition-shadow">
                <CardContent className="pt-0">
                  <div className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 bg-primary/10 rounded-lg mb-4 mx-auto">
                    <feature.icon className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                  </div>
                  <h3 className="text-lg sm:text-xl font-semibold mb-2">{feature.title}</h3>
                  <p className="text-sm sm:text-base text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 sm:py-24 bg-gradient-to-r from-purple-600 to-pink-600 text-white">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight mb-4">
            Ready to Join Flavours?
          </h2>
          <p className="text-base sm:text-lg opacity-90 mb-8 max-w-2xl mx-auto px-4">
            Start your journey today. Whether you're here to create or to discover, 
            your community is waiting for you.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 px-4">
            <Button size="lg" variant="secondary" onClick={() => router.push('/auth')} className="text-lg px-8 w-full sm:w-auto">
              Sign Up Now
            </Button>
            <Button size="lg" variant="outline" onClick={() => router.push('/auth')} className="text-lg px-8 bg-transparent border-white text-white hover:bg-white hover:text-purple-600 w-full sm:w-auto">
              Explore Creators
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 sm:py-12 bg-background border-t">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-8 mb-8">
            {/* Column 1 - Contact & Social */}
            <div className="space-y-4">
            <div className="flex items-center space-x-2">
                <FlavoursLogo size="md" />
              </div>
              <div className="text-sm text-muted-foreground">
                <p>&copy; 2025 Flavours Platform</p>
              </div>
              
              <div className="flex items-center space-x-4">
                <a href="https://twitter.com/flavours" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                  </svg>
                </a>
                <a href="https://instagram.com/flavours" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                </a>
              </div>
              <div className="border-t border-muted-foreground/20 pt-4">
                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9v-9m0-9v9" />
                  </svg>
                  <span>English</span>
                  <span>Russian</span>
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Column 2 - Support & Legal */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-foreground">Support</h3>
              <div className="space-y-2">
                <a href="/help" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">Help</a>
                <a href="/store" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">Store</a>
                <a href="/cookie-notice" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">Cookie Notice</a>
                <a href="/safety" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">Flavours Safety & Transparency Center</a>
              </div>
            </div>

            {/* Column 3 - About & Legal */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-foreground">Legal</h3>
              <div className="space-y-2">
                <a href="/about" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">About</a>
                <a href="/terms" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">Terms of Service</a>
                <a href="/dmca" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">DMCA</a>
                <a href="/anti-slavery" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">Anti-Slavery and Anti-Trafficking Statement</a>
              </div>
            </div>

            {/* Column 4 - Resources */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-foreground">Resources</h3>
              <div className="space-y-2">
                <a href="/blog" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">Blog</a>
                <a href="/privacy" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">Privacy</a>
                <a href="/usc-2257" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">USC 2257</a>
                <a href="/acceptable-use" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">Acceptable Use Policy</a>
              </div>
            </div>

            {/* Column 5 - Business */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-foreground">Business</h3>
              <div className="space-y-2">
                <a href="/branding" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">Branding</a>
                <a href="/complaints" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">Complaints Policy</a>
                <a href="/fan-creator-contract" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">Contract between Fan and Creator</a>
              </div>
            </div>
          </div>

          <div className="border-t border-muted-foreground/20 pt-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-sm text-muted-foreground">
            <p>&copy; 2025 Flavours Platform. All rights reserved.</p>
              </div>
              <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                <span>Made with ❤️ for Creators and Flavours</span>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}