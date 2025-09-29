"use client"

import React from 'react'
import { ResourceHeader } from '@/components/layout/resource-header'
import { ResourceFooter } from '@/components/layout/resource-footer'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Shield, 
  AlertTriangle, 
  Users, 
  Lock, 
  Eye,
  Flag,
  MessageSquare,
  Heart,
  Clock,
  CheckCircle,
  XCircle,
  Info,
  Phone,
  Mail,
  FileText
} from 'lucide-react'

export default function SafetyCenterPage() {
  const safetyFeatures = [
    {
      title: "Content Moderation",
      description: "AI-powered and human review of all content",
      icon: Eye,
      features: [
        "Automated content scanning",
        "Human moderation team",
        "Community reporting system",
        "Real-time content review"
      ]
    },
    {
      title: "User Protection",
      description: "Comprehensive tools to protect users",
      icon: Shield,
      features: [
        "Block and report functionality",
        "Privacy controls",
        "Age verification",
        "Identity verification"
      ]
    },
    {
      title: "Creator Safety",
      description: "Specialized protection for content creators",
      icon: Users,
      features: [
        "Creator verification process",
        "Content protection tools",
        "Harassment prevention",
        "Revenue protection"
      ]
    },
    {
      title: "Data Security",
      description: "Advanced security measures for your data",
      icon: Lock,
      features: [
        "End-to-end encryption",
        "Secure payment processing",
        "Data anonymization",
        "Regular security audits"
      ]
    }
  ]

  const reportingOptions = [
    {
      type: "Inappropriate Content",
      description: "Report content that violates our community guidelines",
      icon: Flag,
      examples: [
        "Harassment or bullying",
        "Hate speech or discrimination",
        "Violence or graphic content",
        "Spam or misleading content"
      ]
    },
    {
      type: "User Behavior",
      description: "Report users who are behaving inappropriately",
      icon: Users,
      examples: [
        "Harassment or stalking",
        "Impersonation",
        "Suspicious activity",
        "Underage users"
      ]
    },
    {
      type: "Technical Issues",
      description: "Report technical problems or security concerns",
      icon: AlertTriangle,
      examples: [
        "Account security issues",
        "Payment problems",
        "Technical bugs",
        "Data breaches"
      ]
    },
    {
      type: "Copyright Issues",
      description: "Report copyright infringement or DMCA violations",
      icon: FileText,
      examples: [
        "Unauthorized use of content",
        "Copyright infringement",
        "Trademark violations",
        "Intellectual property theft"
      ]
    }
  ]

  const safetyTips = [
    {
      category: "For Users",
      tips: [
        "Never share personal information publicly",
        "Use strong, unique passwords",
        "Enable two-factor authentication",
        "Be cautious when interacting with strangers",
        "Report suspicious behavior immediately",
        "Keep your profile information private"
      ]
    },
    {
      category: "For Creators",
      tips: [
        "Verify your identity to build trust",
        "Use watermarks to protect your content",
        "Set clear boundaries with your audience",
        "Monitor your comments and interactions",
        "Keep backup copies of your content",
        "Use our content protection tools"
      ]
    },
    {
      category: "For Parents",
      tips: [
        "Monitor your child's online activity",
        "Use parental controls and filters",
        "Educate children about online safety",
        "Set time limits for platform use",
        "Encourage open communication",
        "Report any concerning content or behavior"
      ]
    }
  ]

  return (
    <div className="min-h-screen bg-background">
      <ResourceHeader />
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Safety & Transparency Center</h1>
          <p className="text-xl text-muted-foreground mb-8">
            Your safety and security are our top priorities. Learn about our comprehensive safety measures.
          </p>
          <div className="flex items-center justify-center space-x-2">
            <Shield className="h-6 w-6 text-primary" />
            <span className="text-sm text-muted-foreground">
              Committed to creating a safe environment for everyone
            </span>
          </div>
        </div>

        {/* Safety Features */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6 text-center">Our Safety Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {safetyFeatures.map((feature, index) => (
              <Card key={index}>
                <CardHeader>
                  <div className="flex items-center space-x-3">
                    <feature.icon className="h-8 w-8 text-primary" />
                    <div>
                      <CardTitle className="text-lg">{feature.title}</CardTitle>
                      <CardDescription>{feature.description}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {feature.features.map((item, itemIndex) => (
                      <li key={itemIndex} className="flex items-center text-sm">
                        <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Reporting System */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6 text-center">How to Report Issues</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {reportingOptions.map((option, index) => (
              <Card key={index}>
                <CardHeader>
                  <div className="flex items-center space-x-3">
                    <option.icon className="h-6 w-6 text-primary" />
                    <div>
                      <CardTitle className="text-lg">{option.type}</CardTitle>
                      <CardDescription>{option.description}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <h4 className="font-semibold mb-2">Examples:</h4>
                  <ul className="space-y-1">
                    {option.examples.map((example, exampleIndex) => (
                      <li key={exampleIndex} className="text-sm text-muted-foreground">
                        • {example}
                      </li>
                    ))}
                  </ul>
                  <Button variant="outline" size="sm" className="mt-4">
                    <Flag className="h-4 w-4 mr-2" />
                    Report Now
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Safety Tips */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6 text-center">Safety Tips</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {safetyTips.map((category, index) => (
              <Card key={index}>
                <CardHeader>
                  <CardTitle className="text-lg">{category.category}</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {category.tips.map((tip, tipIndex) => (
                      <li key={tipIndex} className="flex items-start text-sm">
                        <Shield className="h-4 w-4 text-primary mr-2 mt-0.5 flex-shrink-0" />
                        {tip}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Community Guidelines */}
        <Card className="mb-12">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <FileText className="h-6 w-6" />
              <span>Community Guidelines</span>
            </CardTitle>
            <CardDescription>
              Our rules and expectations for all users
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold mb-2 text-green-600">Allowed Content</h3>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  <li>• Original creative content</li>
                  <li>• Educational and informative posts</li>
                  <li>• Respectful discussions</li>
                  <li>• Age-appropriate content</li>
                  <li>• Constructive feedback</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-2 text-red-600">Prohibited Content</h3>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  <li>• Harassment or bullying</li>
                  <li>• Hate speech or discrimination</li>
                  <li>• Violence or graphic content</li>
                  <li>• Spam or misleading information</li>
                  <li>• Copyright infringement</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contact Safety Team */}
        <Card className="mb-12">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <MessageSquare className="h-6 w-6" />
              <span>Contact Our Safety Team</span>
            </CardTitle>
            <CardDescription>
              Our dedicated safety team is here to help 24/7
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <Mail className="h-8 w-8 mx-auto mb-3 text-primary" />
                <h3 className="font-semibold mb-2">Email Support</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  For non-urgent safety concerns
                </p>
                <Button variant="outline" size="sm">
                  safety@flavours.club
                </Button>
              </div>
              <div className="text-center">
                <MessageSquare className="h-8 w-8 mx-auto mb-3 text-primary" />
                <h3 className="font-semibold mb-2">Live Chat</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  Immediate assistance for urgent issues
                </p>
                <Button size="sm">
                  Start Chat
                </Button>
              </div>
              <div className="text-center">
                <Phone className="h-8 w-8 mx-auto mb-3 text-primary" />
                <h3 className="font-semibold mb-2">Emergency Hotline</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  For serious safety emergencies
                </p>
                <Button variant="outline" size="sm">
                  +1 (555) SAFE-911
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Transparency Report */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Info className="h-6 w-6" />
              <span>Transparency Report</span>
            </CardTitle>
            <CardDescription>
              Our commitment to transparency in safety and moderation
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary mb-2">99.8%</div>
                  <p className="text-sm text-muted-foreground">Content compliance rate</p>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary mb-2">&lt;24h</div>
                  <p className="text-sm text-muted-foreground">Average response time</p>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary mb-2">1M+</div>
                  <p className="text-sm text-muted-foreground">Reports processed monthly</p>
                </div>
              </div>
              <div className="text-center">
                <Button variant="outline">
                  <FileText className="h-4 w-4 mr-2" />
                  View Full Transparency Report
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      <ResourceFooter />
    </div>
  )
}
