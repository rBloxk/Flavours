import React from 'react'
import { PostPageClient } from './post-page-client'

// Generate static params for all possible post IDs
export async function generateStaticParams() {
  // In a real app, this would fetch from your API/database
  // Include all post IDs from our mock data
  const postIds = ['1', '2', '3', '4', '5', '6']
  
  return postIds.map((id) => ({
    id: id,
  }))
}

export default function PostPage() {
  return <PostPageClient />
}
