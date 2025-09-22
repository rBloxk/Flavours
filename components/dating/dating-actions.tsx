"use client"

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Heart, X, Zap, Star, MessageCircle, Shield, Flag } from 'lucide-react'
import { DatingProfile } from '@/app/dating/page'
import { datingService } from '@/lib/dating-service'

interface DatingActionsProps {
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

export function DatingActions({ 
  profile, 
  onLike, 
  onPass, 
  onMessage, 
  onSuperLike,
  onReport,
  onBlock,
  superLikesRemaining = 0,
  isBoosted = false
}: DatingActionsProps) {
  const [isLiking, setIsLiking] = useState(false)
  const [isPassing, setIsPassing] = useState(false)
  const [isSuperLiking, setIsSuperLiking] = useState(false)
  const [showReportModal, setShowReportModal] = useState(false)
  const [showBlockModal, setShowBlockModal] = useState(false)

  const handleLike = async () => {
    setIsLiking(true)
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const result = await datingService.likeProfile('current-user-id', profile.user_id)
      
      if (result.isMatch) {
        // Show match animation/modal
        console.log('It\'s a match!', result.match)
      }
      
      onLike(profile.id)
    } catch (error) {
      console.error('Error liking profile:', error)
    } finally {
      setIsLiking(false)
    }
  }

  const handlePass = async () => {
    setIsPassing(true)
    try {
      await datingService.passProfile('current-user-id', profile.user_id)
      onPass(profile.id)
    } catch (error) {
      console.error('Error passing profile:', error)
    } finally {
      setIsPassing(false)
    }
  }

  const handleSuperLike = async () => {
    if (superLikesRemaining <= 0) return
    
    setIsSuperLiking(true)
    try {
      const result = await datingService.superLikeProfile('current-user-id', profile.user_id)
      
      if (result.isMatch) {
        console.log('Super like match!', result.match)
      }
      
      onSuperLike?.(profile.id)
    } catch (error) {
      console.error('Error super liking profile:', error)
    } finally {
      setIsSuperLiking(false)
    }
  }

  const handleMessage = () => {
    onMessage(profile.id)
  }

  const handleReport = () => {
    setShowReportModal(true)
  }

  const handleBlock = () => {
    setShowBlockModal(true)
  }

