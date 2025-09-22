"use client"

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { X, Plus, Save, ArrowLeft, ArrowRight } from 'lucide-react'
import { useAuth } from '@/components/providers/auth-provider'
import { PhotoUpload } from './photo-upload'

interface DatingProfileFormProps {
  onComplete: () => void
  onCancel: () => void
}

interface DatingProfileData {
  // My Info
  pronouns: string
  gender: string
  birthday: string
  height: string
  weight: string
  sexuality: string
  ethnicity: string
  current_location: string
  hometown: string
  education: string
  college: string
  occupation: string
  work: string
  job_title: string
  languages_known: string[]
  bio: string
  
  // Status
  relationship_status: string
  
  // More
  children: string
  family_plans: string
  pets: string
  religion: string
  zodiac: string
  political_views: string
  interested_in: string[]
  hobbies: string[]
  
  // Vices
  marijuana: string
  smoke: string
  drinks: string
  drugs: string
  
  // Sexual Info
  body_count: string
  affairs: string
  sexual_desires: string
  fantasies: string
  turn_ons: string[]
  turn_offs: string[]
  fav_positions: string[]
  lasting_time: string
  number_of_rounds: string
  trends_i_like: string[]
}

export function DatingProfileForm({ onComplete, onCancel }: DatingProfileFormProps) {
  const { user } = useAuth()
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState<DatingProfileData>({
    pronouns: '',
    gender: '',
    birthday: '',
    height: '',
    weight: '',
    sexuality: '',
    ethnicity: '',
    current_location: '',
    hometown: '',
    education: '',
    college: '',
    occupation: '',
    work: '',
    job_title: '',
    languages_known: [],
    bio: '',
    relationship_status: '',
    children: '',
    family_plans: '',
    pets: '',
    religion: '',
    zodiac: '',
    political_views: '',
    interested_in: [],
    hobbies: [],
    marijuana: '',
    smoke: '',
    drinks: '',
    drugs: '',
    body_count: '',
    affairs: '',
    sexual_desires: '',
    fantasies: '',
    turn_ons: [],
    turn_offs: [],
    fav_positions: [],
    lasting_time: '',
    number_of_rounds: '',
    trends_i_like: []
  })

  const [newLanguage, setNewLanguage] = useState('')
  const [newInterest, setNewInterest] = useState('')
  const [newHobby, setNewHobby] = useState('')
  const [newTurnOn, setNewTurnOn] = useState('')
  const [newTurnOff, setNewTurnOff] = useState('')
  const [newPosition, setNewPosition] = useState('')
  const [newTrend, setNewTrend] = useState('')
  const [profilePhotos, setProfilePhotos] = useState<string[]>([])

  const totalSteps = 6

  const handleInputChange = (field: keyof DatingProfileData, value: string) => {
    setFormData((prev: DatingProfileData) => ({ ...prev, [field]: value }))
  }

  const handleArrayAdd = (field: keyof DatingProfileData, value: string, setter: (value: string) => void) => {
    if (value.trim()) {
      setFormData((prev: DatingProfileData) => ({
        ...prev,
        [field]: [...(prev[field] as string[]), value.trim()]
      }))
      setter('')
    }
  }

  const handleArrayRemove = (field: keyof DatingProfileData, index: number) => {
    setFormData((prev: DatingProfileData) => ({
      ...prev,
      [field]: (prev[field] as string[]).filter((_, i) => i !== index)
    }))
  }

  const handleSubmit = () => {
    console.log('Dating profile data:', formData)
    // Here you would save to database
    onComplete()
  }

  const nextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const renderStep1 = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold mb-2">My Info</h2>
        <p className="text-muted-foreground">Tell us about yourself</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="pronouns">Pronouns</Label>
          <Select value={formData.pronouns} onValueChange={(value: string) => handleInputChange('pronouns', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select pronouns" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="he/him">He/Him</SelectItem>
              <SelectItem value="she/her">She/Her</SelectItem>
              <SelectItem value="they/them">They/Them</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="gender">Gender</Label>
          <Select value={formData.gender} onValueChange={(value: string) => handleInputChange('gender', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select gender" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="male">Male</SelectItem>
              <SelectItem value="female">Female</SelectItem>
              <SelectItem value="non-binary">Non-binary</SelectItem>
              <SelectItem value="transgender">Transgender</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="birthday">Birthday</Label>
          <Input
            id="birthday"
            type="date"
            value={formData.birthday}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('birthday', e.target.value)}
          />
        </div>

        <div>
          <Label htmlFor="height">Height</Label>
          <Select value={formData.height} onValueChange={(value: string) => handleInputChange('height', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select height" />
            </SelectTrigger>
            <SelectContent>
              {Array.from({ length: 24 }, (_, i) => {
                const feet = Math.floor(i / 12) + 4
                const inches = i % 12
                const value = `${feet}'${inches}"`
                return (
                  <SelectItem key={value} value={value}>{value}</SelectItem>
                )
              })}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="weight">Weight (lbs)</Label>
          <Input
            id="weight"
            type="number"
            value={formData.weight}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('weight', e.target.value)}
            placeholder="Enter weight"
          />
        </div>

        <div>
          <Label htmlFor="sexuality">Sexuality</Label>
          <Select value={formData.sexuality} onValueChange={(value: string) => handleInputChange('sexuality', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select sexuality" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="straight">Straight</SelectItem>
              <SelectItem value="gay">Gay</SelectItem>
              <SelectItem value="lesbian">Lesbian</SelectItem>
              <SelectItem value="bisexual">Bisexual</SelectItem>
              <SelectItem value="pansexual">Pansexual</SelectItem>
              <SelectItem value="asexual">Asexual</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="ethnicity">Ethnicity</Label>
          <Select value={formData.ethnicity} onValueChange={(value: string) => handleInputChange('ethnicity', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select ethnicity" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="asian">Asian</SelectItem>
              <SelectItem value="black">Black</SelectItem>
              <SelectItem value="hispanic">Hispanic</SelectItem>
              <SelectItem value="white">White</SelectItem>
              <SelectItem value="mixed">Mixed</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="current_location">Current Location</Label>
          <Input
            id="current_location"
            value={formData.current_location}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('current_location', e.target.value)}
            placeholder="City, State"
          />
        </div>

        <div>
          <Label htmlFor="hometown">Hometown</Label>
          <Input
            id="hometown"
            value={formData.hometown}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('hometown', e.target.value)}
            placeholder="City, State"
          />
        </div>

        <div>
          <Label htmlFor="education">Education</Label>
          <Select value={formData.education} onValueChange={(value: string) => handleInputChange('education', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select education level" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="high-school">High School</SelectItem>
              <SelectItem value="some-college">Some College</SelectItem>
              <SelectItem value="bachelors">Bachelor's Degree</SelectItem>
              <SelectItem value="masters">Master's Degree</SelectItem>
              <SelectItem value="phd">PhD</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="college">College/University</Label>
          <Input
            id="college"
            value={formData.college}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('college', e.target.value)}
            placeholder="College name"
          />
        </div>

        <div>
          <Label htmlFor="occupation">Occupation</Label>
          <Input
            id="occupation"
            value={formData.occupation}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('occupation', e.target.value)}
            placeholder="Your occupation"
          />
        </div>

        <div>
          <Label htmlFor="work">Company/Workplace</Label>
          <Input
            id="work"
            value={formData.work}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('work', e.target.value)}
            placeholder="Company name"
          />
        </div>

        <div>
          <Label htmlFor="job_title">Job Title</Label>
          <Input
            id="job_title"
            value={formData.job_title}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('job_title', e.target.value)}
            placeholder="Your job title"
          />
        </div>
      </div>

      <div>
        <Label>Languages Known</Label>
        <div className="flex flex-wrap gap-2 mb-2">
          {formData.languages_known.map((lang: string, index: number) => (
            <span key={index} className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full border border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80 text-xs font-semibold">
              {lang}
              <X 
                className="h-3 w-3 cursor-pointer" 
                onClick={() => handleArrayRemove('languages_known', index)}
              />
            </span>
          ))}
        </div>
        <div className="flex gap-2">
          <Input
            value={newLanguage}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewLanguage(e.target.value)}
            placeholder="Add language"
          />
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => handleArrayAdd('languages_known', newLanguage, setNewLanguage)}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Bio */}
      <div>
        <Label htmlFor="bio">Bio</Label>
        <Textarea
          id="bio"
          placeholder="Tell us about yourself, your interests, and what you're looking for..."
          value={formData.bio}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => handleInputChange('bio', e.target.value)}
          className="min-h-[100px]"
        />
        <p className="text-sm text-muted-foreground mt-1">
          Write a brief description about yourself to help others get to know you better.
        </p>
      </div>
    </div>
  )

  const renderStep2 = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold mb-2">Status & More</h2>
        <p className="text-muted-foreground">Relationship status and personal details</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="relationship_status">Relationship Status</Label>
          <Select value={formData.relationship_status} onValueChange={(value: string) => handleInputChange('relationship_status', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select relationship status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="single">Single</SelectItem>
              <SelectItem value="dating">Dating</SelectItem>
              <SelectItem value="in-relationship">In a Relationship</SelectItem>
              <SelectItem value="married">Married</SelectItem>
              <SelectItem value="divorced">Divorced</SelectItem>
              <SelectItem value="widowed">Widowed</SelectItem>
              <SelectItem value="complicated">It's Complicated</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="children">Children</Label>
          <Select value={formData.children} onValueChange={(value: string) => handleInputChange('children', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select children status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">No children</SelectItem>
              <SelectItem value="has-children">Has children</SelectItem>
              <SelectItem value="wants-children">Wants children</SelectItem>
              <SelectItem value="doesnt-want-children">Doesn't want children</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="family_plans">Family Plans</Label>
          <Select value={formData.family_plans} onValueChange={(value: string) => handleInputChange('family_plans', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select family plans" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="wants-marriage">Wants marriage</SelectItem>
              <SelectItem value="open-to-marriage">Open to marriage</SelectItem>
              <SelectItem value="not-interested">Not interested</SelectItem>
              <SelectItem value="already-married">Already married</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="pets">Pets</Label>
          <Select value={formData.pets} onValueChange={(value: string) => handleInputChange('pets', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select pets status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="has-pets">Has pets</SelectItem>
              <SelectItem value="wants-pets">Wants pets</SelectItem>
              <SelectItem value="no-pets">No pets</SelectItem>
              <SelectItem value="allergic">Allergic to pets</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="religion">Religion</Label>
          <Select value={formData.religion} onValueChange={(value: string) => handleInputChange('religion', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select religion" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="christian">Christian</SelectItem>
              <SelectItem value="catholic">Catholic</SelectItem>
              <SelectItem value="muslim">Muslim</SelectItem>
              <SelectItem value="jewish">Jewish</SelectItem>
              <SelectItem value="hindu">Hindu</SelectItem>
              <SelectItem value="buddhist">Buddhist</SelectItem>
              <SelectItem value="atheist">Atheist</SelectItem>
              <SelectItem value="agnostic">Agnostic</SelectItem>
              <SelectItem value="spiritual">Spiritual</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="zodiac">Zodiac Sign</Label>
          <Select value={formData.zodiac} onValueChange={(value: string) => handleInputChange('zodiac', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select zodiac sign" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="aries">Aries</SelectItem>
              <SelectItem value="taurus">Taurus</SelectItem>
              <SelectItem value="gemini">Gemini</SelectItem>
              <SelectItem value="cancer">Cancer</SelectItem>
              <SelectItem value="leo">Leo</SelectItem>
              <SelectItem value="virgo">Virgo</SelectItem>
              <SelectItem value="libra">Libra</SelectItem>
              <SelectItem value="scorpio">Scorpio</SelectItem>
              <SelectItem value="sagittarius">Sagittarius</SelectItem>
              <SelectItem value="capricorn">Capricorn</SelectItem>
              <SelectItem value="aquarius">Aquarius</SelectItem>
              <SelectItem value="pisces">Pisces</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="political_views">Political Views</Label>
          <Select value={formData.political_views} onValueChange={(value: string) => handleInputChange('political_views', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select political views" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="liberal">Liberal</SelectItem>
              <SelectItem value="conservative">Conservative</SelectItem>
              <SelectItem value="moderate">Moderate</SelectItem>
              <SelectItem value="apolitical">Apolitical</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <Label>Interested In</Label>
        <div className="flex flex-wrap gap-2 mb-2">
          {formData.interested_in.map((interest: string, index: number) => (
            <span key={index} className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full border border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80 text-xs font-semibold">
              {interest}
              <X 
                className="h-3 w-3 cursor-pointer" 
                onClick={() => handleArrayRemove('interested_in', index)}
              />
            </span>
          ))}
        </div>
        <div className="flex gap-2">
          <Input
            value={newInterest}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewInterest(e.target.value)}
            placeholder="Add interest"
          />
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => handleArrayAdd('interested_in', newInterest, setNewInterest)}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div>
        <Label>Hobbies</Label>
        <div className="flex flex-wrap gap-2 mb-2">
          {formData.hobbies.map((hobby: string, index: number) => (
            <span key={index} className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full border border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80 text-xs font-semibold">
              {hobby}
              <X 
                className="h-3 w-3 cursor-pointer" 
                onClick={() => handleArrayRemove('hobbies', index)}
              />
            </span>
          ))}
        </div>
        <div className="flex gap-2">
          <Input
            value={newHobby}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewHobby(e.target.value)}
            placeholder="Add hobby"
          />
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => handleArrayAdd('hobbies', newHobby, setNewHobby)}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )

  const renderStep3 = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold mb-2">Vices</h2>
        <p className="text-muted-foreground">Lifestyle choices and habits</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="marijuana">Marijuana</Label>
          <Select value={formData.marijuana} onValueChange={(value: string) => handleInputChange('marijuana', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select marijuana usage" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="never">Never</SelectItem>
              <SelectItem value="rarely">Rarely</SelectItem>
              <SelectItem value="occasionally">Occasionally</SelectItem>
              <SelectItem value="regularly">Regularly</SelectItem>
              <SelectItem value="daily">Daily</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="smoke">Smoking</Label>
          <Select value={formData.smoke} onValueChange={(value: string) => handleInputChange('smoke', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select smoking status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="never">Never</SelectItem>
              <SelectItem value="former">Former smoker</SelectItem>
              <SelectItem value="occasionally">Occasionally</SelectItem>
              <SelectItem value="regularly">Regularly</SelectItem>
              <SelectItem value="heavy">Heavy smoker</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="drinks">Drinking</Label>
          <Select value={formData.drinks} onValueChange={(value: string) => handleInputChange('drinks', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select drinking habits" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="never">Never</SelectItem>
              <SelectItem value="rarely">Rarely</SelectItem>
              <SelectItem value="socially">Socially</SelectItem>
              <SelectItem value="regularly">Regularly</SelectItem>
              <SelectItem value="heavy">Heavy drinker</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="drugs">Drugs</Label>
          <Select value={formData.drugs} onValueChange={(value: string) => handleInputChange('drugs', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select drug usage" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="never">Never</SelectItem>
              <SelectItem value="rarely">Rarely</SelectItem>
              <SelectItem value="occasionally">Occasionally</SelectItem>
              <SelectItem value="regularly">Regularly</SelectItem>
              <SelectItem value="recovering">In recovery</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  )

  const renderStep4 = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold mb-2">Sexual Information</h2>
        <p className="text-muted-foreground">Intimate preferences and experiences</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="body_count">Body Count</Label>
          <Select value={formData.body_count} onValueChange={(value: string) => handleInputChange('body_count', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select body count" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="0">0</SelectItem>
              <SelectItem value="1-5">1-5</SelectItem>
              <SelectItem value="6-10">6-10</SelectItem>
              <SelectItem value="11-20">11-20</SelectItem>
              <SelectItem value="21-50">21-50</SelectItem>
              <SelectItem value="50+">50+</SelectItem>
              <SelectItem value="prefer-not-to-say">Prefer not to say</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="affairs">Affairs</Label>
          <Select value={formData.affairs} onValueChange={(value: string) => handleInputChange('affairs', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select affairs status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="never">Never</SelectItem>
              <SelectItem value="once">Once</SelectItem>
              <SelectItem value="multiple">Multiple times</SelectItem>
              <SelectItem value="currently">Currently</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="sexual_desires">Sexual Desires</Label>
          <Textarea
            id="sexual_desires"
            value={formData.sexual_desires}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => handleInputChange('sexual_desires', e.target.value)}
            placeholder="Describe your sexual desires..."
            rows={3}
          />
        </div>

        <div>
          <Label htmlFor="fantasies">Fantasies</Label>
          <Textarea
            id="fantasies"
            value={formData.fantasies}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => handleInputChange('fantasies', e.target.value)}
            placeholder="Share your fantasies..."
            rows={3}
          />
        </div>

        <div>
          <Label htmlFor="lasting_time">Lasting Time</Label>
          <Select value={formData.lasting_time} onValueChange={(value: string) => handleInputChange('lasting_time', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select lasting time" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="under-5-min">Under 5 minutes</SelectItem>
              <SelectItem value="5-10-min">5-10 minutes</SelectItem>
              <SelectItem value="10-20-min">10-20 minutes</SelectItem>
              <SelectItem value="20-30-min">20-30 minutes</SelectItem>
              <SelectItem value="30-min-plus">30+ minutes</SelectItem>
              <SelectItem value="varies">Varies</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="number_of_rounds">Number of Rounds</Label>
          <Select value={formData.number_of_rounds} onValueChange={(value: string) => handleInputChange('number_of_rounds', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select number of rounds" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">1</SelectItem>
              <SelectItem value="2">2</SelectItem>
              <SelectItem value="3">3</SelectItem>
              <SelectItem value="4">4</SelectItem>
              <SelectItem value="5-plus">5+</SelectItem>
              <SelectItem value="varies">Varies</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <Label>Turn Ons</Label>
        <div className="flex flex-wrap gap-2 mb-2">
          {formData.turn_ons.map((turnOn: string, index: number) => (
            <span key={index} className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full border border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80 text-xs font-semibold">
              {turnOn}
              <X 
                className="h-3 w-3 cursor-pointer" 
                onClick={() => handleArrayRemove('turn_ons', index)}
              />
            </span>
          ))}
        </div>
        <div className="flex gap-2">
          <Input
            value={newTurnOn}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewTurnOn(e.target.value)}
            placeholder="Add turn on"
          />
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => handleArrayAdd('turn_ons', newTurnOn, setNewTurnOn)}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div>
        <Label>Turn Offs</Label>
        <div className="flex flex-wrap gap-2 mb-2">
          {formData.turn_offs.map((turnOff: string, index: number) => (
            <span key={index} className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full border border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80 text-xs font-semibold">
              {turnOff}
              <X 
                className="h-3 w-3 cursor-pointer" 
                onClick={() => handleArrayRemove('turn_offs', index)}
              />
            </span>
          ))}
        </div>
        <div className="flex gap-2">
          <Input
            value={newTurnOff}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewTurnOff(e.target.value)}
            placeholder="Add turn off"
          />
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => handleArrayAdd('turn_offs', newTurnOff, setNewTurnOff)}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div>
        <Label>Favorite Positions</Label>
        <div className="flex flex-wrap gap-2 mb-2">
          {formData.fav_positions.map((position: string, index: number) => (
            <span key={index} className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full border border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80 text-xs font-semibold">
              {position}
              <X 
                className="h-3 w-3 cursor-pointer" 
                onClick={() => handleArrayRemove('fav_positions', index)}
              />
            </span>
          ))}
        </div>
        <div className="flex gap-2">
          <Input
            value={newPosition}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewPosition(e.target.value)}
            placeholder="Add favorite position"
          />
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => handleArrayAdd('fav_positions', newPosition, setNewPosition)}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div>
        <Label>Trends I Like</Label>
        <div className="flex flex-wrap gap-2 mb-2">
          {formData.trends_i_like.map((trend: string, index: number) => (
            <span key={index} className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full border border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80 text-xs font-semibold">
              {trend}
              <X 
                className="h-3 w-3 cursor-pointer" 
                onClick={() => handleArrayRemove('trends_i_like', index)}
              />
            </span>
          ))}
        </div>
        <div className="flex gap-2">
          <Input
            value={newTrend}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewTrend(e.target.value)}
            placeholder="Add trend"
          />
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => handleArrayAdd('trends_i_like', newTrend, setNewTrend)}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )

  const renderStep5 = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold mb-2">Profile Photos</h2>
        <p className="text-muted-foreground">Upload your best photos to attract matches</p>
      </div>

      <PhotoUpload
        photos={profilePhotos}
        onPhotosChange={setProfilePhotos}
        maxPhotos={6}
      />
    </div>
  )

  const renderStep6 = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold mb-2">Review & Complete</h2>
        <p className="text-muted-foreground">Review your dating profile information</p>
      </div>

      <div className="space-y-4">
        {/* My Info */}
        <Card>
          <CardHeader>
            <CardTitle>My Info</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <p><strong>Pronouns:</strong> {formData.pronouns || 'Not specified'}</p>
              <p><strong>Gender:</strong> {formData.gender || 'Not specified'}</p>
              <p><strong>Age:</strong> {formData.birthday ? `${new Date().getFullYear() - new Date(formData.birthday).getFullYear()} years old` : 'Not specified'}</p>
              <p><strong>Height:</strong> {formData.height || 'Not specified'}</p>
              <p><strong>Weight:</strong> {formData.weight || 'Not specified'}</p>
              <p><strong>Sexuality:</strong> {formData.sexuality || 'Not specified'}</p>
              <p><strong>Location:</strong> {formData.current_location || 'Not specified'}</p>
              <p><strong>Hometown:</strong> {formData.hometown || 'Not specified'}</p>
              <p><strong>Ethnicity:</strong> {formData.ethnicity || 'Not specified'}</p>
              <p><strong>Education:</strong> {formData.education || 'Not specified'}</p>
              <p><strong>Occupation:</strong> {formData.occupation || 'Not specified'}</p>
              <p><strong>Job Title:</strong> {formData.job_title || 'Not specified'}</p>
              <p><strong>Company:</strong> {formData.work || 'Not specified'}</p>
              <p><strong>College:</strong> {formData.college || 'Not specified'}</p>
            </div>
            {formData.bio && (
              <div className="mt-4">
                <p><strong>Bio:</strong></p>
                <p className="text-muted-foreground mt-1">{formData.bio}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Status & More */}
        <Card>
          <CardHeader>
            <CardTitle>Status & More</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <p><strong>Relationship Status:</strong> {formData.relationship_status || 'Not specified'}</p>
              <p><strong>Children:</strong> {formData.children || 'Not specified'}</p>
              <p><strong>Family Plans:</strong> {formData.family_plans || 'Not specified'}</p>
              <p><strong>Pets:</strong> {formData.pets || 'Not specified'}</p>
              <p><strong>Religion:</strong> {formData.religion || 'Not specified'}</p>
              <p><strong>Zodiac:</strong> {formData.zodiac || 'Not specified'}</p>
              <p><strong>Political Views:</strong> {formData.political_views || 'Not specified'}</p>
            </div>
            {formData.interested_in.length > 0 && (
              <div className="mt-4">
                <p><strong>Interested In:</strong></p>
                <div className="flex flex-wrap gap-2 mt-1">
                  {formData.interested_in.map((interest: string, index: number) => (
                    <span key={index} className="inline-flex items-center px-2.5 py-0.5 rounded-full border text-xs font-semibold">
                      {interest}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {formData.hobbies.length > 0 && (
              <div className="mt-4">
                <p><strong>Hobbies:</strong></p>
                <div className="flex flex-wrap gap-2 mt-1">
                  {formData.hobbies.map((hobby: string, index: number) => (
                    <span key={index} className="inline-flex items-center px-2.5 py-0.5 rounded-full border text-xs font-semibold">
                      {hobby}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {formData.languages_known.length > 0 && (
              <div className="mt-4">
                <p><strong>Languages:</strong></p>
                <div className="flex flex-wrap gap-2 mt-1">
                  {formData.languages_known.map((lang: string, index: number) => (
                    <span key={index} className="inline-flex items-center px-2.5 py-0.5 rounded-full border text-xs font-semibold">
                      {lang}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Vices */}
        <Card>
          <CardHeader>
            <CardTitle>Lifestyle & Vices</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <p><strong>Smoking:</strong> {formData.smoke || 'Not specified'}</p>
              <p><strong>Drinking:</strong> {formData.drinks || 'Not specified'}</p>
              <p><strong>Marijuana:</strong> {formData.marijuana || 'Not specified'}</p>
              <p><strong>Drugs:</strong> {formData.drugs || 'Not specified'}</p>
            </div>
          </CardContent>
        </Card>

        {/* Sexual Info */}
        <Card>
          <CardHeader>
            <CardTitle>Sexual Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <p><strong>Body Count:</strong> {formData.body_count || 'Not specified'}</p>
              <p><strong>Affairs:</strong> {formData.affairs || 'Not specified'}</p>
              <p><strong>Lasting Time:</strong> {formData.lasting_time || 'Not specified'}</p>
              <p><strong>Number of Rounds:</strong> {formData.number_of_rounds || 'Not specified'}</p>
            </div>
            {formData.turn_ons.length > 0 && (
              <div className="mt-4">
                <p><strong>Turn Ons:</strong></p>
                <div className="flex flex-wrap gap-2 mt-1">
                  {formData.turn_ons.map((turnOn: string, index: number) => (
                    <span key={index} className="inline-flex items-center px-2.5 py-0.5 rounded-full border border-transparent bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 text-xs font-semibold">
                      {turnOn}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {formData.turn_offs.length > 0 && (
              <div className="mt-4">
                <p><strong>Turn Offs:</strong></p>
                <div className="flex flex-wrap gap-2 mt-1">
                  {formData.turn_offs.map((turnOff: string, index: number) => (
                    <span key={index} className="inline-flex items-center px-2.5 py-0.5 rounded-full border border-transparent bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 text-xs font-semibold">
                      {turnOff}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {formData.fav_positions.length > 0 && (
              <div className="mt-4">
                <p><strong>Favorite Positions:</strong></p>
                <div className="flex flex-wrap gap-2 mt-1">
                  {formData.fav_positions.map((position: string, index: number) => (
                    <span key={index} className="inline-flex items-center px-2.5 py-0.5 rounded-full border text-xs font-semibold">
                      {position}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {formData.trends_i_like.length > 0 && (
              <div className="mt-4">
                <p><strong>Trends I Like:</strong></p>
                <div className="flex flex-wrap gap-2 mt-1">
                  {formData.trends_i_like.map((trend: string, index: number) => (
                    <span key={index} className="inline-flex items-center px-2.5 py-0.5 rounded-full border text-xs font-semibold">
                      {trend}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {formData.sexual_desires && (
              <div className="mt-4">
                <p><strong>Sexual Desires:</strong></p>
                <p className="text-muted-foreground mt-1">{formData.sexual_desires}</p>
              </div>
            )}
            {formData.fantasies && (
              <div className="mt-4">
                <p><strong>Fantasies:</strong></p>
                <p className="text-muted-foreground mt-1">{formData.fantasies}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Profile Photos */}
        <Card>
          <CardHeader>
            <CardTitle>Profile Photos</CardTitle>
          </CardHeader>
          <CardContent>
            {profilePhotos.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {profilePhotos.map((photo: string, index: number) => (
                  <div key={index} className="relative">
                    <img
                      src={photo}
                      alt={`Profile photo ${index + 1}`}
                      className="w-full h-32 object-cover rounded-lg"
                    />
                    {index === 0 && (
                      <span className="absolute top-2 left-2 inline-flex items-center px-2.5 py-0.5 rounded-full border border-transparent bg-primary text-primary-foreground text-xs font-semibold">
                        Main Photo
                      </span>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">No photos uploaded</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1: return renderStep1()
      case 2: return renderStep2()
      case 3: return renderStep3()
      case 4: return renderStep4()
      case 5: return renderStep5()
      case 6: return renderStep6()
      default: return renderStep1()
    }
  }

  return (
    <div className="min-h-screen bg-white dark:bg-black">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-black dark:text-white mb-4">
              Create Your Dating Profile
            </h1>
            <p className="text-lg text-muted-foreground">
              Step {currentStep} of {totalSteps}
            </p>
          </div>

          {/* Progress Bar */}
          <div className="mb-8">
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-pink-500 to-purple-500 dark:from-pink-400 dark:to-purple-400 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(currentStep / totalSteps) * 100}%` }}
              />
            </div>
          </div>

          {/* Form Content */}
          <Card>
            <CardContent className="p-8">
              {renderCurrentStep()}
            </CardContent>
          </Card>

          {/* Navigation */}
          <div className="flex justify-between mt-8">
            <Button 
              variant="outline" 
              onClick={prevStep}
              disabled={currentStep === 1}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Previous
            </Button>

            <div className="flex space-x-4">
              <Button variant="outline" onClick={onCancel}>
                Cancel
              </Button>
              
              {currentStep < totalSteps ? (
                <Button onClick={nextStep}>
                  Next
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              ) : (
                <Button onClick={handleSubmit} className="bg-black dark:bg-blue-600 text-white dark:text-white-600">
                  <Save className="h-4 w-4 mr-2" />
                  Complete Profile
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
