"use client"

import React from 'react'
import { ResourceHeader } from '@/components/layout/resource-header'
import { ResourceFooter } from '@/components/layout/resource-footer'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  FileText, 
  Shield, 
  Users, 
  AlertTriangle,
  CheckCircle,
  XCircle,
  Info,
  Lock,
  Eye,
  Mail,
  Phone,
  Calendar,
  Flag
} from 'lucide-react'

export default function AcceptableUsePage() {
  const allowedUses = [
    {
      category: "Content Creation",
      description: "Creating and sharing original content",
      examples: [
        "Original videos, images, and written content",
        "Educational and informative posts",
        "Creative and artistic expressions",
        "Personal stories and experiences"
      ]
    },
    {
      category: "Community Engagement",
      description: "Positive interaction with other users",
      examples: [
        "Respectful comments and discussions",
        "Constructive feedback and support",
        "Collaborative projects and partnerships",
        "Community building and networking"
      ]
    },
    {
      category: "Business Activities",
      description: "Legitimate business and commercial use",
      examples: [
        "Creator monetization and subscriptions",
        "Product and service promotion",
        "Professional networking and outreach",
        "Educational and training content"
      ]
    },
    {
      category: "Platform Features",
      description: "Using platform features as intended",
      examples: [
        "Messaging and communication tools",
        "Content sharing and distribution",
        "Analytics and performance tracking",
        "Payment and subscription management"
      ]
    }
  ]

  const prohibitedUses = [
    {
      category: "Illegal Activities",
      description: "Any activity that violates applicable laws",
      examples: [
        "Copyright infringement and piracy",
        "Fraud, scams, and financial crimes",
        "Drug trafficking and illegal substances",
        "Violence, terrorism, and hate crimes"
      ],
      severity: "critical"
    },
    {
      category: "Harassment and Abuse",
      description: "Behavior that harms or intimidates others",
      examples: [
        "Bullying, stalking, and intimidation",
        "Hate speech and discrimination",
        "Sexual harassment and inappropriate content",
        "Threats and incitement to violence"
      ],
      severity: "high"
    },
    {
      category: "Spam and Misinformation",
      description: "Deceptive or unwanted content",
      examples: [
        "Spam, phishing, and malicious links",
        "False information and conspiracy theories",
        "Impersonation and fake accounts",
        "Manipulative marketing and scams"
      ],
      severity: "medium"
    },
    {
      category: "Platform Abuse",
      description: "Misusing platform features and systems",
      examples: [
        "Creating multiple accounts to evade restrictions",
        "Automated tools and bots",
        "Circumventing security measures",
        "Exploiting bugs and vulnerabilities"
      ],
      severity: "medium"
    }
  ]

  const enforcementActions = [
    {
      action: "Content Removal",
      description: "Removing violating content from the platform",
      severity: "low"
    },
    {
      action: "Account Warning",
      description: "Issuing warnings for policy violations",
      severity: "low"
    },
    {
      action: "Feature Restrictions",
      description: "Limiting access to certain platform features",
      severity: "medium"
    },
    {
      action: "Temporary Suspension",
      description: "Suspending account access for a limited time",
      severity: "high"
    },
    {
      action: "Permanent Ban",
      description: "Permanently removing access to the platform",
      severity: "critical"
    },
    {
      action: "Legal Action",
      description: "Pursuing legal remedies for serious violations",
      severity: "critical"
    }
  ]

  const reportingProcess = [
    {
      step: "1",
      title: "Identify Violation",
      description: "Recognize content or behavior that violates our policies"
    },
    {
      step: "2",
      title: "Gather Evidence",
      description: "Collect relevant information and screenshots"
    },
    {
      step: "3",
      title: "Submit Report",
      description: "Use our reporting tools to submit the violation"
    },
    {
      step: "4",
      title: "Review Process",
      description: "Our team reviews the report and investigates"
    },
    {
      step: "5",
      title: "Take Action",
      description: "Appropriate enforcement action is taken"
    },
    {
      step: "6",
      title: "Follow Up",
      description: "You may receive updates on the outcome"
    }
  ]

  return (
    <div className="min-h-screen bg-background">
      <ResourceHeader />
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Acceptable Use Policy</h1>
          <p className="text-xl text-muted-foreground mb-8">
            Guidelines for using our platform responsibly and safely
          </p>
          <div className="flex items-center justify-center space-x-2">
            <Shield className="h-6 w-6 text-primary" />
            <span className="text-sm text-muted-foreground">
              Creating a safe and positive environment for everyone
            </span>
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
              This Acceptable Use Policy outlines the rules and guidelines for using our platform. 
              By using our services, you agree to comply with these policies and help create a 
              safe, respectful, and positive environment for all users.
            </p>
            <p className="text-muted-foreground">
              We reserve the right to modify this policy at any time. Continued use of our platform 
              after changes constitutes acceptance of the updated policy.
            </p>
          </CardContent>
        </Card>

        {/* Allowed Uses */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6">Allowed Uses</h2>
          <div className="space-y-6">
            {allowedUses.map((use, index) => (
              <Card key={index}>
                <CardHeader>
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="h-6 w-6 text-green-500" />
                    <div>
                      <CardTitle className="text-lg">{use.category}</CardTitle>
                      <CardDescription>{use.description}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {use.examples.map((example, exampleIndex) => (
                      <li key={exampleIndex} className="flex items-start text-sm">
                        <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                        {example}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Prohibited Uses */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6">Prohibited Uses</h2>
          <div className="space-y-6">
            {prohibitedUses.map((use, index) => (
              <Card key={index}>
                <CardHeader>
                  <div className="flex items-center space-x-3">
                    <XCircle className="h-6 w-6 text-red-500" />
                    <div>
                      <CardTitle className="text-lg">{use.category}</CardTitle>
                      <CardDescription>{use.description}</CardDescription>
                    </div>
                    <Badge 
                      variant={use.severity === 'critical' ? 'destructive' : 
                              use.severity === 'high' ? 'default' : 'secondary'}
                    >
                      {use.severity}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {use.examples.map((example, exampleIndex) => (
                      <li key={exampleIndex} className="flex items-start text-sm">
                        <XCircle className="h-4 w-4 text-red-500 mr-2 mt-0.5 flex-shrink-0" />
                        {example}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Enforcement Actions */}
        <Card className="mb-12">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <AlertTriangle className="h-6 w-6 text-orange-500" />
              <span>Enforcement Actions</span>
            </CardTitle>
            <CardDescription>
              Consequences for violating our Acceptable Use Policy
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {enforcementActions.map((action, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold">{action.action}</h3>
                    <Badge 
                      variant={action.severity === 'critical' ? 'destructive' : 
                              action.severity === 'high' ? 'default' : 
                              action.severity === 'medium' ? 'secondary' : 'outline'}
                    >
                      {action.severity}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{action.description}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Reporting Process */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6">Reporting Violations</h2>
          <div className="space-y-4">
            {reportingProcess.map((step, index) => (
              <Card key={index}>
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      <Badge variant="outline" className="text-lg px-4 py-2">
                        {step.step}
                      </Badge>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold">{step.title}</h3>
                      <p className="text-muted-foreground">{step.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Reporting Tools */}
        <Card className="mb-12">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Flag className="h-6 w-6" />
              <span>How to Report</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-primary rounded-full mx-auto mb-3 flex items-center justify-center">
                  <Flag className="h-6 w-6 text-white" />
                </div>
                <h3 className="font-semibold mb-2">In-App Reporting</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  Use the report button on any content or user profile
                </p>
                <Button variant="outline" size="sm">
                  Report Now
                </Button>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-primary rounded-full mx-auto mb-3 flex items-center justify-center">
                  <Mail className="h-6 w-6 text-white" />
                </div>
                <h3 className="font-semibold mb-2">Email Support</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  Send detailed reports to our support team
                </p>
                <Button variant="outline" size="sm">
                  support@flavours.club
                </Button>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-primary rounded-full mx-auto mb-3 flex items-center justify-center">
                  <Phone className="h-6 w-6 text-white" />
                </div>
                <h3 className="font-semibold mb-2">Emergency Hotline</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  For urgent safety concerns
                </p>
                <Button variant="outline" size="sm">
                  +1 (555) SAFE-911
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Mail className="h-6 w-6" />
              <span>Questions About This Policy?</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              If you have questions about this Acceptable Use Policy or need clarification on any guidelines, 
              please contact us:
            </p>
            <div className="space-y-2">
              <p className="text-sm">
                <strong>Policy Questions:</strong> policy@flavours.club
              </p>
              <p className="text-sm">
                <strong>General Support:</strong> support@flavours.club
              </p>
              <p className="text-sm">
                <strong>Address:</strong> Flavours Policy Team, 123 Creator Street, San Francisco, CA 94105
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
