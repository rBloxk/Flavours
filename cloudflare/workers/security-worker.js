// Cloudflare Security Worker for Flavours Platform
// This worker provides additional security layers and threat detection

addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

async function handleRequest(request) {
  const url = new URL(request.url)
  const clientIP = request.headers.get('CF-Connecting-IP')
  const userAgent = request.headers.get('User-Agent')
  const country = request.cf.country
  const threatScore = request.cf.threat_score || 0
  const botScore = request.cf.bot_score || 0

  // Security checks
  const securityCheck = await performSecurityChecks({
    url,
    clientIP,
    userAgent,
    country,
    threatScore,
    botScore,
    request
  })

  if (securityCheck.block) {
    return new Response(securityCheck.reason, {
      status: securityCheck.status || 403,
      headers: {
        'Content-Type': 'text/plain',
        'X-Security-Reason': securityCheck.reason
      }
    })
  }

  // Add security headers
  const modifiedRequest = addSecurityHeaders(request)
  
  // Forward request to origin
  const response = await fetch(modifiedRequest)
  
  // Add response security headers
  const modifiedResponse = addResponseSecurityHeaders(response)
  
  return modifiedResponse
}

async function performSecurityChecks({ url, clientIP, userAgent, country, threatScore, botScore, request }) {
  // Check for high threat score
  if (threatScore > 25) {
    return {
      block: true,
      reason: 'High threat score detected',
      status: 403
    }
  }

  // Check for bot activity
  if (botScore > 30) {
    return {
      block: true,
      reason: 'Bot activity detected',
      status: 403
    }
  }

  // Check for suspicious countries
  const blockedCountries = ['CN', 'RU', 'KP', 'IR']
  if (blockedCountries.includes(country)) {
    return {
      block: true,
      reason: 'Access blocked from this region',
      status: 403
    }
  }

  // Check for malicious user agents
  const maliciousPatterns = [
    /sqlmap/i,
    /nikto/i,
    /nmap/i,
    /masscan/i,
    /zap/i,
    /burp/i,
    /wget/i,
    /curl/i
  ]

  if (maliciousPatterns.some(pattern => pattern.test(userAgent))) {
    return {
      block: true,
      reason: 'Malicious user agent detected',
      status: 403
    }
  }

  // Check for SQL injection attempts
  const sqlPatterns = [
    /union\s+select/i,
    /drop\s+table/i,
    /insert\s+into/i,
    /delete\s+from/i,
    /update\s+set/i,
    /or\s+1=1/i,
    /and\s+1=1/i
  ]

  const urlString = url.toString()
  if (sqlPatterns.some(pattern => pattern.test(urlString))) {
    return {
      block: true,
      reason: 'SQL injection attempt detected',
      status: 403
    }
  }

  // Check for XSS attempts
  const xssPatterns = [
    /<script/i,
    /javascript:/i,
    /onload=/i,
    /onerror=/i,
    /onclick=/i,
    /onmouseover=/i
  ]

  if (xssPatterns.some(pattern => pattern.test(urlString))) {
    return {
      block: true,
      reason: 'XSS attempt detected',
      status: 403
    }
  }

  // Check for path traversal
  if (urlString.includes('../') || urlString.includes('..\\')) {
    return {
      block: true,
      reason: 'Path traversal attempt detected',
      status: 403
    }
  }

  // Check for admin brute force
  if (url.pathname.includes('/admin') && threatScore > 10) {
    return {
      block: true,
      reason: 'Admin access blocked due to high threat score',
      status: 403
    }
  }

  // Rate limiting for API endpoints
  if (url.pathname.startsWith('/api/')) {
    const rateLimitCheck = await checkRateLimit(clientIP, url.pathname)
    if (!rateLimitCheck.allowed) {
      return {
        block: true,
        reason: 'Rate limit exceeded',
        status: 429
      }
    }
  }

  return { block: false }
}

function addSecurityHeaders(request) {
  const newHeaders = new Headers(request.headers)
  
  // Add security headers
  newHeaders.set('X-Forwarded-Proto', 'https')
  newHeaders.set('X-Real-IP', request.headers.get('CF-Connecting-IP'))
  newHeaders.set('X-Forwarded-For', request.headers.get('CF-Connecting-IP'))
  
  return new Request(request, {
    headers: newHeaders
  })
}

