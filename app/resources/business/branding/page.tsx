"use client"

import React from 'react'
import { ResourceHeader } from '@/components/layout/resource-header'
import { ResourceFooter } from '@/components/layout/resource-footer'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Palette, 
  Download, 
  Eye, 
  FileText,
  Image,
  Type,
  Colors,
  Layout,
  Shield,
  CheckCircle,
  Info,
  Mail,
  Phone,
  Calendar
} from 'lucide-react'

export default function BrandingPage() {
  const brandAssets = [
    {
      name: "Logo Package",
      description: "Complete logo set in various formats and sizes",
      files: [
        "Logo (PNG, SVG, EPS)",
        "Logo variations (horizontal, vertical, icon)",
        "Color and monochrome versions",
        "Usage guidelines and specifications"
      ],
      download: "brand-assets.zip"
    },
    {
      name: "Color Palette",
      description: "Official brand colors with hex codes and usage guidelines",
      files: [
        "Primary brand colors",
        "Secondary color palette",
        "Accent colors and gradients",
        "Color accessibility guidelines"
      ],
      download: "color-palette.pdf"
    },
    {
      name: "Typography",
      description: "Brand fonts and typography guidelines",
      files: [
        "Primary and secondary fonts",
        "Font weights and styles",
        "Typography hierarchy",
        "Usage examples and best practices"
      ],
      download: "typography-guide.pdf"
    },
    {
      name: "Templates",
      description: "Ready-to-use templates for various applications",
      files: [
        "Social media templates",
        "Presentation templates",
        "Document templates",
        "Web and print templates"
      ],
      download: "templates.zip"
    }
  ]

  const guidelines = [
    {
      category: "Logo Usage",
      description: "Proper use of the Flavours logo",
      rules: [
        "Maintain minimum clear space around the logo",
        "Use approved color variations only",
        "Do not alter, distort, or recreate the logo",
        "Ensure sufficient contrast for readability"
      ]
    },
    {
      category: "Color Usage",
      description: "Guidelines for using brand colors",
      rules: [
        "Use primary colors for main brand elements",
        "Maintain color consistency across all materials",
        "Ensure accessibility compliance (WCAG 2.1)",
        "Test colors in different lighting conditions"
      ]
    },
    {
      category: "Typography",
      description: "Rules for using brand fonts",
      rules: [
        "Use specified fonts for all brand communications",
        "Maintain proper font weights and sizes",
        "Ensure readability across all devices",
        "Follow typography hierarchy guidelines"
      ]
    },
    {
      category: "Imagery",
      description: "Guidelines for brand photography and graphics",
      rules: [
        "Use high-quality, professional imagery",
        "Maintain consistent visual style",
        "Ensure diversity and inclusion in imagery",
        "Follow copyright and licensing requirements"
      ]
    }
  ]

  const prohibitedUses = [
    "Altering or modifying the logo in any way",
    "Using unapproved color variations",
    "Placing the logo on busy or cluttered backgrounds",
    "Using the logo smaller than the minimum size",
    "Creating derivative logos or marks",
    "Using the logo for unauthorized purposes",
    "Combining the logo with other brand elements",
    "Using outdated or incorrect logo versions"
  ]

  const approvalProcess = [
    {
      step: "1",
      title: "Submit Request",
      description: "Complete the brand usage request form"
    },
    {
      step: "2",
      title: "Review Process",
      description: "Our team reviews your request and materials"
    },
    {
      step: "3",
      title: "Feedback & Revisions",
      description: "We provide feedback and request revisions if needed"
    },
    {
      step: "4",
      title: "Approval",
      description: "Final approval and asset delivery"
    }
  ]

  return (
    <div className="min-h-screen bg-background">
      <ResourceHeader />
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Brand Guidelines</h1>
          <p className="text-xl text-muted-foreground mb-8">
            Official branding resources and guidelines for the Flavours platform
          </p>
          <div className="flex items-center justify-center space-x-2">
            <Palette className="h-6 w-6 text-primary" />
            <span className="text-sm text-muted-foreground">
              Maintaining brand consistency across all touchpoints
            </span>
          </div>
        </div>

        {/* Brand Overview */}
        <Card className="mb-12">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Info className="h-6 w-6" />
              <span>Brand Overview</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              The Flavours brand represents creativity, community, and empowerment. Our visual identity 
              reflects our commitment to supporting creators and building meaningful connections. 
              These guidelines ensure consistent and professional representation of our brand across all channels.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full mx-auto mb-3 flex items-center justify-center">
                  <span className="text-white text-2xl font-bold">F</span>
                </div>
                <h3 className="font-semibold">Primary Logo</h3>
                <p className="text-sm text-muted-foreground">Main brand mark</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full mx-auto mb-3 flex items-center justify-center">
                  <span className="text-white text-2xl font-bold">F</span>
                </div>
                <h3 className="font-semibold">Secondary Logo</h3>
                <p className="text-sm text-muted-foreground">Alternative applications</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full mx-auto mb-3 flex items-center justify-center">
                  <span className="text-white text-2xl font-bold">F</span>
                </div>
                <h3 className="font-semibold">Icon Mark</h3>
                <p className="text-sm text-muted-foreground">Social media and apps</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Brand Assets */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6">Brand Assets</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {brandAssets.map((asset, index) => (
              <Card key={index}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">{asset.name}</CardTitle>
                      <CardDescription>{asset.description}</CardDescription>
                    </div>
                    <Button variant="outline" size="sm">
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {asset.files.map((file, fileIndex) => (
                      <li key={fileIndex} className="flex items-center text-sm">
                        <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                        {file}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Brand Guidelines */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6">Brand Guidelines</h2>
          <div className="space-y-6">
            {guidelines.map((guideline, index) => (
              <Card key={index}>
                <CardHeader>
                  <CardTitle className="text-lg">{guideline.category}</CardTitle>
                  <CardDescription>{guideline.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {guideline.rules.map((rule, ruleIndex) => (
                      <li key={ruleIndex} className="flex items-start text-sm">
                        <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                        {rule}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Prohibited Uses */}
        <Card className="mb-12">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Shield className="h-6 w-6 text-red-500" />
              <span>Prohibited Uses</span>
            </CardTitle>
            <CardDescription>
              The following uses of our brand assets are strictly prohibited
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {prohibitedUses.map((use, index) => (
                <div key={index} className="flex items-start space-x-2">
                  <Shield className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                  <span className="text-sm">{use}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Approval Process */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6">Brand Usage Approval Process</h2>
          <div className="space-y-4">
            {approvalProcess.map((step, index) => (
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

        {/* Request Form */}
        <Card className="mb-12">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <FileText className="h-6 w-6" />
              <span>Request Brand Assets</span>
            </CardTitle>
            <CardDescription>
              Submit a request for brand assets or usage approval
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Organization/Company</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Enter your organization name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Intended Use</label>
                <textarea
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  rows={3}
                  placeholder="Describe how you plan to use the brand assets"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Contact Information</label>
                <input
                  type="email"
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="your.email@company.com"
                />
              </div>
              <Button className="w-full">
                <Mail className="h-4 w-4 mr-2" />
                Submit Request
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Mail className="h-6 w-6" />
              <span>Brand Team Contact</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              For questions about brand usage, asset requests, or brand guidelines, contact our brand team:
            </p>
            <div className="space-y-2">
              <p className="text-sm">
                <strong>Brand Manager:</strong> brand@flavours.club
              </p>
              <p className="text-sm">
                <strong>General Inquiries:</strong> hello@flavours.club
              </p>
              <p className="text-sm">
                <strong>Address:</strong> Flavours Brand Team, 123 Creator Street, San Francisco, CA 94105
              </p>
              <p className="text-sm">
                <strong>Phone:</strong> +1 (555) 123-4567
              </p>
            </div>
            <div className="mt-6">
              <Button variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Download Complete Brand Kit
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
      <ResourceFooter />
    </div>
  )
}
