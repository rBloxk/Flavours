import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(request: NextRequest) {
  try {
    const { messages, model } = await request.json()

    // Default to GPT-3.5-turbo for better compatibility and cost efficiency
    const selectedModel = model || 'gpt-3.5-turbo'

    console.log('OpenAI API call:', { 
      hasApiKey: !!process.env.OPENAI_API_KEY,
      model: selectedModel,
      messageCount: messages?.length 
    })

    if (!process.env.OPENAI_API_KEY) {
      console.error('OpenAI API key not configured')
      return NextResponse.json({ error: 'OpenAI API key not configured' }, { status: 500 })
    }

    if (!messages || !Array.isArray(messages)) {
      console.error('Invalid messages format:', messages)
      return NextResponse.json({ error: 'Messages must be an array' }, { status: 400 })
    }

    // Validate message structure
    const validMessages = messages.filter(msg => 
      msg && typeof msg === 'object' && 
      typeof msg.role === 'string' && 
      typeof msg.content === 'string'
    )

    if (validMessages.length === 0) {
      console.error('No valid messages found')
      return NextResponse.json({ error: 'No valid messages provided' }, { status: 400 })
    }

    const completion = await openai.chat.completions.create({
      model: selectedModel,
      messages: validMessages,
      max_tokens: 1000,
      temperature: 0.7,
      top_p: 1,
      frequency_penalty: 0,
      presence_penalty: 0,
    })

    console.log('OpenAI response received:', completion.choices?.length)
    
    if (!completion.choices || completion.choices.length === 0) {
      throw new Error('No completion choices returned')
    }

    return NextResponse.json({ 
      choices: completion.choices,
      usage: completion.usage,
      model: completion.model 
    })
  } catch (error: any) {
    console.error('OpenAI API error details:', error)
    
    // Handle specific error types
    if (error.code === 'insufficient_quota') {
      return NextResponse.json({ 
        error: 'API quota exceeded', 
        details: 'You have exceeded your OpenAI API quota. Please check your billing details.',
        code: 'quota_exceeded'
      }, { status: 429 })
    }
    
    if (error.code === 'model_not_found') {
      return NextResponse.json({ 
        error: 'Model not available', 
        details: `The model '${error.param || 'unknown'}' is not available or you don't have access to it.`,
        code: 'model_not_found'
      }, { status: 404 })
    }
    
    if (error.code === 'rate_limit_exceeded') {
      return NextResponse.json({ 
        error: 'Rate limit exceeded', 
        details: 'Too many requests. Please try again later.',
        code: 'rate_limit'
      }, { status: 429 })
    }

    return NextResponse.json({ 
      error: 'Failed to get AI response', 
      details: error.message || 'Unknown error occurred',
      code: error.code || 'unknown_error'
    }, { status: 500 })
  }
}
