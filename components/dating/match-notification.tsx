"use client"

import React, { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Heart, MessageCircle, X, Sparkles } from 'lucide-react'
import { DatingMatch, DatingProfile } from '@/app/dating/page'

interface MatchNotificationProps {
  match: DatingMatch
  profiles: DatingProfile[]
  onClose: () => void
  onMessage: (matchId: string) => void
  onKeepSwiping: () => void
}

export function MatchNotification({ 
  match, 
  profiles, 
  onClose, 
  onMessage, 
  onKeepSwiping 
}: MatchNotificationProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [showConfetti, setShowConfetti] = useState(false)

  useEffect(() => {
    // Trigger animation
    setIsVisible(true)
    setShowConfetti(true)
    
    // Hide confetti after animation
    const timer = setTimeout(() => setShowConfetti(false), 3000)
    return () => clearTimeout(timer)
  }, [])

  // Find the matched profile
  const matchedProfile = profiles.find(p => p.user_id === match.user2_id)

  if (!matchedProfile) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      {/* Confetti Animation */}
      {showConfetti && (
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(50)].map((_, i) => (
            <div
              key={i}
              className="absolute animate-confetti"
              style={{
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: `${2 + Math.random() * 2}s`
              }}
            >
              <Sparkles className="h-4 w-4 text-yellow-400" />
            </div>
          ))}
        </div>
      )}

      <Card className={`w-full max-w-md transform transition-all duration-500 ${
        isVisible ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
      }`}>
        <CardContent className="p-8 text-center">
          {/* Match Header */}
          <div className="mb-6">
            <div className="flex justify-center mb-4">
              <div className="relative">
                <div className="w-20 h-20 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full flex items-center justify-center">
                  <Heart className="h-10 w-10 text-white" />
                </div>
                <div className="absolute -top-2 -right-2">
                  <Badge className="bg-green-500 text-white animate-pulse">
                    MATCH!
                  </Badge>
                </div>
              </div>
            </div>
            
            <h2 className="text-2xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent mb-2">
              It's a Match!
            </h2>
            <p className="text-muted-foreground">
              You and {matchedProfile.display_name} liked each other
            </p>
          </div>

          {/* Profile Preview */}
          <div className="mb-6">
            <div className="flex justify-center space-x-4">
              {/* Your Profile */}
              <div className="text-center">
                <Avatar className="h-16 w-16 mx-auto mb-2">
                  <AvatarImage src="/api/placeholder/64/64" alt="You" />
                  <AvatarFallback>You</AvatarFallback>
                </Avatar>
                <p className="text-sm font-medium">You</p>
              </div>

              {/* Heart Icon */}
              <div className="flex items-center">
                <Heart className="h-8 w-8 text-red-500 animate-pulse" />
              </div>

              {/* Matched Profile */}
              <div className="text-center">
                <Avatar className="h-16 w-16 mx-auto mb-2">
                  <AvatarImage src={matchedProfile.avatar_url} alt={matchedProfile.display_name} />
                  <AvatarFallback>
                    {matchedProfile.display_name?.charAt(0) || matchedProfile.username?.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <p className="text-sm font-medium">{matchedProfile.display_name}</p>
                <p className="text-xs text-muted-foreground">{matchedProfile.age} years old</p>
              </div>
            </div>
          </div>

          {/* Compatibility Score */}
          {matchedProfile.compatibility_score && (
            <div className="mb-6 p-3 bg-white dark:bg-black border border-gray-200 dark:border-gray-800 rounded-lg">
              <div className="flex items-center justify-center space-x-2">
                <Sparkles className="h-5 w-5 text-purple-500" />
                <span className="font-semibold text-purple-700 dark:text-purple-300">
                  {matchedProfile.compatibility_score}% Compatibility
                </span>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="space-y-3">
            <Button
              onClick={() => onMessage(match.id)}
              className="w-full bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white"
            >
              <MessageCircle className="h-5 w-5 mr-2" />
              Send Message
            </Button>
            
            <Button
              variant="outline"
              onClick={onKeepSwiping}
              className="w-full"
            >
              Keep Swiping
            </Button>
          </div>

          {/* Close Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="absolute top-4 right-4 h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </CardContent>
      </Card>

      <style jsx>{`
        @keyframes confetti {
          0% {
            transform: translateY(-100vh) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(100vh) rotate(720deg);
            opacity: 0;
          }
        }
        
        .animate-confetti {
          animation: confetti linear infinite;
        }
      `}</style>
    </div>
  )
}

// Match List Component
interface MatchListProps {
  matches: DatingMatch[]
  profiles: DatingProfile[]
  onSelectMatch: (match: DatingMatch) => void
}

export function MatchList({ matches, profiles, onSelectMatch }: MatchListProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Your Matches</h3>
      
      {matches.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <Heart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h4 className="text-lg font-medium mb-2">No matches yet</h4>
            <p className="text-muted-foreground">
              Keep swiping to find your perfect match!
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {matches.map((match) => {
            const matchedProfile = profiles.find(p => p.user_id === match.user2_id)
            if (!matchedProfile) return null

            return (
              <Card 
                key={match.id} 
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => onSelectMatch(match)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={matchedProfile.avatar_url} alt={matchedProfile.display_name} />
                      <AvatarFallback>
                        {matchedProfile.display_name?.charAt(0) || matchedProfile.username?.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium truncate">{matchedProfile.display_name}</h4>
                      <p className="text-sm text-muted-foreground truncate">
                        {matchedProfile.age} years old • {matchedProfile.location}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Matched {new Date(match.created_at).toLocaleDateString()}
                      </p>
                    </div>

                    <div className="flex items-center space-x-2">
                      {match.last_message_at && (
                        <Badge variant="secondary" className="text-xs">
                          New
                        </Badge>
                      )}
                      <MessageCircle className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
