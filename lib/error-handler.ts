/**
 * Production-ready error handling utilities
 */

export interface AppError {
  code: string
  message: string
  statusCode: number
  details?: any
  timestamp: string
  requestId?: string
}

export class CustomError extends Error {
  public code: string
  public statusCode: number
  public details?: any
  public timestamp: string
  public requestId?: string

  constructor(
    message: string,
    code: string = 'INTERNAL_ERROR',
    statusCode: number = 500,
    details?: any,
    requestId?: string
  ) {
    super(message)
    this.name = 'CustomError'
    this.code = code
    this.statusCode = statusCode
    this.details = details
    this.timestamp = new Date().toISOString()
    this.requestId = requestId
  }
}

export class ValidationError extends CustomError {
  constructor(message: string, details?: any, requestId?: string) {
    super(message, 'VALIDATION_ERROR', 400, details, requestId)
  }
}

export class AuthenticationError extends CustomError {
  constructor(message: string = 'Authentication required', requestId?: string) {
    super(message, 'AUTHENTICATION_ERROR', 401, undefined, requestId)
  }
}

export class AuthorizationError extends CustomError {
  constructor(message: string = 'Access denied', requestId?: string) {
    super(message, 'AUTHORIZATION_ERROR', 403, undefined, requestId)
  }
}

export class NotFoundError extends CustomError {
  constructor(message: string = 'Resource not found', requestId?: string) {
    super(message, 'NOT_FOUND_ERROR', 404, undefined, requestId)
  }
}

export class ConflictError extends CustomError {
  constructor(message: string, details?: any, requestId?: string) {
    super(message, 'CONFLICT_ERROR', 409, details, requestId)
  }
}

export class RateLimitError extends CustomError {
  constructor(message: string = 'Rate limit exceeded', requestId?: string) {
    super(message, 'RATE_LIMIT_ERROR', 429, undefined, requestId)
  }
}

// Error handler for API routes
export function handleApiError(error: any, requestId?: string): AppError {
  // Log error for monitoring
  console.error('API Error:', {
    error: error.message,
    stack: error.stack,
    requestId,
    timestamp: new Date().toISOString()
  })

  // Return appropriate error response
  if (error instanceof CustomError) {
    return {
      code: error.code,
      message: error.message,
      statusCode: error.statusCode,
      details: error.details,
      timestamp: error.timestamp,
      requestId: error.requestId || requestId
    }
  }

  // Handle known error types
  if (error.name === 'ValidationError') {
    return {
      code: 'VALIDATION_ERROR',
      message: error.message,
      statusCode: 400,
      details: error.details,
      timestamp: new Date().toISOString(),
      requestId
    }
  }

  if (error.name === 'UnauthorizedError') {
    return {
      code: 'AUTHENTICATION_ERROR',
      message: 'Authentication required',
      statusCode: 401,
      timestamp: new Date().toISOString(),
      requestId
    }
  }

  // Default to internal server error
  return {
    code: 'INTERNAL_ERROR',
    message: process.env.NODE_ENV === 'production' 
      ? 'An internal error occurred' 
      : error.message,
    statusCode: 500,
    timestamp: new Date().toISOString(),
    requestId
  }
}

// Error boundary for React components
export function createErrorBoundary() {
  return class ErrorBoundary extends React.Component<
    { children: React.ReactNode },
    { hasError: boolean; error?: Error }
  > {
    constructor(props: { children: React.ReactNode }) {
      super(props)
      this.state = { hasError: false }
    }

    static getDerivedStateFromError(error: Error) {
      return { hasError: true, error }
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
      // Log error to monitoring service
      console.error('React Error Boundary:', {
        error: error.message,
        stack: error.stack,
        componentStack: errorInfo.componentStack,
        timestamp: new Date().toISOString()
      })
    }

    render() {
      if (this.state.hasError) {
        return (
          <div className="min-h-screen flex items-center justify-center bg-background">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-foreground mb-4">
                Something went wrong
              </h1>
              <p className="text-muted-foreground mb-4">
                We're sorry, but something unexpected happened.
              </p>
              <button
                onClick={() => this.setState({ hasError: false })}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
              >
                Try again
              </button>
            </div>
          </div>
        )
      }

      return this.props.children
    }
  }
}

// Utility functions
export function isClientError(statusCode: number): boolean {
  return statusCode >= 400 && statusCode < 500
}

export function isServerError(statusCode: number): boolean {
  return statusCode >= 500 && statusCode < 600
}

export function getErrorMessage(error: any): string {
  if (error instanceof CustomError) {
    return error.message
  }
  
  if (error.message) {
    return error.message
  }
  
  return 'An unexpected error occurred'
}

export function getErrorCode(error: any): string {
  if (error instanceof CustomError) {
    return error.code
  }
  
  return 'UNKNOWN_ERROR'
}
