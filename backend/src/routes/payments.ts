import { Router, Request, Response } from 'express'
import { authMiddleware, AuthenticatedRequest } from '../middleware/auth'
import { validateRequest } from '../middleware/validation'
import { paymentSchemas } from '../schemas/payments'
import { PaymentService } from '../services/paymentService'
import { logger } from '../utils/logger'

const router = Router()
const paymentService = new PaymentService()

// Get available payment gateways
router.get('/gateways', async (req: Request, res: Response) => {
  try {
    const gateways = paymentService.getAvailableGateways()
    res.json({
      gateways,
      recommended: paymentService.getRecommendedGateway()
    })
  } catch (error) {
    logger.error('Get gateways error:', error)
    res.status(500).json({
      error: 'Failed to fetch payment gateways'
    })
  }
})

// Create payment method
router.post('/methods', authMiddleware, validateRequest(paymentSchemas.createPaymentMethod), async (req: Request, res: Response) => {
  try {
    const userId = (req as AuthenticatedRequest).user.id
    const paymentData = req.body

    // Validate card details
    if (!paymentService.validateCardNumber(paymentData.cardNumber)) {
      return res.status(400).json({
        error: 'Invalid card number'
      })
    }

    const cardType = paymentService.detectCardType(paymentData.cardNumber)
    if (cardType === 'unknown') {
      return res.status(400).json({
        error: 'Unsupported card type'
      })
    }

    if (!paymentService.validateCVV(paymentData.cvv, cardType)) {
      return res.status(400).json({
        error: 'Invalid CVV'
      })
    }

    if (!paymentService.validateExpiryDate(paymentData.expiryMonth, paymentData.expiryYear)) {
      return res.status(400).json({
        error: 'Card has expired'
      })
    }

    const paymentMethod = await paymentService.createPaymentMethod({
      ...paymentData,
      userId
    })

    res.status(201).json({
      message: 'Payment method created successfully',
      paymentMethod
    })
  } catch (error) {
    logger.error('Create payment method error:', error)
    res.status(500).json({
      error: 'Failed to create payment method'
    })
  }
})

// Get user's payment methods
router.get('/methods', authMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = (req as AuthenticatedRequest).user.id
    const paymentMethods = await paymentService.getPaymentMethods(userId)

    res.json({
      paymentMethods
    })
  } catch (error) {
    logger.error('Get payment methods error:', error)
    res.status(500).json({
      error: 'Failed to fetch payment methods'
    })
  }
})

// Update payment method
router.put('/methods/:id', authMiddleware, validateRequest(paymentSchemas.updatePaymentMethod), async (req: Request, res: Response) => {
  try {
    const userId = (req as AuthenticatedRequest).user.id
    const { id } = req.params
    const updateData = req.body

    // Verify ownership
    const paymentMethod = await paymentService.getPaymentMethod(id, userId)
    if (!paymentMethod) {
      return res.status(404).json({
        error: 'Payment method not found'
      })
    }

    const updatedMethod = await paymentService.updatePaymentMethod(id, updateData)

    res.json({
      message: 'Payment method updated successfully',
      paymentMethod: updatedMethod
    })
  } catch (error) {
    logger.error('Update payment method error:', error)
    res.status(500).json({
      error: 'Failed to update payment method'
    })
  }
})

// Delete payment method
router.delete('/methods/:id', authMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = (req as AuthenticatedRequest).user.id
    const { id } = req.params

    // Verify ownership
    const paymentMethod = await paymentService.getPaymentMethod(id, userId)
    if (!paymentMethod) {
      return res.status(404).json({
        error: 'Payment method not found'
      })
    }

    await paymentService.deletePaymentMethod(id)

    res.json({
      message: 'Payment method deleted successfully'
    })
  } catch (error) {
    logger.error('Delete payment method error:', error)
    res.status(500).json({
      error: 'Failed to delete payment method'
    })
  }
})

