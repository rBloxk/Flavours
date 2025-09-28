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
  SortDesc,
  UserCheck
} from 'lucide-react'

// Mock data for following
const mockFollowing = [
  {
    id: '1',
    username: 'tech_reviewer',
    display_name: 'Tech Reviewer Pro',
    avatar_url: 'https://ui-avatars.com/api/?name=Tech+Reviewer&background=random',
    bio: 'Latest tech reviews and gadget unboxings 📱',
    location: 'San Francisco, CA',
    is_verified: true,
    is_creator: true,
    followers_count: 250000,
    following_count: 1200,
    posts_count: 456,
    joined_date: '2022-01-15',
    followed_date: '2023-12-20',
    mutual_followers: 15,
    is_following_back: true,
    interests: ['Technology', 'Gadgets', 'Reviews']
  },
  {
    id: '2',
    username: 'travel_blogger',
    display_name: 'Wanderlust Adventures',
    avatar_url: 'https://ui-avatars.com/api/?name=Travel+Blogger&background=random',
    bio: 'Exploring the world one destination at a time ✈️',
    location: 'Global',
    is_verified: true,
    is_creator: true,
    followers_count: 180000,
    following_count: 800,
    posts_count: 234,
    joined_date: '2021-06-10',
    followed_date: '2023-11-15',
    mutual_followers: 8,
    is_following_back: true,
    interests: ['Travel', 'Photography', 'Adventure']
  },
  {
    id: '3',
    username: 'fitness_coach',
    display_name: 'FitLife Coach',
    avatar_url: 'https://ui-avatars.com/api/?name=Fitness+Coach&background=random',
    bio: 'Helping you achieve your fitness goals with science-based training',
    location: 'Austin, TX',
    is_verified: false,
    is_creator: true,
    followers_count: 95000,
    following_count: 456,
    posts_count: 189,
    joined_date: '2022-09-05',
    followed_date: '2023-10-30',
    mutual_followers: 12,
    is_following_back: true,
    interests: ['Fitness', 'Nutrition', 'Wellness']
  },
  {
    id: '4',
    username: 'art_gallery',
    display_name: 'Modern Art Gallery',
    avatar_url: 'https://ui-avatars.com/api/?name=Art+Gallery&background=random',
    bio: 'Contemporary art exhibitions and artist spotlights',
    location: 'New York, NY',
    is_verified: true,
    is_creator: false,
    followers_count: 67000,
    following_count: 234,
    posts_count: 123,
    joined_date: '2021-03-20',
    followed_date: '2023-09-25',
    mutual_followers: 5,
    is_following_back: false,
    interests: ['Art', 'Culture', 'Exhibitions']
  },
  {
    id: '5',
    username: 'music_producer',
    display_name: 'BeatMaker Studio',
    avatar_url: 'https://ui-avatars.com/api/?name=Music+Producer&background=random',
    bio: 'Creating beats and producing tracks for artists worldwide',
    location: 'Los Angeles, CA',
    is_verified: false,
    is_creator: true,
    followers_count: 78000,
    following_count: 345,
    posts_count: 167,
    joined_date: '2022-05-12',
    followed_date: '2023-08-18',
    mutual_followers: 9,
    is_following_back: true,
    interests: ['Music', 'Production', 'Beats']
  },
  {
    id: '6',
    username: 'food_critic',
    display_name: 'Foodie Explorer',
    avatar_url: 'https://ui-avatars.com/api/?name=Food+Critic&background=random',
    bio: 'Restaurant reviews and culinary adventures',
    location: 'Chicago, IL',
    is_verified: true,
    is_creator: true,
    followers_count: 145000,
    following_count: 567,
    posts_count: 298,
    joined_date: '2021-11-08',
    followed_date: '2023-07-12',
    mutual_followers: 6,
    is_following_back: false,
    interests: ['Food', 'Restaurants', 'Cooking']
  }
]

