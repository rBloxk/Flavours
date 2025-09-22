import { DatingProfile } from '@/app/dating/page'

export interface DatingPreferences {
  user_id: string
  gender_preference: string[]
  sexuality_preference: string[]
  age_range: [number, number]
  height_range: [number, number]
  distance_max: number
  relationship_status_preference: string[]
  education_preference: string[]
  interests_preference: string[]
  privacy_settings: {
    show_age: boolean
    show_location: boolean
    show_education: boolean
    show_occupation: boolean
    show_sexual_info: boolean
    show_vices: boolean
    show_photos: boolean
  }
}

export interface MatchResult {
  profile: DatingProfile
  compatibility_score: number
  match_reasons: string[]
  distance?: number
}

export class DatingMatcher {
  private userPreferences: DatingPreferences
  private allProfiles: DatingProfile[]

  constructor(userPreferences: DatingPreferences, allProfiles: DatingProfile[]) {
    this.userPreferences = userPreferences
    this.allProfiles = allProfiles
  }

  /**
   * Get compatible profiles based on user preferences and matching logic
   */
  getCompatibleProfiles(): MatchResult[] {
    const compatibleProfiles = this.allProfiles
      .filter(profile => this.isBasicMatch(profile))
      .map(profile => this.calculateMatch(profile))
      .filter(match => match.compatibility_score > 0)
      .sort((a, b) => b.compatibility_score - a.compatibility_score)

    return compatibleProfiles
  }

  /**
   * Check if a profile meets basic matching criteria
   */
  private isBasicMatch(profile: DatingProfile): boolean {
    // Skip own profile
    if (profile.user_id === this.userPreferences.user_id) {
      return false
    }

    // Gender preference matching
    if (!this.matchesGenderPreference(profile)) {
      return false
    }

    // Sexuality preference matching
    if (!this.matchesSexualityPreference(profile)) {
      return false
    }

    // Age range matching
    if (!this.matchesAgeRange(profile)) {
      return false
    }

    // Height range matching
    if (!this.matchesHeightRange(profile)) {
      return false
    }

    // Relationship status matching
    if (!this.matchesRelationshipStatus(profile)) {
      return false
    }

    return true
  }

  /**
   * Calculate compatibility score and match reasons
   */
  private calculateMatch(profile: DatingProfile): MatchResult {
    let score = 0
    const reasons: string[] = []

    // Basic compatibility (20 points)
    score += 20
    reasons.push('Basic compatibility')

    // Age compatibility (15 points)
    const ageScore = this.calculateAgeCompatibility(profile)
    score += ageScore
    if (ageScore > 0) reasons.push('Age compatibility')

    // Height compatibility (10 points)
    const heightScore = this.calculateHeightCompatibility(profile)
    score += heightScore
    if (heightScore > 0) reasons.push('Height compatibility')

    // Education compatibility (10 points)
    const educationScore = this.calculateEducationCompatibility(profile)
    score += educationScore
    if (educationScore > 0) reasons.push('Education compatibility')

    // Interest compatibility (20 points)
    const interestScore = this.calculateInterestCompatibility(profile)
    score += interestScore
    if (interestScore > 0) reasons.push('Shared interests')

    // Location compatibility (10 points)
    const locationScore = this.calculateLocationCompatibility(profile)
    score += locationScore
    if (locationScore > 0) reasons.push('Location compatibility')

    // Profile completeness (15 points)
    const completenessScore = this.calculateProfileCompleteness(profile)
    score += completenessScore
    if (completenessScore > 0) reasons.push('Complete profile')

    return {
      profile,
      compatibility_score: Math.min(score, 100),
      match_reasons: reasons,
      distance: this.calculateDistance(profile)
    }
  }

  /**
   * Gender preference matching logic
   */
  private matchesGenderPreference(profile: DatingProfile): boolean {
    if (this.userPreferences.gender_preference.length === 0) {
      return true // No preference set
    }

    return this.userPreferences.gender_preference.includes(profile.gender.toLowerCase())
  }

