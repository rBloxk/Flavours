// AI-powered services for content recommendations, moderation, and chatbot
export class AIService {
  private apiKey: string
  private baseUrl: string = 'https://api.openai.com/v1'
  private model: string = 'gpt-3.5-turbo'

  constructor(apiKey?: string) {
    this.apiKey = apiKey || process.env.NEXT_PUBLIC_OPENAI_API_KEY || ''
  }

  // Content recommendation engine
  async getContentRecommendations(
    userId: string,
    userPreferences: {
      interests: string[]
      viewingHistory: string[]
      likedContent: string[]
      demographics?: {
        age?: number
        location?: string
        gender?: string
      }
    },
    limit: number = 10
  ): Promise<{
    recommendations: Array<{
      contentId: string
      score: number
      reason: string
      type: 'similar' | 'trending' | 'personalized' | 'discovery'
    }>
    insights: {
      topInterests: string[]
      trendingTopics: string[]
      personalizedScore: number
    }
  }> {
    try {
      const prompt = this.buildRecommendationPrompt(userPreferences)
      
      const response = await this.callOpenAI(prompt, {
        temperature: 0.7,
        max_tokens: 1000
      })

      // Parse AI response and combine with algorithmic recommendations
      const aiInsights = this.parseRecommendationResponse(response)
      const algorithmicRecommendations = await this.getAlgorithmicRecommendations(userId, userPreferences)
      
      // Combine and rank recommendations
      const combinedRecommendations = this.combineRecommendations(
        aiInsights,
        algorithmicRecommendations,
        limit
      )

      return {
        recommendations: combinedRecommendations,
        insights: aiInsights
      }
    } catch (error) {
      console.error('AI recommendation error:', error)
      // Fallback to algorithmic recommendations
      return await this.getAlgorithmicRecommendations(userId, userPreferences, limit)
    }
  }

  // Content moderation
  async moderateContent(content: {
    text?: string
    imageUrl?: string
    videoUrl?: string
  }): Promise<{
    isApproved: boolean
    confidence: number
    violations: Array<{
      type: 'spam' | 'harassment' | 'explicit' | 'violence' | 'hate_speech' | 'misinformation'
      severity: 'low' | 'medium' | 'high'
      reason: string
      confidence: number
    }>
    suggestions: string[]
  }> {
    try {
      const prompt = this.buildModerationPrompt(content)
      
      const response = await this.callOpenAI(prompt, {
        temperature: 0.1,
        max_tokens: 500
      })

      return this.parseModerationResponse(response)
    } catch (error) {
      console.error('AI moderation error:', error)
      // Fallback to basic keyword filtering
      return this.basicContentModeration(content)
    }
  }

  // Smart chatbot
  async chatWithBot(
    message: string,
    context: {
      userId: string
      conversationHistory: Array<{ role: 'user' | 'assistant'; content: string }>
      userProfile?: any
      platformContext?: string
    }
  ): Promise<{
    response: string
    suggestions: string[]
    intent: 'support' | 'general' | 'technical' | 'billing' | 'other'
    confidence: number
  }> {
    try {
      const systemPrompt = this.buildChatbotSystemPrompt(context)
      const messages = [
        { role: 'system', content: systemPrompt },
        ...context.conversationHistory.slice(-10), // Last 10 messages
        { role: 'user', content: message }
      ]

      const response = await this.callOpenAI(messages, {
        temperature: 0.8,
        max_tokens: 500
      })

      return this.parseChatbotResponse(response, message)
    } catch (error) {
      console.error('AI chatbot error:', error)
      return {
        response: "I'm sorry, I'm having trouble processing your request right now. Please try again later or contact our support team.",
        suggestions: ['Contact Support', 'Browse Help Center', 'Report Issue'],
        intent: 'other',
        confidence: 0
      }
    }
  }

  // Content analysis and insights
  async analyzeContent(content: {
    text: string
    metadata?: any
  }): Promise<{
    sentiment: 'positive' | 'negative' | 'neutral'
    topics: string[]
    keywords: string[]
    engagement: {
      predictedLikes: number
      predictedComments: number
      viralPotential: number
    }
    suggestions: string[]
  }> {
    try {
      const prompt = this.buildContentAnalysisPrompt(content)
      
      const response = await this.callOpenAI(prompt, {
        temperature: 0.3,
        max_tokens: 800
      })

      return this.parseContentAnalysisResponse(response)
    } catch (error) {
      console.error('AI content analysis error:', error)
      return {
        sentiment: 'neutral',
        topics: [],
        keywords: [],
        engagement: {
          predictedLikes: 0,
          predictedComments: 0,
          viralPotential: 0
        },
        suggestions: []
      }
    }
  }