function addResponseSecurityHeaders(response) {
  const newHeaders = new Headers(response.headers)
  
  // Security headers
  newHeaders.set('X-Frame-Options', 'SAMEORIGIN')
  newHeaders.set('X-Content-Type-Options', 'nosniff')
  newHeaders.set('X-XSS-Protection', '1; mode=block')
  newHeaders.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  newHeaders.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()')
  
  // CSP for additional security
  newHeaders.set('Content-Security-Policy', 
    "default-src 'self'; " +
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net; " +
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; " +
    "font-src 'self' https://fonts.gstatic.com; " +
    "img-src 'self' data: https: blob:; " +
    "media-src 'self' https: blob:; " +
    "connect-src 'self' https: wss:; " +
    "frame-src 'none'; " +
    "object-src 'none'; " +
    "base-uri 'self'; " +
    "form-action 'self'"
  )
  
  // HSTS
  newHeaders.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload')
  
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: newHeaders
  })
}

// Rate limiting using Cloudflare KV
async function checkRateLimit(clientIP, endpoint) {
  const key = `rate_limit:${clientIP}:${endpoint}`
  const now = Date.now()
  const windowMs = 60000 // 1 minute
  const maxRequests = 60

  try {
    const stored = await RATE_LIMIT_KV.get(key)
    let requests = stored ? JSON.parse(stored) : []
    
    // Remove old requests outside the window
    requests = requests.filter(timestamp => now - timestamp < windowMs)
    
    if (requests.length >= maxRequests) {
      return { allowed: false }
    }
    
    // Add current request
    requests.push(now)
    
    // Store updated requests
    await RATE_LIMIT_KV.put(key, JSON.stringify(requests), {
      expirationTtl: Math.ceil(windowMs / 1000)
    })
    
    return { allowed: true }
  } catch (error) {
    // If KV fails, allow the request but log the error
    console.error('Rate limit check failed:', error)
    return { allowed: true }
  }
}

// Additional security functions
function isTorExitNode(request) {
  return request.cf.tor_guard === true
}

function isVPNOrProxy(request) {
  return request.cf.threat_score > 20
}

function isSuspiciousLocation(request) {
  const suspiciousCountries = ['CN', 'RU', 'KP', 'IR']
  return suspiciousCountries.includes(request.cf.country)
}

function isMaliciousUserAgent(userAgent) {
  const maliciousPatterns = [
    /sqlmap/i,
    /nikto/i,
    /nmap/i,
    /masscan/i,
    /zap/i,
    /burp/i,
    /wget/i,
    /curl/i,
    /python-requests/i,
    /go-http-client/i,
    /java/i,
    /libwww-perl/i
  ]
  
  return maliciousPatterns.some(pattern => pattern.test(userAgent))
}

function detectAttackPatterns(url) {
  const attackPatterns = [
    // SQL Injection
    /union\s+select/i,
    /drop\s+table/i,
    /insert\s+into/i,
    /delete\s+from/i,
    /update\s+set/i,
    /or\s+1=1/i,
    /and\s+1=1/i,
    /'\s+or\s+'/i,
    /"\s+or\s+"/i,
    
    // XSS
    /<script/i,
    /javascript:/i,
    /onload=/i,
    /onerror=/i,
    /onclick=/i,
    /onmouseover=/i,
    /alert\(/i,
    /document\.cookie/i,
    
    // Path Traversal
    /\.\.\//,
    /\.\.\\/,
    /\.\.%2f/i,
    /\.\.%5c/i,
    
    // Command Injection
    /;.*cat/i,
    /;.*ls/i,
    /;.*rm/i,
    /;.*wget/i,
    /;.*curl/i,
    
    // LDAP Injection
    /\(&/i,
    /\(|/i,
    /\)/i,
    
    // NoSQL Injection
    /\$where/i,
    /\$ne/i,
    /\$gt/i,
    /\$lt/i,
    /\$regex/i
  ]
  
  return attackPatterns.some(pattern => pattern.test(url))
}

// Export functions for testing
export {
  performSecurityChecks,
  addSecurityHeaders,
  addResponseSecurityHeaders,
  checkRateLimit,
  isTorExitNode,
  isVPNOrProxy,
  isSuspiciousLocation,
  isMaliciousUserAgent,
  detectAttackPatterns
}