  /**
   * Sexuality preference matching logic
   */
  private matchesSexualityPreference(profile: DatingProfile): boolean {
    if (this.userPreferences.sexuality_preference.length === 0) {
      return true // No preference set
    }

    return this.userPreferences.sexuality_preference.includes(profile.sexuality.toLowerCase())
  }

  /**
   * Age range matching logic
   */
  private matchesAgeRange(profile: DatingProfile): boolean {
    const [minAge, maxAge] = this.userPreferences.age_range
    return profile.age >= minAge && profile.age <= maxAge
  }

  /**
   * Height range matching logic
   */
  private matchesHeightRange(profile: DatingProfile): boolean {
    const [minHeight, maxHeight] = this.userPreferences.height_range
    
    // Parse height string (e.g., "5'6"")
    const heightParts = profile.height.split("'")
    if (heightParts.length !== 2) return true // Skip if height format is invalid

    const feet = parseInt(heightParts[0])
    const inches = parseInt(heightParts[1].replace('"', ''))
    const totalInches = feet * 12 + inches

    const minInches = minHeight * 12
    const maxInches = maxHeight * 12

    return totalInches >= minInches && totalInches <= maxInches
  }

  /**
   * Relationship status matching logic
   */
  private matchesRelationshipStatus(profile: DatingProfile): boolean {
    if (this.userPreferences.relationship_status_preference.length === 0) {
      return true // No preference set
    }

    return this.userPreferences.relationship_status_preference.includes(profile.relationship_status.toLowerCase())
  }

  /**
   * Calculate age compatibility score
   */
  private calculateAgeCompatibility(profile: DatingProfile): number {
    const [minAge, maxAge] = this.userPreferences.age_range
    const ageRange = maxAge - minAge
    
    if (ageRange === 0) return 0

    const ageDistance = Math.min(
      Math.abs(profile.age - minAge),
      Math.abs(profile.age - maxAge)
    )

    return Math.max(0, 15 - (ageDistance / ageRange) * 15)
  }

  /**
   * Calculate height compatibility score
   */
  private calculateHeightCompatibility(profile: DatingProfile): number {
    const [minHeight, maxHeight] = this.userPreferences.height_range
    const heightRange = maxHeight - minHeight
    
    if (heightRange === 0) return 0

    // Parse height string
    const heightParts = profile.height.split("'")
    if (heightParts.length !== 2) return 0

    const feet = parseInt(heightParts[0])
    const inches = parseInt(heightParts[1].replace('"', ''))
    const totalInches = feet * 12 + inches

    const minInches = minHeight * 12
    const maxInches = maxHeight * 12

    const heightDistance = Math.min(
      Math.abs(totalInches - minInches),
      Math.abs(totalInches - maxInches)
    )

    return Math.max(0, 10 - (heightDistance / (heightRange * 12)) * 10)
  }

  /**
   * Calculate education compatibility score
   */
  private calculateEducationCompatibility(profile: DatingProfile): number {
    if (this.userPreferences.education_preference.length === 0) {
      return 0
    }

    if (this.userPreferences.education_preference.includes(profile.education.toLowerCase())) {
      return 10
    }

    return 0
  }

  /**
   * Calculate interest compatibility score
   */
  private calculateInterestCompatibility(profile: DatingProfile): number {
    if (this.userPreferences.interests_preference.length === 0) {
      return 0
    }

    const commonInterests = profile.interests.filter(interest =>
      this.userPreferences.interests_preference.some(pref =>
        interest.toLowerCase().includes(pref.toLowerCase())
      )
    )

    if (commonInterests.length === 0) return 0

    const interestRatio = commonInterests.length / Math.max(
      profile.interests.length,
      this.userPreferences.interests_preference.length
    )

    return Math.round(interestRatio * 20)
  }