export default function FollowingPage() {
  const params = useParams()
  const router = useRouter()
  const username = params.username as string
  
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState('recent')
  const [filterBy, setFilterBy] = useState('all')
  const [following, setFollowing] = useState(mockFollowing)
  const [isLoading, setIsLoading] = useState(false)

  // Filter and search following
  const filteredFollowing = following.filter(user => {
    const matchesSearch = user.display_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         user.bio.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesFilter = filterBy === 'all' || 
                         (filterBy === 'verified' && user.is_verified) ||
                         (filterBy === 'creators' && user.is_creator) ||
                         (filterBy === 'mutual' && user.mutual_followers > 0) ||
                         (filterBy === 'following_back' && user.is_following_back)
    
    return matchesSearch && matchesFilter
  })

  // Sort following
  const sortedFollowing = [...filteredFollowing].sort((a, b) => {
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

  const handleUnfollow = async (userId: string) => {
    setIsLoading(true)
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      setFollowing(prev => prev.filter(user => user.id !== userId))
    } catch (error) {
      console.error('Error unfollowing user:', error)
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
          <h1 className="text-3xl font-bold">Following</h1>
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
                placeholder="Search following..."
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
                  <TabsTrigger value="following_back">Following Back</TabsTrigger>
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

      {/* Following List */}
      <div className="space-y-4">
        {sortedFollowing.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-12">
                <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No following found</h3>
                <p className="text-muted-foreground">
                  {searchQuery ? 'Try adjusting your search terms' : 'No following to display'}
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          sortedFollowing.map((user) => (
            <Card key={user.id} className="hover:shadow-md transition-shadow">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4 flex-1">
                    <Avatar 
                      className="h-16 w-16 cursor-pointer" 
                      onClick={() => handleUserClick(user.username)}
                    >
                      <AvatarImage src={user.avatar_url} alt={user.display_name} />
                      <AvatarFallback className="text-lg">
                        {user.display_name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center space-x-2">
                        <h3 
                          className="font-semibold text-lg cursor-pointer hover:text-primary"
                          onClick={() => handleUserClick(user.username)}
                        >
                          {user.display_name}
                        </h3>
                        {user.is_verified && (
                          <Shield className="h-4 w-4 text-blue-600" />
                        )}
                        {user.is_creator && (
                          <Crown className="h-4 w-4 text-purple-600" />
                        )}
                        {user.is_following_back && (
                          <UserCheck className="h-4 w-4 text-green-600" />
                        )}
                      </div>
                      
                      <p className="text-muted-foreground">@{user.username}</p>
                      
                      {user.bio && (
                        <p className="text-sm">{user.bio}</p>
                      )}
                      
                      <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                        {user.location && (
                          <div className="flex items-center space-x-1">
                            <MapPin className="h-4 w-4" />
                            <span>{user.location}</span>
                          </div>
                        )}
                        <div className="flex items-center space-x-1">
                          <Calendar className="h-4 w-4" />
                          <span>Followed {new Date(user.followed_date).toLocaleDateString()}</span>
                        </div>
                        {user.mutual_followers > 0 && (
                          <div className="flex items-center space-x-1">
                            <Users className="h-4 w-4" />
                            <span>{user.mutual_followers} mutual followers</span>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex items-center space-x-4 text-sm">
                        <span className="font-medium">{user.followers_count.toLocaleString()} followers</span>
                        <span className="font-medium">{user.posts_count} posts</span>
                        {user.is_following_back && (
                          <Badge variant="secondary" className="text-xs">
                            Follows you back
                          </Badge>
                        )}
                      </div>
                      
                      {user.interests && user.interests.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {user.interests.slice(0, 3).map((interest, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {interest}
                            </Badge>
                          ))}
                          {user.interests.length > 3 && (
                            <Badge variant="secondary" className="text-xs">
                              +{user.interests.length - 3} more
                            </Badge>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex flex-col space-y-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleUnfollow(user.id)}
                      disabled={isLoading}
                      className="min-w-[100px] text-red-600 hover:text-red-700 hover:border-red-300"
                    >
                      <UserMinus className="h-4 w-4 mr-2" />
                      Unfollow
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
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold">{following.length}</div>
              <div className="text-sm text-muted-foreground">Total Following</div>
            </div>
            <div>
              <div className="text-2xl font-bold">
                {following.filter(f => f.is_verified).length}
              </div>
              <div className="text-sm text-muted-foreground">Verified</div>
            </div>
            <div>
              <div className="text-2xl font-bold">
                {following.filter(f => f.is_creator).length}
              </div>
              <div className="text-sm text-muted-foreground">Creators</div>
            </div>
            <div>
              <div className="text-2xl font-bold">
                {following.filter(f => f.mutual_followers > 0).length}
              </div>
              <div className="text-sm text-muted-foreground">Mutual</div>
            </div>
            <div>
              <div className="text-2xl font-bold">
                {following.filter(f => f.is_following_back).length}
              </div>
              <div className="text-sm text-muted-foreground">Following Back</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
