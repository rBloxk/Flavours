"use client"

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { 
  Flag, 
  AlertTriangle, 
  Shield, 
  FileText, 
  Camera,
  Upload,
  Send,
  CheckCircle
} from 'lucide-react'
import { toast } from 'sonner'

interface ContentReportFormProps {
  contentId: string
  contentType: 'post' | 'comment' | 'message' | 'profile' | 'other'
  contentUrl: string
  onReportSubmitted?: (reportId: string) => void
  className?: string
}

export function ContentReportForm({
  contentId,
  contentType,
  contentUrl,
  onReportSubmitted,
  className = ''
}: ContentReportFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [formData, setFormData] = useState({
    type: '',
    severity: '',
    reason: '',
    description: '',
    evidence: [] as string[],
    additionalInfo: '',
    isAnonymous: false,
    contactConsent: false
  })

  const reportTypes = [
    { value: 'child_exploitation', label: 'Child Exploitation', severity: 'critical', description: 'Content involving minors' },
    { value: 'illegal_content', label: 'Illegal Content', severity: 'high', description: 'Content that violates laws' },
    { value: 'copyright_infringement', label: 'Copyright Infringement', severity: 'high', description: 'Unauthorized use of copyrighted material' },
    { value: 'harassment', label: 'Harassment', severity: 'medium', description: 'Bullying, threats, or intimidation' },
    { value: 'spam', label: 'Spam', severity: 'low', description: 'Unsolicited or repetitive content' },
    { value: 'violence', label: 'Violence', severity: 'high', description: 'Graphic violence or harm' },
    { value: 'hate_speech', label: 'Hate Speech', severity: 'high', description: 'Discriminatory or offensive language' },
    { value: 'other', label: 'Other', severity: 'low', description: 'Other violations not listed' }
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.type || !formData.reason || !formData.description) {
      toast.error('Please fill in all required fields')
      return
    }

    if (!formData.contactConsent) {
      toast.error('Please consent to contact for follow-up')
      return
    }

    setIsSubmitting(true)

    try {
      // In production, submit to your reporting API
      const reportData = {
        contentId,
        contentType,
        contentUrl,
        ...formData,
        submittedAt: new Date().toISOString()
      }

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000))

      const reportId = `REPORT-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      
      setIsSubmitted(true)
      onReportSubmitted?.(reportId)
      
      toast.success('Report submitted successfully. Thank you for helping keep our platform safe.')

    } catch (error) {
      console.error('Report submission error:', error)
      toast.error('Failed to submit report. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    const fileNames = files.map(file => file.name)
    setFormData(prev => ({
      ...prev,
      evidence: [...prev.evidence, ...fileNames]
    }))
  }

  const selectedType = reportTypes.find(type => type.value === formData.type)

  if (isSubmitted) {
    return (
      <Card className={className}>
        <CardContent className="p-6 text-center">
          <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">Report Submitted</h3>
          <p className="text-muted-foreground mb-4">
            Thank you for reporting this content. Our moderation team will review it within 24 hours.
          </p>
          <div className="space-y-2 text-sm text-muted-foreground">
            <p>• You will receive an email confirmation</p>
            <p>• We may contact you for additional information</p>
            <p>• All reports are taken seriously and investigated</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Flag className="h-5 w-5 text-red-600" />
          <span>Report Content</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Content Information */}
          <div className="p-4 bg-muted rounded-lg">
            <h4 className="font-medium mb-2">Content Being Reported</h4>
            <div className="text-sm text-muted-foreground space-y-1">
              <p><strong>Type:</strong> {contentType}</p>
              <p><strong>URL:</strong> {contentUrl}</p>
              <p><strong>ID:</strong> {contentId}</p>
            </div>
          </div>

          {/* Report Type */}
          <div className="space-y-2">
            <Label htmlFor="type">Report Type *</Label>
            <Select value={formData.type} onValueChange={(value) => setFormData(prev => ({ ...prev, type: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="Select the type of violation" />
              </SelectTrigger>
              <SelectContent>
                {reportTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    <div className="flex items-center space-x-2">
                      <span>{type.label}</span>
                      <Badge variant={
                        type.severity === 'critical' ? 'destructive' :
                        type.severity === 'high' ? 'secondary' :
                        type.severity === 'medium' ? 'outline' : 'outline'
                      }>
                        {type.severity}
                      </Badge>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedType && (
              <p className="text-sm text-muted-foreground">{selectedType.description}</p>
            )}
          </div>

          {/* Severity */}
          <div className="space-y-2">
            <Label htmlFor="severity">Severity Level *</Label>
            <Select value={formData.severity} onValueChange={(value) => setFormData(prev => ({ ...prev, severity: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="Select severity level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low - Minor violation</SelectItem>
                <SelectItem value="medium">Medium - Moderate violation</SelectItem>
                <SelectItem value="high">High - Serious violation</SelectItem>
                <SelectItem value="critical">Critical - Immediate action required</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Reason */}
          <div className="space-y-2">
            <Label htmlFor="reason">Reason for Report *</Label>
            <Input
              id="reason"
              value={formData.reason}
              onChange={(e) => setFormData(prev => ({ ...prev, reason: e.target.value }))}
              placeholder="Brief reason for reporting this content"
              required
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Detailed Description *</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Provide detailed information about the violation"
              rows={4}
              required
            />
          </div>

          {/* Evidence Upload */}
          <div className="space-y-2">
            <Label>Evidence (Optional)</Label>
            <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
              <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
              <p className="text-sm text-muted-foreground mb-2">
                Upload screenshots or other evidence
              </p>
              <input
                type="file"
                multiple
                accept="image/*,.pdf,.doc,.docx"
                onChange={handleFileUpload}
                className="hidden"
                id="evidence-upload"
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => document.getElementById('evidence-upload')?.click()}
              >
                <Camera className="h-4 w-4 mr-2" />
                Upload Files
              </Button>
            </div>
            {formData.evidence.length > 0 && (
              <div className="space-y-1">
                <p className="text-sm font-medium">Uploaded files:</p>
                {formData.evidence.map((file, index) => (
                  <div key={index} className="flex items-center space-x-2 text-sm">
                    <FileText className="h-4 w-4" />
                    <span>{file}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Additional Information */}
          <div className="space-y-2">
            <Label htmlFor="additionalInfo">Additional Information</Label>
            <Textarea
              id="additionalInfo"
              value={formData.additionalInfo}
              onChange={(e) => setFormData(prev => ({ ...prev, additionalInfo: e.target.value }))}
              placeholder="Any additional information that might help with the investigation"
              rows={3}
            />
          </div>

          {/* Options */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="anonymous"
                checked={formData.isAnonymous}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isAnonymous: !!checked }))}
              />
              <Label htmlFor="anonymous" className="text-sm">
                Submit anonymously
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="contactConsent"
                checked={formData.contactConsent}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, contactConsent: !!checked }))}
                required
              />
              <Label htmlFor="contactConsent" className="text-sm">
                I consent to being contacted for follow-up questions *
              </Label>
            </div>
          </div>

          {/* Warning */}
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <strong>Important:</strong> False reports may result in account suspension. 
              Please ensure your report is accurate and made in good faith.
            </AlertDescription>
          </Alert>

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full"
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Submitting Report...
              </>
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                Submit Report
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
