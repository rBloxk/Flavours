"use client"

import React from 'react'
import { ResourceHeader } from '@/components/layout/resource-header'
import { ResourceFooter } from '@/components/layout/resource-footer'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Shield, 
  Eye, 
  Lock, 
  Users,
  Database,
  Globe,
  Mail,
  Phone,
  Calendar,
  CheckCircle,
  XCircle,
  Info,
  Settings,
  Download,
  FileText
} from 'lucide-react'

export default function PrivacyPage() {
  const dataTypes = [
    {
      category: "Account Information",
      description: "Information you provide when creating and managing your account",
      examples: [
        "Name, email address, and username",
        "Profile information and bio",
        "Payment and billing information",
        "Account preferences and settings"
      ]
    },
    {
      category: "Content Data",
      description: "Content you create, upload, and share on our platform",
      examples: [
        "Posts, videos, images, and other media",
        "Comments and interactions",
        "Messages and communications",
        "Content metadata and analytics"
      ]
    },
    {
      category: "Usage Information",
      description: "How you interact with our platform and services",
      examples: [
        "Pages visited and features used",
        "Time spent on content",
        "Search queries and preferences",
        "Device and browser information"
      ]
    },
    {
      category: "Technical Data",
      description: "Automatically collected technical information",
      examples: [
        "IP address and location data",
        "Device identifiers and characteristics",
        "Log files and error reports",
        "Performance and diagnostic data"
      ]
    }
  ]

  const dataUses = [
    {
      purpose: "Service Provision",
      description: "To provide and maintain our platform services",
      icon: Settings,
      examples: [
        "Account management and authentication",
        "Content delivery and storage",
        "Payment processing",
        "Customer support"
      ]
    },
    {
      purpose: "Personalization",
      description: "To personalize your experience and content",
      icon: Users,
      examples: [
        "Content recommendations",
        "Customized user interface",
        "Targeted advertising",
        "Personalized communications"
      ]
    },
    {
      purpose: "Analytics",
      description: "To analyze and improve our services",
      icon: Database,
      examples: [
        "Usage analytics and insights",
        "Performance monitoring",
        "Feature development",
        "Quality improvement"
      ]
    },
    {
      purpose: "Security",
      description: "To protect our platform and users",
      icon: Shield,
      examples: [
        "Fraud prevention",
        "Content moderation",
        "Security monitoring",
        "Compliance enforcement"
      ]
    }
  ]

  const userRights = [
    {
      right: "Access",
      description: "Request a copy of your personal data",
      icon: Eye
    },
    {
      right: "Rectification",
      description: "Correct inaccurate or incomplete data",
      icon: CheckCircle
    },
    {
      right: "Erasure",
      description: "Request deletion of your personal data",
      icon: XCircle
    },
    {
      right: "Portability",
      description: "Export your data in a machine-readable format",
      icon: Download
    },
    {
      right: "Restriction",
      description: "Limit how we process your data",
      icon: Lock
    },
    {
      right: "Objection",
      description: "Object to certain types of data processing",
      icon: Shield
    }
  ]

  const dataSharing = [
    {
      category: "Service Providers",
      description: "Third-party companies that help us operate our platform",
      examples: [
        "Cloud hosting and storage providers",
        "Payment processors",
        "Analytics and marketing tools",
        "Customer support services"
      ]
    },
    {
      category: "Legal Requirements",
      description: "When required by law or to protect rights",
      examples: [
        "Court orders and legal processes",
        "Law enforcement requests",
        "Regulatory compliance",
        "Protection of rights and safety"
      ]
    },
    {
      category: "Business Transfers",
      description: "In connection with mergers, acquisitions, or asset sales",
      examples: [
        "Company mergers and acquisitions",
        "Asset sales and transfers",
        "Business restructuring",
        "Investment and financing activities"
      ]
    },
    {
      category: "Consent",
      description: "When you have given explicit consent",
      examples: [
        "Marketing communications",
        "Third-party integrations",
        "Social media sharing",
        "Research and surveys"
      ]
    }
  ]

  return (
    <div className="min-h-screen bg-background">
      <ResourceHeader />
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Privacy Policy</h1>
          <p className="text-xl text-muted-foreground mb-8">
            How we collect, use, and protect your personal information
          </p>
          <div className="flex items-center justify-center space-x-4">
            <Badge variant="outline" className="flex items-center space-x-1">
              <Calendar className="h-3 w-3" />
              <span>Last updated: {new Date().toLocaleDateString()}</span>
            </Badge>
            <Badge variant="outline" className="flex items-center space-x-1">
              <FileText className="h-3 w-3" />
              <span>Version 3.2</span>
            </Badge>
          </div>
        </div>

        {/* Introduction */}
        <Card className="mb-12">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Info className="h-6 w-6" />
              <span>Introduction</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              At Flavours, we are committed to protecting your privacy and ensuring the security of your personal information. 
              This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our platform.
            </p>
            <p className="text-muted-foreground">
              By using our services, you agree to the collection and use of information in accordance with this policy. 
              We will not use or share your information with anyone except as described in this Privacy Policy.
            </p>
          </CardContent>
        </Card>

        {/* Data Collection */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6">Information We Collect</h2>
          <div className="space-y-6">
            {dataTypes.map((type, index) => (
              <Card key={index}>
                <CardHeader>
                  <CardTitle className="text-lg">{type.category}</CardTitle>
                  <CardDescription>{type.description}</CardDescription>
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

        {/* Data Usage */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6">How We Use Your Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {dataUses.map((use, index) => (
              <Card key={index}>
                <CardHeader>
                  <div className="flex items-center space-x-3">
                    <use.icon className="h-6 w-6 text-primary" />
                    <CardTitle className="text-lg">{use.purpose}</CardTitle>
                  </div>
                  <CardDescription>{use.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-1">
                    {use.examples.map((example, exampleIndex) => (
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

        {/* Data Sharing */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6">Information Sharing</h2>
          <div className="space-y-6">
            {dataSharing.map((sharing, index) => (
              <Card key={index}>
                <CardHeader>
                  <CardTitle className="text-lg">{sharing.category}</CardTitle>
                  <CardDescription>{sharing.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-1">
                    {sharing.examples.map((example, exampleIndex) => (
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

        {/* User Rights */}
        <Card className="mb-12">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Shield className="h-6 w-6" />
              <span>Your Privacy Rights</span>
            </CardTitle>
            <CardDescription>
              You have certain rights regarding your personal information
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {userRights.map((right, index) => (
                <div key={index} className="text-center">
                  <right.icon className="h-8 w-8 mx-auto mb-3 text-primary" />
                  <h3 className="font-semibold mb-2">{right.right}</h3>
                  <p className="text-sm text-muted-foreground">{right.description}</p>
                </div>
              ))}
            </div>
            <div className="mt-6 text-center">
              <Button variant="outline">
                <Settings className="h-4 w-4 mr-2" />
                Manage Your Privacy Settings
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Data Security */}
        <Card className="mb-12">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Lock className="h-6 w-6" />
              <span>Data Security</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-muted-foreground">
                We implement appropriate technical and organizational measures to protect your personal information 
                against unauthorized access, alteration, disclosure, or destruction.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold mb-2">Technical Measures</h3>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    <li>• End-to-end encryption</li>
                    <li>• Secure data transmission (HTTPS)</li>
                    <li>• Regular security audits</li>
                    <li>• Access controls and authentication</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Organizational Measures</h3>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    <li>• Employee training and awareness</li>
                    <li>• Data protection policies</li>
                    <li>• Incident response procedures</li>
                    <li>• Regular compliance reviews</li>
                  </ul>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* International Transfers */}
        <Card className="mb-12">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Globe className="h-6 w-6" />
              <span>International Data Transfers</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Your information may be transferred to and processed in countries other than your own. 
              We ensure that such transfers comply with applicable data protection laws and implement 
              appropriate safeguards to protect your information.
            </p>
            <div className="bg-muted p-4 rounded-lg">
              <h4 className="font-semibold mb-2">Safeguards Include:</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Standard Contractual Clauses (SCCs)</li>
                <li>• Adequacy decisions by relevant authorities</li>
                <li>• Binding corporate rules</li>
                <li>• Certification schemes and codes of conduct</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Mail className="h-6 w-6" />
              <span>Contact Us</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              If you have any questions about this Privacy Policy or our data practices, please contact us:
            </p>
            <div className="space-y-2">
              <p className="text-sm">
                <strong>Data Protection Officer:</strong> privacy@flavours.com
              </p>
              <p className="text-sm">
                <strong>General Inquiries:</strong> hello@flavours.com
              </p>
              <p className="text-sm">
                <strong>Address:</strong> Flavours Privacy Team, 123 Creator Street, San Francisco, CA 94105
              </p>
              <p className="text-sm">
                <strong>Phone:</strong> +1 (555) 123-4567
              </p>
            </div>
            <div className="mt-6">
              <Button variant="outline">
                <Download className="h-4 w-4 mr-2" />
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
