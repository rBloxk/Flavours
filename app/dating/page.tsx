"use client"

import React, { useState, useEffect } from 'react'
import { useAuth } from '@/components/providers/auth-provider'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Heart, MessageCircle, Star, MapPin, Calendar, Users, Filter, Settings } from 'lucide-react'
import { DatingProfileForm } from '@/components/dating/dating-profile-form'
import { DatingProfileCard } from '@/components/dating/dating-profile-card'
import { DatingFilters } from '@/components/dating/dating-filters'
import { DatingPrivacySettings } from '@/components/dating/dating-privacy-settings'
import { MatchNotification, MatchList } from '@/components/dating/match-notification'
import { DatingMatcher, DatingUtils } from '@/lib/dating-matching'
import { datingService, DatingMatch } from '@/lib/dating-service'

interface DatingProfile {
  id: string
  user_id: string
  display_name: string
  username: string
  avatar_url?: string
  age: number
  height: string
  location: string
  bio: string
  gender: string
  sexuality: string
  relationship_status: string
  education: string
  occupation: string
  interests: string[]
  photos: string[]
  is_verified: boolean
  is_online: boolean
  last_seen: string
  distance?: number
  compatibility_score?: number
}

export default function DatingPage() {
  const { user, profile } = useAuth()
  const [profiles, setProfiles] = useState<DatingProfile[]>([])
  const [filteredProfiles, setFilteredProfiles] = useState<DatingProfile[]>([])
  const [showProfileForm, setShowProfileForm] = useState(false)
  const [showFilters, setShowFilters] = useState(false)
  const [showPrivacySettings, setShowPrivacySettings] = useState(false)
  const [loading, setLoading] = useState(true)
  const [currentProfileIndex, setCurrentProfileIndex] = useState(0)
  const [userPreferences, setUserPreferences] = useState(DatingUtils.getDefaultPreferences(user?.id || ''))
  const [matches, setMatches] = useState<DatingMatch[]>([])
  const [currentMatch, setCurrentMatch] = useState<DatingMatch | null>(null)
  const [superLikesRemaining, setSuperLikesRemaining] = useState(5)
  const [isBoosted, setIsBoosted] = useState(false)
  const [showMatches, setShowMatches] = useState(false)

  // Mock data for demonstration
  const mockProfiles: DatingProfile[] = [
    {
      id: '1',
      user_id: 'user1',
      display_name: 'Emma',
      username: 'emma_rose',
      avatar_url: '/api/placeholder/300/400',
      age: 24,
      height: '5\'6"',
      weight: '125',
      location: 'New York, NY',
      hometown: 'Boston, MA',
      bio: 'Love traveling, photography, and trying new restaurants. Looking for someone to share adventures with!',
      gender: 'Female',
      sexuality: 'Straight',
      relationship_status: 'Single',
      education: 'Bachelor\'s Degree',
      occupation: 'Graphic Designer',
      college: 'NYU',
      work: 'Creative Studio',
      job_title: 'Senior Designer',
      interests: ['Photography', 'Travel', 'Food', 'Art'],
      photos: [
        'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=600&fit=crop&crop=face',
        'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=600&fit=crop&crop=face',
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=600&fit=crop&crop=face',
        'https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=400&h=600&fit=crop&crop=face'
      ],
      is_verified: true,
      is_online: true,
      last_seen: 'Online now',
      distance: 2.5,
      compatibility_score: 85,
      
      // My Info
      pronouns: 'she/her',
      birthday: '2000-03-15',
      ethnicity: 'White',
      
      // Status & More
      children: 'No children',
      family_plans: 'Wants marriage',
      pets: 'Has pets',
      religion: 'Christian',
      zodiac: 'Pisces',
      political_views: 'Liberal',
      interested_in: ['Travel', 'Art', 'Music', 'Fitness'],
      hobbies: ['Photography', 'Cooking', 'Yoga', 'Reading'],
      
      // Vices
      marijuana: 'Never',
      smoke: 'Never',
      drinks: 'Socially',
      drugs: 'Never',
      
      // Sexual Info
      body_count: '1-5',
      affairs: 'Never',
      sexual_desires: 'Looking for emotional connection and physical intimacy',
      fantasies: 'Romantic dinners, weekend getaways, exploring new places together',
      turn_ons: ['Intelligence', 'Sense of humor', 'Ambition', 'Kindness'],
      turn_offs: ['Arrogance', 'Dishonesty', 'Negativity'],
      fav_positions: ['Missionary', 'Cowgirl'],
      lasting_time: '10-20 minutes',
      number_of_rounds: '2',
      trends_i_like: ['Slow burn', 'Emotional connection', 'Foreplay'],
      
      languages_known: ['English', 'Spanish', 'French']
    },
    {
      id: '2',
      user_id: 'user2',
      display_name: 'Sophia',
      username: 'sophia_m',
      avatar_url: '/api/placeholder/300/400',
      age: 26,
      height: '5\'4"',
      weight: '115',
      location: 'Los Angeles, CA',
      hometown: 'San Diego, CA',
      bio: 'Fitness enthusiast, dog lover, and coffee addict. Let\'s grab a coffee and see where it goes!',
      gender: 'Female',
      sexuality: 'Straight',
      relationship_status: 'Single',
      education: 'Master\'s Degree',
      occupation: 'Marketing Manager',
      college: 'UCLA',
      work: 'Tech Startup',
      job_title: 'Senior Marketing Manager',
      interests: ['Fitness', 'Dogs', 'Coffee', 'Movies'],
      photos: [
        'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=400&h=600&fit=crop&crop=face',
        'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=400&h=600&fit=crop&crop=face',
        'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&h=600&fit=crop&crop=face',
        'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=400&h=600&fit=crop&crop=face',
        'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=600&fit=crop&crop=face',
        'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=400&h=600&fit=crop&crop=face'
      ],
      is_verified: false,
      is_online: false,
      last_seen: '2 hours ago',
      distance: 15.2,
      compatibility_score: 72,
      
      // My Info
      pronouns: 'she/her',
      birthday: '1998-07-22',
      ethnicity: 'Hispanic',
      
      // Status & More
      children: 'No children',
      family_plans: 'Open to marriage',
      pets: 'Has pets',
      religion: 'Catholic',
      zodiac: 'Cancer',
      political_views: 'Moderate',
      interested_in: ['Fitness', 'Travel', 'Food', 'Movies'],
      hobbies: ['Gym', 'Dog training', 'Coffee brewing', 'Netflix'],
      
      // Vices
      marijuana: 'Rarely',
      smoke: 'Never',
      drinks: 'Socially',
      drugs: 'Never',
      
      // Sexual Info
      body_count: '6-10',
      affairs: 'Never',
      sexual_desires: 'Looking for someone who shares my active lifestyle',
      fantasies: 'Morning workouts together, healthy cooking, beach walks',
      turn_ons: ['Fitness', 'Ambition', 'Loyalty', 'Adventure'],
      turn_offs: ['Laziness', 'Smoking', 'Dishonesty'],
      fav_positions: ['Doggy style', 'Standing'],
      lasting_time: '20-30 minutes',
      number_of_rounds: '3',
      trends_i_like: ['Quickies', 'Morning sex', 'Outdoor activities'],
      
      languages_known: ['English', 'Spanish']
    },
    {
      id: '3',
      user_id: 'user3',
      display_name: 'Alex',
      username: 'alex_j',
      avatar_url: '/api/placeholder/300/400',
      age: 28,
      height: '6\'0"',
      weight: '180',
      location: 'Chicago, IL',
      hometown: 'Detroit, MI',
      bio: 'Software engineer by day, musician by night. Looking for someone who appreciates both tech and creativity.',
      gender: 'Male',
      sexuality: 'Straight',
      relationship_status: 'Single',
      education: 'Bachelor\'s Degree',
      occupation: 'Software Engineer',
      college: 'University of Michigan',
      work: 'Tech Corp',
      job_title: 'Senior Software Engineer',
      interests: ['Music', 'Technology', 'Gaming', 'Cooking'],
      photos: [
        'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=600&fit=crop&crop=face',
        'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=600&fit=crop&crop=face',
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=600&fit=crop&crop=face',
        'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=600&fit=crop&crop=face',
        'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=400&h=600&fit=crop&crop=face',
        'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&h=600&fit=crop&crop=face'
      ],
      is_verified: true,
      is_online: true,
      last_seen: 'Online now',
      distance: 8.7,
      compatibility_score: 91,
      
      // My Info
      pronouns: 'he/him',
      birthday: '1996-11-08',
      ethnicity: 'Mixed',
      
      // Status & More
      children: 'No children',
      family_plans: 'Wants marriage',
      pets: 'Wants pets',
      religion: 'Agnostic',
      zodiac: 'Scorpio',
      political_views: 'Liberal',
      interested_in: ['Technology', 'Music', 'Gaming', 'Art'],
      hobbies: ['Guitar', 'Coding', 'Gaming', 'Cooking'],
      
      // Vices
      marijuana: 'Occasionally',
      smoke: 'Never',
      drinks: 'Regularly',
      drugs: 'Never',
      
      // Sexual Info
      body_count: '11-20',
      affairs: 'Never',
      sexual_desires: 'Looking for intellectual and creative connection',
      fantasies: 'Late night coding sessions, music jams, cooking together',
      turn_ons: ['Intelligence', 'Creativity', 'Independence', 'Music'],
      turn_offs: ['Ignorance', 'Close-mindedness', 'Drama'],
      fav_positions: ['Missionary', 'Cowgirl', 'Spooning'],
      lasting_time: '30+ minutes',
      number_of_rounds: '4',
      trends_i_like: ['Intellectual foreplay', 'Music during sex', 'Slow burn'],
      
      languages_known: ['English', 'Python', 'JavaScript']
    }
  ]

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setProfiles(mockProfiles)
      
      // Apply matching logic
      const matcher = new DatingMatcher(userPreferences, mockProfiles)
      const matchedProfiles = matcher.getCompatibleProfiles()
      
      setFilteredProfiles(matchedProfiles.map(match => match.profile))
      setLoading(false)
    }, 1000)
  }, [userPreferences])

  const handleLike = (profileId: string) => {
    console.log('Liked profile:', profileId)
    // Move to next profile
    setCurrentProfileIndex(prev => Math.min(prev + 1, filteredProfiles.length - 1))
  }

  const handlePass = (profileId: string) => {
    console.log('Passed profile:', profileId)
    // Move to next profile
    setCurrentProfileIndex(prev => Math.min(prev + 1, filteredProfiles.length - 1))
  }

  const handleMessage = (profileId: string) => {
    console.log('Message profile:', profileId)
    // Navigate to messages or open chat
  }

  const handleSuperLike = (profileId: string) => {
    console.log('Super like profile:', profileId)
    setSuperLikesRemaining(prev => Math.max(0, prev - 1))
    // Move to next profile
    setCurrentProfileIndex(prev => Math.min(prev + 1, filteredProfiles.length - 1))
  }

  const handleReport = (profileId: string) => {
    console.log('Report profile:', profileId)
    // Remove from current view
    setFilteredProfiles(prev => prev.filter(p => p.id !== profileId))
  }

  const handleBlock = (profileId: string) => {
    console.log('Block profile:', profileId)
    // Remove from current view
    setFilteredProfiles(prev => prev.filter(p => p.id !== profileId))
  }

  const handleMatchClose = () => {
    setCurrentMatch(null)
  }

  const handleMatchMessage = (matchId: string) => {
    console.log('Open chat for match:', matchId)
    setCurrentMatch(null)
    // Navigate to chat
  }

  const handleKeepSwiping = () => {
    setCurrentMatch(null)
  }

  const currentProfile = filteredProfiles[currentProfileIndex]

  if (!user || !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Please log in to access Dating</h1>
          <p className="text-muted-foreground">You need to be logged in to view dating profiles.</p>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading dating profiles...</p>
        </div>
      </div>
    )
  }

  if (showProfileForm) {
    return (
      <DatingProfileForm 
        onComplete={() => setShowProfileForm(false)}
        onCancel={() => setShowProfileForm(false)}
      />
    )
  }

  if (showPrivacySettings) {
    return (
      <div className="min-h-screen bg-white dark:bg-black">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-black dark:text-white mb-4">
              Privacy Settings
            </h1>
            <p className="text-lg text-muted-foreground">
              Control who can see your dating profile and information
            </p>
          </div>
          
          <DatingPrivacySettings
            initialSettings={userPreferences.privacy_settings}
            onSave={(settings) => {
              setUserPreferences(prev => ({
                ...prev,
                privacy_settings: settings
              }))
              setShowPrivacySettings(false)
            }}
            onCancel={() => setShowPrivacySettings(false)}
          />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white dark:bg-black">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-black dark:text-white mb-4">
            FlavoursDating
          </h1>
          <p className="text-lg text-muted-foreground mb-6">
            Discover amazing people and meaningful connections
          </p>
          
          <div className="flex justify-center space-x-4 mb-8">
            <Button 
              onClick={() => setShowProfileForm(true)}
              className="bg-black dark:bg-white text-white dark:text-black"
            >
              <Settings className="h-4 w-4 mr-2" />
              Complete Your Profile
            </Button>
            <Button 
              variant="outline" 
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="h-4 w-4 mr-2" />
              Filters
            </Button>
            <Button 
              variant="outline" 
              onClick={() => setShowPrivacySettings(true)}
            >
              <Settings className="h-4 w-4 mr-2" />
              Privacy Settings
            </Button>
            <Button 
              variant="outline" 
              onClick={() => setShowMatches(!showMatches)}
            >
              <Heart className="h-4 w-4 mr-2" />
              Matches ({matches.length})
            </Button>
          </div>
        </div>

        {/* Filters */}
        {showFilters && (
          <div className="mb-8">
            <DatingFilters 
              profiles={profiles}
              onFilter={setFilteredProfiles}
              onClose={() => setShowFilters(false)}
            />
          </div>
        )}

        {/* Matches Section */}
        {showMatches && (
          <div className="max-w-4xl mx-auto mb-8">
            <MatchList
              matches={matches}
              profiles={profiles}
              onSelectMatch={(match) => {
                setCurrentMatch(match)
                setShowMatches(false)
              }}
            />
          </div>
        )}

        {/* Main Content */}
        <div className="max-w-4xl mx-auto">
          {filteredProfiles.length === 0 ? (
            <Card className="text-center py-12">
              <CardContent>
                <Heart className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">No profiles found</h3>
                <p className="text-muted-foreground mb-4">
                  Try adjusting your filters or check back later for new profiles.
                </p>
                <Button onClick={() => setShowFilters(true)}>
                  Adjust Filters
                </Button>
              </CardContent>
            </Card>
          ) : currentProfile ? (
            <DatingProfileCard
              profile={currentProfile}
              onLike={handleLike}
              onPass={handlePass}
              onMessage={handleMessage}
              onSuperLike={handleSuperLike}
              onReport={handleReport}
              onBlock={handleBlock}
              superLikesRemaining={superLikesRemaining}
              isBoosted={isBoosted}
            />
          ) : (
            <Card className="text-center py-12">
              <CardContent>
                <Users className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">You've seen everyone!</h3>
                <p className="text-muted-foreground mb-4">
                  Check back later for new profiles or adjust your filters.
                </p>
                <Button onClick={() => setCurrentProfileIndex(0)}>
                  Start Over
                </Button>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Stats */}
        <div className="max-w-4xl mx-auto mt-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="text-center py-4">
                <div className="text-2xl font-bold text-pink-600 dark:text-pink-400">{profiles.length}</div>
                <div className="text-sm text-muted-foreground">Total Profiles</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="text-center py-4">
                <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">{filteredProfiles.length}</div>
                <div className="text-sm text-muted-foreground">Available Matches</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="text-center py-4">
                <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">{currentProfileIndex + 1}</div>
                <div className="text-sm text-muted-foreground">Profiles Viewed</div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Match Notification */}
      {currentMatch && (
        <MatchNotification
          match={currentMatch}
          profiles={profiles}
          onClose={handleMatchClose}
          onMessage={handleMatchMessage}
          onKeepSwiping={handleKeepSwiping}
        />
      )}
    </div>
  )
}
