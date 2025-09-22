"use client"

import React, { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Heart, MessageCircle, X, MapPin, Calendar, Star, Shield, Crown, MoreHorizontal } from 'lucide-react'
import { DatingActions } from './dating-actions'
interface DatingProfile {
  id: string
  user_id: string
  display_name: string
  username: string
  avatar_url?: string
  age: number
  height: string
  weight?: string
  location: string
  hometown?: string
  bio: string
  gender: string
  sexuality: string
  relationship_status: string
  education: string
  occupation: string
  college?: string
  work?: string
  job_title?: string
  interests: string[]
  photos: string[]
  is_verified: boolean
  is_online: boolean
  last_seen: string
  distance?: number
  compatibility_score?: number
  languages_known?: string[]
  hobbies?: string[]
  
  // My Info
  pronouns?: string
  birthday?: string
  ethnicity?: string
  
  // Status & More
  children?: string
  family_plans?: string
  pets?: string
  religion?: string
  zodiac?: string
  political_views?: string
  interested_in?: string[]
  
  // Vices
  marijuana?: string
  smoke?: string
  drinks?: string
  drugs?: string
  
  // Sexual Info
  body_count?: string
  affairs?: string
  sexual_desires?: string
  fantasies?: string
  turn_ons?: string[]
  turn_offs?: string[]
  fav_positions?: string[]
  lasting_time?: string
  number_of_rounds?: string
  trends_i_like?: string[]
}

interface DatingProfileCardProps {
  profile: DatingProfile
  onLike: (profileId: string) => void
  onPass: (profileId: string) => void
  onMessage: (profileId: string) => void
  onSuperLike?: (profileId: string) => void
  onReport?: (profileId: string) => void
  onBlock?: (profileId: string) => void
  superLikesRemaining?: number
  isBoosted?: boolean
}

