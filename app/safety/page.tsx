import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { FlavoursLogo } from '@/components/ui/flavours-logo'
import { Shield, Eye, Lock, Users, AlertTriangle, CheckCircle } from 'lucide-react'

export default function SafetyPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-6 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center space-x-2 mb-6">
            <FlavoursLogo size="lg" />
          </div>
          <h1 className="text-4xl font-bold mb-4">Safety & Transparency Center</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Your safety and privacy are our top priorities. Learn about our policies and tools.
          </p>
        </div>

        {/* Safety Features */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          <Card>
            <CardHeader>
              <Shield className="h-8 w-8 text-primary mb-2" />
              <CardTitle>Content Moderation</CardTitle>
              <CardDescription>
                AI-powered and human-reviewed content filtering
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  Automated content scanning
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  Human review team
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  Community reporting
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Eye className="h-8 w-8 text-primary mb-2" />
              <CardTitle>Privacy Protection</CardTitle>
              <CardDescription>
                Advanced privacy controls and data protection
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  End-to-end encryption
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  Privacy settings
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  Data anonymization
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Users className="h-8 w-8 text-primary mb-2" />
              <CardTitle>Community Guidelines</CardTitle>
              <CardDescription>
                Clear rules and expectations for all users
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  Respectful interactions
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  Age verification
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  Consent requirements
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Reporting & Support */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <AlertTriangle className="h-8 w-8 text-orange-500 mb-2" />
              <CardTitle>Report Content</CardTitle>
              <CardDescription>
                Help us maintain a safe community
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground">
                If you see content that violates our community guidelines, please report it immediately.
              </p>
              <div className="space-y-2">
                <a href="#" className="block text-sm hover:text-primary">Report inappropriate content</a>
                <a href="#" className="block text-sm hover:text-primary">Report harassment</a>
                <a href="#" className="block text-sm hover:text-primary">Report copyright violation</a>
                <a href="#" className="block text-sm hover:text-primary">Report underage content</a>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Lock className="h-8 w-8 text-primary mb-2" />
              <CardTitle>Account Security</CardTitle>
              <CardDescription>
                Protect your account and personal information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Learn how to keep your account secure and protect your privacy.
              </p>
              <div className="space-y-2">
                <a href="#" className="block text-sm hover:text-primary">Enable two-factor authentication</a>
                <a href="#" className="block text-sm hover:text-primary">Privacy settings guide</a>
                <a href="#" className="block text-sm hover:text-primary">Block and report users</a>
                <a href="#" className="block text-sm hover:text-primary">Data protection rights</a>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
