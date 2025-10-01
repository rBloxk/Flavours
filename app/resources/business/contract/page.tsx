"use client"

import React from 'react'
import { ResourceHeader } from '@/components/layout/resource-header'
import { ResourceFooter } from '@/components/layout/resource-footer'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  FileText, 
  Users, 
  DollarSign, 
  Shield,
  CheckCircle,
  AlertTriangle,
  Info,
  Download,
  Mail,
  Phone,
  Calendar,
  Eye,
  Lock,
  Star
} from 'lucide-react'

export default function ContractPage() {
  const contractTypes = [
    {
      type: "Creator Agreement",
      description: "Standard agreement for content creators on our platform",
      features: [
        "Content licensing and ownership",
        "Revenue sharing terms",
        "Platform usage rights",
        "Content guidelines and restrictions",
        "Termination and suspension clauses"
      ],
      duration: "Ongoing",
      notice: "30 days"
    },
    {
      type: "Premium Creator Contract",
      description: "Enhanced agreement for verified and premium creators",
      features: [
        "Higher revenue sharing rates",
        "Priority support and features",
        "Exclusive content opportunities",
        "Advanced analytics and insights",
        "Custom branding and promotion"
      ],
      duration: "12 months",
      notice: "60 days"
    },
    {
      type: "Brand Partnership Agreement",
      description: "Contract for brand collaborations and sponsored content",
      features: [
        "Sponsored content guidelines",
        "Brand compliance requirements",
        "Performance metrics and reporting",
        "Intellectual property protection",
        "Payment and delivery terms"
      ],
      duration: "Project-based",
      notice: "15 days"
    },
    {
      type: "Enterprise License",
      description: "Corporate agreement for businesses and organizations",
      features: [
        "Bulk content licensing",
        "Custom platform features",
        "Dedicated account management",
        "Advanced security and compliance",
        "Volume pricing and discounts"
      ],
      duration: "24 months",
      notice: "90 days"
    }
  ]

  const keyTerms = [
    {
      category: "Revenue Sharing",
      description: "How earnings are calculated and distributed",
      terms: [
        "Standard creators: 77% revenue share",
        "Premium creators: 88% revenue share",
        "Enterprise clients: Custom rates",
        "Payment processing: 2.9% + $3.00 per transaction",
        "Minimum payout: $300 USD"
      ]
    },
    {
      category: "Content Rights",
      description: "Intellectual property and usage rights",
      terms: [
        "Creators retain ownership of original content",
        "Platform license for distribution and promotion",
        "Exclusive content rights for premium creators",
        "Brand partnership content sharing rights",
        "User-generated content usage permissions"
      ]
    },
    {
      category: "Platform Usage",
      description: "Rules and guidelines for platform use",
      terms: [
        "Compliance with community guidelines",
        "Content moderation and review process",
        "Account security and authentication",
        "Platform feature access and limitations",
        "Technical support and maintenance"
      ]
    },
    {
      category: "Termination",
      description: "Conditions for contract termination",
      terms: [
        "Mutual agreement termination",
        "Breach of contract consequences",
        "Content removal and data retention",
        "Final payment and settlement",
        "Post-termination obligations"
      ]
    }
  ]

  const legalProtections = [
    {
      protection: "Intellectual Property",
      description: "Safeguards for creators' original content and ideas",
      icon: Shield
    },
    {
      protection: "Revenue Protection",
      description: "Guaranteed payment terms and dispute resolution",
      icon: DollarSign
    },
    {
      protection: "Privacy Rights",
      description: "Protection of personal and business information",
      icon: Lock
    },
    {
      protection: "Dispute Resolution",
      description: "Fair and efficient conflict resolution process",
      icon: Users
    }
  ]

  const contractProcess = [
    {
      step: "1",
      title: "Initial Discussion",
      description: "Discuss terms and requirements with our team"
    },
    {
      step: "2",
      title: "Contract Drafting",
      description: "Custom contract prepared based on your needs"
    },
    {
      step: "3",
      title: "Legal Review",
      description: "Review contract terms with legal counsel if needed"
    },
    {
      step: "4",
      title: "Negotiation",
      description: "Discuss and modify terms as necessary"
    },
    {
      step: "5",
      title: "Execution",
      description: "Sign and execute the final agreement"
    },
    {
      step: "6",
      title: "Implementation",
      description: "Begin working under the new contract terms"
    }
  ]

  return (
    <div className="min-h-screen bg-background">
      <ResourceHeader />
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Contract Between Fan and Creator</h1>
          <p className="text-xl text-muted-foreground mb-8">
            Comprehensive agreements for creators, fans, and business partnerships
          </p>
          <div className="flex items-center justify-center space-x-2">
            <FileText className="h-6 w-6 text-primary" />
            <span className="text-sm text-muted-foreground">
              Protecting the interests of all parties
            </span>
          </div>
        </div>

        {/* Introduction */}
        <Card className="mb-12">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Info className="h-6 w-6" />
              <span>Contract Overview</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Our contracts are designed to protect the interests of creators, fans, and business partners 
              while ensuring fair and transparent relationships. Each contract type is tailored to specific 
              use cases and includes comprehensive terms for revenue sharing, content rights, and platform usage.
            </p>
            <p className="text-muted-foreground">
              All contracts are reviewed by legal experts and updated regularly to reflect changes in 
              platform policies, industry standards, and applicable laws.
            </p>
          </CardContent>
        </Card>

        {/* Contract Types */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6">Contract Types</h2>
          <div className="space-y-6">
            {contractTypes.map((contract, index) => (
              <Card key={index}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">{contract.type}</CardTitle>
                      <CardDescription>{contract.description}</CardDescription>
                    </div>
                    <div className="text-right">
                      <Badge variant="outline" className="mb-2">
                        {contract.duration}
                      </Badge>
                      <p className="text-sm text-muted-foreground">
                        Notice: {contract.notice}
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <h4 className="font-semibold mb-2">Key Features:</h4>
                  <ul className="space-y-1">
                    {contract.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-start text-sm">
                        <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Key Terms */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6">Key Contract Terms</h2>
          <div className="space-y-6">
            {keyTerms.map((term, index) => (
              <Card key={index}>
                <CardHeader>
                  <CardTitle className="text-lg">{term.category}</CardTitle>
                  <CardDescription>{term.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {term.terms.map((item, itemIndex) => (
                      <li key={itemIndex} className="flex items-start text-sm">
                        <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Legal Protections */}
        <Card className="mb-12">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Shield className="h-6 w-6" />
              <span>Legal Protections</span>
            </CardTitle>
            <CardDescription>
              Comprehensive legal safeguards for all parties
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {legalProtections.map((protection, index) => (
                <div key={index} className="text-center">
                  <protection.icon className="h-12 w-12 mx-auto mb-4 text-primary" />
                  <h3 className="font-semibold mb-2">{protection.protection}</h3>
                  <p className="text-sm text-muted-foreground">{protection.description}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Contract Process */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6">Contract Process</h2>
          <div className="space-y-4">
            {contractProcess.map((step, index) => (
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

        {/* Important Notice */}
        <Card className="mb-12">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <AlertTriangle className="h-6 w-6 text-orange-500" />
              <span>Important Legal Notice</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-muted-foreground">
                This information is provided for general guidance only and does not constitute legal advice. 
                Contract terms may vary based on individual circumstances and applicable laws.
              </p>
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                <h4 className="font-semibold text-orange-800 mb-2">Recommendation</h4>
                <p className="text-sm text-orange-700">
                  We strongly recommend consulting with qualified legal counsel before entering into any contract 
                  to ensure you understand all terms and implications.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contract Templates */}
        <Card className="mb-12">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Download className="h-6 w-6" />
              <span>Contract Templates</span>
            </CardTitle>
            <CardDescription>
              Download standard contract templates for review
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Button variant="outline" className="justify-start">
                <Download className="h-4 w-4 mr-2" />
                Creator Agreement Template
              </Button>
              <Button variant="outline" className="justify-start">
                <Download className="h-4 w-4 mr-2" />
                Premium Creator Contract
              </Button>
              <Button variant="outline" className="justify-start">
                <Download className="h-4 w-4 mr-2" />
                Brand Partnership Agreement
              </Button>
              <Button variant="outline" className="justify-start">
                <Download className="h-4 w-4 mr-2" />
                Enterprise License Template
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Mail className="h-6 w-6" />
              <span>Contract Support</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              For questions about contracts, terms, or to discuss custom agreements, contact our legal team:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <Mail className="h-8 w-8 mx-auto mb-3 text-primary" />
                <h3 className="font-semibold mb-2">Legal Team</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  For contract questions and legal support
                </p>
                <Button variant="outline" size="sm">
                  legal@flavours.club
                </Button>
              </div>
              <div className="text-center">
                <Phone className="h-8 w-8 mx-auto mb-3 text-primary" />
                <h3 className="font-semibold mb-2">Business Development</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  For partnership and enterprise agreements
                </p>
                <Button variant="outline" size="sm">
                  +1 (555) LEGAL-1
                </Button>
              </div>
              <div className="text-center">
                <Users className="h-8 w-8 mx-auto mb-3 text-primary" />
                <h3 className="font-semibold mb-2">Creator Relations</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  For creator-specific contract support
                </p>
                <Button size="sm">
                  creators@flavours.club
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
