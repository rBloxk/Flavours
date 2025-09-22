"use client"

import React, { useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { useToast } from '@/hooks/use-toast'
import { 
  CreditCard, 
  Lock, 
  Shield, 
  CheckCircle, 
  AlertTriangle,
  Loader2,
  Eye,
  EyeOff,
  Building2
} from 'lucide-react'

interface AddPaymentMethodModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  title?: string
  description?: string
  type?: 'card' | 'bank'
}

interface PaymentMethodForm {
  cardNumber: string
  expiryMonth: string
  expiryYear: string
  cvv: string
  cardholderName: string
  billingAddress: {
    line1: string
    line2: string
    city: string
    state: string
    postalCode: string
    country: string
  }
  // Bank Account Fields
  bankAccount: {
    accountNumber: string
    ifsc: string
    routingNumber: string
    bankName: string
    bankAddress: {
      line1: string
      line2: string
      city: string
      state: string
      postalCode: string
      country: string
    }
  }
  // Recipient Information
  recipientInfo: {
    fullName: string
    email: string
    address: {
      line1: string
      line2: string
      city: string
      state: string
      postalCode: string
      country: string
    }
  }
}

const MONTHS = [
  { value: '01', label: 'January' },
  { value: '02', label: 'February' },
  { value: '03', label: 'March' },
  { value: '04', label: 'April' },
  { value: '05', label: 'May' },
  { value: '06', label: 'June' },
  { value: '07', label: 'July' },
  { value: '08', label: 'August' },
  { value: '09', label: 'September' },
  { value: '10', label: 'October' },
  { value: '11', label: 'November' },
  { value: '12', label: 'December' }
]

const YEARS = Array.from({ length: 10 }, (_, i) => {
  const year = new Date().getFullYear() + i
  return { value: year.toString(), label: year.toString() }
})

const COUNTRIES = [
  { value: 'US', label: 'United States' },
  { value: 'CA', label: 'Canada' },
  { value: 'GB', label: 'United Kingdom' },
  { value: 'AU', label: 'Australia' },
  { value: 'DE', label: 'Germany' },
  { value: 'FR', label: 'France' },
  { value: 'IT', label: 'Italy' },
  { value: 'ES', label: 'Spain' },
  { value: 'NL', label: 'Netherlands' },
  { value: 'SE', label: 'Sweden' },
  { value: 'NO', label: 'Norway' },
  { value: 'DK', label: 'Denmark' },
  { value: 'FI', label: 'Finland' },
  { value: 'CH', label: 'Switzerland' },
  { value: 'AT', label: 'Austria' },
  { value: 'BE', label: 'Belgium' },
  { value: 'IE', label: 'Ireland' },
  { value: 'PT', label: 'Portugal' },
  { value: 'PL', label: 'Poland' },
  { value: 'CZ', label: 'Czech Republic' },
  { value: 'HU', label: 'Hungary' },
  { value: 'SK', label: 'Slovakia' },
  { value: 'SI', label: 'Slovenia' },
  { value: 'HR', label: 'Croatia' },
  { value: 'RO', label: 'Romania' },
  { value: 'BG', label: 'Bulgaria' },
  { value: 'GR', label: 'Greece' },
  { value: 'CY', label: 'Cyprus' },
  { value: 'MT', label: 'Malta' },
  { value: 'LU', label: 'Luxembourg' },
  { value: 'EE', label: 'Estonia' },
  { value: 'LV', label: 'Latvia' },
  { value: 'LT', label: 'Lithuania' },
  { value: 'JP', label: 'Japan' },
  { value: 'KR', label: 'South Korea' },
  { value: 'SG', label: 'Singapore' },
  { value: 'HK', label: 'Hong Kong' },
  { value: 'TW', label: 'Taiwan' },
  { value: 'NZ', label: 'New Zealand' },
  { value: 'BR', label: 'Brazil' },
  { value: 'MX', label: 'Mexico' },
  { value: 'AR', label: 'Argentina' },
  { value: 'CL', label: 'Chile' },
  { value: 'CO', label: 'Colombia' },
  { value: 'PE', label: 'Peru' },
  { value: 'ZA', label: 'South Africa' },
  { value: 'IL', label: 'Israel' },
  { value: 'AE', label: 'United Arab Emirates' },
  { value: 'SA', label: 'Saudi Arabia' },
  { value: 'IN', label: 'India' },
  { value: 'TH', label: 'Thailand' },
  { value: 'MY', label: 'Malaysia' },
  { value: 'PH', label: 'Philippines' },
  { value: 'ID', label: 'Indonesia' },
  { value: 'VN', label: 'Vietnam' }
]