export function DatingProfileCard({ 
  profile, 
  onLike, 
  onPass, 
  onMessage, 
  onSuperLike,
  onReport,
  onBlock,
  superLikesRemaining = 0,
  isBoosted = false
}: DatingProfileCardProps) {
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0)
  const [showFullProfile, setShowFullProfile] = useState(false)

  const nextPhoto = () => {
    setCurrentPhotoIndex(prev => 
      prev < profile.photos.length - 1 ? prev + 1 : 0
    )
  }

  const prevPhoto = () => {
    setCurrentPhotoIndex(prev => 
      prev > 0 ? prev - 1 : profile.photos.length - 1
    )
  }

  const getCompatibilityColor = (score: number) => {
    if (score >= 80) return 'text-green-600'
    if (score >= 60) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getCompatibilityText = (score: number) => {
    if (score >= 80) return 'Excellent Match'
    if (score >= 60) return 'Good Match'
    return 'Fair Match'
  }

  return (
    <div className="max-w-4xl mx-auto">
      <Card className="overflow-hidden shadow-lg">
        {/* Photo Section */}
        <div className="relative h-100 bg-white dark:bg-black">
          {profile.photos.length > 0 ? (
            <>
              <img
                src={profile.photos[currentPhotoIndex]}
                alt={`${profile.display_name} photo ${currentPhotoIndex + 1}`}
                className="w-full h-100 object-cover"
              />
              
              {/* Photo Navigation */}
              {profile.photos.length > 1 && (
                <>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black/20 hover:bg-black/40 text-white"
                    onClick={prevPhoto}
                  >
                    ←
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black/20 hover:bg-black/40 text-white"
                    onClick={nextPhoto}
                  >
                    →
                  </Button>
                  
                  {/* Photo Indicators */}
                  <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                    {profile.photos.map((_: string, index: number) => (
                      <div
                        key={index}
                        className={`w-2 h-2 rounded-full ${
                          index === currentPhotoIndex ? 'bg-white' : 'bg-white/50'
                        }`}
                      />
                    ))}
                  </div>
                </>
              )}
            </>
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Avatar className="h-32 w-32">
                <AvatarImage src={profile.avatar_url} alt={profile.display_name} />
                <AvatarFallback className="text-4xl">
                  {profile.display_name?.charAt(0) || profile.username?.charAt(0)}
                </AvatarFallback>
              </Avatar>
            </div>
          )}

          {/* Online Status */}
          {profile.is_online && (
            <div className="absolute top-4 right-4">
              <Badge className="bg-green-500 text-white">
                Online
              </Badge>
            </div>
          )}

          {/* Verification Badge */}
          {profile.is_verified && (
            <div className="absolute top-4 left-4">
              <Shield className="h-6 w-6 text-blue-600 bg-white rounded-full p-1" />
            </div>
          )}
        </div>

        <CardContent className="p-6">
          {/* Profile Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center space-x-3">
              <Avatar className="h-12 w-12">
                <AvatarImage src={profile.avatar_url} alt={profile.display_name} />
                <AvatarFallback>
                  {profile.display_name?.charAt(0) || profile.username?.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div>
                <div className="flex items-center space-x-2">
                  <h2 className="text-xl font-bold">{profile.display_name}</h2>
                  {profile.is_verified && (
                    <Shield className="h-4 w-4 text-blue-600" />
                  )}
                </div>
                <p className="text-sm text-muted-foreground">@{profile.username}</p>
                <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                  <span>{profile.age} years old</span>
                  <span>•</span>
                  <span>{profile.height}</span>
                </div>
              </div>
            </div>
            
            <Button variant="ghost" size="sm">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </div>

          {/* Compatibility Score */}
          {profile.compatibility_score && (
            <div className="mb-4 p-3 bg-white dark:bg-black border border-gray-200 dark:border-gray-800 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Compatibility</p>
                  <p className={`text-lg font-bold ${getCompatibilityColor(profile.compatibility_score)}`}>
                    {profile.compatibility_score}%
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">
                    {getCompatibilityText(profile.compatibility_score)}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Location & Distance */}
          <div className="flex items-center space-x-4 mb-4 text-sm text-muted-foreground">
            <div className="flex items-center space-x-1">
              <MapPin className="h-4 w-4" />
              <span>{profile.location}</span>
            </div>
            {profile.distance && (
              <>
                <span>•</span>
                <span>{profile.distance} miles away</span>
              </>
            )}
            <div className="flex items-center space-x-1">
              <Calendar className="h-4 w-4" />
              <span>{profile.last_seen}</span>
            </div>
          </div>

          {/* Bio */}
          <div className="mb-4">
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{profile.bio}</p>
          </div>

          {/* Basic Details */}
          <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
            <div>
              <p className="font-medium text-gray-900 dark:text-gray-100">Gender</p>
              <p className="text-gray-600 dark:text-gray-400">{profile.gender}</p>
            </div>
            <div>
              <p className="font-medium text-gray-900 dark:text-gray-100">Sexuality</p>
              <p className="text-gray-600 dark:text-gray-400">{profile.sexuality}</p>
            </div>
            <div>
              <p className="font-medium text-gray-900 dark:text-gray-100">Status</p>
              <p className="text-gray-600 dark:text-gray-400">{profile.relationship_status}</p>
            </div>
            <div>
              <p className="font-medium text-gray-900 dark:text-gray-100">Education</p>
              <p className="text-gray-600 dark:text-gray-400">{profile.education}</p>
            </div>
            {profile.pronouns && (
              <div>
                <p className="font-medium text-gray-900 dark:text-gray-100">Pronouns</p>
                <p className="text-gray-600 dark:text-gray-400">{profile.pronouns}</p>
              </div>
            )}
            {profile.weight && (
              <div>
                <p className="font-medium text-gray-900 dark:text-gray-100">Weight</p>
                <p className="text-gray-600 dark:text-gray-400">{profile.weight} lbs</p>
              </div>
            )}
            {profile.ethnicity && (
              <div>
                <p className="font-medium text-gray-900 dark:text-gray-100">Ethnicity</p>
                <p className="text-gray-600 dark:text-gray-400">{profile.ethnicity}</p>
              </div>
            )}
            {profile.hometown && (
              <div>
                <p className="font-medium text-gray-900 dark:text-gray-100">Hometown</p>
                <p className="text-gray-600 dark:text-gray-400">{profile.hometown}</p>
              </div>
            )}
          </div>

          {/* Interests */}
          <div className="mb-4">
            <p className="font-medium text-gray-900 dark:text-gray-100 mb-2">Interests</p>
            <div className="flex flex-wrap gap-2">
              {profile.interests.map((interest: string, index: number) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {interest}
                </Badge>
              ))}
            </div>
          </div>

          {/* Interested In */}
          {profile.interested_in && profile.interested_in.length > 0 && (
            <div className="mb-4">
              <p className="font-medium text-gray-900 dark:text-gray-100 mb-2">Interested In</p>
              <div className="flex flex-wrap gap-2">
                {profile.interested_in.map((interest: string, index: number) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {interest}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Hobbies */}
          {profile.hobbies && profile.hobbies.length > 0 && (
            <div className="mb-4">
              <p className="font-medium text-gray-900 dark:text-gray-100 mb-2">Hobbies</p>
              <div className="flex flex-wrap gap-2">
                {profile.hobbies.map((hobby: string, index: number) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {hobby}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <DatingActions
            profile={profile}
            onLike={onLike}
            onPass={onPass}
            onMessage={onMessage}
            onSuperLike={onSuperLike}
            onReport={onReport}
            onBlock={onBlock}
            superLikesRemaining={superLikesRemaining}
            isBoosted={isBoosted}
          />

          {/* View Full Profile Button */}
          <div className="mt-4 text-center">
            <Button
              variant="ghost"
              onClick={() => setShowFullProfile(!showFullProfile)}
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              {showFullProfile ? 'Show Less' : 'View Full Profile'}
            </Button>
          </div>

          {/* Full Profile Details */}
          {showFullProfile && (
            <div className="mt-6 pt-6 border-t space-y-6">
              {/* Work & Education */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">Occupation</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{profile.occupation}</p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">Job Title</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{profile.job_title || 'Not specified'}</p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">Company</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{profile.work || 'Not specified'}</p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">College</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{profile.college || 'Not specified'}</p>
                </div>
              </div>

              {/* Languages */}
              {profile.languages_known && profile.languages_known.length > 0 && (
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">Languages</h4>
                  <div className="flex flex-wrap gap-2">
                    {profile.languages_known.map((lang: string, index: number) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {lang}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Personal Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {profile.children && (
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">Children</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{profile.children}</p>
                  </div>
                )}
                {profile.family_plans && (
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">Family Plans</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{profile.family_plans}</p>
                  </div>
                )}
                {profile.pets && (
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">Pets</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{profile.pets}</p>
                  </div>
                )}
                {profile.religion && (
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">Religion</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{profile.religion}</p>
                  </div>
                )}
                {profile.zodiac && (
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">Zodiac</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{profile.zodiac}</p>
                  </div>
                )}
                {profile.political_views && (
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">Political Views</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{profile.political_views}</p>
                  </div>
                )}
              </div>

              {/* Lifestyle & Vices */}
              {(profile.marijuana || profile.smoke || profile.drinks || profile.drugs) && (
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-3">Lifestyle</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {profile.smoke && (
                      <div>
                        <p className="text-xs font-bold text-black-500 dark:text-white-400">Smoking</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{profile.smoke}</p>
                      </div>
                    )}
                    {profile.drinks && (
                      <div>
                        <p className="text-xs font-bold text-black-500 dark:text-white-400">Drinking</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{profile.drinks}</p>
                      </div>
                    )}
                    {profile.marijuana && (
                      <div>
                        <p className="text-xs font-bold text-black-500 dark:text-gwhiteray-400">Marijuana</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{profile.marijuana}</p>
                      </div>
                    )}
                    {profile.drugs && (
                      <div>
                        <p className="text-xs font-bold text-black-500 dark:text-white-400">Drugs</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{profile.drugs}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Turn Ons */}
              {profile.turn_ons && profile.turn_ons.length > 0 && (
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">Turn Ons</h4>
                  <div className="flex flex-wrap gap-2">
                    {profile.turn_ons.map((turnOn: string, index: number) => (
                      <Badge key={index} variant="secondary" className="text-xs bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200">
                        {turnOn}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Turn Offs */}
              {profile.turn_offs && profile.turn_offs.length > 0 && (
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">Turn Offs</h4>
                  <div className="flex flex-wrap gap-2">
                    {profile.turn_offs.map((turnOff: string, index: number) => (
                      <Badge key={index} variant="secondary" className="text-xs bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200">
                        {turnOff}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Favorite Positions */}
              {profile.fav_positions && profile.fav_positions.length > 0 && (
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">Favorite Positions</h4>
                  <div className="flex flex-wrap gap-2">
                    {profile.fav_positions.map((position: string, index: number) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {position}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Trends */}
              {profile.trends_i_like && profile.trends_i_like.length > 0 && (
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">Trends I Like</h4>
                  <div className="flex flex-wrap gap-2">
                    {profile.trends_i_like.map((trend: string, index: number) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {trend}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Sexual Information */}
              {(profile.body_count || profile.affairs || profile.lasting_time || profile.number_of_rounds) && (
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-3">Sexual Information</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {profile.body_count && (
                      <div>
                        <p className="text-xs text-black-500 font-bold dark:text-white-400">Body Count</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{profile.body_count}</p>
                      </div>
                    )}
                    {profile.affairs && (
                      <div>
                        <p className="text-xs text-black-500 font-bold dark:text-white-400">Affairs</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{profile.affairs}</p>
                      </div>
                    )}
                    {profile.lasting_time && (
                      <div>
                        <p className="text-xs text-black-500 font-bold dark:text-white-400">Lasting Time</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{profile.lasting_time}</p>
                      </div>
                    )}
                    {profile.number_of_rounds && (
                      <div>
                        <p className="text-xs text-black-500 font-bold dark:text-white-400">Number of Rounds</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{profile.number_of_rounds}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Sexual Desires & Fantasies */}
              {(profile.sexual_desires || profile.fantasies) && (
                <div className="space-y-4">
                  {profile.sexual_desires && (
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">Sexual Desires</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{profile.sexual_desires}</p>
                    </div>
                  )}
                  {profile.fantasies && (
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">Fantasies</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{profile.fantasies}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
