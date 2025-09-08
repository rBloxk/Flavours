"use client"

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { 
  Shield, 
  Eye, 
  Lock, 
  Globe, 
  Users, 
  Database, 
  Settings, 
  AlertTriangle, 
  CheckCircle, 
  Info, 
  Download, 
  Mail, 
  Phone, 
  Calendar, 
  ChevronDown, 
  ChevronRight,
  FileText,
  UserCheck,
  Server,
  Key,
  Trash2,
  Edit,
  Share2,
  Bell,
  Heart,
  MessageCircle,
  Video,
  Image,
  Mic,
  DollarSign,
  TrendingUp,
  Award,
  Star
} from 'lucide-react'

export default function PrivacyPolicyPage() {
  const [expandedSections, setExpandedSections] = useState<string[]>(['introduction'])

  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev => 
      prev.includes(sectionId) 
        ? prev.filter(id => id !== sectionId)
        : [...prev, sectionId]
    )
  }

  const privacySections = [
    {
      id: 'introduction',
      title: 'Introduction',
      icon: Info,
      lastUpdated: '2024-01-15',
      content: `
        <p>Welcome to Flavours! This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our creator monetization platform.</p>
        
        <h4>Our Commitment</h4>
        <p>We are committed to protecting your privacy and ensuring the security of your personal information. This policy applies to all users of Flavours, including creators, subscribers, and visitors.</p>
        
        <h4>Key Principles</h4>
        <ul>
          <li><strong>Transparency:</strong> We clearly explain what data we collect and why</li>
          <li><strong>Control:</strong> You have control over your personal information</li>
          <li><strong>Security:</strong> We implement robust security measures to protect your data</li>
          <li><strong>Compliance:</strong> We comply with applicable privacy laws and regulations</li>
        </ul>
      `
    },
    {
      id: 'data-collection',
      title: 'Information We Collect',
      icon: Database,
      lastUpdated: '2024-01-15',
      content: `
        <h4>Personal Information</h4>
        <p>We collect information you provide directly to us, such as:</p>
        <ul>
          <li><strong>Account Information:</strong> Name, email address, username, profile picture</li>
          <li><strong>Payment Information:</strong> Billing address, payment method details (processed securely by third-party providers)</li>
          <li><strong>Content:</strong> Posts, images, videos, audio recordings, and other content you create</li>
          <li><strong>Communication:</strong> Messages, comments, and other communications</li>
        </ul>
        
        <h4>Automatically Collected Information</h4>
        <p>We automatically collect certain information when you use our platform:</p>
        <ul>
          <li><strong>Usage Data:</strong> How you interact with our platform, features used, time spent</li>
          <li><strong>Device Information:</strong> Device type, operating system, browser type, IP address</li>
          <li><strong>Location Data:</strong> General location information (with your consent)</li>
          <li><strong>Analytics Data:</strong> Performance metrics, error logs, crash reports</li>
        </ul>
        
        <h4>Third-Party Information</h4>
        <p>We may receive information from third parties, such as:</p>
        <ul>
          <li>Social media platforms (when you connect your accounts)</li>
          <li>Payment processors (transaction information)</li>
          <li>Analytics providers (usage statistics)</li>
        </ul>
      `
    },
    {
      id: 'data-usage',
      title: 'How We Use Your Information',
      icon: Settings,
      lastUpdated: '2024-01-15',
      content: `
        <h4>Primary Uses</h4>
        <p>We use your information to:</p>
        <ul>
          <li><strong>Provide Services:</strong> Operate and maintain our platform</li>
          <li><strong>Process Payments:</strong> Handle subscriptions, tips, and other transactions</li>
          <li><strong>Communicate:</strong> Send important updates, notifications, and support messages</li>
          <li><strong>Improve Platform:</strong> Analyze usage patterns to enhance user experience</li>
        </ul>
        
        <h4>Content and Creator Features</h4>
        <p>For creators, we use your information to:</p>
        <ul>
          <li>Display your content to subscribers and followers</li>
          <li>Process subscription payments and revenue sharing</li>
          <li>Provide analytics and insights about your content performance</li>
          <li>Enable monetization features and tools</li>
        </ul>
        
        <h4>Legal and Safety</h4>
        <p>We may use your information to:</p>
        <ul>
          <li>Comply with legal obligations and court orders</li>
          <li>Protect against fraud, abuse, and security threats</li>
          <li>Enforce our Terms of Service and Community Guidelines</li>
          <li>Protect the rights and safety of our users</li>
        </ul>
      `
    },
    {
      id: 'data-sharing',
      title: 'Information Sharing',
      icon: Share2,
      lastUpdated: '2024-01-15',
      content: `
        <h4>Public Information</h4>
        <p>Some information is publicly visible on our platform:</p>
        <ul>
          <li>Your public profile information (name, bio, profile picture)</li>
          <li>Content you post publicly</li>
          <li>Public comments and interactions</li>
        </ul>
        
        <h4>Limited Sharing</h4>
        <p>We may share your information in these limited circumstances:</p>
        <ul>
          <li><strong>With Your Consent:</strong> When you explicitly authorize sharing</li>
          <li><strong>Service Providers:</strong> Trusted third parties who help us operate our platform</li>
          <li><strong>Legal Requirements:</strong> When required by law or to protect our rights</li>
          <li><strong>Business Transfers:</strong> In connection with mergers, acquisitions, or asset sales</li>
        </ul>
        
        <h4>We Do Not Sell</h4>
        <p>We do not sell, rent, or trade your personal information to third parties for their commercial purposes.</p>
      `
    },
    {
      id: 'data-security',
      title: 'Data Security',
      icon: Lock,
      lastUpdated: '2024-01-15',
      content: `
        <h4>Security Measures</h4>
        <p>We implement comprehensive security measures to protect your information:</p>
        <ul>
          <li><strong>Encryption:</strong> Data is encrypted in transit and at rest</li>
          <li><strong>Access Controls:</strong> Strict access controls and authentication</li>
          <li><strong>Regular Audits:</strong> Regular security assessments and updates</li>
          <li><strong>Employee Training:</strong> Staff training on data protection practices</li>
        </ul>
        
        <h4>Payment Security</h4>
        <p>Payment information is processed by certified third-party providers and never stored on our servers.</p>
        
        <h4>Incident Response</h4>
        <p>In the event of a security incident, we will:</p>
        <ul>
          <li>Notify affected users promptly</li>
          <li>Take immediate action to secure systems</li>
          <li>Cooperate with law enforcement if necessary</li>
          <li>Provide updates on our response efforts</li>
        </ul>
      `
    },
    {
      id: 'your-rights',
      title: 'Your Rights and Choices',
      icon: UserCheck,
      lastUpdated: '2024-01-15',
      content: `
        <h4>Access and Control</h4>
        <p>You have the right to:</p>
        <ul>
          <li><strong>Access:</strong> Request a copy of your personal information</li>
          <li><strong>Correct:</strong> Update or correct inaccurate information</li>
          <li><strong>Delete:</strong> Request deletion of your account and data</li>
          <li><strong>Port:</strong> Export your data in a portable format</li>
        </ul>
        
        <h4>Privacy Settings</h4>
        <p>You can control your privacy through:</p>
        <ul>
          <li>Account settings and privacy preferences</li>
          <li>Content visibility settings</li>
          <li>Communication preferences</li>
          <li>Data sharing controls</li>
        </ul>
        
        <h4>Opt-Out Options</h4>
        <p>You can opt out of:</p>
        <ul>
          <li>Marketing communications</li>
          <li>Non-essential data collection</li>
          <li>Location tracking</li>
          <li>Analytics and performance monitoring</li>
        </ul>
      `
    },
    {
      id: 'cookies',
      title: 'Cookies and Tracking',
      icon: Server,
      lastUpdated: '2024-01-15',
      content: `
        <h4>Types of Cookies</h4>
        <p>We use different types of cookies:</p>
        <ul>
          <li><strong>Essential Cookies:</strong> Required for platform functionality</li>
          <li><strong>Performance Cookies:</strong> Help us understand how you use our platform</li>
          <li><strong>Functional Cookies:</strong> Remember your preferences and settings</li>
          <li><strong>Marketing Cookies:</strong> Used for targeted advertising (with consent)</li>
        </ul>
        
        <h4>Cookie Management</h4>
        <p>You can manage cookies through:</p>
        <ul>
          <li>Your browser settings</li>
          <li>Our cookie preference center</li>
          <li>Third-party opt-out tools</li>
        </ul>
        
        <h4>Third-Party Services</h4>
        <p>We use third-party services that may set their own cookies:</p>
        <ul>
          <li>Analytics providers (Google Analytics, etc.)</li>
          <li>Payment processors</li>
          <li>Social media integrations</li>
        </ul>
      `
    },
    {
      id: 'children-privacy',
      title: 'Children\'s Privacy',
      icon: Shield,
      lastUpdated: '2024-01-15',
      content: `
        <h4>Age Requirements</h4>
        <p>Flavours is not intended for children under 13 years of age. We do not knowingly collect personal information from children under 13.</p>
        
        <h4>Parental Controls</h4>
        <p>If you are a parent or guardian and believe your child has provided us with personal information, please contact us immediately.</p>
        
        <h4>Teen Users</h4>
        <p>For users between 13-17 years old, we recommend parental supervision and may require parental consent for certain features.</p>
      `
    },
    {
      id: 'international-transfers',
      title: 'International Data Transfers',
      icon: Globe,
      lastUpdated: '2024-01-15',
      content: `
        <h4>Global Operations</h4>
        <p>Flavours operates globally, and your information may be transferred to and processed in countries other than your own.</p>
        
        <h4>Data Protection</h4>
        <p>We ensure appropriate safeguards are in place for international transfers, including:</p>
        <ul>
          <li>Standard contractual clauses</li>
          <li>Adequacy decisions</li>
          <li>Binding corporate rules</li>
          <li>Certification schemes</li>
        </ul>
        
        <h4>Your Rights</h4>
        <p>Regardless of where your data is processed, you retain all rights under applicable privacy laws.</p>
      `
    },
    {
      id: 'changes-updates',
      title: 'Changes to This Policy',
      icon: Edit,
      lastUpdated: '2024-01-15',
      content: `
        <h4>Policy Updates</h4>
        <p>We may update this Privacy Policy from time to time to reflect changes in our practices or legal requirements.</p>
        
        <h4>Notification of Changes</h4>
        <p>When we make significant changes, we will:</p>
        <ul>
          <li>Notify you via email or platform notification</li>
          <li>Post the updated policy on our website</li>
          <li>Provide a summary of key changes</li>
        </ul>
        
        <h4>Effective Date</h4>
        <p>Changes will be effective immediately upon posting, unless otherwise specified.</p>
      `
    },
    {
      id: 'contact-info',
      title: 'Contact Us',
      icon: Mail,
      lastUpdated: '2024-01-15',
      content: `
        <h4>Privacy Questions</h4>
        <p>If you have questions about this Privacy Policy or our privacy practices, please contact us:</p>
        
        <h4>Contact Information</h4>
        <ul>
          <li><strong>Email:</strong> privacy@flavours.com</li>
          <li><strong>Address:</strong> Flavours Privacy Team, 123 Creator Street, San Francisco, CA 94105</li>
          <li><strong>Phone:</strong> +1 (555) 123-4567</li>
        </ul>
        
        <h4>Data Protection Officer</h4>
        <p>For EU users, you can contact our Data Protection Officer at dpo@flavours.com</p>
        
        <h4>Response Time</h4>
        <p>We aim to respond to all privacy inquiries within 30 days.</p>
      `
    }
  ]

  const quickFacts = [
    {
      icon: Shield,
      title: 'GDPR Compliant',
      description: 'We comply with European data protection regulations'
    },
    {
      icon: Lock,
      title: 'End-to-End Encryption',
      description: 'Your sensitive data is encrypted at all times'
    },
    {
      icon: UserCheck,
      title: 'Full Control',
      description: 'You have complete control over your personal data'
    },
    {
      icon: Server,
      title: 'Secure Infrastructure',
      description: 'Enterprise-grade security and monitoring'
    }
  ]

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center space-x-2">
          <Shield className="h-8 w-8 text-primary" />
          <h1 className="text-4xl font-bold">Privacy Policy</h1>
        </div>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
          Your privacy is important to us. This policy explains how we collect, use, and protect your information when you use Flavours.
        </p>
        <div className="flex items-center justify-center space-x-4 text-sm text-muted-foreground">
          <span className="flex items-center">
            <Calendar className="h-4 w-4 mr-1" />
            Last updated: January 15, 2024
          </span>
          <span className="flex items-center">
            <FileText className="h-4 w-4 mr-1" />
            Version 2.1
          </span>
        </div>
      </div>

      {/* Quick Facts */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {quickFacts.map((fact, index) => {
          const Icon = fact.icon
          return (
            <Card key={index} className="text-center">
              <CardContent className="p-6">
                <Icon className="h-8 w-8 text-primary mx-auto mb-3" />
                <h3 className="font-semibold mb-2">{fact.title}</h3>
                <p className="text-sm text-muted-foreground">{fact.description}</p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Download PDF */}
      <Card className="bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Download className="h-6 w-6 text-primary" />
              <div>
                <h3 className="font-semibold">Download Privacy Policy</h3>
                <p className="text-sm text-muted-foreground">Get a PDF copy of this privacy policy for your records</p>
              </div>
            </div>
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Download PDF
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Privacy Sections */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold">Privacy Policy Sections</h2>
        {privacySections.map((section) => {
          const Icon = section.icon
          const isExpanded = expandedSections.includes(section.id)
          
          return (
            <Card key={section.id} className="hover:shadow-lg transition-shadow">
              <CardHeader 
                className="cursor-pointer"
                onClick={() => toggleSection(section.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Icon className="h-6 w-6 text-primary" />
                    <div>
                      <CardTitle className="text-xl">{section.title}</CardTitle>
                      <p className="text-sm text-muted-foreground">
                        Last updated: {section.lastUpdated}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {isExpanded ? <ChevronDown className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
                  </div>
                </div>
              </CardHeader>
              
              {isExpanded && (
                <CardContent className="pt-0">
                  <div 
                    className="prose prose-sm max-w-none"
                    dangerouslySetInnerHTML={{ __html: section.content }}
                  />
                </CardContent>
              )}
            </Card>
          )
        })}
      </div>

      {/* Contact Information */}
      <Card className="bg-muted/50">
        <CardContent className="p-6">
          <div className="text-center space-y-4">
            <h3 className="text-xl font-semibold">Questions About Your Privacy?</h3>
            <p className="text-muted-foreground">
              We're here to help. Contact our privacy team if you have any questions or concerns.
            </p>
            <div className="flex items-center justify-center space-x-4">
              <Button variant="outline">
                <Mail className="h-4 w-4 mr-2" />
                Email Privacy Team
              </Button>
              <Button variant="outline">
                <Phone className="h-4 w-4 mr-2" />
                Call Support
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Legal Notice */}
      <div className="text-center text-sm text-muted-foreground space-y-2">
        <p>
          This Privacy Policy is effective as of January 15, 2024, and was last updated on January 15, 2024.
        </p>
        <p>
          By using Flavours, you acknowledge that you have read and understood this Privacy Policy.
        </p>
        <div className="flex items-center justify-center space-x-4 pt-4">
          <Button variant="ghost" size="sm">
            Terms of Service
          </Button>
          <Separator orientation="vertical" className="h-4" />
          <Button variant="ghost" size="sm">
            Cookie Policy
          </Button>
          <Separator orientation="vertical" className="h-4" />
          <Button variant="ghost" size="sm">
            Community Guidelines
          </Button>
        </div>
      </div>
    </div>
  )
}
