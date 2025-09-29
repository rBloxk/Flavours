"use client"

import React from 'react'
import { ResourceHeader } from '@/components/layout/resource-header'
import { ResourceFooter } from '@/components/layout/resource-footer'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  HelpCircle, 
  MessageCircle, 
  Mail, 
  Phone, 
  Clock, 
  Search,
  BookOpen,
  Video,
  FileText,
  Users,
  Settings,
  Shield,
  CreditCard,
  Smartphone
} from 'lucide-react'

export default function HelpPage() {
  const helpCategories = [
    {
      title: "Getting Started",
      description: "Learn the basics of using Flavours",
      icon: BookOpen,
      articles: [
        "How to create your account",
        "Setting up your profile",
        "Understanding the platform",
        "First steps for creators"
      ]
    },
    {
      title: "Account & Profile",
      description: "Manage your account settings",
      icon: Settings,
      articles: [
        "Updating your profile information",
        "Changing your password",
        "Account verification",
        "Privacy settings"
      ]
    },
    {
      title: "Content Creation",
      description: "Create and manage your content",
      icon: Video,
      articles: [
        "Uploading videos and images",
        "Creating posts and stories",
        "Content guidelines",
        "Monetization options"
      ]
    },
    {
      title: "Payments & Billing",
      description: "Manage your payments and earnings",
      icon: CreditCard,
      articles: [
        "Setting up payment methods",
        "Understanding earnings",
        "Withdrawal process",
        "Tax information"
      ]
    },
    {
      title: "Safety & Security",
      description: "Keep your account secure",
      icon: Shield,
      articles: [
        "Account security tips",
        "Reporting inappropriate content",
        "Blocking users",
        "Two-factor authentication"
      ]
    },
    {
      title: "Mobile App",
      description: "Using Flavours on mobile",
      icon: Smartphone,
      articles: [
        "Downloading the app",
        "Mobile features",
        "Push notifications",
        "Offline viewing"
      ]
    }
  ]

  const faqs = [
    {
      question: "How do I create a creator account?",
      answer: "To become a creator, simply sign up for an account and complete your profile verification. Once verified, you can start uploading content and setting up monetization options."
    },
    {
      question: "What are the content guidelines?",
      answer: "We have strict guidelines to ensure a safe and positive environment. Content must be original, appropriate, and comply with our community standards. Check our full guidelines in the Resources section."
    },
    {
      question: "How do I get paid as a creator?",
      answer: "Creators earn money through subscriptions, tips, and paid content. Payments are processed monthly and can be withdrawn to your bank account or digital wallet."
    },
    {
      question: "Is my content protected?",
      answer: "Yes, we use advanced security measures to protect your content from unauthorized use. We also provide tools for watermarking and content protection."
    },
    {
      question: "How do I report inappropriate content?",
      answer: "You can report content by clicking the three dots menu on any post and selecting 'Report'. Our moderation team reviews all reports within 24 hours."
    },
    {
      question: "Can I use Flavours on my phone?",
      answer: "Yes! We have mobile apps for both iOS and Android. Download them from the App Store or Google Play Store for the best mobile experience."
    }
  ]

  return (
    <div className="min-h-screen bg-background">
      <ResourceHeader />
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Help Center</h1>
          <p className="text-xl text-muted-foreground mb-8">
            Find answers to your questions and learn how to make the most of Flavours
          </p>
          
          {/* Search Bar */}
          <div className="max-w-2xl mx-auto">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
              <input
                type="text"
                placeholder="Search for help articles..."
                className="w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>
        </div>

        {/* Help Categories */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {helpCategories.map((category, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <category.icon className="h-8 w-8 text-primary" />
                  <div>
                    <CardTitle className="text-lg">{category.title}</CardTitle>
                    <CardDescription>{category.description}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {category.articles.map((article, articleIndex) => (
                    <li key={articleIndex} className="text-sm text-muted-foreground hover:text-foreground cursor-pointer">
                      • {article}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Contact Support */}
        <Card className="mb-12">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <MessageCircle className="h-6 w-6" />
              <span>Still need help?</span>
            </CardTitle>
            <CardDescription>
              Our support team is here to help you 24/7
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <Mail className="h-8 w-8 mx-auto mb-3 text-primary" />
                <h3 className="font-semibold mb-2">Email Support</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  Get help via email within 24 hours
                </p>
                <Button variant="outline" size="sm">
                  support@flavours.com
                </Button>
              </div>
              <div className="text-center">
                <MessageCircle className="h-8 w-8 mx-auto mb-3 text-primary" />
                <h3 className="font-semibold mb-2">Live Chat</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  Chat with our support team in real-time
                </p>
                <Button size="sm">
                  Start Chat
                </Button>
              </div>
              <div className="text-center">
                <Phone className="h-8 w-8 mx-auto mb-3 text-primary" />
                <h3 className="font-semibold mb-2">Phone Support</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  Call us for urgent issues
                </p>
                <Button variant="outline" size="sm">
                  +1 (555) 123-4567
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* FAQ Section */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <Card key={index}>
                <CardContent className="p-6">
                  <h3 className="font-semibold mb-2">{faq.question}</h3>
                  <p className="text-muted-foreground">{faq.answer}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Support Hours */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Clock className="h-6 w-6" />
              <span>Support Hours</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold mb-2">Live Chat & Phone</h3>
                <p className="text-sm text-muted-foreground">
                  Monday - Friday: 9:00 AM - 6:00 PM PST<br />
                  Saturday - Sunday: 10:00 AM - 4:00 PM PST
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Email Support</h3>
                <p className="text-sm text-muted-foreground">
                  Available 24/7<br />
                  Average response time: 2-4 hours
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      <ResourceFooter />
    </div>
  )
}
