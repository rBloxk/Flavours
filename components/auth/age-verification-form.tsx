"use client"

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Shield, 
  CreditCard, 
  FileText, 
  Camera,
  Upload,
  CheckCircle,
  AlertTriangle,
  Lock,
  Eye,
  EyeOff
} from 'lucide-react'
import { toast } from 'sonner'

interface AgeVerificationFormProps {
  onVerificationComplete?: (result: any) => void
  onVerificationFailed?: (reason: string) => void
  className?: string
}

export function AgeVerificationForm({
  onVerificationComplete,
  onVerificationFailed,
  className = ''
}: AgeVerificationFormProps) {
  const [activeTab, setActiveTab] = useState('id')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isVerified, setIsVerified] = useState(false)
  const [showSensitiveData, setShowSensitiveData] = useState(false)
  
  const [formData, setFormData] = useState({
    // Personal Information
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    country: '',
    zipCode: '',
    dateOfBirth: '',
    
    // ID Verification
    idType: '',
    idNumber: '',
    idImage: null as File | null,
    selfieImage: null as File | null,
    
    // Credit Card Verification
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardholderName: '',
    
    // Government ID
    governmentIdType: '',
    governmentIdNumber: '',
    governmentIdImage: null as File | null,
    
    // Consent
    termsAccepted: false,
    privacyAccepted: false,
    dataProcessingAccepted: false
  })

  const countries = [
    { code: 'US', name: 'United States' },
    { code: 'CA', name: 'Canada' },
    { code: 'GB', name: 'United Kingdom' },
    { code: 'AU', name: 'Australia' },
    { code: 'DE', name: 'Germany' },
    { code: 'FR', name: 'France' },
    { code: 'ES', name: 'Spain' },
    { code: 'IT', name: 'Italy' },
    { code: 'NL', name: 'Netherlands' },
    { code: 'SE', name: 'Sweden' }
  ]

  const idTypes = [
    { value: 'drivers_license', label: 'Driver\'s License' },
    { value: 'passport', label: 'Passport' },
    { value: 'national_id', label: 'National ID Card' },
    { value: 'military_id', label: 'Military ID' }
  ]

  const governmentIdTypes = [
    { value: 'passport', label: 'Passport' },
    { value: 'national_id', label: 'National ID' },
    { value: 'birth_certificate', label: 'Birth Certificate' }
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)

    try {
      // In production, submit to your age verification API
      const verificationData = {
        method: activeTab,
        user: {
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          address: `${formData.address}, ${formData.city}, ${formData.state} ${formData.zipCode}`,
          country: formData.country,
          dateOfBirth: formData.dateOfBirth
        },
        verification: {
          idType: formData.idType,
          idNumber: formData.idNumber,
          governmentIdType: formData.governmentIdType,
          governmentIdNumber: formData.governmentIdNumber,
          creditCardLast4: formData.cardNumber.slice(-4)
        }
      }

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 3000))

      // Simulate verification result
      const age = calculateAge(formData.dateOfBirth)
      const isVerified = age >= 18

      if (isVerified) {
        setIsVerified(true)
        onVerificationComplete?.({
          isVerified: true,
          age,
          method: activeTab,
          confidence: 0.95,
          timestamp: new Date().toISOString()
        })
        toast.success('Age verification successful! You can now access adult content.')
      } else {
        onVerificationFailed?.('You must be 18 or older to access this content.')
        toast.error('Age verification failed. You must be 18 or older.')
      }

    } catch (error) {
      console.error('Verification error:', error)
      onVerificationFailed?.('Verification failed. Please try again.')
      toast.error('Verification failed. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const validateForm = (): boolean => {
    if (!formData.name || !formData.email || !formData.dateOfBirth || !formData.country) {
      toast.error('Please fill in all required fields')
      return false
    }

    if (!formData.termsAccepted || !formData.privacyAccepted || !formData.dataProcessingAccepted) {
      toast.error('Please accept all required terms')
      return false
    }

    const age = calculateAge(formData.dateOfBirth)
    if (age < 13) {
      toast.error('You must be at least 13 years old to create an account')
      return false
    }

    return true
  }

  const calculateAge = (birthDate: string): number => {
    const birth = new Date(birthDate)
    const today = new Date()
    let age = today.getFullYear() - birth.getFullYear()
    const monthDiff = today.getMonth() - birth.getMonth()
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--
    }
    
    return age
  }

  const handleFileUpload = (field: string, file: File | null) => {
    setFormData(prev => ({ ...prev, [field]: file }))
  }

  if (isVerified) {
    return (
      <Card className={className}>
        <CardContent className="p-6 text-center">
          <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">Verification Complete</h3>
          <p className="text-muted-foreground mb-4">
            Your age has been successfully verified. You can now access adult content.
          </p>
          <div className="space-y-2 text-sm text-muted-foreground">
            <p>• Your verification is valid for 1 year</p>
            <p>• You can update your verification at any time</p>
            <p>• Your information is securely encrypted</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Shield className="h-5 w-5 text-blue-600" />
          <span>Age Verification Required</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Alert className="mb-6">
          <Lock className="h-4 w-4" />
          <AlertDescription>
            <strong>Adult Content Warning:</strong> This platform contains adult content. 
            You must be 18 or older to access this content. Age verification is required by law.
          </AlertDescription>
        </Alert>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="id" className="flex items-center space-x-2">
              <FileText className="h-4 w-4" />
              <span>ID Scan</span>
            </TabsTrigger>
            <TabsTrigger value="card" className="flex items-center space-x-2">
              <CreditCard className="h-4 w-4" />
              <span>Credit Card</span>
            </TabsTrigger>
            <TabsTrigger value="government" className="flex items-center space-x-2">
              <Shield className="h-4 w-4" />
              <span>Government ID</span>
            </TabsTrigger>
          </TabsList>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Personal Information */}
            <div className="space-y-4">
              <h4 className="font-medium">Personal Information</h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter your full name"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email Address *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="Enter your email"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="Enter your phone number"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dateOfBirth">Date of Birth *</Label>
                  <Input
                    id="dateOfBirth"
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={(e) => setFormData(prev => ({ ...prev, dateOfBirth: e.target.value }))}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="country">Country *</Label>
                  <Select value={formData.country} onValueChange={(value) => setFormData(prev => ({ ...prev, country: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select your country" />
                    </SelectTrigger>
                    <SelectContent>
                      {countries.map((country) => (
                        <SelectItem key={country.code} value={country.code}>
                          {country.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">Address *</Label>
                  <Input
                    id="address"
                    value={formData.address}
                    onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                    placeholder="Street address"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="city">City *</Label>
                  <Input
                    id="city"
                    value={formData.city}
                    onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                    placeholder="City"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="state">State/Province *</Label>
                  <Input
                    id="state"
                    value={formData.state}
                    onChange={(e) => setFormData(prev => ({ ...prev, state: e.target.value }))}
                    placeholder="State or Province"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="zipCode">ZIP/Postal Code *</Label>
                  <Input
                    id="zipCode"
                    value={formData.zipCode}
                    onChange={(e) => setFormData(prev => ({ ...prev, zipCode: e.target.value }))}
                    placeholder="ZIP or Postal Code"
                    required
                  />
                </div>
              </div>
            </div>

            {/* ID Verification */}
            <TabsContent value="id" className="space-y-4">
              <h4 className="font-medium">ID Verification</h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="idType">ID Type *</Label>
                  <Select value={formData.idType} onValueChange={(value) => setFormData(prev => ({ ...prev, idType: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select ID type" />
                    </SelectTrigger>
                    <SelectContent>
                      {idTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="idNumber">ID Number *</Label>
                  <Input
                    id="idNumber"
                    value={formData.idNumber}
                    onChange={(e) => setFormData(prev => ({ ...prev, idNumber: e.target.value }))}
                    placeholder="Enter ID number"
                    required
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>ID Document Photo *</Label>
                  <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
                    <Camera className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground mb-2">
                      Upload a clear photo of your ID document
                    </p>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileUpload('idImage', e.target.files?.[0] || null)}
                      className="hidden"
                      id="id-upload"
                      required
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => document.getElementById('id-upload')?.click()}
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Upload ID Photo
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Selfie Photo *</Label>
                  <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
                    <Camera className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground mb-2">
                      Upload a selfie photo for identity verification
                    </p>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileUpload('selfieImage', e.target.files?.[0] || null)}
                      className="hidden"
                      id="selfie-upload"
                      required
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => document.getElementById('selfie-upload')?.click()}
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Upload Selfie
                    </Button>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Credit Card Verification */}
            <TabsContent value="card" className="space-y-4">
              <h4 className="font-medium">Credit Card Verification</h4>
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  Credit card verification is less secure than ID verification. 
                  We recommend using ID verification for better security.
                </AlertDescription>
              </Alert>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="cardNumber">Card Number *</Label>
                  <Input
                    id="cardNumber"
                    type="text"
                    value={formData.cardNumber}
                    onChange={(e) => setFormData(prev => ({ ...prev, cardNumber: e.target.value }))}
                    placeholder="1234 5678 9012 3456"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cardholderName">Cardholder Name *</Label>
                  <Input
                    id="cardholderName"
                    value={formData.cardholderName}
                    onChange={(e) => setFormData(prev => ({ ...prev, cardholderName: e.target.value }))}
                    placeholder="Name on card"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="expiryDate">Expiry Date *</Label>
                  <Input
                    id="expiryDate"
                    type="text"
                    value={formData.expiryDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, expiryDate: e.target.value }))}
                    placeholder="MM/YY"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cvv">CVV *</Label>
                  <Input
                    id="cvv"
                    type="text"
                    value={formData.cvv}
                    onChange={(e) => setFormData(prev => ({ ...prev, cvv: e.target.value }))}
                    placeholder="123"
                    required
                  />
                </div>
              </div>
            </TabsContent>

            {/* Government ID Verification */}
            <TabsContent value="government" className="space-y-4">
              <h4 className="font-medium">Government ID Verification</h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="governmentIdType">Government ID Type *</Label>
                  <Select value={formData.governmentIdType} onValueChange={(value) => setFormData(prev => ({ ...prev, governmentIdType: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select government ID type" />
                    </SelectTrigger>
                    <SelectContent>
                      {governmentIdTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="governmentIdNumber">Government ID Number *</Label>
                  <Input
                    id="governmentIdNumber"
                    value={formData.governmentIdNumber}
                    onChange={(e) => setFormData(prev => ({ ...prev, governmentIdNumber: e.target.value }))}
                    placeholder="Enter government ID number"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Government ID Document Photo *</Label>
                <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
                  <Camera className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground mb-2">
                    Upload a clear photo of your government ID document
                  </p>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileUpload('governmentIdImage', e.target.files?.[0] || null)}
                    className="hidden"
                    id="government-id-upload"
                    required
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => document.getElementById('government-id-upload')?.click()}
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Government ID
                  </Button>
                </div>
              </div>
            </TabsContent>

            {/* Consent */}
            <div className="space-y-4">
              <h4 className="font-medium">Consent & Terms</h4>
              
              <div className="space-y-3">
                <div className="flex items-start space-x-2">
                  <Checkbox
                    id="termsAccepted"
                    checked={formData.termsAccepted}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, termsAccepted: !!checked }))}
                    required
                  />
                  <Label htmlFor="termsAccepted" className="text-sm">
                    I agree to the <a href="/terms" className="text-blue-600 hover:underline">Terms of Service</a> *
                  </Label>
                </div>

                <div className="flex items-start space-x-2">
                  <Checkbox
                    id="privacyAccepted"
                    checked={formData.privacyAccepted}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, privacyAccepted: !!checked }))}
                    required
                  />
                  <Label htmlFor="privacyAccepted" className="text-sm">
                    I agree to the <a href="/privacy" className="text-blue-600 hover:underline">Privacy Policy</a> *
                  </Label>
                </div>

                <div className="flex items-start space-x-2">
                  <Checkbox
                    id="dataProcessingAccepted"
                    checked={formData.dataProcessingAccepted}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, dataProcessingAccepted: !!checked }))}
                    required
                  />
                  <Label htmlFor="dataProcessingAccepted" className="text-sm">
                    I consent to the processing of my personal data for age verification purposes *
                  </Label>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Verifying Age...
                </>
              ) : (
                <>
                  <Shield className="h-4 w-4 mr-2" />
                  Verify Age
                </>
              )}
            </Button>
          </form>
        </Tabs>
      </CardContent>
    </Card>
  )
}
