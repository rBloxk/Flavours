"use client"

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { 
  MessageCircle, 
  Mail, 
  Phone, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  Info, 
  Send, 
  Upload, 
  Paperclip, 
  Star, 
  Users, 
  Zap, 
  Shield, 
  Heart, 
  TrendingUp, 
  Award, 
  Globe, 
  Lock, 
  DollarSign, 
  Video, 
  Image, 
  Mic, 
  Settings, 
  Calendar, 
  MapPin, 
  ExternalLink,
  Copy,
  Download
} from 'lucide-react'

export default function ContactSupportPage() {
  const [selectedMethod, setSelectedMethod] = useState('chat')
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
    priority: 'medium',
    category: 'general'
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const contactMethods = [
    {
      id: 'chat',
      title: 'Live Chat',
      description: 'Get instant help from our support team',
      icon: MessageCircle,
      availability: '24/7',
      responseTime: 'Usually within minutes',
      color: 'text-green-500',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200'
    },
    {
      id: 'email',
      title: 'Email Support',
      description: 'Send us a detailed message',
      icon: Mail,
      availability: '24/7',
      responseTime: 'Within 2-4 hours',
      color: 'text-blue-500',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200'
    },
  
  ]

  const supportCategories = [
    { value: 'general', label: 'General Inquiry', icon: Info },
    { value: 'technical', label: 'Technical Issue', icon: Zap },
    { value: 'billing', label: 'Billing & Payments', icon: DollarSign },
    { value: 'account', label: 'Account Issues', icon: Settings },
    { value: 'content', label: 'Content & Media', icon: Video },
    { value: 'monetization', label: 'Monetization', icon: TrendingUp },
    { value: 'community', label: 'Community & Safety', icon: Shield },
    { value: 'feature', label: 'Feature Request', icon: Star }
  ]

  const priorityLevels = [
    { value: 'low', label: 'Low', description: 'General questions or feedback', color: 'text-green-600' },
    { value: 'medium', label: 'Medium', description: 'Standard support request', color: 'text-yellow-600' },
    { value: 'high', label: 'High', description: 'Urgent issue affecting functionality', color: 'text-orange-600' },
    { value: 'critical', label: 'Critical', description: 'System down or security issue', color: 'text-red-600' }
  ]

  const faqs = [
    {
      question: 'How quickly do you respond to support requests?',
      answer: 'We typically respond to live chat within minutes, email within 2-4 hours, and phone calls immediately during business hours.'
    },
    {
      question: 'What information should I include in my support request?',
      answer: 'Please include your account details, a clear description of the issue, steps to reproduce it, and any relevant screenshots or error messages.'
    },
    {
      question: 'Can I get help with content creation strategies?',
      answer: 'Yes! Our support team includes content strategy specialists who can help you optimize your content and grow your audience.'
    },
    {
      question: 'Is there a limit to how many support requests I can submit?',
      answer: 'No limits! We encourage you to reach out whenever you need help. Premium subscribers get priority support.'
    }
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    setIsSubmitting(false)
    setSubmitted(true)
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center space-x-2">
          <MessageCircle className="h-8 w-8 text-primary" />
          <h1 className="text-4xl font-bold">Contact Support</h1>
        </div>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
          We're here to help! Choose your preferred contact method and get the support you need. 
          Our team is available 24/7 to assist you with any questions or issues.
        </p>
      </div>

      {/* Contact Methods */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Choose Your Contact Method</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {contactMethods.map((method) => {
            const Icon = method.icon
            return (
              <Card 
                key={method.id}
                className={`cursor-pointer transition-all hover:shadow-lg ${
                  selectedMethod === method.id ? 'ring-2 ring-primary' : ''
                }`}
                onClick={() => setSelectedMethod(method.id)}
              >
                <CardContent className="p-6">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className={`p-2 rounded-lg ${method.bgColor}`}>
                      <Icon className={`h-6 w-6 ${method.color}`} />
                    </div>
                    <div>
                      <h3 className="font-semibold">{method.title}</h3>
                      <p className="text-sm text-muted-foreground">{method.description}</p>
                    </div>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Availability:</span>
                      <span className="font-medium">{method.availability}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Response Time:</span>
                      <span className="font-medium">{method.responseTime}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>

      {/* Contact Form */}
      {selectedMethod !== 'chat' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <MessageCircle className="h-5 w-5" />
              <span>Send us a Message</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {submitted ? (
              <div className="text-center py-8">
                <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">Message Sent Successfully!</h3>
                <p className="text-muted-foreground mb-4">
                  We've received your message and will get back to you within {selectedMethod === 'email' ? '2-4 hours' : 'minutes'}.
                </p>
                <div className="flex items-center justify-center space-x-4">
                  <Button onClick={() => setSubmitted(false)} variant="outline">
                    Send Another Message
                  </Button>
                  <Button onClick={() => window.location.href = '/help'}>
                    Browse Help Center
                  </Button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Name *</label>
                    <Input
                      placeholder="Your full name"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Email *</label>
                    <Input
                      type="email"
                      placeholder="your.email@example.com"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Category *</label>
                    <select
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      value={formData.category}
                      onChange={(e) => handleInputChange('category', e.target.value)}
                      required
                    >
                      {supportCategories.map((category) => {
                        const Icon = category.icon
                        return (
                          <option key={category.value} value={category.value}>
                            {category.label}
                          </option>
                        )
                      })}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Priority *</label>
                    <select
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      value={formData.priority}
                      onChange={(e) => handleInputChange('priority', e.target.value)}
                      required
                    >
                      {priorityLevels.map((priority) => (
                        <option key={priority.value} value={priority.value}>
                          {priority.label} - {priority.description}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Subject *</label>
                  <Input
                    placeholder="Brief description of your issue"
                    value={formData.subject}
                    onChange={(e) => handleInputChange('subject', e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Message *</label>
                  <Textarea
                    placeholder="Please provide detailed information about your issue, including steps to reproduce it if applicable..."
                    value={formData.message}
                    onChange={(e) => handleInputChange('message', e.target.value)}
                    className="min-h-[120px]"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Attachments (Optional)</label>
                  <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
                    <Upload className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground mb-2">
                      Drag and drop files here, or click to browse
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Supported formats: Images, PDFs, Videos (max 10MB each)
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4">
                  <div className="text-sm text-muted-foreground">
                    * Required fields
                  </div>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <>
                        <Clock className="mr-2 h-4 w-4 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send className="mr-2 h-4 w-4" />
                        Send Message
                      </>
                    )}
                  </Button>
                </div>
              </form>
            )}
          </CardContent>
        </Card>
      )}

      {/* Live Chat */}
      {selectedMethod === 'chat' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <MessageCircle className="h-5 w-5 text-green-500" />
              <span>Live Chat Support</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageCircle className="h-8 w-8 text-green-500" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Start a Live Chat</h3>
              <p className="text-muted-foreground mb-6">
                Our support team is online and ready to help you right now!
              </p>
              <div className="flex items-center justify-center space-x-4 mb-6">
                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span>Online now</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  <span>Usually responds in minutes</span>
                </div>
              </div>
              <Button size="lg" className="bg-green-500 hover:bg-green-600">
                <MessageCircle className="mr-2 h-5 w-5" />
                Start Chat
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* FAQ Section */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Frequently Asked Questions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {faqs.map((faq, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <h3 className="font-semibold mb-2">{faq.question}</h3>
                <p className="text-muted-foreground text-sm">{faq.answer}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Support Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6 text-center">
            <Clock className="h-8 w-8 text-blue-500 mx-auto mb-2" />
            <div className="text-2xl font-bold mb-1">2 min</div>
            <div className="text-sm text-muted-foreground">Avg Response Time</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <CheckCircle className="h-8 w-8 text-green-500 mx-auto mb-2" />
            <div className="text-2xl font-bold mb-1">98%</div>
            <div className="text-sm text-muted-foreground">Resolution Rate</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <Star className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
            <div className="text-2xl font-bold mb-1">4.9/5</div>
            <div className="text-sm text-muted-foreground">Customer Rating</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <Users className="h-8 w-8 text-purple-500 mx-auto mb-2" />
            <div className="text-2xl font-bold mb-1">24/7</div>
            <div className="text-sm text-muted-foreground">Support Available</div>
          </CardContent>
        </Card>
      </div>

      {/* Additional Resources */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Additional Resources</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="cursor-pointer hover:shadow-lg transition-shadow">
            <CardContent className="p-6 text-center">
              <Globe className="h-8 w-8 text-blue-500 mx-auto mb-3" />
              <h3 className="font-semibold mb-2">Help Center</h3>
              <p className="text-sm text-muted-foreground mb-4">Browse our comprehensive help articles</p>
              <Button variant="outline" size="sm">Visit Help Center</Button>
            </CardContent>
          </Card>
          
          <Card className="cursor-pointer hover:shadow-lg transition-shadow">
            <CardContent className="p-6 text-center">
              <Users className="h-8 w-8 text-green-500 mx-auto mb-3" />
              <h3 className="font-semibold mb-2">Community Forum</h3>
              <p className="text-sm text-muted-foreground mb-4">Get help from other creators</p>
              <Button variant="outline" size="sm">Join Community</Button>
            </CardContent>
          </Card>
          
          <Card className="cursor-pointer hover:shadow-lg transition-shadow">
            <CardContent className="p-6 text-center">
              <Download className="h-8 w-8 text-purple-500 mx-auto mb-3" />
              <h3 className="font-semibold mb-2">Status Page</h3>
              <p className="text-sm text-muted-foreground mb-4">Check system status and updates</p>
              <Button variant="outline" size="sm">View Status</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
