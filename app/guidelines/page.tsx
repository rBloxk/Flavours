"use client"

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Shield, Users, Heart, MessageCircle, AlertTriangle, CheckCircle, X, Info, Eye, EyeOff, Lock, Globe, Crown, Star, Award, Flag, Ban, AlertCircle, Clock, Calendar, Download, ExternalLink, ChevronDown, ChevronRight, FileText, BookOpen, Scale, Gavel, Zap, Target, Lightbulb, ThumbsUp, ThumbsDown, MessageSquare, Share2, Video, Image, Mic, DollarSign, TrendingUp, BarChart3, Settings, Bell, Mail, Phone, MapPin } from 'lucide-react'

export default function GuidelinesPage() {
  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-4">Community Guidelines</h1>
          <p className="text-muted-foreground text-lg">
            Help us maintain a safe and welcoming environment for everyone
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Content Guidelines
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4">
              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                <div>
                  <h3 className="font-semibold">Respectful Communication</h3>
                  <p className="text-muted-foreground text-sm">
                    Be kind and respectful in all interactions. Harassment, bullying, or hate speech will not be tolerated.
                  </p>
        </div>
      </div>

              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                <div>
                  <h3 className="font-semibold">Original Content</h3>
                  <p className="text-muted-foreground text-sm">
                    Share only original content or content you have permission to use. Respect copyright and intellectual property.
                  </p>
                </div>
      </div>

              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                <div>
                  <h3 className="font-semibold">Appropriate Content</h3>
                  <p className="text-muted-foreground text-sm">
                    Content should be appropriate for all audiences. Explicit or inappropriate content is prohibited.
                  </p>
                </div>
              </div>
          </div>
        </CardContent>
      </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Community Standards
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-yellow-500 mt-0.5" />
                    <div>
                  <h3 className="font-semibold">Spam and Self-Promotion</h3>
                  <p className="text-muted-foreground text-sm">
                    Avoid excessive self-promotion or spam. Focus on providing value to the community.
                      </p>
                    </div>
                  </div>
              
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-yellow-500 mt-0.5" />
                <div>
                  <h3 className="font-semibold">Privacy and Safety</h3>
                  <p className="text-muted-foreground text-sm">
                    Protect your privacy and the privacy of others. Don't share personal information without consent.
                  </p>
                </div>
              </div>
            </div>
                </CardContent>
            </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Flag className="h-5 w-5" />
              Reporting and Enforcement
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              If you encounter content that violates these guidelines, please report it using the report button. 
              Our moderation team will review all reports and take appropriate action.
            </p>
            
            <div className="flex flex-wrap gap-2">
              <Badge variant="destructive">Immediate Action</Badge>
              <Badge variant="secondary">Warning</Badge>
              <Badge variant="outline">Content Removal</Badge>
              <Badge variant="outline">Account Suspension</Badge>
          </div>
        </CardContent>
      </Card>
      </div>
    </div>
  )
}
