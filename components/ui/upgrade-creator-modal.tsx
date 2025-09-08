"use client"

import React, { useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { useToast } from '@/hooks/use-toast'
import { 
  Crown, 
  CheckCircle, 
  Star, 
  Zap, 
  Shield, 
  Users, 
  DollarSign,
  Calendar,
  Loader2,
  X
} from 'lucide-react'

interface UpgradeCreatorModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

interface SubscriptionPlan {
  id: string
  name: string
  price: number
  duration: string
  features: string[]
  popular?: boolean
  description: string
}

const CREATOR_PLANS: SubscriptionPlan[] = [
  {
    id: 'creator-basic',
    name: 'Creator Basic',
    price: 9.99,
    duration: 'month',
    description: 'Perfect for new creators starting their journey',
    features: [
      'Upload up to 50 posts per month',
      'Basic analytics dashboard',
      'Direct messaging with fans',
      'Custom subscription tiers',
      'Basic content scheduling',
      'Standard customer support'
    ]
  },
  {
    id: 'creator-pro',
    name: 'Creator Pro',
    price: 19.99,
    duration: 'month',
    description: 'Most popular choice for established creators',
    popular: true,
    features: [
      'Unlimited posts per month',
      'Advanced analytics & insights',
      'Priority customer support',
      'Custom branding options',
      'Advanced content scheduling',
      'Fan engagement tools',
      'Revenue optimization tips',
      'Early access to new features'
    ]
  },
  {
    id: 'creator-premium',
    name: 'Creator Premium',
    price: 39.99,
    duration: 'month',
    description: 'For top creators who want maximum features',
    features: [
      'Everything in Creator Pro',
      'Dedicated account manager',
      'Custom domain integration',
      'Advanced monetization tools',
      'White-label options',
      'API access',
      'Custom integrations',
      '24/7 priority support',
      'Revenue sharing opportunities'
    ]
  }
]

export function UpgradeCreatorModal({ isOpen, onClose, onSuccess }: UpgradeCreatorModalProps) {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null)
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly')

  const getPlanPrice = (plan: SubscriptionPlan) => {
    if (billingCycle === 'yearly') {
      return plan.price * 10 // 2 months free for yearly
    }
    return plan.price
  }

  const getBillingText = (plan: SubscriptionPlan) => {
    if (billingCycle === 'yearly') {
      const yearlyPrice = getPlanPrice(plan)
      const savings = (plan.price * 12) - yearlyPrice
      return `$${yearlyPrice.toFixed(2)}/year (Save $${savings.toFixed(2)})`
    }
    return `$${getPlanPrice(plan).toFixed(2)}/${plan.duration}`
  }

  const handleUpgrade = async () => {
    if (!selectedPlan) {
      toast({
        title: "Select a Plan",
        description: "Please select a subscription plan to continue.",
        variant: "destructive"
      })
      return
    }

    setIsLoading(true)
    
    try {
      // Simulate API call to upgrade to creator
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      const plan = CREATOR_PLANS.find(p => p.id === selectedPlan)
      
      toast({
        title: "Upgrade Successful!",
        description: `Welcome to ${plan?.name}! You now have access to all creator features.`,
      })
      
      onSuccess()
      onClose()
    } catch (error) {
      toast({
        title: "Upgrade Failed",
        description: "Failed to upgrade to creator. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto w-[95vw] sm:w-full">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Crown className="h-5 w-5 text-yellow-500" />
            Upgrade to Creator
          </DialogTitle>
          <DialogDescription>
            Choose a plan that fits your content creation needs and start monetizing your content.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Billing Cycle Toggle */}
          <div className="flex items-center justify-center">
            <div className="flex items-center bg-gray-100 rounded-lg p-1">
              <Button
                variant={billingCycle === 'monthly' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setBillingCycle('monthly')}
                className="px-4"
              >
                Monthly
              </Button>
              <Button
                variant={billingCycle === 'yearly' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setBillingCycle('yearly')}
                className="px-4"
              >
                Yearly
                <Badge variant="secondary" className="ml-2 text-xs">Save 16%</Badge>
              </Button>
            </div>
          </div>

          {/* Plans Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {CREATOR_PLANS.map((plan) => (
              <Card 
                key={plan.id} 
                className={`relative cursor-pointer transition-all ${
                  selectedPlan === plan.id 
                    ? 'ring-2 ring-blue-500 shadow-lg' 
                    : 'hover:shadow-md'
                } ${plan.popular ? 'border-blue-200' : ''}`}
                onClick={() => setSelectedPlan(plan.id)}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge className="bg-blue-500 text-white px-3 py-1">
                      <Star className="h-3 w-3 mr-1" />
                      Most Popular
                    </Badge>
                  </div>
                )}
                
                <CardHeader className="text-center pb-4">
                  <CardTitle className="text-xl">{plan.name}</CardTitle>
                  <CardDescription className="text-sm">{plan.description}</CardDescription>
                  <div className="mt-4">
                    <div className="text-3xl font-bold">${getPlanPrice(plan).toFixed(2)}</div>
                    <div className="text-sm text-muted-foreground">
                      {getBillingText(plan)}
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <ul className="space-y-2">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm">
                        <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                  
                  <Separator />
                  
                  <Button 
                    className="w-full" 
                    variant={selectedPlan === plan.id ? 'default' : 'outline'}
                    onClick={(e) => {
                      e.stopPropagation()
                      setSelectedPlan(plan.id)
                    }}
                  >
                    {selectedPlan === plan.id ? 'Selected' : 'Select Plan'}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Benefits Section */}
          <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-4 text-center">Why Upgrade to Creator?</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <DollarSign className="h-6 w-6 text-blue-600" />
                  </div>
                  <h4 className="font-medium mb-2">Monetize Content</h4>
                  <p className="text-sm text-muted-foreground">
                    Set subscription prices, sell exclusive content, and earn from your creativity.
                  </p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Users className="h-6 w-6 text-green-600" />
                  </div>
                  <h4 className="font-medium mb-2">Build Audience</h4>
                  <p className="text-sm text-muted-foreground">
                    Connect with fans through direct messaging and exclusive content.
                  </p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Zap className="h-6 w-6 text-purple-600" />
                  </div>
                  <h4 className="font-medium mb-2">Advanced Tools</h4>
                  <p className="text-sm text-muted-foreground">
                    Access analytics, scheduling tools, and optimization features.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
              Cancel
            </Button>
            <Button 
              onClick={handleUpgrade} 
              disabled={isLoading || !selectedPlan}
              className="min-w-[140px]"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Upgrading...
                </>
              ) : (
                <>
                  <Crown className="h-4 w-4 mr-2" />
                  Upgrade Now
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