  return (
    <div className="space-y-4">
      {/* Boost Indicator */}
      {isBoosted && (
        <Card className="bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 border-yellow-200 dark:border-yellow-800">
          <CardContent className="p-3">
            <div className="flex items-center space-x-2">
              <Zap className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
              <span className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                Profile Boosted - More visibility!
              </span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Super Likes Remaining */}
      {superLikesRemaining > 0 && (
        <div className="flex items-center justify-center space-x-2 text-sm text-muted-foreground">
          <Star className="h-4 w-4 text-blue-500" />
          <span>{superLikesRemaining} Super Likes remaining</span>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex space-x-3">
        <Button
          variant="outline"
          size="lg"
          className="flex-1 border-red-200 text-red-600 hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-900/20"
          onClick={handlePass}
          disabled={isPassing}
        >
          {isPassing ? (
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-red-600" />
          ) : (
            <X className="h-5 w-5 mr-2" />
          )}
          Pass
        </Button>
        
        <Button
          size="lg"
          className="flex-1 bg-black dark:bg-white text-white dark:text-black"
          onClick={handleLike}
          disabled={isLiking}
        >
          {isLiking ? (
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
          ) : (
            <Heart className="h-5 w-5 mr-2" />
          )}
          Like
        </Button>
        
        <Button
          variant="outline"
          size="lg"
          className="flex-1 border-blue-200 text-blue-600 hover:bg-blue-50 dark:border-blue-800 dark:text-blue-400 dark:hover:bg-blue-900/20"
          onClick={handleMessage}
        >
          <MessageCircle className="h-5 w-5 mr-2" />
          Message
        </Button>
      </div>

      {/* Super Like Button */}
      {superLikesRemaining > 0 && (
        <div className="flex justify-center">
          <Button
            variant="outline"
            size="lg"
            className="w-full border-green-200 bg-green-600 text-white hover:bg-green-700 hover:text-white dark:border-green-800 dark:text-white-400 dark:hover:bg-green-700"
            onClick={handleSuperLike}
            disabled={isSuperLiking}
          >
            {isSuperLiking ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600" />
            ) : (
              <Star className="h-5 w-5 mr-2" />
            )}
            Super Like
          </Button>
        </div>
      )}

      {/* Safety Actions */}
      <div className="flex justify-center space-x-4 pt-4 border-t">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleReport}
          className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-900/20"
        >
          <Flag className="h-4 w-4 mr-1" />
          Report
        </Button>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={handleBlock}
          className="text-gray-600 hover:text-gray-700 hover:bg-gray-50 dark:text-gray-400 dark:hover:text-gray-300 dark:hover:bg-gray-800"
        >
          <Shield className="h-4 w-4 mr-1" />
          Block
        </Button>
      </div>

      {/* Report Modal */}
      {showReportModal && (
        <ReportModal
          profile={profile}
          onClose={() => setShowReportModal(false)}
          onReport={onReport}
        />
      )}

      {/* Block Modal */}
      {showBlockModal && (
        <BlockModal
          profile={profile}
          onClose={() => setShowBlockModal(false)}
          onBlock={onBlock}
        />
      )}
    </div>
  )
}

// Report Modal Component
function ReportModal({ profile, onClose, onReport }: {
  profile: DatingProfile
  onClose: () => void
  onReport?: (profileId: string) => void
}) {
  const [selectedReason, setSelectedReason] = useState('')
  const [description, setDescription] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const reportReasons = [
    'Inappropriate photos',
    'Harassment or bullying',
    'Spam or fake profile',
    'Underage user',
    'Violence or threats',
    'Other'
  ]

  const handleSubmit = async () => {
    if (!selectedReason) return
    
    setIsSubmitting(true)
    try {
      await datingService.reportProfile('current-user-id', profile.user_id, selectedReason, description)
      onReport?.(profile.id)
      onClose()
    } catch (error) {
      console.error('Error reporting profile:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md">
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold mb-4">Report {profile.display_name}</h3>
          
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Reason for reporting</label>
              <div className="space-y-2">
                {reportReasons.map((reason) => (
                  <label key={reason} className="flex items-center space-x-2">
                    <input
                      type="radio"
                      name="reason"
                      value={reason}
                      checked={selectedReason === reason}
                      onChange={(e) => setSelectedReason(e.target.value)}
                      className="text-primary"
                    />
                    <span className="text-sm">{reason}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Additional details (optional)</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Please provide more details..."
                className="w-full p-3 border rounded-md resize-none h-20"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-3 mt-6">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              onClick={handleSubmit}
              disabled={!selectedReason || isSubmitting}
              className="bg-red-600 hover:bg-red-700 hover:text-white text-white"
            >
              {isSubmitting ? 'Reporting...' : 'Report'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Block Modal Component
function BlockModal({ profile, onClose, onBlock }: {
  profile: DatingProfile
  onClose: () => void
  onBlock?: (profileId: string) => void
}) {
  const [isBlocking, setIsBlocking] = useState(false)

  const handleBlock = async () => {
    setIsBlocking(true)
    try {
      await datingService.blockUser('current-user-id', profile.user_id)
      onBlock?.(profile.id)
      onClose()
    } catch (error) {
      console.error('Error blocking user:', error)
    } finally {
      setIsBlocking(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md">
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold mb-4">Block {profile.display_name}</h3>
          
          <p className="text-muted-foreground mb-6">
            This will prevent {profile.display_name} from seeing your profile or messaging you. 
            You can unblock them later in your settings.
          </p>

          <div className="flex justify-end space-x-3">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              onClick={handleBlock}
              disabled={isBlocking}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {isBlocking ? 'Blocking...' : 'Block'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
