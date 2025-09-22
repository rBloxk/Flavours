"use client"

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/providers/auth-provider'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
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
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary">
              <Crown className="h-8 w-8 text-primary-foreground" />
            </div>
            <span className="font-bold text-4xl bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Flavours
            </span>
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
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center space-x-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary">
                <Crown className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="font-bold text-lg sm:text-xl bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Flavours
              </span>
            </div>
            <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-6 text-sm text-muted-foreground">
              <a href="#" className="hover:text-foreground transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-foreground transition-colors">Terms of Service</a>
              <a href="#" className="hover:text-foreground transition-colors">Support</a>
            </div>

          </div>
          <div className="mt-6 sm:mt-8 pt-6 sm:pt-8 border-t text-center text-sm text-muted-foreground">
            <p>&copy; 2025 Flavours Platform. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}