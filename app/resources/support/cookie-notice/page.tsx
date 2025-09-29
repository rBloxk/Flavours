"use client"

import React from 'react'
import { ResourceHeader } from '@/components/layout/resource-header'
import { ResourceFooter } from '@/components/layout/resource-footer'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Cookie, 
  Settings, 
  Shield, 
  Eye, 
  Target,
  BarChart3,
  Users,
  Lock,
  CheckCircle,
  XCircle,
  Info
} from 'lucide-react'

export default function CookieNoticePage() {
  const cookieTypes = [
    {
      name: "Essential Cookies",
      description: "These cookies are necessary for the website to function properly",
      required: true,
      icon: Lock,
      examples: [
        "Authentication and login status",
        "Shopping cart functionality",
        "Security and fraud prevention",
        "Basic website navigation"
      ]
    },
    {
      name: "Performance Cookies",
      description: "Help us understand how visitors interact with our website",
      required: false,
      icon: BarChart3,
      examples: [
        "Page load times and performance metrics",
        "Error tracking and debugging",
        "Website usage statistics",
        "Feature usage analytics"
      ]
    },
    {
      name: "Functional Cookies",
      description: "Enable enhanced functionality and personalization",
      required: false,
      icon: Settings,
      examples: [
        "Language and region preferences",
        "Customized content display",
        "Remembered user settings",
        "Accessibility features"
      ]
    },
    {
      name: "Marketing Cookies",
      description: "Used to deliver relevant advertisements and track campaign performance",
      required: false,
      icon: Target,
      examples: [
        "Personalized ad targeting",
        "Social media integration",
        "Campaign performance tracking",
        "Cross-site advertising"
      ]
    },
    {
      name: "Analytics Cookies",
      description: "Help us improve our website and user experience",
      required: false,
      icon: Eye,
      examples: [
        "User behavior analysis",
        "Content performance metrics",
        "A/B testing data",
        "Conversion tracking"
      ]
    }
  ]

  const thirdPartyServices = [
    {
      name: "Google Analytics",
      purpose: "Website analytics and performance tracking",
      cookies: ["_ga", "_gid", "_gat"],
      retention: "2 years"
    },
    {
      name: "Facebook Pixel",
      purpose: "Social media advertising and tracking",
      cookies: ["_fbp", "fr"],
      retention: "90 days"
    },
    {
      name: "Stripe",
      purpose: "Payment processing and fraud prevention",
      cookies: ["__stripe_mid", "__stripe_sid"],
      retention: "1 year"
    },
    {
      name: "Cloudflare",
      purpose: "Security and performance optimization",
      cookies: ["__cf_bm", "__cfduid"],
      retention: "30 days"
    }
  ]

  return (
    <div className="min-h-screen bg-background">
      <ResourceHeader />
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Cookie Notice</h1>
          <p className="text-xl text-muted-foreground mb-8">
            Learn about how we use cookies and similar technologies on Flavours
          </p>
          <div className="flex items-center justify-center space-x-2">
            <Cookie className="h-6 w-6 text-primary" />
            <span className="text-sm text-muted-foreground">
              Last updated: {new Date().toLocaleDateString()}
            </span>
          </div>
        </div>

        {/* What are Cookies */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Info className="h-6 w-6" />
              <span>What are Cookies?</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Cookies are small text files that are stored on your device when you visit our website. 
              They help us provide you with a better experience by remembering your preferences and 
              understanding how you use our platform.
            </p>
            <p className="text-muted-foreground">
              We use cookies and similar technologies (like web beacons, pixels, and local storage) 
              to enhance your experience, analyze our traffic, and for advertising purposes.
            </p>
          </CardContent>
        </Card>

        {/* Cookie Types */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-6">Types of Cookies We Use</h2>
          <div className="space-y-4">
            {cookieTypes.map((type, index) => (
              <Card key={index}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <type.icon className="h-6 w-6 text-primary" />
                      <div>
                        <CardTitle className="text-lg">{type.name}</CardTitle>
                        <CardDescription>{type.description}</CardDescription>
                      </div>
                    </div>
                    <Badge variant={type.required ? "default" : "secondary"}>
                      {type.required ? (
                        <><CheckCircle className="h-3 w-3 mr-1" /> Required</>
                      ) : (
                        <><XCircle className="h-3 w-3 mr-1" /> Optional</>
                      )}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <h4 className="font-semibold mb-2">Examples:</h4>
                  <ul className="space-y-1">
                    {type.examples.map((example, exampleIndex) => (
                      <li key={exampleIndex} className="text-sm text-muted-foreground">
                        • {example}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Third Party Services */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Users className="h-6 w-6" />
              <span>Third-Party Services</span>
            </CardTitle>
            <CardDescription>
              We work with trusted third-party services that may set their own cookies
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {thirdPartyServices.map((service, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold">{service.name}</h3>
                    <Badge variant="outline">{service.retention}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">{service.purpose}</p>
                  <div className="flex flex-wrap gap-2">
                    {service.cookies.map((cookie, cookieIndex) => (
                      <Badge key={cookieIndex} variant="secondary" className="text-xs">
                        {cookie}
                      </Badge>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Your Choices */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Settings className="h-6 w-6" />
              <span>Your Cookie Choices</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Browser Settings</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  You can control cookies through your browser settings. Most browsers allow you to:
                </p>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  <li>• View and delete cookies</li>
                  <li>• Block cookies from specific websites</li>
                  <li>• Block all third-party cookies</li>
                  <li>• Clear all cookies when you close your browser</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Cookie Preferences</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  You can manage your cookie preferences directly on our platform:
                </p>
                <Button variant="outline" size="sm">
                  <Settings className="h-4 w-4 mr-2" />
                  Manage Cookie Preferences
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Impact of Disabling Cookies */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Shield className="h-6 w-6" />
              <span>Impact of Disabling Cookies</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold mb-2 text-green-600">Essential Cookies</h3>
                <p className="text-sm text-muted-foreground">
                  Disabling essential cookies will prevent the website from functioning properly. 
                  You may not be able to log in, make purchases, or access certain features.
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2 text-yellow-600">Optional Cookies</h3>
                <p className="text-sm text-muted-foreground">
                  Disabling optional cookies may result in a less personalized experience, 
                  but the website will still function. You may see less relevant content and ads.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card>
          <CardHeader>
            <CardTitle>Questions About Cookies?</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              If you have any questions about our use of cookies or this notice, please contact us:
            </p>
            <div className="space-y-2">
              <p className="text-sm">
                <strong>Email:</strong> privacy@flavours.com
              </p>
              <p className="text-sm">
                <strong>Address:</strong> Flavours Privacy Team, 123 Creator Street, San Francisco, CA 94105
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
      <ResourceFooter />
    </div>
  )
}
