import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { FlavoursLogo } from '@/components/ui/flavours-logo'
import { Users, Heart, Shield, Zap } from 'lucide-react'

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-6 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center space-x-2 mb-6">
            <FlavoursLogo size="lg" />
          </div>
          <h1 className="text-4xl font-bold mb-4">About Flavours</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Empowering creators and connecting communities through premium content and meaningful interactions.
          </p>
        </div>

        {/* Mission Statement */}
        <Card className="mb-12">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Heart className="h-6 w-6 text-primary mr-2" />
              Our Mission
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg text-muted-foreground mb-4">
              Flavours is dedicated to creating a safe, inclusive platform where creators can monetize their content 
              and build meaningful relationships with their audience. We believe in empowering creators to share their 
              unique perspectives while providing fans with exclusive access to premium content.
            </p>
            <p className="text-lg text-muted-foreground">
              Our platform combines cutting-edge technology with human-centered design to create an environment 
              where creativity thrives and communities flourish.
            </p>
          </CardContent>
        </Card>

        {/* Values */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          <Card>
            <CardHeader>
              <Shield className="h-8 w-8 text-primary mb-2" />
              <CardTitle>Safety First</CardTitle>
              <CardDescription>
                Protecting our community
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                We prioritize the safety and well-being of all users through advanced moderation tools, 
                privacy protection, and clear community guidelines.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Users className="h-8 w-8 text-primary mb-2" />
              <CardTitle>Creator Empowerment</CardTitle>
              <CardDescription>
                Supporting content creators
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                We provide creators with the tools, analytics, and support they need to build sustainable 
                businesses and connect with their audience.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Shield className="h-8 w-8 text-primary mb-2" />
              <CardTitle>Inclusivity</CardTitle>
              <CardDescription>
                Welcoming everyone
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                We celebrate diversity and create an inclusive environment where creators and fans from 
                all backgrounds can thrive and express themselves authentically.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Company Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
          <Card className="text-center">
            <CardContent className="pt-6">
              <div className="text-3xl font-bold text-primary mb-2">50K+</div>
              <div className="text-sm text-muted-foreground">Active Creators</div>
            </CardContent>
          </Card>
          <Card className="text-center">
            <CardContent className="pt-6">
              <div className="text-3xl font-bold text-primary mb-2">2M+</div>
              <div className="text-sm text-muted-foreground">Community Members</div>
            </CardContent>
          </Card>
          <Card className="text-center">
            <CardContent className="pt-6">
              <div className="text-3xl font-bold text-primary mb-2">$10M+</div>
              <div className="text-sm text-muted-foreground">Creator Earnings</div>
            </CardContent>
          </Card>
          <Card className="text-center">
            <CardContent className="pt-6">
              <div className="text-3xl font-bold text-primary mb-2">99.9%</div>
              <div className="text-sm text-muted-foreground">Uptime</div>
            </CardContent>
          </Card>
        </div>

        {/* Technology */}
        <Card className="mb-12">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Zap className="h-6 w-6 text-primary mr-2" />
              Technology & Innovation
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg text-muted-foreground mb-4">
              Flavours is built on cutting-edge technology that ensures fast, secure, and reliable performance. 
              Our platform leverages artificial intelligence for content moderation, advanced analytics for creator insights, 
              and state-of-the-art security measures to protect user data.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
              <div>
                <h4 className="font-semibold mb-2">Key Technologies</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Real-time WebSocket connections</li>
                  <li>• AI-powered content moderation</li>
                  <li>• Advanced analytics and reporting</li>
                  <li>• End-to-end encryption</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Features</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Live streaming capabilities</li>
                  <li>• Anonymous chat system</li>
                  <li>• Comprehensive creator tools</li>
                  <li>• Multi-platform support</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contact */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              Get in Touch
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg text-muted-foreground mb-4">
              Have questions about Flavours? We'd love to hear from you.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-semibold mb-2">General Inquiries</h4>
                <p className="text-sm text-muted-foreground">contact@flavours.club</p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Press & Media</h4>
                <p className="text-sm text-muted-foreground">press@flavours.club</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
