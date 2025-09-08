import React from 'react'
import { ProfilePageClient } from './profile-page-client'

// Generate static params for all possible usernames
export async function generateStaticParams() {
  // In a real app, this would fetch from your API/database
  const usernames = [
    'photographer_sarah',
    'chef_mike',
    'jane_fitness',
    'artist_maya',
    'chef_marco'
  ]
  
  return usernames.map((username) => ({
    username: username,
  }))
}

export default function ProfilePage() {
  return <ProfilePageClient />
}
