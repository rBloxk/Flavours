"use client"

import React from 'react'
import { ResourceHeader } from '@/components/layout/resource-header'
import { ResourceFooter } from '@/components/layout/resource-footer'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  FileText, 
  AlertTriangle, 
  Shield, 
  Mail,
  Clock,
  CheckCircle,
  XCircle,
  Info,
  Download,
  Upload,
  Eye,
  Flag
} from 'lucide-react'

export default function DMCAPage() {
  const dmcaInfo = [
    {
      title: "What is DMCA?",
      description: "The Digital Millennium Copyright Act (DMCA) is a U.S. copyright law that provides a framework for addressing copyright infringement on digital platforms.",
      icon: Info
    },
    {
      title: "Our Commitment",
      description: "We respect intellectual property rights and respond promptly to valid DMCA takedown notices.",
      icon: Shield
    },
    {
      title: "Response Time",
      description: "We typically respond to DMCA notices within 24-48 hours of receipt.",
      icon: Clock
    },
    {
      title: "Counter-Notifications",
      description: "Users can file counter-notifications if they believe their content was wrongfully removed.",
      icon: FileText
    }
  ]

  const requiredInfo = [
    "Your contact information (name, address, phone, email)",
    "Description of the copyrighted work",
    "URL or location of the infringing content",
    "Statement of good faith belief that the use is not authorized",
    "Statement that the information is accurate and you are authorized to act",
    "Physical or electronic signature"
  ]

  const processSteps = [
    {
      step: "1",
      title: "Submit Notice",
      description: "Send a complete DMCA takedown notice to our designated agent",
      icon: Upload
    },
    {
      step: "2",
      title: "Review Process",
      description: "We review the notice for completeness and validity",
      icon: Eye
    },
    {
      step: "3",
      title: "Content Removal",
      description: "If valid, we remove the infringing content within 24-48 hours",
      icon: XCircle
    },
    {
      step: "4",
      title: "User Notification",
      description: "We notify the user whose content was removed",
      icon: Mail
    },
    {
      step: "5",
      title: "Counter-Notification",
      description: "User can file a counter-notification if they dispute the claim",
      icon: FileText
    }
  ]

  const counterNotificationInfo = [
    "User's contact information",
    "Description of the removed content",
    "Statement of good faith belief that the content was removed by mistake",
    "Consent to jurisdiction of federal court",
    "Physical or electronic signature"
  ]

  return (
    <div className="min-h-screen bg-background">
      <ResourceHeader />
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">DMCA Policy</h1>
          <p className="text-xl text-muted-foreground mb-8">
            Digital Millennium Copyright Act (DMCA) Notice and Takedown Policy
          </p>
          <div className="flex items-center justify-center space-x-2">
            <Shield className="h-6 w-6 text-primary" />
            <span className="text-sm text-muted-foreground">
              Protecting intellectual property rights
            </span>
          </div>
        </div>

        {/* DMCA Information */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6">About DMCA</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {dmcaInfo.map((info, index) => (
              <Card key={index}>
                <CardHeader>
                  <div className="flex items-center space-x-3">
                    <info.icon className="h-6 w-6 text-primary" />
                    <CardTitle className="text-lg">{info.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{info.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Process Steps */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6">DMCA Process</h2>
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
                    <step.icon className="h-6 w-6 text-primary flex-shrink-0" />
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

        {/* Required Information */}
        <Card className="mb-12">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <AlertTriangle className="h-6 w-6 text-orange-500" />
              <span>Required Information for DMCA Notice</span>
            </CardTitle>
            <CardDescription>
              Your DMCA notice must include all of the following information
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {requiredInfo.map((info, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-sm">{info}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Counter-Notification */}
        <Card className="mb-12">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <FileText className="h-6 w-6 text-blue-500" />
              <span>Counter-Notification Process</span>
            </CardTitle>
            <CardDescription>
              If you believe your content was wrongfully removed, you can file a counter-notification
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Required Information:</h3>
                <div className="space-y-2">
                  {counterNotificationInfo.map((info, index) => (
                    <div key={index} className="flex items-start space-x-3">
                      <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{info}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h4 className="font-semibold text-yellow-800 mb-2">Important Notice</h4>
                <p className="text-sm text-yellow-700">
                  Filing a false counter-notification may result in legal consequences. 
                  Only file if you have a good faith belief that the content was removed by mistake.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card className="mb-12">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Mail className="h-6 w-6" />
              <span>DMCA Agent Contact Information</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Designated DMCA Agent</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  All DMCA notices and counter-notifications must be sent to our designated agent:
                </p>
                <div className="bg-muted p-4 rounded-lg">
                  <p className="text-sm">
                    <strong>Name:</strong> Flavours DMCA Agent<br />
                    <strong>Email:</strong> dmca@flavours.com<br />
                    <strong>Address:</strong> 123 Creator Street, San Francisco, CA 94105<br />
                    <strong>Phone:</strong> +1 (555) 123-4567
                  </p>
                </div>
              </div>
              <div className="flex space-x-4">
                <Button>
                  <Mail className="h-4 w-4 mr-2" />
                  Send DMCA Notice
                </Button>
                <Button variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Download Template
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Repeat Infringers */}
        <Card className="mb-12">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Flag className="h-6 w-6 text-red-500" />
              <span>Repeat Infringers Policy</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-muted-foreground">
                In accordance with the DMCA, we maintain a policy of terminating accounts of users 
                who are repeat infringers of copyright.
              </p>
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <h4 className="font-semibold text-red-800 mb-2">Warning System</h4>
                <ul className="text-sm text-red-700 space-y-1">
                  <li>• First offense: Content removal and warning</li>
                  <li>• Second offense: Temporary account suspension</li>
                  <li>• Third offense: Permanent account termination</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Legal Disclaimer */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Info className="h-6 w-6" />
              <span>Legal Disclaimer</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              This DMCA policy is provided for informational purposes only and does not constitute legal advice. 
              If you have questions about copyright law or need legal assistance, please consult with an attorney.
            </p>
            <p className="text-sm text-muted-foreground">
              Flavours reserves the right to modify this DMCA policy at any time. 
              Changes will be posted on this page with an updated revision date.
            </p>
          </CardContent>
        </Card>
      </div>
      <ResourceFooter />
    </div>
  )
}
