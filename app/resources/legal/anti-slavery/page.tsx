"use client"

import { getCurrentDate } from '@/lib/date-utils'
import { ResourceHeader } from '@/components/layout/resource-header'
import { ResourceFooter } from '@/components/layout/resource-footer'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Shield, 
  Users, 
  Globe, 
  CheckCircle,
  AlertTriangle,
  FileText,
  Heart,
  Lock,
  Eye,
  Flag,
  Mail,
  Phone,
  Calendar
} from 'lucide-react'

export default function AntiSlaveryPage() {
  const commitments = [
    {
      title: "Zero Tolerance",
      description: "We have a zero-tolerance approach to modern slavery and human trafficking",
      icon: Shield,
      color: "text-red-500"
    },
    {
      title: "Supply Chain Transparency",
      description: "We ensure transparency throughout our supply chain and business relationships",
      icon: Eye,
      color: "text-blue-500"
    },
    {
      title: "Employee Protection",
      description: "We protect the rights and dignity of all our employees and contractors",
      icon: Users,
      color: "text-green-500"
    },
    {
      title: "Global Standards",
      description: "We adhere to international labor standards and human rights principles",
      icon: Globe,
      color: "text-purple-500"
    }
  ]

  const policies = [
    {
      title: "Recruitment Practices",
      description: "All recruitment is conducted ethically with proper documentation and fair treatment",
      points: [
        "No recruitment fees charged to workers",
        "Transparent employment terms",
        "Fair wage practices",
        "Safe working conditions"
      ]
    },
    {
      title: "Supplier Due Diligence",
      description: "We conduct thorough due diligence on all suppliers and business partners",
      points: [
        "Background checks on suppliers",
        "Regular compliance audits",
        "Contract terms requiring ethical practices",
        "Ongoing monitoring and assessment"
      ]
    },
    {
      title: "Employee Training",
      description: "All employees receive training on identifying and preventing modern slavery",
      points: [
        "Annual training programs",
        "Recognition of warning signs",
        "Reporting procedures",
        "Support for victims"
      ]
    },
    {
      title: "Reporting Mechanisms",
      description: "Clear channels for reporting concerns about modern slavery or human trafficking",
      points: [
        "Anonymous reporting hotline",
        "Direct contact with management",
        "External reporting options",
        "Protection for whistleblowers"
      ]
    }
  ]

  const indicators = [
    {
      category: "Recruitment Red Flags",
      items: [
        "Workers charged excessive recruitment fees",
        "Confiscation of identity documents",
        "Restrictions on freedom of movement",
        "Threats or intimidation"
      ]
    },
    {
      category: "Working Conditions",
      items: [
        "Excessive working hours without proper compensation",
        "Dangerous or unsafe working conditions",
        "Lack of proper safety equipment",
        "Inadequate living conditions"
      ]
    },
    {
      category: "Financial Exploitation",
      items: [
        "Wages below legal minimum",
        "Deductions for undefined purposes",
        "No access to bank accounts",
        "Debt bondage situations"
      ]
    },
    {
      category: "Personal Freedom",
      items: [
        "Restrictions on communication",
        "Isolation from family and friends",
        "Physical or psychological abuse",
        "Forced labor or services"
      ]
    }
  ]

  const reportingInfo = [
    {
      method: "Internal Reporting",
      description: "Report concerns through our internal channels",
      contact: "ethics@flavours.club",
      icon: Mail
    },
    {
      method: "Anonymous Hotline",
      description: "Call our confidential reporting hotline",
      contact: "+1 (555) ETHICS-1",
      icon: Phone
    },
    {
      method: "External Authorities",
      description: "Contact local law enforcement or anti-trafficking organizations",
      contact: "Human Trafficking Hotline: 1-888-373-7888",
      icon: Flag
    }
  ]

  return (
    <div className="min-h-screen bg-background">
      <ResourceHeader />
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Anti-Slavery and Anti-Trafficking Statement</h1>
          <p className="text-xl text-muted-foreground mb-8">
            Our commitment to preventing modern slavery and human trafficking
          </p>
          <div className="flex items-center justify-center space-x-2">
            <Shield className="h-6 w-6 text-primary" />
            <span className="text-sm text-muted-foreground">
              Committed to human rights and ethical practices
            </span>
          </div>
        </div>

        {/* Statement */}
        <Card className="mb-12">
          <CardHeader>
            <CardTitle className="text-2xl text-center">Our Statement</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg text-center text-muted-foreground max-w-4xl mx-auto">
              Flavours is committed to preventing acts of modern slavery and human trafficking from 
              occurring within our business and supply chain. We recognize our responsibility to 
              respect and promote fundamental human rights and to ensure that our operations and 
              business relationships do not contribute to human rights violations.
            </p>
          </CardContent>
        </Card>

        {/* Commitments */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6 text-center">Our Commitments</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {commitments.map((commitment, index) => (
              <Card key={index} className="text-center">
                <CardHeader>
                  <commitment.icon className={`h-12 w-12 mx-auto mb-4 ${commitment.color}`} />
                  <CardTitle className="text-lg">{commitment.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{commitment.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Policies */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6 text-center">Our Policies and Procedures</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {policies.map((policy, index) => (
              <Card key={index}>
                <CardHeader>
                  <CardTitle className="text-lg">{policy.title}</CardTitle>
                  <CardDescription>{policy.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {policy.points.map((point, pointIndex) => (
                      <li key={pointIndex} className="flex items-start text-sm">
                        <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                        {point}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Warning Signs */}
        <Card className="mb-12">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <AlertTriangle className="h-6 w-6 text-orange-500" />
              <span>Warning Signs of Modern Slavery</span>
            </CardTitle>
            <CardDescription>
              Be aware of these indicators that may suggest modern slavery or human trafficking
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {indicators.map((indicator, index) => (
                <div key={index}>
                  <h3 className="font-semibold mb-3">{indicator.category}</h3>
                  <ul className="space-y-2">
                    {indicator.items.map((item, itemIndex) => (
                      <li key={itemIndex} className="flex items-start text-sm">
                        <AlertTriangle className="h-4 w-4 text-orange-500 mr-2 mt-0.5 flex-shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Reporting */}
        <Card className="mb-12">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Flag className="h-6 w-6 text-red-500" />
              <span>How to Report Concerns</span>
            </CardTitle>
            <CardDescription>
              If you suspect modern slavery or human trafficking, report it immediately
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {reportingInfo.map((info, index) => (
                <div key={index} className="text-center">
                  <info.icon className="h-8 w-8 mx-auto mb-3 text-primary" />
                  <h3 className="font-semibold mb-2">{info.method}</h3>
                  <p className="text-sm text-muted-foreground mb-3">{info.description}</p>
                  <Button variant="outline" size="sm">
                    {info.contact}
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

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
              <div>
                <h3 className="font-semibold mb-2">UK Modern Slavery Act 2015</h3>
                <p className="text-sm text-muted-foreground">
                  We comply with the UK Modern Slavery Act 2015, which requires companies to 
                  publish an annual statement on the steps they have taken to prevent modern slavery.
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">California Transparency in Supply Chains Act</h3>
                <p className="text-sm text-muted-foreground">
                  We adhere to the California Transparency in Supply Chains Act, which requires 
                  companies to disclose their efforts to eradicate slavery and human trafficking.
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">International Labor Organization (ILO) Standards</h3>
                <p className="text-sm text-muted-foreground">
                  We follow ILO conventions on forced labor, child labor, and fundamental 
                  principles and rights at work.
                </p>
              </div>
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
            <div className="space-y-4">
              <p className="text-muted-foreground">
                For questions about this statement or to report concerns about modern slavery 
                or human trafficking, please contact:
              </p>
              <div className="bg-muted p-4 rounded-lg">
                <p className="text-sm">
                  <strong>Ethics and Compliance Officer</strong><br />
                  Email: ethics@flavours.club<br />
                  Phone: +1 (555) ETHICS-1<br />
                  Address: 123 Creator Street, San Francisco, CA 94105
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  This statement is reviewed and updated annually. Last updated: {getCurrentDate()}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      <ResourceFooter />
    </div>
  )
}
