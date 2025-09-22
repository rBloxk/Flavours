"use client"

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Slider } from '@/components/ui/slider'
import { Checkbox } from '@/components/ui/checkbox'
import { X, Filter } from 'lucide-react'
import { DatingProfile } from '@/app/dating/page'

interface DatingFiltersProps {
  profiles: DatingProfile[]
  onFilter: (filteredProfiles: DatingProfile[]) => void
  onClose: () => void
}

interface FilterState {
  ageRange: [number, number]
  heightRange: [number, number]
  distance: number
  gender: string[]
  sexuality: string[]
  relationshipStatus: string[]
  education: string[]
  hasPhotos: boolean
  isVerified: boolean
  isOnline: boolean
  interests: string[]
}

export function DatingFilters({ profiles, onFilter, onClose }: DatingFiltersProps) {
  const [filters, setFilters] = useState<FilterState>({
    ageRange: [18, 50],
    heightRange: [4, 7], // feet
    distance: 50,
    gender: [],
    sexuality: [],
    relationshipStatus: [],
    education: [],
    hasPhotos: false,
    isVerified: false,
    isOnline: false,
    interests: []
  })

  const [tempFilters, setTempFilters] = useState<FilterState>(filters)

  const applyFilters = () => {
    let filtered = [...profiles]

    // Age filter
    filtered = filtered.filter(profile => 
      profile.age >= tempFilters.ageRange[0] && profile.age <= tempFilters.ageRange[1]
    )

    // Height filter (convert to inches for comparison)
    filtered = filtered.filter(profile => {
      const heightParts = profile.height.split("'")
      if (heightParts.length === 2) {
        const feet = parseInt(heightParts[0])
        const inches = parseInt(heightParts[1].replace('"', ''))
        const totalInches = feet * 12 + inches
        const minInches = tempFilters.heightRange[0] * 12
        const maxInches = tempFilters.heightRange[1] * 12
        return totalInches >= minInches && totalInches <= maxInches
      }
      return true
    })

    // Gender filter
    if (tempFilters.gender.length > 0) {
      filtered = filtered.filter(profile => 
        tempFilters.gender.includes(profile.gender.toLowerCase())
      )
    }

    // Sexuality filter
    if (tempFilters.sexuality.length > 0) {
      filtered = filtered.filter(profile => 
        tempFilters.sexuality.includes(profile.sexuality.toLowerCase())
      )
    }

    // Relationship status filter
    if (tempFilters.relationshipStatus.length > 0) {
      filtered = filtered.filter(profile => 
        tempFilters.relationshipStatus.includes(profile.relationship_status.toLowerCase())
      )
    }

    // Education filter
    if (tempFilters.education.length > 0) {
      filtered = filtered.filter(profile => 
        tempFilters.education.includes(profile.education.toLowerCase())
      )
    }

    // Photos filter
    if (tempFilters.hasPhotos) {
      filtered = filtered.filter(profile => profile.photos.length > 0)
    }

    // Verified filter
    if (tempFilters.isVerified) {
      filtered = filtered.filter(profile => profile.is_verified)
    }

    // Online filter
    if (tempFilters.isOnline) {
      filtered = filtered.filter(profile => profile.is_online)
    }

    // Interests filter
    if (tempFilters.interests.length > 0) {
      filtered = filtered.filter(profile => 
        tempFilters.interests.some(interest => 
          profile.interests.some(profileInterest => 
            profileInterest.toLowerCase().includes(interest.toLowerCase())
          )
        )
      )
    }

    setFilters(tempFilters)
    onFilter(filtered)
    onClose()
  }

  const resetFilters = () => {
    const defaultFilters: FilterState = {
      ageRange: [18, 50],
      heightRange: [4, 7],
      distance: 50,
      gender: [],
      sexuality: [],
      relationshipStatus: [],
      education: [],
      hasPhotos: false,
      isVerified: false,
      isOnline: false,
      interests: []
    }
    setTempFilters(defaultFilters)
  }

  const handleCheckboxChange = (field: keyof FilterState, value: string) => {
    setTempFilters(prev => ({
      ...prev,
      [field]: prev[field].includes(value)
        ? (prev[field] as string[]).filter(item => item !== value)
        : [...(prev[field] as string[]), value]
    }))
  }

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <Filter className="h-5 w-5" />
            <span>Dating Filters</span>
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Age Range */}
        <div>
          <Label className="text-base font-medium">Age Range</Label>
          <div className="mt-2">
            <Slider
              value={tempFilters.ageRange}
              onValueChange={(value) => setTempFilters(prev => ({ ...prev, ageRange: value as [number, number] }))}
              min={18}
              max={80}
              step={1}
              className="w-full"
            />
            <div className="flex justify-between text-sm text-muted-foreground mt-1">
              <span>{tempFilters.ageRange[0]} years</span>
              <span>{tempFilters.ageRange[1]} years</span>
            </div>
          </div>
        </div>

        {/* Height Range */}
        <div>
          <Label className="text-base font-medium">Height Range</Label>
          <div className="mt-2">
            <Slider
              value={tempFilters.heightRange}
              onValueChange={(value) => setTempFilters(prev => ({ ...prev, heightRange: value as [number, number] }))}
              min={4}
              max={7}
              step={0.1}
              className="w-full"
            />
            <div className="flex justify-between text-sm text-muted-foreground mt-1">
              <span>{tempFilters.heightRange[0]}'0"</span>
              <span>{tempFilters.heightRange[1]}'0"</span>
            </div>
          </div>
        </div>

        {/* Distance */}
        <div>
          <Label className="text-base font-medium">Maximum Distance: {tempFilters.distance} miles</Label>
          <div className="mt-2">
            <Slider
              value={[tempFilters.distance]}
              onValueChange={(value) => setTempFilters(prev => ({ ...prev, distance: value[0] }))}
              min={1}
              max={100}
              step={1}
              className="w-full"
            />
          </div>
        </div>

        {/* Gender */}
        <div>
          <Label className="text-base font-medium">Gender</Label>
          <div className="mt-2 space-y-2">
            {['Male', 'Female', 'Non-binary', 'Transgender'].map((gender) => (
              <div key={gender} className="flex items-center space-x-2">
                <Checkbox
                  id={`gender-${gender}`}
                  checked={tempFilters.gender.includes(gender.toLowerCase())}
                  onCheckedChange={() => handleCheckboxChange('gender', gender.toLowerCase())}
                />
                <Label htmlFor={`gender-${gender}`} className="text-sm">{gender}</Label>
              </div>
            ))}
          </div>
        </div>

        {/* Sexuality */}
        <div>
          <Label className="text-base font-medium">Sexuality</Label>
          <div className="mt-2 space-y-2">
            {['Straight', 'Gay', 'Lesbian', 'Bisexual', 'Pansexual', 'Asexual'].map((sexuality) => (
              <div key={sexuality} className="flex items-center space-x-2">
                <Checkbox
                  id={`sexuality-${sexuality}`}
                  checked={tempFilters.sexuality.includes(sexuality.toLowerCase())}
                  onCheckedChange={() => handleCheckboxChange('sexuality', sexuality.toLowerCase())}
                />
                <Label htmlFor={`sexuality-${sexuality}`} className="text-sm">{sexuality}</Label>
              </div>
            ))}
          </div>
        </div>

        {/* Relationship Status */}
        <div>
          <Label className="text-base font-medium">Relationship Status</Label>
          <div className="mt-2 space-y-2">
            {['Single', 'Dating', 'In a Relationship', 'Married', 'Divorced'].map((status) => (
              <div key={status} className="flex items-center space-x-2">
                <Checkbox
                  id={`status-${status}`}
                  checked={tempFilters.relationshipStatus.includes(status.toLowerCase())}
                  onCheckedChange={() => handleCheckboxChange('relationshipStatus', status.toLowerCase())}
                />
                <Label htmlFor={`status-${status}`} className="text-sm">{status}</Label>
              </div>
            ))}
          </div>
        </div>

        {/* Education */}
        <div>
          <Label className="text-base font-medium">Education</Label>
          <div className="mt-2 space-y-2">
            {['High School', 'Some College', 'Bachelor\'s Degree', 'Master\'s Degree', 'PhD'].map((edu) => (
              <div key={edu} className="flex items-center space-x-2">
                <Checkbox
                  id={`education-${edu}`}
                  checked={tempFilters.education.includes(edu.toLowerCase())}
                  onCheckedChange={() => handleCheckboxChange('education', edu.toLowerCase())}
                />
                <Label htmlFor={`education-${edu}`} className="text-sm">{edu}</Label>
              </div>
            ))}
          </div>
        </div>

        {/* Additional Filters */}
        <div>
          <Label className="text-base font-medium">Additional Filters</Label>
          <div className="mt-2 space-y-2">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="has-photos"
                checked={tempFilters.hasPhotos}
                onCheckedChange={(checked) => setTempFilters(prev => ({ ...prev, hasPhotos: !!checked }))}
              />
              <Label htmlFor="has-photos" className="text-sm">Has Photos</Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox
                id="is-verified"
                checked={tempFilters.isVerified}
                onCheckedChange={(checked) => setTempFilters(prev => ({ ...prev, isVerified: !!checked }))}
              />
              <Label htmlFor="is-verified" className="text-sm">Verified Profiles Only</Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox
                id="is-online"
                checked={tempFilters.isOnline}
                onCheckedChange={(checked) => setTempFilters(prev => ({ ...prev, isOnline: !!checked }))}
              />
              <Label htmlFor="is-online" className="text-sm">Online Now</Label>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-between pt-4 border-t">
          <Button variant="outline" onClick={resetFilters}>
            Reset Filters
          </Button>
          <div className="space-x-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={applyFilters} className="bg-black dark:bg-white text-white dark:text-black">
              Apply Filters
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
