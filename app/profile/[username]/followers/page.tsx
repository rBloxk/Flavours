'use client'

import React, { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  ArrowLeft, 
  Search, 
  Users, 
  UserPlus, 
  UserMinus, 
  Crown, 
  Shield,
  Calendar,
  MapPin,
  Heart,
  MessageCircle,
  Share2,
  Filter,
  SortAsc,
  SortDesc
} from 'lucide-react'

// Mock data for followers
const mockFollowers = [
  {
    id: '1',
    username: 'sarah_fitness',
    display_name: 'Sarah Johnson',
    avatar_url: 'https://ui-avatars.com/api/?name=Sarah+Johnson&background=random',
    bio: 'Certified personal trainer helping you achieve your fitness goals 💪',
    location: 'Los Angeles, CA',
    is_verified: true,
    is_creator: true,
    followers_count: 125000,
    following_count: 856,
    posts_count: 342,
    joined_date: '2023-01-15',
    followed_date: '2024-01-10',
    mutual_followers: 12,
    is_following_back: false,
    interests: ['Fitness', 'Health', 'Nutrition']
  },
  {
    id: '2',
    username: 'alex_artist',
    display_name: 'Alex Chen',
    avatar_url: 'https://ui-avatars.com/api/?name=Alex+Chen&background=random',
    bio: 'Digital artist creating stunning visual experiences',
    location: 'New York, NY',
    is_verified: true,
    is_creator: true,
    followers_count: 89000,
    following_count: 1200,
    posts_count: 156,
    joined_date: '2022-08-20',
    followed_date: '2024-01-08',
    mutual_followers: 8,
    is_following_back: true,
    interests: ['Art', 'Design', 'Digital Media']
  },
  {
    id: '3',
    username: 'maya_cooking',
    display_name: 'Maya Rodriguez',
    avatar_url: 'https://ui-avatars.com/api/?name=Maya+Rodriguez&background=random',
    bio: 'Chef sharing authentic recipes and cooking tips',
    location: 'Miami, FL',
    is_verified: true,
    is_creator: true,
    followers_count: 156000,
    following_count: 234,
    posts_count: 89,
    joined_date: '2023-03-10',
    followed_date: '2024-01-05',
    mutual_followers: 5,
    is_following_back: false,
    interests: ['Cooking', 'Food', 'Recipes']
  },
  {
    id: '4',
    username: 'david_photography',
    display_name: 'David Kim',
    avatar_url: 'https://ui-avatars.com/api/?name=David+Kim&background=random',
    bio: 'Professional photographer capturing life\'s beautiful moments',
    location: 'Seattle, WA',
    is_verified: false,
    is_creator: false,
    followers_count: 45000,
    following_count: 567,
    posts_count: 234,
    joined_date: '2023-06-15',
    followed_date: '2024-01-03',
    mutual_followers: 3,
    is_following_back: true,
    interests: ['Photography', 'Travel', 'Nature']
  },
  {
    id: '5',
    username: 'lisa_music',
    display_name: 'Lisa Thompson',
    avatar_url: 'https://ui-avatars.com/api/?name=Lisa+Thompson&background=random',
    bio: 'Musician and songwriter sharing original compositions',
    location: 'Nashville, TN',
    is_verified: false,
    is_creator: true,
    followers_count: 67000,
    following_count: 345,
    posts_count: 178,
    joined_date: '2023-09-22',
    followed_date: '2024-01-01',
    mutual_followers: 7,
    is_following_back: false,
    interests: ['Music', 'Songwriting', 'Guitar']
  }
]

