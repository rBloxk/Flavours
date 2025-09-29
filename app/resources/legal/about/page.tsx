"use client"

import React from 'react'
import { ResourceHeader } from '@/components/layout/resource-header'
import { ResourceFooter } from '@/components/layout/resource-footer'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Users, 
  Heart, 
  Target, 
  Award,
  Globe,
  Shield,
  Zap,
  Star,
  TrendingUp,
  MessageSquare,
  Camera,
  Video,
  DollarSign,
  Lock,
  CheckCircle
} from 'lucide-react'

export default function AboutPage() {
  const values = [
    {
      title: "Creativity First",
      description: "We believe in empowering creators to express themselves freely and authentically",
      icon: Heart,
      color: "text-red-500"
    },
    {
      title: "Community Driven",
      description: "Building meaningful connections between creators and their audiences",
      icon: Users,
      color: "text-blue-500"
    },
    {
      title: "Innovation",
      description: "Continuously evolving our platform with cutting-edge technology",
      icon: Zap,
      color: "text-yellow-500"
    },
    {
      title: "Transparency",
      description: "Open communication and honest practices in everything we do",
      icon: Shield,
      color: "text-green-500"
    }
  ]

  const milestones = [
    {
      year: "2020",
      title: "Flavours Founded",
      description: "Started with a vision to revolutionize creator monetization"
    },
    {
      year: "2021",
      title: "First 1,000 Creators",
      description: "Reached our first milestone of active creators on the platform"
    },
    {
      year: "2022",
      title: "Series A Funding",
      description: "Raised $10M to accelerate platform development and growth"
    },
    {
      year: "2023",
      title: "Global Expansion",
      description: "Launched in 15 countries with localized features and support"
    },
    {
      year: "2024",
      title: "AI Integration",
      description: "Introduced AI-powered content recommendations and creator tools"
    }
  ]

  const teamStats = [
    {
      number: "50+",
      label: "Team Members",
      icon: Users
    },
    {
      number: "15",
      label: "Countries",
      icon: Globe
    },
    {
      number: "1M+",
      label: "Active Users",
      icon: TrendingUp
    },
    {
      number: "100K+",
      label: "Creators",
      icon: Star
    }
  ]

  const features = [
    {
      title: "Creator Tools",
      description: "Advanced analytics, content protection, and monetization options",
      icon: Camera
    },
    {
      title: "Community Features",
      description: "Engagement tools, messaging, and social interactions",
      icon: MessageSquare
    },
    {
      title: "Monetization",
      description: "Multiple revenue streams including subscriptions, tips, and paid content",
      icon: DollarSign
    },
    {
      title: "Content Protection",
      description: "Advanced security measures to protect creator content",
      icon: Lock
    }
  ]

  return (
    <div className="min-h-screen bg-background">
      <ResourceHeader />
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">About Flavours</h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
            We're building the future of creator monetization, empowering content creators 
            to connect with their audiences and build sustainable businesses.
          </p>
        </div>

        {/* Mission Statement */}
        <Card className="mb-12">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl mb-4">Our Mission</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg text-center text-muted-foreground max-w-4xl mx-auto">
              To democratize content creation by providing creators with the tools, platform, 
              and community they need to turn their passion into profit. We believe every 
              creator deserves fair compensation for their work and the opportunity to build 
              meaningful connections with their audience.
            </p>
          </CardContent>
        </Card>

        {/* Values */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6 text-center">Our Values</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value, index) => (
              <Card key={index} className="text-center">
                <CardHeader>
                  <value.icon className={`h-12 w-12 mx-auto mb-4 ${value.color}`} />
                  <CardTitle className="text-lg">{value.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{value.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Team Stats */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6 text-center">By the Numbers</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {teamStats.map((stat, index) => (
              <Card key={index} className="text-center">
                <CardContent className="pt-6">
                  <stat.icon className="h-8 w-8 mx-auto mb-3 text-primary" />
                  <div className="text-3xl font-bold mb-2">{stat.number}</div>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Features */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6 text-center">What We Offer</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {features.map((feature, index) => (
              <Card key={index}>
                <CardHeader>
                  <div className="flex items-center space-x-3">
                    <feature.icon className="h-8 w-8 text-primary" />
                    <CardTitle className="text-lg">{feature.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Timeline */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6 text-center">Our Journey</h2>
          <div className="space-y-6">
            {milestones.map((milestone, index) => (
              <Card key={index}>
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      <Badge variant="outline" className="text-lg px-4 py-2">
                        {milestone.year}
                      </Badge>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold">{milestone.title}</h3>
                      <p className="text-muted-foreground">{milestone.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Leadership Team */}
        <Card className="mb-12">
          <CardHeader>
            <CardTitle className="text-center">Leadership Team</CardTitle>
            <CardDescription className="text-center">
              Meet the people behind Flavours
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <span className="text-white text-2xl font-bold">JS</span>
                </div>
                <h3 className="font-semibold">Jane Smith</h3>
                <p className="text-sm text-muted-foreground mb-2">CEO & Co-Founder</p>
                <p className="text-xs text-muted-foreground">
                  Former VP of Product at TechCorp, passionate about creator economy
                </p>
              </div>
              <div className="text-center">
                <div className="w-24 h-24 bg-gradient-to-br from-green-500 to-blue-600 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <span className="text-white text-2xl font-bold">MR</span>
                </div>
                <h3 className="font-semibold">Mike Rodriguez</h3>
                <p className="text-sm text-muted-foreground mb-2">CTO & Co-Founder</p>
                <p className="text-xs text-muted-foreground">
                  Ex-Google engineer, expert in scalable platform architecture
                </p>
              </div>
              <div className="text-center">
                <div className="w-24 h-24 bg-gradient-to-br from-pink-500 to-red-600 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <span className="text-white text-2xl font-bold">SC</span>
                </div>
                <h3 className="font-semibold">Sarah Chen</h3>
                <p className="text-sm text-muted-foreground mb-2">Head of Creator Success</p>
                <p className="text-xs text-muted-foreground">
                  Former creator herself, understands the challenges creators face
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contact */}
        <Card>
          <CardHeader>
            <CardTitle className="text-center">Get in Touch</CardTitle>
            <CardDescription className="text-center">
              We'd love to hear from you
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
              <div>
                <h3 className="font-semibold mb-2">General Inquiries</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  For general questions and information
                </p>
                <Button variant="outline" size="sm">
                  hello@flavours.com
                </Button>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Press & Media</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  For media inquiries and press releases
                </p>
                <Button variant="outline" size="sm">
                  press@flavours.com
                </Button>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Partnerships</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  For business partnerships and collaborations
                </p>
                <Button variant="outline" size="sm">
                  partnerships@flavours.com
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