  /**
   * Calculate location compatibility score
   */
  private calculateLocationCompatibility(profile: DatingProfile): number {
    // This would typically use geolocation data
    // For now, return a base score if location is provided
    if (profile.location && profile.location.trim() !== '') {
      return 10
    }
    return 0
  }

  /**
   * Calculate profile completeness score
   */
  private calculateProfileCompleteness(profile: DatingProfile): number {
    let completeness = 0
    const maxScore = 15

    // Check various profile fields
    if (profile.bio && profile.bio.trim() !== '') completeness += 3
    if (profile.photos && profile.photos.length > 0) completeness += 3
    if (profile.interests && profile.interests.length > 0) completeness += 3
    if (profile.education && profile.education.trim() !== '') completeness += 2
    if (profile.occupation && profile.occupation.trim() !== '') completeness += 2
    if (profile.location && profile.location.trim() !== '') completeness += 2

    return Math.min(completeness, maxScore)
  }

  /**
   * Calculate distance between user and profile (mock implementation)
   */
  private calculateDistance(profile: DatingProfile): number {
    // This would typically use geolocation data
    // For now, return a random distance for demonstration
    return Math.floor(Math.random() * 50) + 1
  }

  /**
   * Get profiles that match specific criteria
   */
  getProfilesByCriteria(criteria: {
    gender?: string[]
    sexuality?: string[]
    ageRange?: [number, number]
    relationshipStatus?: string[]
    hasPhotos?: boolean
    isVerified?: boolean
    isOnline?: boolean
  }): DatingProfile[] {
    return this.allProfiles.filter(profile => {
      if (criteria.gender && !criteria.gender.includes(profile.gender.toLowerCase())) {
        return false
      }
      
      if (criteria.sexuality && !criteria.sexuality.includes(profile.sexuality.toLowerCase())) {
        return false
      }
      
      if (criteria.ageRange) {
        const [minAge, maxAge] = criteria.ageRange
        if (profile.age < minAge || profile.age > maxAge) {
          return false
        }
      }
      
      if (criteria.relationshipStatus && !criteria.relationshipStatus.includes(profile.relationship_status.toLowerCase())) {
        return false
      }
      
      if (criteria.hasPhotos && profile.photos.length === 0) {
        return false
      }
      
      if (criteria.isVerified && !profile.is_verified) {
        return false
      }
      
      if (criteria.isOnline && !profile.is_online) {
        return false
      }
      
      return true
    })
  }
}

/**
 * Utility functions for dating matching
 */
export const DatingUtils = {
  /**
   * Calculate age from birthday
   */
  calculateAge(birthday: string): number {
    const today = new Date()
    const birthDate = new Date(birthday)
    let age = today.getFullYear() - birthDate.getFullYear()
    const monthDiff = today.getMonth() - birthDate.getMonth()
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--
    }
    
    return age
  },

  /**
   * Parse height string to inches
   */
  parseHeightToInches(height: string): number {
    const heightParts = height.split("'")
    if (heightParts.length !== 2) return 0
    
    const feet = parseInt(heightParts[0])
    const inches = parseInt(heightParts[1].replace('"', ''))
    
    return feet * 12 + inches
  },

  /**
   * Format height from inches
   */
  formatHeightFromInches(totalInches: number): string {
    const feet = Math.floor(totalInches / 12)
    const inches = totalInches % 12
    return `${feet}'${inches}"`
  },

  /**
   * Get default dating preferences
   */
  getDefaultPreferences(userId: string): DatingPreferences {
    return {
      user_id: userId,
      gender_preference: [],
      sexuality_preference: [],
      age_range: [18, 50],
      height_range: [4, 7],
      distance_max: 50,
      relationship_status_preference: [],
      education_preference: [],
      interests_preference: [],
      privacy_settings: {
        show_age: true,
        show_location: true,
        show_education: true,
        show_occupation: true,
        show_sexual_info: false,
        show_vices: false,
        show_photos: true
      }
    }
  }
}
