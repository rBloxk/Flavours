"use client"

import React from 'react'
import { ResourceHeader } from '@/components/layout/resource-header'
import { ResourceFooter } from '@/components/layout/resource-footer'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  MessageSquare, 
  AlertTriangle, 
  Clock, 
  CheckCircle,
  FileText,
  Mail,
  Phone,
  Calendar,
  Users,
  Shield,
  Eye,
  Flag,
  Info,
  Download
} from 'lucide-react'

export default function ComplaintsPage() {
  const complaintTypes = [
    {
      category: "Content Issues",
      description: "Reports about inappropriate or harmful content",
      examples: [
        "Harassment or bullying",
        "Hate speech or discrimination",
        "Violence or graphic content",
        "Copyright infringement",
        "Spam or misleading content"
      ],
      priority: "high"
    },
    {
      category: "User Behavior",
      description: "Complaints about user conduct and interactions",
      examples: [
        "Inappropriate messaging",
        "Stalking or harassment",
        "Impersonation or fake accounts",
        "Abusive behavior",
        "Privacy violations"
      ],
      priority: "high"
    },
    {
      category: "Technical Issues",
      description: "Problems with platform functionality and performance",
      examples: [
        "Payment processing errors",
        "Account access problems",
        "Content upload failures",
        "App crashes or bugs",
        "Data loss or corruption"
      ],
      priority: "medium"
    },
    {
      category: "Business Disputes",
      description: "Issues related to creator payments and business operations",
      examples: [
        "Payment delays or errors",
        "Subscription billing issues",
        "Revenue calculation disputes",
        "Contract or agreement problems",
        "Account suspension appeals"
      ],
      priority: "medium"
    }
  ]

  const processSteps = [
    {
      step: "1",
      title: "Submit Complaint",
      description: "Complete our complaint form with detailed information"
    },
    {
      step: "2",
      title: "Initial Review",
      description: "Our team reviews your complaint within 24 hours"
    },
    {
      step: "3",
      title: "Investigation",
      description: "Thorough investigation of the reported issue"
    },
    {
      step: "4",
      title: "Resolution",
      description: "Appropriate action taken and resolution provided"
    },
    {
      step: "5",
      title: "Follow-up",
      description: "Follow-up to ensure satisfaction with resolution"
    }
  ]

  const responseTimes = [
    {
      type: "Urgent Safety Issues",
      timeframe: "Within 2 hours",
      description: "Immediate threats to user safety"
    },
    {
      type: "Content Violations",
      timeframe: "Within 24 hours",
      description: "Reports of policy violations"
    },
    {
      type: "Technical Issues",
      timeframe: "Within 48 hours",
      description: "Platform functionality problems"
    },
    {
      type: "Business Disputes",
      timeframe: "Within 5 business days",
      description: "Payment and business-related issues"
    }
  ]

  const escalationProcess = [
    {
      level: "Level 1",
      title: "Initial Support",
      description: "Standard customer support team",
      contact: "support@flavours.com"
    },
    {
      level: "Level 2",
      title: "Senior Support",
      description: "Experienced support specialists",
      contact: "senior-support@flavours.com"
    },
    {
      level: "Level 3",
      title: "Management Review",
      description: "Management team review and resolution",
      contact: "management@flavours.com"
    },
    {
      level: "Level 4",
      title: "Executive Escalation",
      description: "Executive team for complex issues",
      contact: "executive@flavours.com"
    }
  ]

  return (
    <div className="min-h-screen bg-background">
      <ResourceHeader />
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Complaints Policy</h1>
          <p className="text-xl text-muted-foreground mb-8">
            How to report issues and our commitment to resolving complaints fairly
          </p>
          <div className="flex items-center justify-center space-x-2">
            <MessageSquare className="h-6 w-6 text-primary" />
            <span className="text-sm text-muted-foreground">
              Your feedback helps us improve our platform
            </span>
          </div>
        </div>

        {/* Introduction */}
        <Card className="mb-12">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Info className="h-6 w-6" />
              <span>Our Commitment</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              At Flavours, we take all complaints seriously and are committed to resolving them 
              fairly and promptly. We have established procedures to ensure that your concerns 
              are heard, investigated, and addressed appropriately.
            </p>
            <p className="text-muted-foreground">
              This policy outlines how to submit complaints, what to expect during the process, 
              and how we work to resolve issues to your satisfaction.
            </p>
          </CardContent>
        </Card>

        {/* Complaint Types */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6">Types of Complaints</h2>
          <div className="space-y-6">
            {complaintTypes.map((type, index) => (
              <Card key={index}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">{type.category}</CardTitle>
                      <CardDescription>{type.description}</CardDescription>
                    </div>
                    <Badge 
                      variant={type.priority === 'high' ? 'destructive' : 'secondary'}
                    >
                      {type.priority} priority
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

        {/* Process Steps */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6">Complaint Process</h2>
          <div className="space-y-4">
            {processSteps.map((step, index) => (
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

        {/* Response Times */}
        <Card className="mb-12">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Clock className="h-6 w-6" />
              <span>Response Times</span>
            </CardTitle>
            <CardDescription>
              Our commitment to responding to complaints within these timeframes
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {responseTimes.map((response, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold">{response.type}</h3>
                    <Badge variant="outline">{response.timeframe}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{response.description}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Escalation Process */}
        <Card className="mb-12">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Users className="h-6 w-6" />
              <span>Escalation Process</span>
            </CardTitle>
            <CardDescription>
              How complaints are escalated for complex or unresolved issues
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {escalationProcess.map((level, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold">{level.level}: {level.title}</h3>
                    <Badge variant="outline">{level.contact}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{level.description}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Submit Complaint */}
        <Card className="mb-12">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <FileText className="h-6 w-6" />
              <span>Submit a Complaint</span>
            </CardTitle>
            <CardDescription>
              Use this form to submit your complaint with all relevant details
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Complaint Type</label>
                <select className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary">
                  <option value="">Select complaint type</option>
                  <option value="content">Content Issues</option>
                  <option value="behavior">User Behavior</option>
                  <option value="technical">Technical Issues</option>
                  <option value="business">Business Disputes</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Description</label>
                <textarea
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  rows={4}
                  placeholder="Please provide a detailed description of your complaint"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Evidence</label>
                <input
                  type="file"
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  accept=".jpg,.jpeg,.png,.pdf,.doc,.docx"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Upload screenshots, documents, or other evidence (optional)
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Contact Information</label>
                <input
                  type="email"
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="your.email@example.com"
                />
              </div>
              <Button className="w-full">
                <MessageSquare className="h-4 w-4 mr-2" />
                Submit Complaint
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Mail className="h-6 w-6" />
              <span>Contact Information</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              For immediate assistance or to discuss your complaint, contact us:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <Mail className="h-8 w-8 mx-auto mb-3 text-primary" />
                <h3 className="font-semibold mb-2">Email Support</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  For detailed complaints and documentation
                </p>
                <Button variant="outline" size="sm">
                  complaints@flavours.com
                </Button>
              </div>
              <div className="text-center">
                <Phone className="h-8 w-8 mx-auto mb-3 text-primary" />
                <h3 className="font-semibold mb-2">Phone Support</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  For urgent issues and immediate assistance
                </p>
                <Button variant="outline" size="sm">
                  +1 (555) COMPLAINT
                </Button>
              </div>
              <div className="text-center">
                <MessageSquare className="h-8 w-8 mx-auto mb-3 text-primary" />
                <h3 className="font-semibold mb-2">Live Chat</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  For real-time support and guidance
                </p>
                <Button size="sm">
                  Start Chat
                </Button>
              </div>
            </div>
            <div className="mt-6 text-center">
              <Button variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Download Complaint Form
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
      <ResourceFooter />
    </div>
  )
}