export default function FollowersPage() {
  const params = useParams()
  const router = useRouter()
  const username = params.username as string
  
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState('recent')
  const [filterBy, setFilterBy] = useState('all')
  const [followers, setFollowers] = useState(mockFollowers)
  const [isLoading, setIsLoading] = useState(false)

  // Filter and search followers
  const filteredFollowers = followers.filter(follower => {
    const matchesSearch = follower.display_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         follower.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         follower.bio.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesFilter = filterBy === 'all' || 
                         (filterBy === 'verified' && follower.is_verified) ||
                         (filterBy === 'creators' && follower.is_creator) ||
                         (filterBy === 'mutual' && follower.mutual_followers > 0)
    
    return matchesSearch && matchesFilter
  })

  // Sort followers
  const sortedFollowers = [...filteredFollowers].sort((a, b) => {
    switch (sortBy) {
      case 'recent':
        return new Date(b.followed_date).getTime() - new Date(a.followed_date).getTime()
      case 'name':
        return a.display_name.localeCompare(b.display_name)
      case 'followers':
        return b.followers_count - a.followers_count
      case 'mutual':
        return b.mutual_followers - a.mutual_followers
      default:
        return 0
    }
  })

  const handleFollowToggle = async (followerId: string) => {
    setIsLoading(true)
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      setFollowers(prev => prev.map(follower => 
        follower.id === followerId 
          ? { ...follower, is_following_back: !follower.is_following_back }
          : follower
      ))
    } catch (error) {
      console.error('Error toggling follow:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleUserClick = (username: string) => {
    router.push(`/profile/${username}`)
  }

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => router.back()}
          className="flex items-center space-x-2"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back</span>
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Followers</h1>
          <p className="text-muted-foreground">@{username}</p>
        </div>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search followers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <Tabs value={filterBy} onValueChange={setFilterBy}>
                <TabsList>
                  <TabsTrigger value="all">All</TabsTrigger>
                  <TabsTrigger value="verified">Verified</TabsTrigger>
                  <TabsTrigger value="creators">Creators</TabsTrigger>
                  <TabsTrigger value="mutual">Mutual</TabsTrigger>
                </TabsList>
              </Tabs>
              <Tabs value={sortBy} onValueChange={setSortBy}>
                <TabsList>
                  <TabsTrigger value="recent">Recent</TabsTrigger>
                  <TabsTrigger value="name">Name</TabsTrigger>
                  <TabsTrigger value="followers">Followers</TabsTrigger>
                  <TabsTrigger value="mutual">Mutual</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Followers List */}
      <div className="space-y-4">
        {sortedFollowers.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-12">
                <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No followers found</h3>
                <p className="text-muted-foreground">
                  {searchQuery ? 'Try adjusting your search terms' : 'No followers to display'}
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          sortedFollowers.map((follower) => (
            <Card key={follower.id} className="hover:shadow-md transition-shadow">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4 flex-1">
                    <Avatar 
                      className="h-16 w-16 cursor-pointer" 
                      onClick={() => handleUserClick(follower.username)}
                    >
                      <AvatarImage src={follower.avatar_url} alt={follower.display_name} />
                      <AvatarFallback className="text-lg">
                        {follower.display_name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center space-x-2">
                        <h3 
                          className="font-semibold text-lg cursor-pointer hover:text-primary"
                          onClick={() => handleUserClick(follower.username)}
                        >
                          {follower.display_name}
                        </h3>
                        {follower.is_verified && (
                          <Shield className="h-4 w-4 text-blue-600" />
                        )}
                        {follower.is_creator && (
                          <Crown className="h-4 w-4 text-purple-600" />
                        )}
                      </div>
                      
                      <p className="text-muted-foreground">@{follower.username}</p>
                      
                      {follower.bio && (
                        <p className="text-sm">{follower.bio}</p>
                      )}
                      
                      <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                        {follower.location && (
                          <div className="flex items-center space-x-1">
                            <MapPin className="h-4 w-4" />
                            <span>{follower.location}</span>
                          </div>
                        )}
                        <div className="flex items-center space-x-1">
                          <Calendar className="h-4 w-4" />
                          <span>Followed you {new Date(follower.followed_date).toLocaleDateString()}</span>
                        </div>
                        {follower.mutual_followers > 0 && (
                          <div className="flex items-center space-x-1">
                            <Users className="h-4 w-4" />
                            <span>{follower.mutual_followers} mutual followers</span>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex items-center space-x-4 text-sm">
                        <span className="font-medium">{follower.followers_count.toLocaleString()} followers</span>
                        <span className="font-medium">{follower.posts_count} posts</span>
                      </div>
                      
                      {follower.interests && follower.interests.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {follower.interests.slice(0, 3).map((interest, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {interest}
                            </Badge>
                          ))}
                          {follower.interests.length > 3 && (
                            <Badge variant="secondary" className="text-xs">
                              +{follower.interests.length - 3} more
                            </Badge>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex flex-col space-y-2">
                    <Button
                      variant={follower.is_following_back ? "outline" : "default"}
                      size="sm"
                      onClick={() => handleFollowToggle(follower.id)}
                      disabled={isLoading}
                      className="min-w-[100px]"
                    >
                      {follower.is_following_back ? (
                        <>
                          <UserMinus className="h-4 w-4 mr-2" />
                          Following
                        </>
                      ) : (
                        <>
                          <UserPlus className="h-4 w-4 mr-2" />
                          Follow Back
                        </>
                      )}
                    </Button>
                    
                    <div className="flex space-x-1">
                      <Button variant="ghost" size="sm" className="flex-1">
                        <MessageCircle className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" className="flex-1">
                        <Share2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Stats Summary */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold">{followers.length}</div>
              <div className="text-sm text-muted-foreground">Total Followers</div>
            </div>
            <div>
              <div className="text-2xl font-bold">
                {followers.filter(f => f.is_verified).length}
              </div>
              <div className="text-sm text-muted-foreground">Verified</div>
            </div>
            <div>
              <div className="text-2xl font-bold">
                {followers.filter(f => f.is_creator).length}
              </div>
              <div className="text-sm text-muted-foreground">Creators</div>
            </div>
            <div>
              <div className="text-2xl font-bold">
                {followers.filter(f => f.mutual_followers > 0).length}
              </div>
              <div className="text-sm text-muted-foreground">Mutual</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
