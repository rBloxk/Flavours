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
  Calendar,
  CheckCircle,
  AlertTriangle,
  Info,
  Lock,
  Eye,
  Mail,
  Phone,
  Download,
  Upload
} from 'lucide-react'

export default function USC2257Page() {
  const requirements = [
    {
      title: "Age Verification",
      description: "All performers must be verified to be 18 years or older",
      icon: Users,
      details: [
        "Government-issued photo identification required",
        "Verification must be completed before content creation",
        "Records must be maintained for all performers",
        "Regular re-verification for ongoing content creators"
      ]
    },
    {
      title: "Record Keeping",
      description: "Comprehensive records must be maintained for all content",
      icon: FileText,
      details: [
        "Performer identification and age verification documents",
        "Content creation dates and locations",
        "Producer information and contact details",
        "Content distribution and publication records"
      ]
    },
    {
      title: "Content Labeling",
      description: "All content must be properly labeled and categorized",
      icon: Shield,
      details: [
        "Clear age verification statements",
        "Producer identification and contact information",
        "Content creation date and location",
        "Compliance with platform content policies"
      ]
    },
    {
      title: "Access Control",
      description: "Restricted access to age verification records",
      icon: Lock,
      details: [
        "Secure storage of sensitive documents",
        "Limited access to authorized personnel only",
        "Regular security audits and updates",
        "Compliance with data protection regulations"
      ]
    }
  ]

  const complianceSteps = [
    {
      step: "1",
      title: "Performer Registration",
      description: "Complete age verification and identity confirmation process"
    },
    {
      step: "2",
      title: "Document Collection",
      description: "Gather required identification and verification documents"
    },
    {
      step: "3",
      title: "Record Maintenance",
      description: "Store and maintain all required records securely"
    },
    {
      step: "4",
      title: "Content Review",
      description: "Ensure all content meets compliance requirements"
    },
    {
      step: "5",
      title: "Ongoing Monitoring",
      description: "Regular audits and updates to maintain compliance"
    }
  ]

  const legalRequirements = [
    {
      section: "18 U.S.C. § 2257",
      title: "Record Keeping Requirements",
      description: "Federal law requiring records for sexually explicit content"
    },
    {
      section: "18 U.S.C. § 2257A",
      title: "Record Keeping for Simulated Content",
      description: "Requirements for simulated sexually explicit conduct"
    },
    {
      section: "28 C.F.R. Part 75",
      title: "Implementation Regulations",
      description: "Department of Justice regulations implementing the statutes"
    }
  ]

  const penalties = [
    {
      violation: "Failure to Maintain Records",
      penalty: "Up to 5 years imprisonment and/or fines",
      severity: "high"
    },
    {
      violation: "False Age Verification",
      penalty: "Up to 10 years imprisonment and/or fines",
      severity: "critical"
    },
    {
      violation: "Inadequate Record Keeping",
      penalty: "Civil penalties and platform suspension",
      severity: "medium"
    },
    {
      violation: "Unauthorized Access to Records",
      penalty: "Criminal charges and civil liability",
      severity: "high"
    }
  ]

  return (
    <div className="min-h-screen bg-background">
      <ResourceHeader />
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">USC 2257 Compliance</h1>
          <p className="text-xl text-muted-foreground mb-8">
            Age verification and record keeping requirements for content creators
          </p>
          <div className="flex items-center justify-center space-x-2">
            <Shield className="h-6 w-6 text-primary" />
            <span className="text-sm text-muted-foreground">
              Ensuring compliance with federal age verification laws
            </span>
          </div>
        </div>

        {/* Legal Notice */}
        <Card className="mb-12">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <AlertTriangle className="h-6 w-6 text-orange-500" />
              <span>Important Legal Notice</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              This page provides information about compliance with 18 U.S.C. § 2257 and related regulations. 
              These laws require record keeping and age verification for certain types of content.
            </p>
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
              <h4 className="font-semibold text-orange-800 mb-2">Disclaimer</h4>
              <p className="text-sm text-orange-700">
                This information is provided for educational purposes only and does not constitute legal advice. 
                Content creators should consult with qualified legal counsel to ensure full compliance with applicable laws.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Requirements */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6">Compliance Requirements</h2>
          <div className="space-y-6">
            {requirements.map((requirement, index) => (
              <Card key={index}>
                <CardHeader>
                  <div className="flex items-center space-x-3">
                    <requirement.icon className="h-6 w-6 text-primary" />
                    <div>
                      <CardTitle className="text-lg">{requirement.title}</CardTitle>
                      <CardDescription>{requirement.description}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {requirement.details.map((detail, detailIndex) => (
                      <li key={detailIndex} className="flex items-start text-sm">
                        <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                        {detail}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Compliance Process */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6">Compliance Process</h2>
          <div className="space-y-4">
            {complianceSteps.map((step, index) => (
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

        {/* Legal Framework */}
        <Card className="mb-12">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <FileText className="h-6 w-6" />
              <span>Legal Framework</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {legalRequirements.map((requirement, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <h3 className="font-semibold text-primary mb-2">{requirement.section}</h3>
                  <h4 className="font-medium mb-2">{requirement.title}</h4>
                  <p className="text-sm text-muted-foreground">{requirement.description}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Penalties */}
        <Card className="mb-12">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <AlertTriangle className="h-6 w-6 text-red-500" />
              <span>Penalties for Non-Compliance</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {penalties.map((penalty, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold">{penalty.violation}</h3>
                    <Badge 
                      variant={penalty.severity === 'critical' ? 'destructive' : 
                              penalty.severity === 'high' ? 'default' : 'secondary'}
                    >
                      {penalty.severity}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{penalty.penalty}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Resources */}
        <Card className="mb-12">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Info className="h-6 w-6" />
              <span>Resources and Support</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold mb-3">Documentation</h3>
                <div className="space-y-2">
                  <Button variant="outline" size="sm" className="w-full justify-start">
                    <Download className="h-4 w-4 mr-2" />
                    Compliance Checklist
                  </Button>
                  <Button variant="outline" size="sm" className="w-full justify-start">
                    <Download className="h-4 w-4 mr-2" />
                    Record Keeping Template
                  </Button>
                  <Button variant="outline" size="sm" className="w-full justify-start">
                    <Download className="h-4 w-4 mr-2" />
                    Age Verification Form
                  </Button>
                </div>
              </div>
              <div>
                <h3 className="font-semibold mb-3">Support</h3>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">compliance@flavours.com</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">+1 (555) COMPLY-1</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Eye className="h-6 w-6" />
              <span>Record Custodian Information</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              For questions about record keeping or to request access to records, contact our designated custodian:
            </p>
            <div className="bg-muted p-4 rounded-lg">
              <p className="text-sm">
                <strong>Flavours Record Custodian</strong><br />
                Email: records@flavours.com<br />
                Phone: +1 (555) RECORDS<br />
                Address: 123 Creator Street, San Francisco, CA 94105<br />
                Hours: Monday - Friday, 9:00 AM - 5:00 PM PST
              </p>
            </div>
            <div className="mt-4">
              <Button variant="outline">
                <Upload className="h-4 w-4 mr-2" />
                Submit Verification Documents
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
      <ResourceFooter />
    </div>
  )
}