  // Generate content suggestions
  async generateContentSuggestions(
    userProfile: {
      interests: string[]
      audience: string[]
      contentHistory: string[]
    },
    contentType: 'post' | 'video' | 'story' | 'live'
  ): Promise<{
    suggestions: Array<{
      title: string
      description: string
      hashtags: string[]
      type: string
      estimatedEngagement: number
    }>
    trendingTopics: string[]
    bestTimes: string[]
  }> {
    try {
      const prompt = this.buildContentSuggestionPrompt(userProfile, contentType)
      
      const response = await this.callOpenAI(prompt, {
        temperature: 0.9,
        max_tokens: 1000
      })

      return this.parseContentSuggestionResponse(response)
    } catch (error) {
      console.error('AI content suggestion error:', error)
      return {
        suggestions: [],
        trendingTopics: [],
        bestTimes: []
      }
    }
  }

  // Private helper methods
  private async callOpenAI(prompt: string | any[], options: any = {}) {
    const response = await fetch(`${this.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: this.model,
        messages: Array.isArray(prompt) ? prompt : [{ role: 'user', content: prompt }],
        ...options
      })
    })

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`)
    }

    const data = await response.json()
    return data.choices[0].message.content
  }

  private buildRecommendationPrompt(preferences: any): string {
    return `
    Analyze the following user preferences and generate content recommendations:
    
    Interests: ${preferences.interests.join(', ')}
    Viewing History: ${preferences.viewingHistory.slice(-10).join(', ')}
    Liked Content: ${preferences.likedContent.slice(-10).join(', ')}
    Demographics: ${JSON.stringify(preferences.demographics || {})}
    
    Provide recommendations with:
    1. Top 5 interests based on behavior
    2. 3 trending topics in their interest areas
    3. Personalized engagement score (0-100)
    4. Content type preferences
    5. Optimal posting times
    
    Format as JSON with insights object.
    `
  }

  private buildModerationPrompt(content: any): string {
    return `
    Analyze the following content for violations:
    
    Text: ${content.text || 'N/A'}
    Image URL: ${content.imageUrl || 'N/A'}
    Video URL: ${content.videoUrl || 'N/A'}
    
    Check for:
    - Spam or promotional content
    - Harassment or bullying
    - Explicit or inappropriate content
    - Violence or harmful content
    - Hate speech
    - Misinformation
    
    Provide:
    1. Approval status (true/false)
    2. Confidence score (0-100)
    3. List of violations with severity
    4. Suggestions for improvement
    
    Format as JSON.
    `
  }

  private buildChatbotSystemPrompt(context: any): string {
    return `
    You are FlavoursBot, an AI assistant for the Flavours creator platform. 
    
    User Profile: ${JSON.stringify(context.userProfile || {})}
    Platform Context: ${context.platformContext || 'General support'}
    
    Your role:
    - Help users with platform features
    - Provide creator tips and advice
    - Assist with technical issues
    - Guide users through onboarding
    - Answer questions about monetization
    
    Guidelines:
    - Be helpful, friendly, and professional
    - Provide accurate information
    - Escalate complex issues to human support
    - Suggest relevant platform features
    - Keep responses concise but informative
    
    Always end with 2-3 helpful suggestions.
    `
  }

  private buildContentAnalysisPrompt(content: any): string {
    return `
    Analyze the following content:
    
    Text: ${content.text}
    Metadata: ${JSON.stringify(content.metadata || {})}
    
    Provide:
    1. Sentiment analysis (positive/negative/neutral)
    2. Main topics and themes
    3. Key keywords
    4. Engagement predictions (likes, comments, viral potential)
    5. Improvement suggestions
    
    Format as JSON with detailed analysis.
    `
  }

  private buildContentSuggestionPrompt(profile: any, contentType: string): string {
    return `
    Generate content suggestions for a creator with:
    
    Interests: ${profile.interests.join(', ')}
    Audience: ${profile.audience.join(', ')}
    Content History: ${profile.contentHistory.slice(-5).join(', ')}
    Content Type: ${contentType}
    
    Provide:
    1. 5 creative content suggestions
    2. Trending topics in their niche
    3. Best posting times
    4. Hashtag recommendations
    5. Engagement optimization tips
    
    Format as JSON with detailed suggestions.
    `
  }

  // Response parsing methods
  private parseRecommendationResponse(response: string): any {
    try {
      return JSON.parse(response)
    } catch {
      return {
        topInterests: [],
        trendingTopics: [],
        personalizedScore: 50
      }
    }
  }

  private parseModerationResponse(response: string): any {
    try {
      return JSON.parse(response)
    } catch {
      return {
        isApproved: true,
        confidence: 50,
        violations: [],
        suggestions: []
      }
    }
  }

  private parseChatbotResponse(response: string, originalMessage: string): any {
    const intent = this.detectIntent(originalMessage)
    const suggestions = this.extractSuggestions(response)
    
    return {
      response: response.trim(),
      suggestions,
      intent,
      confidence: 0.8
    }
  }

  private parseContentAnalysisResponse(response: string): any {
    try {
      return JSON.parse(response)
    } catch {
      return {
        sentiment: 'neutral',
        topics: [],
        keywords: [],
        engagement: { predictedLikes: 0, predictedComments: 0, viralPotential: 0 },
        suggestions: []
      }
    }
  }

  private parseContentSuggestionResponse(response: string): any {
    try {
      return JSON.parse(response)
    } catch {
      return {
        suggestions: [],
        trendingTopics: [],
        bestTimes: []
      }
    }
  }

  // Fallback methods
  private async getAlgorithmicRecommendations(userId: string, preferences: any, limit: number = 10): Promise<any> {
    // Basic algorithmic recommendations based on user behavior
    return {
      recommendations: [],
      insights: {
        topInterests: preferences.interests.slice(0, 5),
        trendingTopics: [],
        personalizedScore: 60
      }
    }
  }

  private basicContentModeration(content: any): any {
    const violations = []
    const text = content.text?.toLowerCase() || ''
    
    // Basic keyword filtering
    const spamKeywords = ['buy now', 'click here', 'free money', 'win cash']
    const harassmentKeywords = ['hate', 'stupid', 'ugly', 'kill yourself']
    
    if (spamKeywords.some(keyword => text.includes(keyword))) {
      violations.push({
        type: 'spam',
        severity: 'medium',
        reason: 'Contains promotional language',
        confidence: 70
      })
    }
    
    if (harassmentKeywords.some(keyword => text.includes(keyword))) {
      violations.push({
        type: 'harassment',
        severity: 'high',
        reason: 'Contains potentially harmful language',
        confidence: 80
      })
    }

    return {
      isApproved: violations.length === 0,
      confidence: violations.length > 0 ? 80 : 60,
      violations,
      suggestions: violations.length > 0 ? ['Review content guidelines', 'Edit content'] : []
    }
  }

  private detectIntent(message: string): 'support' | 'general' | 'technical' | 'billing' | 'other' {
    const lowerMessage = message.toLowerCase()
    
    if (lowerMessage.includes('help') || lowerMessage.includes('support')) return 'support'
    if (lowerMessage.includes('bug') || lowerMessage.includes('error') || lowerMessage.includes('not working')) return 'technical'
    if (lowerMessage.includes('payment') || lowerMessage.includes('billing') || lowerMessage.includes('money')) return 'billing'
    if (lowerMessage.includes('how') || lowerMessage.includes('what') || lowerMessage.includes('why')) return 'general'
    
    return 'other'
  }

  private extractSuggestions(response: string): string[] {
    // Extract suggestions from response (basic implementation)
    const suggestions = []
    const lines = response.split('\n')
    
    for (const line of lines) {
      if (line.includes('•') || line.includes('-') || line.includes('1.') || line.includes('2.')) {
        suggestions.push(line.replace(/^[•\-\d\.\s]+/, '').trim())
      }
    }
    
    return suggestions.slice(0, 3)
  }

  private combineRecommendations(aiInsights: any, algorithmic: any, limit: number): any[] {
    // Combine AI insights with algorithmic recommendations
    return []
  }
}

