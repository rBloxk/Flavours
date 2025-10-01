import { NextRequest, NextResponse } from 'next/server'

// Mock data - in real app, this would come from database
const mockAgeVerificationRequests = [
  {
    id: '1',
    userId: 'user1',
    username: 'john_doe',
    email: 'john@example.com',
    displayName: 'John Doe',
    governmentIdUrl: '/api/placeholder/id1.jpg',
    selfieUrl: '/api/placeholder/selfie1.jpg',
    status: 'pending',
    submittedAt: '2024-01-15T10:30:00Z'
  },
  {
    id: '2',
    userId: 'user2',
    username: 'jane_smith',
    email: 'jane@example.com',
    displayName: 'Jane Smith',
    governmentIdUrl: '/api/placeholder/id2.jpg',
    selfieUrl: '/api/placeholder/selfie2.jpg',
    status: 'pending',
    submittedAt: '2024-01-14T15:45:00Z'
  },
  {
    id: '3',
    userId: 'user3',
    username: 'mike_wilson',
    email: 'mike@example.com',
    displayName: 'Mike Wilson',
    governmentIdUrl: '/api/placeholder/id3.jpg',
    selfieUrl: '/api/placeholder/selfie3.jpg',
    status: 'approved',
    submittedAt: '2024-01-13T09:20:00Z',
    reviewedAt: '2024-01-13T14:30:00Z',
    reviewedBy: 'admin@flavours.club'
  },
  {
    id: '4',
    userId: 'user4',
    username: 'sarah_jones',
    email: 'sarah@example.com',
    displayName: 'Sarah Jones',
    governmentIdUrl: '/api/placeholder/id4.jpg',
    selfieUrl: '/api/placeholder/selfie4.jpg',
    status: 'rejected',
    submittedAt: '2024-01-12T11:15:00Z',
    reviewedAt: '2024-01-12T16:45:00Z',
    reviewedBy: 'admin@flavours.club',
    rejectionReason: 'Government ID image is unclear'
  }
]

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const search = searchParams.get('search')

    let filteredRequests = mockAgeVerificationRequests

    // Filter by status
    if (status && status !== 'all') {
      filteredRequests = filteredRequests.filter(req => req.status === status)
    }

    // Filter by search term
    if (search) {
      filteredRequests = filteredRequests.filter(req =>
        req.username.toLowerCase().includes(search.toLowerCase()) ||
        req.email.toLowerCase().includes(search.toLowerCase()) ||
        req.displayName.toLowerCase().includes(search.toLowerCase())
      )
    }

    return NextResponse.json({
      success: true,
      data: filteredRequests,
      total: filteredRequests.length,
      pending: mockAgeVerificationRequests.filter(r => r.status === 'pending').length,
      approved: mockAgeVerificationRequests.filter(r => r.status === 'approved').length,
      rejected: mockAgeVerificationRequests.filter(r => r.status === 'rejected').length
    })
  } catch (error) {
    console.error('Get age verification requests error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { requestId, action, reason } = body

    if (!requestId || !action) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Find the request
    const requestIndex = mockAgeVerificationRequests.findIndex(req => req.id === requestId)
    if (requestIndex === -1) {
      return NextResponse.json(
        { error: 'Request not found' },
        { status: 404 }
      )
    }

    // Update the request
    const updatedRequest = {
      ...mockAgeVerificationRequests[requestIndex],
      status: action === 'approve' ? 'approved' : 'rejected',
      reviewedAt: new Date().toISOString(),
      reviewedBy: 'admin@flavours.club',
      ...(action === 'reject' && reason && { rejectionReason: reason })
    }

    mockAgeVerificationRequests[requestIndex] = updatedRequest

    // In a real app, you would also update the user's verification status
    // and send them a notification about the decision

    return NextResponse.json({
      success: true,
      data: updatedRequest,
      message: `Age verification request ${action}d successfully`
    })
  } catch (error) {
    console.error('Update age verification request error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
