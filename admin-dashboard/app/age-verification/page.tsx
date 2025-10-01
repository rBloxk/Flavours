'use client'

import { useState, useEffect } from 'react'
import { AdminLayout } from '../../components/admin-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { 
  FileText, 
  Camera, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Search,
  Eye,
  Download,
  AlertCircle,
  Shield,
  User,
  Calendar,
  CreditCard
} from 'lucide-react'

interface AgeVerificationRequest {
  id: string
  userId: string
  username: string
  email: string
  displayName: string
  governmentIdUrl: string
  selfieUrl: string
  status: 'pending' | 'approved' | 'rejected'
  submittedAt: string
  reviewedAt?: string
  reviewedBy?: string
  rejectionReason?: string
}

export default function AgeVerificationPage() {
  const [requests, setRequests] = useState<AgeVerificationRequest[]>([])
  const [filteredRequests, setFilteredRequests] = useState<AgeVerificationRequest[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all')
  const [selectedRequest, setSelectedRequest] = useState<AgeVerificationRequest | null>(null)
  const [showImageModal, setShowImageModal] = useState(false)
  const [selectedImageUrl, setSelectedImageUrl] = useState('')
  const [selectedImageType, setSelectedImageType] = useState<'id' | 'selfie'>('id')
  const [isLoading, setIsLoading] = useState(true)

  // Fetch age verification requests from API
  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const response = await fetch('/api/age-verification')
        const data = await response.json()
        
        if (data.success) {
          setRequests(data.data)
          setFilteredRequests(data.data)
        }
      } catch (error) {
        console.error('Failed to fetch age verification requests:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchRequests()
  }, [])

  // Filter requests based on search term and status
  useEffect(() => {
    let filtered = requests

    if (searchTerm) {
      filtered = filtered.filter(request =>
        request.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        request.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        request.displayName.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(request => request.status === statusFilter)
    }

    setFilteredRequests(filtered)
  }, [requests, searchTerm, statusFilter])

  const handleApprove = async (requestId: string) => {
    try {
      const response = await fetch('/api/age-verification', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          requestId,
          action: 'approve'
        })
      })

      const data = await response.json()
      
      if (data.success) {
        setRequests(prev => prev.map(req => 
          req.id === requestId 
            ? { 
                ...req, 
                status: 'approved' as const,
                reviewedAt: new Date().toISOString(),
                reviewedBy: 'admin@flavours.club'
              }
            : req
        ))
        setSelectedRequest(null)
      }
    } catch (error) {
      console.error('Failed to approve request:', error)
    }
  }

  const handleViewImage = (imageUrl: string, type: 'id' | 'selfie') => {
    setSelectedImageUrl(imageUrl)
    setSelectedImageType(type)
    setShowImageModal(true)
  }

  const handleCloseImageModal = () => {
    setShowImageModal(false)
    setSelectedImageUrl('')
  }

  const handleReject = async (requestId: string, reason: string) => {
    try {
      const response = await fetch('/api/age-verification', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          requestId,
          action: 'reject',
          reason
        })
      })

      const data = await response.json()
      
      if (data.success) {
        setRequests(prev => prev.map(req => 
          req.id === requestId 
            ? { 
                ...req, 
                status: 'rejected' as const,
                reviewedAt: new Date().toISOString(),
                reviewedBy: 'admin@flavours.club',
                rejectionReason: reason
              }
            : req
        ))
        setSelectedRequest(null)
      }
    } catch (error) {
      console.error('Failed to reject request:', error)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary" className="flex items-center gap-1"><Clock className="h-3 w-3" />Pending</Badge>
      case 'approved':
        return <Badge variant="default" className="flex items-center gap-1"><CheckCircle2 className="h-3 w-3" />Approved</Badge>
      case 'rejected':
        return <Badge variant="destructive" className="flex items-center gap-1"><XCircle className="h-3 w-3" />Rejected</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const pendingCount = requests.filter(r => r.status === 'pending').length
  const approvedCount = requests.filter(r => r.status === 'approved').length
  const rejectedCount = requests.filter(r => r.status === 'rejected').length

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Age Verification</h1>
          <p className="text-muted-foreground">Review and manage age verification requests</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Requests</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{requests.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{pendingCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Approved</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{approvedCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rejected</CardTitle>
            <XCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{rejectedCount}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Label htmlFor="search">Search</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Search by username, email, or name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="sm:w-48">
              <Label htmlFor="status">Status</Label>
              <select
                id="status"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="w-full px-3 py-2 border border-input bg-background rounded-md text-sm"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Requests Table */}
      <Card>
        <CardHeader>
          <CardTitle>Verification Requests</CardTitle>
          <CardDescription>
            {filteredRequests.length} request(s) found
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredRequests.map((request) => (
              <div key={request.id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                      <User className="h-5 w-5 text-primary-foreground" />
                    </div>
                    <div>
                      <h3 className="font-medium">{request.displayName}</h3>
                      <p className="text-sm text-muted-foreground">@{request.username}</p>
                      <p className="text-sm text-muted-foreground">{request.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">Submitted</p>
                      <p className="text-sm font-medium">{formatDate(request.submittedAt)}</p>
                    </div>
                    {getStatusBadge(request.status)}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedRequest(request)}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      Review
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Review Modal */}
      {selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Review Age Verification</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedRequest(null)}
                >
                  <XCircle className="h-4 w-4" />
                </Button>
              </CardTitle>
              <CardDescription>
                Reviewing verification for {selectedRequest.displayName} (@{selectedRequest.username})
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* User Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>User Information</Label>
                  <div className="space-y-2 mt-2">
                    <p><strong>Name:</strong> {selectedRequest.displayName}</p>
                    <p><strong>Username:</strong> @{selectedRequest.username}</p>
                    <p><strong>Email:</strong> {selectedRequest.email}</p>
                    <p><strong>Submitted:</strong> {formatDate(selectedRequest.submittedAt)}</p>
                  </div>
                </div>
                <div>
                  <Label>Current Status</Label>
                  <div className="mt-2">
                    {getStatusBadge(selectedRequest.status)}
                  </div>
                </div>
              </div>

              {/* Documents */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Government ID</Label>
                  <div className="mt-2 border rounded-lg p-4 text-center">
                    <FileText className="h-12 w-12 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">Government ID Document</p>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="mt-2"
                      onClick={() => handleViewImage(selectedRequest.governmentIdUrl, 'id')}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      View Document
                    </Button>
                  </div>
                </div>
                <div>
                  <Label>Selfie Photo</Label>
                  <div className="mt-2 border rounded-lg p-4 text-center">
                    <Camera className="h-12 w-12 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">Selfie Photo</p>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="mt-2"
                      onClick={() => handleViewImage(selectedRequest.selfieUrl, 'selfie')}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      View Photo
                    </Button>
                  </div>
                </div>
              </div>

              {/* Actions */}
              {selectedRequest.status === 'pending' && (
                <div className="flex space-x-4">
                  <Button
                    onClick={() => handleApprove(selectedRequest.id)}
                    className="flex-1"
                  >
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    Approve
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => {
                      const reason = prompt('Please provide a reason for rejection:')
                      if (reason) {
                        handleReject(selectedRequest.id, reason)
                      }
                    }}
                    className="flex-1"
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Reject
                  </Button>
                </div>
              )}

              {/* Review History */}
              {selectedRequest.reviewedAt && (
                <div>
                  <Label>Review History</Label>
                  <div className="mt-2 p-4 bg-muted rounded-lg">
                    <p><strong>Reviewed:</strong> {formatDate(selectedRequest.reviewedAt)}</p>
                    <p><strong>Reviewed by:</strong> {selectedRequest.reviewedBy}</p>
                    {selectedRequest.rejectionReason && (
                      <p><strong>Reason:</strong> {selectedRequest.rejectionReason}</p>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>

    {/* Image Preview Modal */}
    {showImageModal && (
      <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
        <div className="bg-white dark:bg-gray-900 rounded-lg p-6 max-w-4xl max-h-[90vh] overflow-hidden">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">
              {selectedImageType === 'id' ? 'Government ID Document' : 'Selfie Photo'}
            </h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCloseImageModal}
            >
              <XCircle className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex justify-center">
            <img
              src={selectedImageUrl}
              alt={selectedImageType === 'id' ? 'Government ID' : 'Selfie'}
              className="max-w-full max-h-[70vh] object-contain rounded-lg"
              onError={(e) => {
                // Fallback for demo purposes - show placeholder
                e.currentTarget.src = `data:image/svg+xml;base64,${btoa(`
                  <svg width="400" height="300" xmlns="http://www.w3.org/2000/svg">
                    <rect width="400" height="300" fill="#f3f4f6"/>
                    <text x="200" y="150" text-anchor="middle" fill="#6b7280" font-family="Arial" font-size="16">
                      ${selectedImageType === 'id' ? 'Government ID Document' : 'Selfie Photo'}
                    </text>
                    <text x="200" y="180" text-anchor="middle" fill="#9ca3af" font-family="Arial" font-size="12">
                      Demo Image - Click to view actual document
                    </text>
                  </svg>
                `)}`
              }}
            />
          </div>
          <div className="mt-4 flex justify-center space-x-4">
            <Button
              variant="outline"
              onClick={() => window.open(selectedImageUrl, '_blank')}
            >
              <Download className="h-4 w-4 mr-2" />
              Download
            </Button>
            <Button onClick={handleCloseImageModal}>
              Close
            </Button>
          </div>
        </div>
      </div>
    )}
    </AdminLayout>
  )
}
