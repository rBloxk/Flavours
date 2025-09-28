"use client"

import React, { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Checkbox } from '@/components/ui/checkbox'
// Removed Supabase auth imports - using demo mode only
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { FlavoursLogo } from '@/components/ui/flavours-logo'
import { Crown, Loader2 } from 'lucide-react'
import { useAuth } from '@/components/providers/auth-provider'
import Link from 'next/link'

const signUpSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  username: z.string().min(3, 'Username must be at least 3 characters'),
  displayName: z.string().min(2, 'Display name must be at least 2 characters'),
  isCreator: z.boolean().default(false),
  ageVerified: z.boolean().refine(val => val === true, 'You must verify you are 18+'),
  termsAccepted: z.boolean().refine(val => val === true, 'You must accept the terms of service'),
})

const signInSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
  rememberMe: z.boolean().default(false),
})

export function AuthForms() {
  const router = useRouter()
  const { login, register, refreshAuth } = useAuth()
  const [isLoading, setIsLoading] = useState(false)

  // Check for remembered email on component mount
  useEffect(() => {
    const rememberedEmail = localStorage.getItem('rememberedEmail')
    const rememberMe = localStorage.getItem('rememberMe')
    
    if (rememberedEmail && rememberMe === 'true') {
      signInForm.setValue('email', rememberedEmail)
      signInForm.setValue('rememberMe', true)
    }
  }, [])

  const signUpForm = useForm<z.infer<typeof signUpSchema>>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      email: '',
      password: '',
      username: '',
      displayName: '',
      isCreator: false,
      ageVerified: false,
      termsAccepted: false,
    },
  })

  const signInForm = useForm<z.infer<typeof signInSchema>>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: '',
      password: '',
      rememberMe: false,
    },
  })

  const onSignUp = async (values: z.infer<typeof signUpSchema>) => {
    console.log('Form values:', values) // Debug log
    setIsLoading(true)
    
    try {
      const result = await register({
        email: values.email,
        password: values.password,
        username: values.username,
        display_name: values.displayName,
        is_creator: values.isCreator
      })
      
      if (result.success) {
        // Store email for verification page
        localStorage.setItem('pendingVerificationEmail', values.email)
        
        toast.success('Account created successfully! Please check your email to verify your account.')
        
        // Redirect to verification page
        setTimeout(() => {
          router.push('/auth/verify-email')
        }, 1000)
      } else {
        toast.error(result.error || 'Failed to create account')
      }
      
    } catch (error: any) {
      console.error('Sign up error:', error)
      toast.error('Failed to create account')
    } finally {
      setIsLoading(false)
    }
  }

  const onSignIn = async (values: z.infer<typeof signInSchema>) => {
    setIsLoading(true)
    
    try {
      const result = await login(values.email, values.password)
      
      if (result.success) {
        // Handle "Remember Me" functionality
        if (values.rememberMe) {
          localStorage.setItem('rememberMe', 'true')
          localStorage.setItem('rememberedEmail', values.email)
        } else {
          localStorage.removeItem('rememberMe')
          localStorage.removeItem('rememberedEmail')
        }
        
        toast.success('Sign in successful! Welcome back!')
        
        // Redirect to feed
        setTimeout(() => {
          router.push('/feed')
        }, 1000)
      } else {
        toast.error(result.error || 'Failed to sign in')
      }
      
    } catch (error: any) {
      console.error('Sign in error:', error)
      toast.error('Failed to sign in')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-700 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <FlavoursLogo size="lg" />
          </div>
          <CardTitle className="text-2xl">Welcome</CardTitle>
          <p className="text-muted-foreground">
            Sign in to your account or create a new one
          </p>
        </CardHeader>
        <CardContent>
          {/* Demo Mode Notice */}
          <div className="mb-4 p-3 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg">
            <p className="text-sm text-green-800 dark:text-green-200">
              <strong>✅ Demo Mode Active:</strong> Use any email/password to sign in or create an account. Authentication is working and will redirect to the feed page!
            </p>
            <Button 
              variant="outline" 
              size="sm" 
              className="mt-2 w-full"
              onClick={() => {
                // Set up demo user for testing
                const demoUser = {
                  id: 'demo-user-' + Date.now(),
                  email: 'demo@example.com',
                  username: 'demo_user',
                  display_name: 'Demo User',
                  is_creator: false,
                  avatar_url: 'https://ui-avatars.com/api/?name=Demo+User&background=random',
                  created_at: new Date().toISOString()
                }
                
                localStorage.setItem('demoUser', JSON.stringify(demoUser))
                localStorage.setItem('isAuthenticated', 'true')
                refreshAuth()
                
                toast.success('Demo user set up! You can now access protected pages.')
              }}
            >
              Quick Demo Setup
            </Button>
          </div>
          
          <Tabs defaultValue="signin" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="signin">Sign In</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>
            
            <TabsContent value="signin" className="space-y-4">
              <form onSubmit={signInForm.handleSubmit(onSignIn)} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signin-email">Email</Label>
                  <Input
                    id="signin-email"
                    type="email"
                    placeholder="you@example.com"
                    {...signInForm.register('email')}
                  />
                  {signInForm.formState.errors.email && (
                    <p className="text-sm text-destructive">{signInForm.formState.errors.email.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signin-password">Password</Label>
                  <Input
                    id="signin-password"
                    type="password"
                    {...signInForm.register('password')}
                  />
                  {signInForm.formState.errors.password && (
                    <p className="text-sm text-destructive">{signInForm.formState.errors.password.message}</p>
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="rememberMe"
                      checked={signInForm.watch('rememberMe')}
                      onCheckedChange={(checked) => signInForm.setValue('rememberMe', checked === true)}
                    />
                    <Label
                      htmlFor="rememberMe"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      Remember me
                    </Label>
                  </div>
                  <Link 
                    href="/auth/forgot-password" 
                    className="text-sm text-muted-foreground hover:text-primary"
                  >
                    Forgot password?
                  </Link>
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Sign In
                </Button>
              </form>
            </TabsContent>
            
            <TabsContent value="signup" className="space-y-4">
              <form onSubmit={signUpForm.handleSubmit(onSignUp)} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signup-email">Email</Label>
                  <Input
                    id="signup-email"
                    type="email"
                    placeholder="you@example.com"
                    {...signUpForm.register('email')}
                  />
                  {signUpForm.formState.errors.email && (
                    <p className="text-sm text-destructive">{signUpForm.formState.errors.email.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-password">Password</Label>
                  <Input
                    id="signup-password"
                    type="password"
                    {...signUpForm.register('password')}
                  />
                  {signUpForm.formState.errors.password && (
                    <p className="text-sm text-destructive">{signUpForm.formState.errors.password.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    placeholder="johndoe"
                    {...signUpForm.register('username')}
                  />
                  {signUpForm.formState.errors.username && (
                    <p className="text-sm text-destructive">{signUpForm.formState.errors.username.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="displayName">Display Name</Label>
                  <Input
                    id="displayName"
                    placeholder="John Doe"
                    {...signUpForm.register('displayName')}
                  />
                  {signUpForm.formState.errors.displayName && (
                    <p className="text-sm text-destructive">{signUpForm.formState.errors.displayName.message}</p>
                  )}
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="isCreator"
                    checked={signUpForm.watch('isCreator')}
                    onCheckedChange={(checked) => signUpForm.setValue('isCreator', checked === true)}
                  />
                  <Label
                    htmlFor="isCreator"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    I want to be a creator
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="ageVerified"
                    checked={signUpForm.watch('ageVerified')}
                    onCheckedChange={(checked) => signUpForm.setValue('ageVerified', checked === true)}
                  />
                  <Label
                    htmlFor="ageVerified"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    I am 18 years of age or older
                  </Label>
                </div>
                {signUpForm.formState.errors.ageVerified && (
                  <p className="text-sm text-destructive">{signUpForm.formState.errors.ageVerified.message}</p>
                )}
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="termsAccepted"
                    checked={signUpForm.watch('termsAccepted')}
                    onCheckedChange={(checked) => signUpForm.setValue('termsAccepted', checked === true)}
                  />
                  <Label
                    htmlFor="termsAccepted"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    I accept the Terms of Service and Privacy Policy
                  </Label>
                </div>
                {signUpForm.formState.errors.termsAccepted && (
                  <p className="text-sm text-destructive">{signUpForm.formState.errors.termsAccepted.message}</p>
                )}
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Create Account
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