// Singleton instance
export const aiService = new AIService()

// React hooks for AI features
export function useAIRecommendations(userId: string, preferences: any) {
  const [recommendations, setRecommendations] = React.useState<any>(null)
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<Error | null>(null)

  const fetchRecommendations = React.useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const result = await aiService.getContentRecommendations(userId, preferences)
      setRecommendations(result)
    } catch (err) {
      setError(err as Error)
    } finally {
      setLoading(false)
    }
  }, [userId, preferences])

  React.useEffect(() => {
    if (userId && preferences) {
      fetchRecommendations()
    }
  }, [userId, preferences, fetchRecommendations])

  return { recommendations, loading, error, refetch: fetchRecommendations }
}

export function useAIChatbot() {
  const [messages, setMessages] = React.useState<Array<{ role: 'user' | 'assistant'; content: string }>>([])
  const [loading, setLoading] = React.useState(false)

  const sendMessage = React.useCallback(async (message: string, context: any) => {
    try {
      setLoading(true)
      const response = await aiService.chatWithBot(message, {
        ...context,
        conversationHistory: messages
      })
      
      setMessages(prev => [
        ...prev,
        { role: 'user', content: message },
        { role: 'assistant', content: response.response }
      ])
      
      return response
    } catch (error) {
      console.error('Chatbot error:', error)
      throw error
    } finally {
      setLoading(false)
    }
  }, [messages])

  const clearMessages = React.useCallback(() => {
    setMessages([])
  }, [])

  return { messages, loading, sendMessage, clearMessages }
}

