"use client"

import React from 'react'
import { ResourceHeader } from '@/components/layout/resource-header'
import { ResourceFooter } from '@/components/layout/resource-footer'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  FileText, 
  Calendar, 
  Users, 
  Shield,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Info,
  Lock,
  DollarSign,
  Eye,
  Flag
} from 'lucide-react'

export default function TermsPage() {
  const sections = [
    {
      title: "1. Acceptance of Terms",
      content: "By accessing and using Flavours, you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service."
    },
    {
      title: "2. Description of Service",
      content: "Flavours is a creator monetization platform that allows users to create, share, and monetize content. We provide tools for content creation, audience engagement, and revenue generation."
    },
    {
      title: "3. User Accounts",
      content: "You are responsible for maintaining the confidentiality of your account and password. You agree to accept responsibility for all activities that occur under your account or password."
    },
    {
      title: "4. Content Guidelines",
      content: "Users must comply with our community guidelines. Prohibited content includes but is not limited to: harassment, hate speech, violence, illegal activities, and copyright infringement."
    },
    {
      title: "5. Intellectual Property",
      content: "Users retain ownership of their original content. By posting content, you grant Flavours a license to display, distribute, and promote your content on our platform."
    },
    {
      title: "6. Payment Terms",
      content: "Creators receive payments based on their content performance and subscriber engagement. Payment processing is handled by third-party providers with their own terms and conditions."
    },
    {
      title: "7. Privacy Policy",
      content: "Your privacy is important to us. Please review our Privacy Policy, which also governs your use of the service, to understand our practices."
    },
    {
      title: "8. Prohibited Uses",
      content: "You may not use our service for any unlawful purpose or to solicit others to perform unlawful acts. You may not violate any international, federal, provincial, or state regulations, rules, laws, or local ordinances."
    },
    {
      title: "9. Termination",
      content: "We may terminate or suspend your account immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms."
    },
    {
      title: "10. Disclaimer",
      content: "The information on this web site is provided on an 'as is' basis. To the fullest extent permitted by law, this Company excludes all representations, warranties, conditions and terms."
    }
  ]

  const keyPoints = [
    {
      title: "Age Requirement",
      description: "You must be at least 18 years old to use our platform",
      icon: Users,
      type: "requirement"
    },
    {
      title: "Content Ownership",
      description: "You retain ownership of your original content",
      icon: FileText,
      type: "right"
    },
    {
      title: "Payment Processing",
      description: "Payments are processed securely through third-party providers",
      icon: DollarSign,
      type: "info"
    },
    {
      title: "Content Moderation",
      description: "We reserve the right to moderate and remove inappropriate content",
      icon: Shield,
      type: "policy"
    },
    {
      title: "Account Security",
      description: "You are responsible for maintaining account security",
      icon: Lock,
      type: "responsibility"
    },
    {
      title: "Privacy Protection",
      description: "We protect your personal information according to our Privacy Policy",
      icon: Eye,
      type: "protection"
    }
  ]

  const prohibitedActivities = [
    "Harassment or bullying of other users",
    "Posting hate speech or discriminatory content",
    "Sharing violent or graphic content",
    "Copyright infringement or intellectual property theft",
    "Spam or misleading information",
    "Impersonation of other users or entities",
    "Sharing personal information of others",
    "Engaging in illegal activities",
    "Circumventing platform security measures",
    "Creating multiple accounts to evade restrictions"
  ]

  return (
    <div className="min-h-screen bg-background">
      <ResourceHeader />
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Terms of Service</h1>
          <p className="text-xl text-muted-foreground mb-8">
            Please read these terms carefully before using our platform
          </p>
          <div className="flex items-center justify-center space-x-4">
            <Badge variant="outline" className="flex items-center space-x-1">
              <Calendar className="h-3 w-3" />
              <span>Last updated: {new Date().toLocaleDateString()}</span>
            </Badge>
            <Badge variant="outline" className="flex items-center space-x-1">
              <FileText className="h-3 w-3" />
              <span>Version 2.1</span>
            </Badge>
          </div>
        </div>

        {/* Key Points */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6">Key Points</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {keyPoints.map((point, index) => (
              <Card key={index}>
                <CardContent className="p-4">
                  <div className="flex items-start space-x-3">
                    <point.icon className={`h-5 w-5 mt-0.5 ${
                      point.type === 'requirement' ? 'text-red-500' :
                      point.type === 'right' ? 'text-green-500' :
                      point.type === 'info' ? 'text-blue-500' :
                      point.type === 'policy' ? 'text-orange-500' :
                      point.type === 'responsibility' ? 'text-purple-500' :
                      'text-cyan-500'
                    }`} />
                    <div>
                      <h3 className="font-semibold text-sm">{point.title}</h3>
                      <p className="text-xs text-muted-foreground">{point.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Terms Sections */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6">Terms and Conditions</h2>
          <div className="space-y-6">
            {sections.map((section, index) => (
              <Card key={index}>
                <CardHeader>
                  <CardTitle className="text-lg">{section.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{section.content}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Prohibited Activities */}
        <Card className="mb-12">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <AlertTriangle className="h-6 w-6 text-red-500" />
              <span>Prohibited Activities</span>
            </CardTitle>
            <CardDescription>
              The following activities are strictly prohibited on our platform
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {prohibitedActivities.map((activity, index) => (
                <div key={index} className="flex items-start space-x-2">
                  <XCircle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                  <span className="text-sm">{activity}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* User Rights */}
        <Card className="mb-12">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <CheckCircle className="h-6 w-6 text-green-500" />
              <span>Your Rights</span>
            </CardTitle>
            <CardDescription>
              What you can expect from us
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold">Content Ownership</h3>
                  <p className="text-sm text-muted-foreground">
                    You retain full ownership of your original content and can remove it at any time
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold">Fair Compensation</h3>
                  <p className="text-sm text-muted-foreground">
                    Creators receive fair compensation for their content based on platform metrics
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold">Privacy Protection</h3>
                  <p className="text-sm text-muted-foreground">
                    Your personal information is protected according to our Privacy Policy
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold">Account Control</h3>
                  <p className="text-sm text-muted-foreground">
                    You can modify, suspend, or delete your account at any time
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Info className="h-6 w-6" />
              <span>Questions About These Terms?</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              If you have any questions about these Terms of Service, please contact us:
            </p>
            <div className="space-y-2">
              <p className="text-sm">
                <strong>Email:</strong> legal@flavours.com
              </p>
              <p className="text-sm">
                <strong>Address:</strong> Flavours Legal Team, 123 Creator Street, San Francisco, CA 94105
              </p>
              <p className="text-sm">
                <strong>Phone:</strong> +1 (555) 123-4567
              </p>
            </div>
            <div className="mt-6">
              <Button variant="outline">
                <FileText className="h-4 w-4 mr-2" />
                Download PDF Version
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
      <ResourceFooter />
    </div>
  )
}