// Set default payment method
router.post('/methods/:id/default', authMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = (req as AuthenticatedRequest).user.id
    const { id } = req.params

    // Verify ownership
    const paymentMethod = await paymentService.getPaymentMethod(id, userId)
    if (!paymentMethod) {
      return res.status(404).json({
        error: 'Payment method not found'
      })
    }

    await paymentService.setDefaultPaymentMethod(id, userId)

    res.json({
      message: 'Default payment method updated successfully'
    })
  } catch (error) {
    logger.error('Set default payment method error:', error)
    res.status(500).json({
      error: 'Failed to set default payment method'
    })
  }
})

// Create payment intent for subscription
router.post('/intents/subscription', authMiddleware, validateRequest(paymentSchemas.createSubscriptionIntent), async (req: Request, res: Response) => {
  try {
    const userId = (req as AuthenticatedRequest).user.id
    const { creatorId, planId, paymentMethodId } = req.body

    const paymentIntent = await paymentService.createSubscriptionPayment({
      userId,
      creatorId,
      planId,
      paymentMethodId
    })

    res.status(201).json({
      message: 'Payment intent created successfully',
      paymentIntent
    })
  } catch (error) {
    logger.error('Create subscription payment error:', error)
    res.status(500).json({
      error: 'Failed to create subscription payment'
    })
  }
})

// Create payment intent for tip
router.post('/intents/tip', authMiddleware, validateRequest(paymentSchemas.createTipIntent), async (req: Request, res: Response) => {
  try {
    const userId = (req as AuthenticatedRequest).user.id
    const { creatorId, amount, message, paymentMethodId } = req.body

    const paymentIntent = await paymentService.createTipPayment({
      userId,
      creatorId,
      amount,
      message,
      paymentMethodId
    })

    res.status(201).json({
      message: 'Tip payment intent created successfully',
      paymentIntent
    })
  } catch (error) {
    logger.error('Create tip payment error:', error)
    res.status(500).json({
      error: 'Failed to create tip payment'
    })
  }
})

// Create payment intent for PPV content
router.post('/intents/ppv', authMiddleware, validateRequest(paymentSchemas.createPPVIntent), async (req: Request, res: Response) => {
  try {
    const userId = (req as AuthenticatedRequest).user.id
    const { postId, paymentMethodId } = req.body

    const paymentIntent = await paymentService.createPPVPayment({
      userId,
      postId,
      paymentMethodId
    })

    res.status(201).json({
      message: 'PPV payment intent created successfully',
      paymentIntent
    })
  } catch (error) {
    logger.error('Create PPV payment error:', error)
    res.status(500).json({
      error: 'Failed to create PPV payment'
    })
  }
})

// Confirm payment intent
router.post('/intents/:id/confirm', authMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = (req as AuthenticatedRequest).user.id
    const { id } = req.params

    const result = await paymentService.confirmPaymentIntent(id, userId)

    res.json({
      message: 'Payment confirmed successfully',
      result
    })
  } catch (error) {
    logger.error('Confirm payment error:', error)
    res.status(500).json({
      error: 'Failed to confirm payment'
    })
  }
})

// Get transaction history
router.get('/transactions', authMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = (req as AuthenticatedRequest).user.id
    const { page = 1, limit = 20, type } = req.query

    const transactions = await paymentService.getTransactionHistory({
      userId,
      page: Number(page),
      limit: Number(limit),
      type: type as string
    })

    res.json({
      transactions,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total: transactions.length
      }
    })
  } catch (error) {
    logger.error('Get transaction history error:', error)
    res.status(500).json({
      error: 'Failed to fetch transaction history'
    })
  }
})

// Calculate fees for a given amount
router.post('/fees/calculate', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { amount, provider } = req.body

    if (!amount || amount <= 0) {
      return res.status(400).json({
        error: 'Invalid amount'
      })
    }

    const fees = paymentService.calculateFees(amount, provider)
    const netAmount = amount - fees

    res.json({
      amount,
      fees,
      netAmount,
      provider: provider || paymentService.getRecommendedGateway()
    })
  } catch (error) {
    logger.error('Calculate fees error:', error)
    res.status(500).json({
      error: 'Failed to calculate fees'
    })
  }
})

export default router
