export interface DatingMedia {
  url: string
  type: 'image' | 'video' | 'gif'
  id?: string
}

export interface DatingProfile {
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
  photos: DatingMedia[] // Updated to support mixed media types
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

export interface DatingProfileData {
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