export function AddPaymentMethodModal({ isOpen, onClose, onSuccess, title, description, type = 'card' }: AddPaymentMethodModalProps) {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [showCvv, setShowCvv] = useState(false)
  const [formData, setFormData] = useState<PaymentMethodForm>({
    cardNumber: '',
    expiryMonth: '',
    expiryYear: '',
    cvv: '',
    cardholderName: '',
    billingAddress: {
      line1: '',
      line2: '',
      city: '',
      state: '',
      postalCode: '',
      country: 'US'
    },
    bankAccount: {
      accountNumber: '',
      ifsc: '',
      routingNumber: '',
      bankName: '',
      bankAddress: {
        line1: '',
        line2: '',
        city: '',
        state: '',
        postalCode: '',
        country: 'IN'
      }
    },
    recipientInfo: {
      fullName: '',
      email: '',
      address: {
        line1: '',
        line2: '',
        city: '',
        state: '',
        postalCode: '',
        country: 'IN'
      }
    }
  })

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '')
    const matches = v.match(/\d{4,16}/g)
    const match = matches && matches[0] || ''
    const parts = []
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4))
    }
    if (parts.length) {
      return parts.join(' ')
    } else {
      return v
    }
  }

  const getCardType = (cardNumber: string) => {
    const number = cardNumber.replace(/\s/g, '')
    if (number.startsWith('4')) return 'visa'
    if (number.startsWith('5') || number.startsWith('2')) return 'mastercard'
    if (number.startsWith('3')) return 'amex'
    if (number.startsWith('6')) return 'discover'
    return 'unknown'
  }

  const validateForm = () => {
    const errors: string[] = []
    
    if (!formData.cardNumber || formData.cardNumber.replace(/\s/g, '').length < 13) {
      errors.push('Please enter a valid card number')
    }
    
    if (!formData.expiryMonth || !formData.expiryYear) {
      errors.push('Please select expiry date')
    }
    
    if (!formData.cvv || formData.cvv.length < 3) {
      errors.push('Please enter a valid CVV')
    }
    
    if (!formData.cardholderName.trim()) {
      errors.push('Please enter cardholder name')
    }
    
    if (!formData.billingAddress.line1.trim()) {
      errors.push('Please enter billing address')
    }
    
    if (!formData.billingAddress.city.trim()) {
      errors.push('Please enter city')
    }
    
    if (!formData.billingAddress.postalCode.trim()) {
      errors.push('Please enter postal code')
    }
    
    return errors
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const errors = validateForm()
    if (errors.length > 0) {
      toast({
        title: "Validation Error",
        description: errors.join(', '),
        variant: "destructive"
      })
      return
    }

    setIsLoading(true)
    
    try {
      // Simulate API call to add payment method
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      toast({
        title: "Payment Method Added",
        description: "Your credit card has been successfully added and verified.",
      })
      
      onSuccess()
      onClose()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add payment method. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    if (field === 'cardNumber') {
      setFormData(prev => ({
        ...prev,
        cardNumber: formatCardNumber(value)
      }))
    } else if (field.startsWith('billingAddress.')) {
      const addressField = field.split('.')[1]
      setFormData(prev => ({
        ...prev,
        billingAddress: {
          ...prev.billingAddress,
          [addressField]: value
        }
      }))
    } else if (field.startsWith('bankAccount.')) {
      const bankField = field.split('.')[1]
      if (bankField.startsWith('bankAddress.')) {
        const addressField = bankField.split('.')[1]
        setFormData(prev => ({
          ...prev,
          bankAccount: {
            ...prev.bankAccount,
            bankAddress: {
              ...prev.bankAccount.bankAddress,
              [addressField]: value
            }
          }
        }))
      } else {
        setFormData(prev => ({
          ...prev,
          bankAccount: {
            ...prev.bankAccount,
            [bankField]: value
          }
        }))
      }
    } else if (field.startsWith('recipientInfo.')) {
      const recipientField = field.split('.')[1]
      if (recipientField.startsWith('address.')) {
        const addressField = recipientField.split('.')[1]
        setFormData(prev => ({
          ...prev,
          recipientInfo: {
            ...prev.recipientInfo,
            address: {
              ...prev.recipientInfo.address,
              [addressField]: value
            }
          }
        }))
      } else {
        setFormData(prev => ({
          ...prev,
          recipientInfo: {
            ...prev.recipientInfo,
            [recipientField]: value
          }
        }))
      }
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }))
    }
  }

  const cardType = getCardType(formData.cardNumber)

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto w-[95vw] sm:w-full">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {type === 'bank' ? (
              <>
                <Building2 className="h-5 w-5" />
                {title || 'Add Bank Account'}
              </>
            ) : (
              <>
                <CreditCard className="h-5 w-5" />
                {title || 'Add Payment Method'}
              </>
            )}
          </DialogTitle>
          <DialogDescription>
            {description || (type === 'bank' 
              ? 'Securely add a bank account to receive payments and earnings. All information is encrypted and secure.'
              : 'Securely add a credit card to your account. All payment information is encrypted and secure.'
            )}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Security Notice */}
          <Card className="bg-green-50 border-green-200">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <Shield className="h-5 w-5 text-green-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-green-800">Secure Payment Processing</h4>
                  <p className="text-sm text-green-700 mt-1">
                    Your payment information is processed through industry-leading security standards 
                    including PCI DSS Level 1 compliance and 256-bit SSL encryption.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Bank Account Form */}
          {type === 'bank' && (
            <>
              {/* Recipient Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Recipient Information</h3>
                
                <div className="space-y-2">
                  <Label htmlFor="recipientFullName">Full Name</Label>
                  <Input
                    id="recipientFullName"
                    type="text"
                    placeholder="Enter your full name"
                    value={formData.recipientInfo.fullName}
                    onChange={(e) => handleInputChange('recipientInfo.fullName', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="recipientEmail">Email Address</Label>
                  <Input
                    id="recipientEmail"
                    type="email"
                    placeholder="Enter your email address"
                    value={formData.recipientInfo.email}
                    onChange={(e) => handleInputChange('recipientInfo.email', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="recipientStreet">Recipient's Street</Label>
                  <Input
                    id="recipientStreet"
                    type="text"
                    placeholder="Enter street address"
                    value={formData.recipientInfo.address.line1}
                    onChange={(e) => handleInputChange('recipientInfo.address.line1', e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="recipientCity">Recipient's City</Label>
                    <Input
                      id="recipientCity"
                      type="text"
                      placeholder="Enter city"
                      value={formData.recipientInfo.address.city}
                      onChange={(e) => handleInputChange('recipientInfo.address.city', e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="recipientState">Recipient's State</Label>
                    <Input
                      id="recipientState"
                      type="text"
                      placeholder="Enter state"
                      value={formData.recipientInfo.address.state}
                      onChange={(e) => handleInputChange('recipientInfo.address.state', e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="recipientPostalCode">Recipient's Postal Code</Label>
                    <Input
                      id="recipientPostalCode"
                      type="text"
                      placeholder="Enter postal code"
                      value={formData.recipientInfo.address.postalCode}
                      onChange={(e) => handleInputChange('recipientInfo.address.postalCode', e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="recipientCountry">Recipient's Country</Label>
                    <Select value={formData.recipientInfo.address.country} onValueChange={(value) => handleInputChange('recipientInfo.address.country', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select country" />
                      </SelectTrigger>
                      <SelectContent>
                        {COUNTRIES.map(country => (
                          <SelectItem key={country.value} value={country.value}>
                            {country.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Bank Account Details */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Bank Account Details</h3>
                
                <div className="space-y-2">
                  <Label htmlFor="accountNumber">Account Number</Label>
                  <Input
                    id="accountNumber"
                    type="text"
                    placeholder="Enter account number"
                    value={formData.bankAccount.accountNumber}
                    onChange={(e) => handleInputChange('bankAccount.accountNumber', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="ifsc">IFSC Code</Label>
                  <Input
                    id="ifsc"
                    type="text"
                    placeholder="Enter IFSC code"
                    value={formData.bankAccount.ifsc}
                    onChange={(e) => handleInputChange('bankAccount.ifsc', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="routingNumber">Routing Number</Label>
                  <Input
                    id="routingNumber"
                    type="text"
                    placeholder="Enter routing number"
                    value={formData.bankAccount.routingNumber}
                    onChange={(e) => handleInputChange('bankAccount.routingNumber', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bankName">Bank Name</Label>
                  <Input
                    id="bankName"
                    type="text"
                    placeholder="Enter bank name"
                    value={formData.bankAccount.bankName}
                    onChange={(e) => handleInputChange('bankAccount.bankName', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bankStreet">Bank Street</Label>
                  <Input
                    id="bankStreet"
                    type="text"
                    placeholder="Enter bank street address"
                    value={formData.bankAccount.bankAddress.line1}
                    onChange={(e) => handleInputChange('bankAccount.bankAddress.line1', e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="bankCity">Bank City</Label>
                    <Input
                      id="bankCity"
                      type="text"
                      placeholder="Enter bank city"
                      value={formData.bankAccount.bankAddress.city}
                      onChange={(e) => handleInputChange('bankAccount.bankAddress.city', e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bankState">Bank State</Label>
                    <Input
                      id="bankState"
                      type="text"
                      placeholder="Enter bank state"
                      value={formData.bankAccount.bankAddress.state}
                      onChange={(e) => handleInputChange('bankAccount.bankAddress.state', e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="bankPostalCode">Bank Postal Code</Label>
                    <Input
                      id="bankPostalCode"
                      type="text"
                      placeholder="Enter bank postal code"
                      value={formData.bankAccount.bankAddress.postalCode}
                      onChange={(e) => handleInputChange('bankAccount.bankAddress.postalCode', e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bankCountry">Bank Country</Label>
                    <Select value={formData.bankAccount.bankAddress.country} onValueChange={(value) => handleInputChange('bankAccount.bankAddress.country', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select country" />
                      </SelectTrigger>
                      <SelectContent>
                        {COUNTRIES.map(country => (
                          <SelectItem key={country.value} value={country.value}>
                            {country.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <Separator />
            </>
          )}

          {/* Card Information */}
          {type === 'card' && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Card Information</h3>
            
            <div className="space-y-2">
              <Label htmlFor="cardNumber">Card Number</Label>
              <div className="relative">
                <Input
                  id="cardNumber"
                  type="text"
                  placeholder="1234 5678 9012 3456"
                  value={formData.cardNumber}
                  onChange={(e) => handleInputChange('cardNumber', e.target.value)}
                  maxLength={19}
                  className="pr-12"
                />
                {cardType !== 'unknown' && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <Badge variant="secondary" className="text-xs">
                      {cardType.toUpperCase()}
                    </Badge>
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Expiry Date</Label>
                <div className="grid grid-cols-2 gap-2">
                  <Select value={formData.expiryMonth} onValueChange={(value) => handleInputChange('expiryMonth', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Month" />
                    </SelectTrigger>
                    <SelectContent>
                      {MONTHS.map(month => (
                        <SelectItem key={month.value} value={month.value}>
                          {month.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={formData.expiryYear} onValueChange={(value) => handleInputChange('expiryYear', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Year" />
                    </SelectTrigger>
                    <SelectContent>
                      {YEARS.map(year => (
                        <SelectItem key={year.value} value={year.value}>
                          {year.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="cvv">CVV</Label>
                <div className="relative">
                  <Input
                    id="cvv"
                    type={showCvv ? 'text' : 'password'}
                    placeholder="123"
                    value={formData.cvv}
                    onChange={(e) => handleInputChange('cvv', e.target.value)}
                    maxLength={4}
                    className="pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3"
                    onClick={() => setShowCvv(!showCvv)}
                  >
                    {showCvv ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="cardholderName">Cardholder Name</Label>
              <Input
                id="cardholderName"
                type="text"
                placeholder="John Doe"
                value={formData.cardholderName}
                onChange={(e) => handleInputChange('cardholderName', e.target.value)}
              />
            </div>
            </div>
          )}

          <Separator />

          {/* Billing Address */}
          {type === 'card' && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Billing Address</h3>
            
            <div className="space-y-2">
              <Label htmlFor="line1">Address Line 1</Label>
              <Input
                id="line1"
                type="text"
                placeholder="123 Main Street"
                value={formData.billingAddress.line1}
                onChange={(e) => handleInputChange('billingAddress.line1', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="line2">Address Line 2 (Optional)</Label>
              <Input
                id="line2"
                type="text"
                placeholder="Apartment, suite, etc."
                value={formData.billingAddress.line2}
                onChange={(e) => handleInputChange('billingAddress.line2', e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  type="text"
                  placeholder="New York"
                  value={formData.billingAddress.city}
                  onChange={(e) => handleInputChange('billingAddress.city', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="state">State/Province</Label>
                <Input
                  id="state"
                  type="text"
                  placeholder="NY"
                  value={formData.billingAddress.state}
                  onChange={(e) => handleInputChange('billingAddress.state', e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="postalCode">Postal Code</Label>
                <Input
                  id="postalCode"
                  type="text"
                  placeholder="10001"
                  value={formData.billingAddress.postalCode}
                  onChange={(e) => handleInputChange('billingAddress.postalCode', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="country">Country</Label>
                <Select value={formData.billingAddress.country} onValueChange={(value) => handleInputChange('billingAddress.country', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select country" />
                  </SelectTrigger>
                  <SelectContent>
                    {COUNTRIES.map(country => (
                      <SelectItem key={country.value} value={country.value}>
                        {country.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            </div>
          )}

          <Separator />

          {/* Submit Button */}
          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {type === 'bank' ? 'Adding Bank Account...' : 'Adding Payment Method...'}
                </>
              ) : (
                <>
                  <Lock className="h-4 w-4 mr-2" />
                  {type === 'bank' ? 'Add Bank Account' : 'Add Payment Method'}
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
