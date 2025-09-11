'use client'

import { useState, useEffect } from 'react'
import { AdminLayout } from '@/components/admin-layout'
import { AuthGuard } from '@/components/auth-guard'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { 
  Search, 
  Filter, 
  MoreHorizontal, 
  CreditCard, 
  DollarSign, 
  TrendingUp,
  TrendingDown,
  CheckCircle,
  XCircle,
  Clock,
  Download,
  Eye,
  AlertTriangle
} from 'lucide-react'

interface Payment {
  id: string
  userId: string
  userName: string
  creatorId: string
  creatorName: string
  amount: number
  currency: string
  status: 'completed' | 'pending' | 'failed' | 'refunded' | 'cancelled'
  type: 'subscription' | 'tip' | 'purchase' | 'refund'
  method: 'card' | 'paypal' | 'stripe' | 'apple_pay' | 'google_pay'
  transactionId: string
  createdAt: string
  processedAt?: string
  failureReason?: string
}

interface Payout {
  id: string
  creatorId: string
  creatorName: string
  amount: number
  currency: string
  status: 'pending' | 'processing' | 'completed' | 'failed'
  method: 'bank_transfer' | 'paypal' | 'stripe'
  requestedAt: string
  processedAt?: string
  failureReason?: string
}

export default function PaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([])
  const [payouts, setPayouts] = useState<Payout[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [activeTab, setActiveTab] = useState<'payments' | 'payouts'>('payments')

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      // Mock data for demo
      const mockPayments: Payment[] = [
        {
          id: '1',
          userId: 'user1',
          userName: 'John Doe',
          creatorId: 'creator1',
          creatorName: 'Sarah Johnson',
          amount: 9.99,
          currency: 'USD',
          status: 'completed',
          type: 'subscription',
          method: 'card',
          transactionId: 'txn_123456789',
          createdAt: '2024-01-20T10:30:00Z',
          processedAt: '2024-01-20T10:31:00Z'
        },
        {
          id: '2',
          userId: 'user2',
          userName: 'Mike Chen',
          creatorId: 'creator2',
          creatorName: 'Emma Davis',
          amount: 5.00,
          currency: 'USD',
          status: 'completed',
          type: 'tip',
          method: 'paypal',
          transactionId: 'txn_987654321',
          createdAt: '2024-01-19T15:45:00Z',
          processedAt: '2024-01-19T15:46:00Z'
        },
        {
          id: '3',
          userId: 'user3',
          userName: 'Alex Rodriguez',
          creatorId: 'creator3',
          creatorName: 'David Kim',
          amount: 12.99,
          currency: 'USD',
          status: 'pending',
          type: 'subscription',
          method: 'stripe',
          transactionId: 'txn_456789123',
          createdAt: '2024-01-18T09:15:00Z'
        },
        {
          id: '4',
          userId: 'user4',
          userName: 'Lisa Wang',
          creatorId: 'creator4',
          creatorName: 'Jessica Brown',
          amount: 7.99,
          currency: 'USD',
          status: 'failed',
          type: 'subscription',
          method: 'card',
          transactionId: 'txn_789123456',
          createdAt: '2024-01-17T16:20:00Z',
          failureReason: 'Insufficient funds'
        },
        {
          id: '5',
          userId: 'user5',
          userName: 'David Kim',
          creatorId: 'creator5',
          creatorName: 'Mike Chen',
          amount: 9.99,
          currency: 'USD',
          status: 'refunded',
          type: 'refund',
          method: 'card',
          transactionId: 'txn_321654987',
          createdAt: '2024-01-16T14:30:00Z',
          processedAt: '2024-01-16T14:35:00Z'
        }
      ]

      const mockPayouts: Payout[] = [
        {
          id: '1',
          creatorId: 'creator1',
          creatorName: 'Sarah Johnson',
          amount: 1250.00,
          currency: 'USD',
          status: 'completed',
          method: 'bank_transfer',
          requestedAt: '2024-01-20T10:00:00Z',
          processedAt: '2024-01-20T14:00:00Z'
        },
        {
          id: '2',
          creatorId: 'creator2',
          creatorName: 'Emma Davis',
          amount: 890.50,
          currency: 'USD',
          status: 'processing',
          method: 'paypal',
          requestedAt: '2024-01-19T15:00:00Z'
        },
        {
          id: '3',
          creatorId: 'creator3',
          creatorName: 'David Kim',
          amount: 2100.75,
          currency: 'USD',
          status: 'pending',
          method: 'stripe',
          requestedAt: '2024-01-18T09:00:00Z'
        },
        {
          id: '4',
          creatorId: 'creator4',
          creatorName: 'Jessica Brown',
          amount: 450.25,
          currency: 'USD',
          status: 'failed',
          method: 'bank_transfer',
          requestedAt: '2024-01-17T16:00:00Z',
          failureReason: 'Invalid bank account details'
        }
      ]

      setPayments(mockPayments)
      setPayouts(mockPayouts)
    } catch (error) {
      console.error('Failed to fetch payment data:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'pending':
      case 'processing':
        return <Clock className="h-4 w-4 text-orange-500" />
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />
      case 'refunded':
        return <TrendingDown className="h-4 w-4 text-blue-500" />
      case 'cancelled':
        return <XCircle className="h-4 w-4 text-gray-500" />
      default:
        return <Clock className="h-4 w-4 text-gray-500" />
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge variant="default" className="bg-green-600">Completed</Badge>
      case 'pending':
        return <Badge variant="outline" className="text-orange-600 border-orange-600">Pending</Badge>
      case 'processing':
        return <Badge variant="outline" className="text-blue-600 border-blue-600">Processing</Badge>
      case 'failed':
        return <Badge variant="destructive">Failed</Badge>
      case 'refunded':
        return <Badge variant="outline" className="text-blue-600 border-blue-600">Refunded</Badge>
      case 'cancelled':
        return <Badge variant="secondary">Cancelled</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'subscription':
        return <Badge variant="outline" className="text-blue-600 border-blue-600">Subscription</Badge>
      case 'tip':
        return <Badge variant="outline" className="text-green-600 border-green-600">Tip</Badge>
      case 'purchase':
        return <Badge variant="outline" className="text-purple-600 border-purple-600">Purchase</Badge>
      case 'refund':
        return <Badge variant="outline" className="text-red-600 border-red-600">Refund</Badge>
      default:
        return <Badge variant="secondary">{type}</Badge>
    }
  }

  const formatCurrency = (amount: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(amount)
  }

  const filteredPayments = payments.filter(payment => {
    const matchesSearch = payment.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         payment.creatorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         payment.transactionId.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || payment.status === statusFilter
    const matchesType = typeFilter === 'all' || payment.type === typeFilter
    return matchesSearch && matchesStatus && matchesType
  })

  const filteredPayouts = payouts.filter(payout => {
    const matchesSearch = payout.creatorName.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || payout.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const stats = {
    totalRevenue: payments.filter(p => p.status === 'completed').reduce((sum, p) => sum + p.amount, 0),
    pendingPayments: payments.filter(p => p.status === 'pending').length,
    failedPayments: payments.filter(p => p.status === 'failed').length,
    totalPayouts: payouts.filter(p => p.status === 'completed').reduce((sum, p) => sum + p.amount, 0),
    pendingPayouts: payouts.filter(p => p.status === 'pending' || p.status === 'processing').length
  }

  if (loading) {
    return (
      <AuthGuard requiredRole="admin">
        <AdminLayout>
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </AdminLayout>
      </AuthGuard>
    )
  }

  return (
    <AuthGuard requiredRole="admin">
      <AdminLayout>
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Payments & Payouts</h1>
          <p className="text-muted-foreground">Manage financial transactions and creator payouts</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(stats.totalRevenue)}</div>
              <p className="text-xs text-muted-foreground">Completed payments</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Payments</CardTitle>
              <Clock className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{stats.pendingPayments}</div>
              <p className="text-xs text-muted-foreground">Awaiting processing</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Failed Payments</CardTitle>
              <XCircle className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{stats.failedPayments}</div>
              <p className="text-xs text-muted-foreground">Need attention</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Payouts</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(stats.totalPayouts)}</div>
              <p className="text-xs text-muted-foreground">Paid to creators</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Payouts</CardTitle>
              <AlertTriangle className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{stats.pendingPayouts}</div>
              <p className="text-xs text-muted-foreground">Awaiting processing</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <div className="mb-6">
          <div className="flex space-x-1 bg-muted p-1 rounded-lg w-fit">
            <Button
              variant={activeTab === 'payments' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setActiveTab('payments')}
            >
              Payments
            </Button>
            <Button
              variant={activeTab === 'payouts' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setActiveTab('payouts')}
            >
              Payouts
            </Button>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={`Search ${activeTab} by name or transaction ID...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-input rounded-md bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="all">All Status</option>
            <option value="completed">Completed</option>
            <option value="pending">Pending</option>
            <option value="processing">Processing</option>
            <option value="failed">Failed</option>
            <option value="refunded">Refunded</option>
            <option value="cancelled">Cancelled</option>
          </select>
          {activeTab === 'payments' && (
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-3 py-2 border border-input rounded-md bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="all">All Types</option>
              <option value="subscription">Subscription</option>
              <option value="tip">Tip</option>
              <option value="purchase">Purchase</option>
              <option value="refund">Refund</option>
            </select>
          )}
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-1" />
            Export
          </Button>
        </div>

        {/* Payments/Payouts Table */}
        <Card>
          <CardHeader>
            <CardTitle>
              {activeTab === 'payments' ? `Payments (${filteredPayments.length})` : `Payouts (${filteredPayouts.length})`}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {activeTab === 'payments' ? (
                filteredPayments.map((payment) => (
                  <div key={payment.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                        <CreditCard className="h-5 w-5 text-primary-foreground" />
                      </div>
                      <div>
                        <h3 className="font-medium">{payment.userName} → {payment.creatorName}</h3>
                        <p className="text-sm text-muted-foreground">
                          {payment.transactionId} • {new Date(payment.createdAt).toLocaleDateString()}
                        </p>
                        <div className="flex items-center space-x-2 mt-1">
                          {getTypeBadge(payment.type)}
                          <Badge variant="outline">{payment.method}</Badge>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <p className="text-lg font-bold">{formatCurrency(payment.amount, payment.currency)}</p>
                        <div className="flex items-center space-x-1">
                          {getStatusIcon(payment.status)}
                          {getStatusBadge(payment.status)}
                        </div>
                      </div>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))
              ) : (
                filteredPayouts.map((payout) => (
                  <div key={payout.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                        <TrendingUp className="h-5 w-5 text-primary-foreground" />
                      </div>
                      <div>
                        <h3 className="font-medium">{payout.creatorName}</h3>
                        <p className="text-sm text-muted-foreground">
                          {payout.method} • {new Date(payout.requestedAt).toLocaleDateString()}
                        </p>
                        {payout.failureReason && (
                          <p className="text-sm text-red-600 mt-1">{payout.failureReason}</p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <p className="text-lg font-bold">{formatCurrency(payout.amount, payout.currency)}</p>
                        <div className="flex items-center space-x-1">
                          {getStatusIcon(payout.status)}
                          {getStatusBadge(payout.status)}
                        </div>
                      </div>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </AdminLayout>
    </AuthGuard>
  )
}
