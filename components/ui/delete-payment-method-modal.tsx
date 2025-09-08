"use client"

import React, { useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'
import { 
  CreditCard, 
  AlertTriangle,
  Loader2,
  Trash2
} from 'lucide-react'

interface DeletePaymentMethodModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  paymentMethod: {
    id: string
    type: string
    last4: string
    expiryMonth: string
    expiryYear: string
    cardholderName: string
    isDefault: boolean
  }
}

export function DeletePaymentMethodModal({ isOpen, onClose, onSuccess, paymentMethod }: DeletePaymentMethodModalProps) {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)

  const handleDelete = async () => {
    setIsLoading(true)
    
    try {
      // Simulate API call to delete payment method
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      toast({
        title: "Payment Method Deleted",
        description: "Your payment method has been successfully removed.",
      })
      
      onSuccess()
      onClose()
    } catch (error) {
      toast({
        title: "Delete Failed",
        description: "Failed to delete payment method. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md w-[95vw] sm:w-full">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-600">
            <Trash2 className="h-5 w-5" />
            Delete Payment Method
          </DialogTitle>
          <DialogDescription>
            This action cannot be undone. Are you sure you want to delete this payment method?
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Payment Method Info */}
          <Card className="bg-gray-50 border-gray-200">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-10 h-6 bg-gray-200 rounded">
                  <CreditCard className="h-4 w-4 text-gray-600" />
                </div>
                <div>
                  <div className="font-medium">
                    {paymentMethod.type.toUpperCase()} •••• {paymentMethod.last4}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {paymentMethod.cardholderName} • Expires {paymentMethod.expiryMonth}/{paymentMethod.expiryYear}
                  </div>
                  {paymentMethod.isDefault && (
                    <div className="text-xs text-blue-600 font-medium mt-1">
                      Default payment method
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Warning */}
          <Card className="bg-red-50 border-red-200">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-red-800">Important Notice</h4>
                  <ul className="text-sm text-red-700 mt-2 space-y-1">
                    <li>• This payment method will be permanently deleted</li>
                    <li>• Any active subscriptions using this card may be affected</li>
                    <li>• You'll need to add a new payment method for future purchases</li>
                    {paymentMethod.isDefault && (
                      <li>• You'll need to set a new default payment method</li>
                    )}
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleDelete} 
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Payment Method
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
