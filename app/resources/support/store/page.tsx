"use client"

import React from 'react'
import { ResourceHeader } from '@/components/layout/resource-header'
import { ResourceFooter } from '@/components/layout/resource-footer'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Store, 
  ShoppingBag, 
  CreditCard, 
  Gift, 
  Star,
  Crown,
  Sparkles,
  Zap,
  Heart,
  Users,
  Trophy,
  Coins
} from 'lucide-react'

export default function StorePage() {
  const storeItems = [
    {
      id: 1,
      name: "Creator Pro",
      description: "Advanced tools for professional creators",
      price: 29.99,
      period: "month",
      icon: Crown,
      features: [
        "Advanced analytics dashboard",
        "Priority customer support",
        "Custom branding options",
        "Advanced content protection",
        "Unlimited uploads",
        "HD video streaming"
      ],
      popular: true
    },
    {
      id: 2,
      name: "Premium Subscription",
      description: "Access to exclusive content and features",
      price: 9.99,
      period: "month",
      icon: Star,
      features: [
        "Ad-free experience",
        "Exclusive content access",
        "Early access to new features",
        "Premium customer support",
        "Custom themes",
        "Advanced search filters"
      ],
      popular: false
    },
    {
      id: 3,
      name: "Boost Pack",
      description: "Increase your content visibility",
      price: 4.99,
      period: "week",
      icon: Zap,
      features: [
        "Content promotion boost",
        "Featured placement",
        "Increased reach",
        "Priority in search results",
        "Analytics insights",
        "7-day duration"
      ],
      popular: false
    },
    {
      id: 4,
      name: "Gift Subscription",
      description: "Give the gift of Flavours Premium",
      price: 99.99,
      period: "year",
      icon: Gift,
      features: [
        "12 months of Premium access",
        "Gift wrapping available",
        "Custom message option",
        "Instant delivery",
        "Recipient notification",
        "Flexible start date"
      ],
      popular: false
    }
  ]

  const virtualItems = [
    {
      name: "Virtual Gifts",
      description: "Send virtual gifts to your favorite creators",
      icon: Heart,
      items: [
        { name: "Rose", price: 1.99, emoji: "🌹" },
        { name: "Heart", price: 2.99, emoji: "❤️" },
        { name: "Star", price: 4.99, emoji: "⭐" },
        { name: "Crown", price: 9.99, emoji: "👑" },
        { name: "Diamond", price: 19.99, emoji: "💎" },
        { name: "Trophy", price: 49.99, emoji: "🏆" }
      ]
    },
    {
      name: "Creator Badges",
      description: "Showcase your achievements",
      icon: Trophy,
      items: [
        { name: "Verified Badge", price: 14.99, emoji: "✅" },
        { name: "Top Creator", price: 24.99, emoji: "🏅" },
        { name: "Rising Star", price: 9.99, emoji: "🌟" },
        { name: "Community Favorite", price: 19.99, emoji: "💖" }
      ]
    }
  ]

  return (
    <div className="min-h-screen bg-background">
      <ResourceHeader />
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Flavours Store</h1>
          <p className="text-xl text-muted-foreground mb-8">
            Enhance your Flavours experience with premium features and virtual items
          </p>
        </div>

        {/* Subscription Plans */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6 text-center">Subscription Plans</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {storeItems.map((item) => (
              <Card key={item.id} className={`relative ${item.popular ? 'ring-2 ring-primary' : ''}`}>
                {item.popular && (
                  <Badge className="absolute -top-2 left-1/2 transform -translate-x-1/2 bg-primary">
                    Most Popular
                  </Badge>
                )}
                <CardHeader className="text-center">
                  <item.icon className="h-12 w-12 mx-auto mb-4 text-primary" />
                  <CardTitle className="text-xl">{item.name}</CardTitle>
                  <CardDescription>{item.description}</CardDescription>
                  <div className="mt-4">
                    <span className="text-3xl font-bold">${item.price}</span>
                    <span className="text-muted-foreground">/{item.period}</span>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 mb-6">
                    {item.features.map((feature, index) => (
                      <li key={index} className="flex items-center text-sm">
                        <Sparkles className="h-4 w-4 text-primary mr-2 flex-shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <Button 
                    className="w-full" 
                    variant={item.popular ? "default" : "outline"}
                  >
                    <ShoppingBag className="h-4 w-4 mr-2" />
                    Subscribe Now
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Virtual Items */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6 text-center">Virtual Items</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {virtualItems.map((category, index) => (
              <Card key={index}>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <category.icon className="h-6 w-6 text-primary" />
                    <span>{category.name}</span>
                  </CardTitle>
                  <CardDescription>{category.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    {category.items.map((item, itemIndex) => (
                      <div key={itemIndex} className="border rounded-lg p-4 hover:bg-muted/50 transition-colors cursor-pointer">
                        <div className="text-center">
                          <div className="text-2xl mb-2">{item.emoji}</div>
                          <h3 className="font-semibold text-sm">{item.name}</h3>
                          <p className="text-primary font-bold">${item.price}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Payment Methods */}
        <Card className="mb-12">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <CreditCard className="h-6 w-6" />
              <span>Payment Methods</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="w-16 h-10 bg-blue-600 rounded mx-auto mb-2 flex items-center justify-center">
                  <span className="text-white font-bold text-xs">VISA</span>
                </div>
                <p className="text-sm text-muted-foreground">Credit Cards</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-10 bg-orange-500 rounded mx-auto mb-2 flex items-center justify-center">
                  <span className="text-white font-bold text-xs">MC</span>
                </div>
                <p className="text-sm text-muted-foreground">Mastercard</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-10 bg-blue-500 rounded mx-auto mb-2 flex items-center justify-center">
                  <span className="text-white font-bold text-xs">PP</span>
                </div>
                <p className="text-sm text-muted-foreground">PayPal</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-10 bg-green-600 rounded mx-auto mb-2 flex items-center justify-center">
                  <span className="text-white font-bold text-xs">BTC</span>
                </div>
                <p className="text-sm text-muted-foreground">Cryptocurrency</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* FAQ */}
        <Card>
          <CardHeader>
            <CardTitle>Store FAQ</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">How do I cancel my subscription?</h3>
                <p className="text-sm text-muted-foreground">
                  You can cancel your subscription at any time from your account settings. 
                  You'll continue to have access until the end of your current billing period.
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Are virtual items refundable?</h3>
                <p className="text-sm text-muted-foreground">
                  Virtual items are generally non-refundable. However, we may provide refunds 
                  in exceptional circumstances. Contact support for assistance.
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Do you offer student discounts?</h3>
                <p className="text-sm text-muted-foreground">
                  Yes! Students with valid .edu email addresses can get 50% off Creator Pro. 
                  Contact support with your student ID for verification.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      <ResourceFooter />
    </div>
  )
}
