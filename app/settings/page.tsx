"use client"

import React, { useState, useEffect } from 'react'
import { AuthGuard } from '@/components/auth/auth-guard'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '@/components/providers/auth-provider'
import { useTheme } from 'next-themes'
import { 
  User, 
  Bell, 
  Shield, 
  Palette, 
  Camera,
  Save,
  Eye,
  EyeOff,
  Trash2,
  Download,
  Upload,
  AlertTriangle,
  CheckCircle,
  Crown,
  Globe,
  Sun,
  Moon,
  CreditCard,
  Plus,
  Edit,
  Trash,
  DollarSign,
  Building2,
  Wallet,
  Filter,
  Volume2,
  Clock,
  Database,
  Activity,
  BarChart3,
  TrendingUp,
  HelpCircle,
  ChevronRight,
  ChevronDown,
  X,
  Check,
  AlertCircle,
  Star,
  Bookmark,
  Share2,
  Copy,
  ExternalLink,
  Search,
  Video,
  Image,
  File,
  Link,
  Key,
  Smartphone,
  Tablet,
  Laptop,
  Desktop,
  Headphones,
  Speaker,
  Volume1,
  Mute,
  Play,
  Pause,
  RotateCcw,
  RotateCw,
  ZoomIn,
  ZoomOut,
  Move,
  Type,
  Bold,
  Italic,
  Underline,
  AlignLeft,
  AlignCenter,
  AlignRight,
  List,
  Grid,
  Layout,
  Sidebar,
  Square,
  Circle,
  Triangle,
  Heart,
  Smile,
  ThumbsUp,
  ThumbsDown,
  Award,
  Trophy,
  Medal,
  Gift,
  Package,
  ShoppingCart,
  ShoppingBag,
  Tag,
  Tags,
  Hash,
  AtSign,
  Percent,
  Euro,
  Pound,
  Yen,
  Bitcoin,
  Banknote,
  Coins,
  PiggyBank,
  TrendingDown,
  PieChart,
  LineChart,
  AreaChart,
  Thermometer,
  Cloud,
  CloudRain,
  CloudSnow,
  CloudLightning,
  Sunrise,
  Sunset,
  Compass,
  Navigation,
  Map,
  MapPin,
  Home,
  Building,
  Store,
  Factory,
  Warehouse,
  School,
  Hospital,
  Church,
  Landmark,
  Mountain,
  Trees,
  Flower,
  Leaf,
  Sprout,
  Bug,
  Fish,
  Bird,
  Cat,
  Dog,
  Rabbit,
  Mouse,
  Turtle,
  Snake,
  Lizard,
  Frog,
  Butterfly,
  Bee,
  Ant,
  Spider,
  Car,
  Truck,
  Bus,
  Train,
  Plane,
  Ship,
  Bike,
  Motorcycle,
  Scooter,
  Skateboard,
  Gamepad2,
  Joystick,
  Puzzle,
  Chess,
  Cards,
  Spade,
  Club,
  Diamond,
  Flag,
  Skull,
  Ghost,
  Alien,
  Robot,
  Android,
  Apple,
  Windows,
  Linux,
  Firefox,
  Safari,
  Edge,
  Opera,
  Lock,
  Unlock,
  ShieldCheck,
  ShieldAlert,
  SortAsc,
  SortDesc,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUpDown,
  ChevronUp,
  ChevronLeft,
  RefreshCw,
  RefreshCcw,
  Undo,
  Redo,
  Cut,
  Paste,
  Scissors,
  Eraser,
  Pen,
  Pencil,
  Highlighter,
  Paintbrush,
  Dropper,
  Bucket,
  Spray,
  Stamp,
  Sticker,
  Emoji,
  Laugh,
  Wink,
  Angry,
  Sad,
  Surprised,
  Confused,
  Neutral,
  Expressionless,
  Unamused,
  RollingEyes,
  Grimacing,
  LyingFace,
  Relieved,
  Pensive,
  Sleepy,
  DroolingFace,
  SleepingFace,
  Mask,
  FaceWithThermometer,
  FaceWithHeadBandage,
  NauseatedFace,
  FaceVomiting,
  SneezingFace,
  HotFace,
  ColdFace,
  WoozyFace,
  ExplodingHead,
  CowboyHatFace,
  DisguisedFace,
  Sunglasses,
  NerdFace,
  MonocleFace,
  WorriedFace,
  SlightlyFrowningFace,
  OpenMouth,
  HushedFace,
  AstonishedFace,
  FlushedFace,
  PleadingFace,
  FrowningFace,
  AnguishedFace,
  FearfulFace,
  ColdSweat,
  DisappointedRelieved,
  Cry,
  LoudlyCryingFace,
  ScreamingFace,
  ConfoundedFace,
  PerseveringFace,
  DisappointedFace,
  SweatFace,
  WearyFace,
  TiredFace,
  YawningFace,
  SteamFromNose,
  PoutingFace,
  AngryFace,
  FaceWithSymbolsOnMouth,
  SmilingFaceWithHorns,
  AngryFaceWithHorns,
  SkullAndCrossbones,
  PileOfPoo,
  ClownFace,
  Ogre,
  Goblin,
  KissingFace,
  KissingFaceWithClosedEyes,
  FaceBlowingAKiss,
  SmilingFaceWithHeartEyes,
  StarStruck,
  SmilingFaceWithHalo,
  SmilingFaceWithHearts,
  HeartEyes,
  KissingFaceWithSmilingEyes,
  SmilingFaceWithTear,
  PartyingFace,
  SmilingFaceWithSunglasses,
  FaceWithMonocle,
  IdCard,
  CheckCircle2,
  FileText,
  Mail,
  Monitor
} from 'lucide-react'
import { AddPaymentMethodModal } from '@/components/ui/add-payment-method-modal'
import { UpgradeCreatorModal } from '@/components/ui/upgrade-creator-modal'
import { EditPaymentMethodModal } from '@/components/ui/edit-payment-method-modal'
import { DeletePaymentMethodModal } from '@/components/ui/delete-payment-method-modal'

export default function SettingsPage() {
  const { user, profile } = useAuth()
  const { theme, setTheme } = useTheme()
  const [activeTab, setActiveTab] = useState('profile')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [showBankAccountModal, setShowBankAccountModal] = useState(false)
  const [showCreditCardModal, setShowCreditCardModal] = useState(false)
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<any>(null)
  
  // Age verification state
  const [showAgeVerificationModal, setShowAgeVerificationModal] = useState(false)
  const [ageVerificationStatus, setAgeVerificationStatus] = useState<'pending' | 'verified' | 'rejected' | 'not_submitted'>('not_submitted')
  const [governmentIdFile, setGovernmentIdFile] = useState<File | null>(null)
  const [selfieFile, setSelfieFile] = useState<File | null>(null)
  const [isUploadingVerification, setIsUploadingVerification] = useState(false)
  
  // New state for enhanced features
  const [contentSettings, setContentSettings] = useState({
    matureContent: false,
    violenceFilter: true,
    profanityFilter: true,
    spamFilter: true,
    autoPlay: true,
    dataSaver: false,
    contentLanguage: 'en'
  })
  
  const [accessibilitySettings, setAccessibilitySettings] = useState({
    highContrast: false,
    reducedMotion: false,
    screenReader: false,
    colorBlindSupport: false,
    keyboardNavigation: true,
    focusIndicators: true,
    altText: true
  })
  
  const [securitySettings, setSecuritySettings] = useState({
    twoFactorAuth: false,
    loginAlerts: true,
    deviceManagement: true,
    sessionTimeout: 30,
    biometricAuth: false,
    secureBackup: false,
    privacyMode: false,
    dataEncryption: true
  })
  
  const [dataSettings, setDataSettings] = useState({
    autoBackup: true,
    cloudSync: true,
    dataRetention: 365,
    analyticsOptIn: true,
    crashReporting: true,
    performanceMonitoring: true,
    personalizedAds: false,
    locationTracking: false
  })
  const [paymentMethods, setPaymentMethods] = useState([
    {
      id: '1',
      type: 'visa',
      last4: '4242',
      expiryMonth: '12',
      expiryYear: '2025',
      cardholderName: 'John Doe',
      isDefault: true,
      billingAddress: {
        line1: '123 Main Street',
        line2: 'Apt 4B',
        city: 'New York',
        state: 'NY',
        postalCode: '10001',
        country: 'US'
      }
    }
  ])
  const [transactions, setTransactions] = useState([
    {
      id: '1',
      type: 'subscription',
      amount: 9.99,
      currency: 'USD',
      status: 'completed',
      description: 'Creator Pro Subscription',
      date: '2024-01-15T10:30:00Z',
      paymentMethod: 'Visa •••• 4242'
    },
    {
      id: '2',
      type: 'tip',
      amount: 5.00,
      currency: 'USD',
      status: 'completed',
      description: 'Tip to @creator123',
      date: '2024-01-10T14:20:00Z',
      paymentMethod: 'Visa •••• 4242'
    }
  ])

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'account', label: 'Account', icon: Shield },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'privacy', label: 'Privacy', icon: Lock },
    { id: 'appearance', label: 'Appearance', icon: Palette },
    { id: 'content', label: 'Content & Safety', icon: Filter },
    { id: 'accessibility', label: 'Accessibility', icon: Eye },
    { id: 'security', label: 'Security', icon: ShieldCheck },
    { id: 'data', label: 'Data Management', icon: Database },
    { id: 'bank-account', label: 'Add Bank Account (To Earn)', icon: Building2 },
    { id: 'credit-card', label: 'Add Credit Card (To Subscribe)', icon: Wallet },
    { id: 'billing', label: 'Billing', icon: Crown },
    { id: 'age-verification', label: 'Age Verification', icon: Shield }
  ]

  const handleSave = async () => {
    setIsLoading(true)
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    setIsLoading(false)
  }

  const handlePaymentMethodAdded = () => {
    // Add a new payment method to the list
    const newPaymentMethod = {
      id: Date.now().toString(),
      type: 'mastercard',
      last4: '5555',
      expiryMonth: '06',
      expiryYear: '2026',
      cardholderName: 'Jane Smith',
      isDefault: false,
      billingAddress: {
        line1: '456 Oak Avenue',
        line2: '',
        city: 'Los Angeles',
        state: 'CA',
        postalCode: '90210',
        country: 'US'
      }
    }
    setPaymentMethods(prev => [...prev, newPaymentMethod])
  }

  const handleUpgradeSuccess = () => {
    // Update user profile to creator status
    console.log('User upgraded to creator')
  }

  const handleEditPaymentMethod = (method: any) => {
    setSelectedPaymentMethod(method)
    setShowEditModal(true)
  }

  const handleDeletePaymentMethod = (method: any) => {
    setSelectedPaymentMethod(method)
    setShowDeleteModal(true)
  }

  // Age verification handlers
  const handleGovernmentIdUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setGovernmentIdFile(file)
    }
  }

  const handleSelfieUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setSelfieFile(file)
    }
  }

  const handleAgeVerificationSubmit = async () => {
    if (!governmentIdFile || !selfieFile) {
      alert('Please upload both government ID and selfie')
      return
    }

    setIsUploadingVerification(true)
    try {
      // Simulate API call for age verification
      await new Promise(resolve => setTimeout(resolve, 2000))
      setAgeVerificationStatus('pending')
      setShowAgeVerificationModal(false)
      alert('Age verification submitted successfully. You will be notified once verified.')
      
      // In a real app, this would:
      // 1. Upload files to secure storage
      // 2. Create verification request in database
      // 3. Notify admin dashboard
      // 4. Send confirmation email to user
    } catch (error) {
      console.error('Age verification error:', error)
      alert('Failed to submit age verification. Please try again.')
    } finally {
      setIsUploadingVerification(false)
    }
  }

  // Simulate admin review notification (in real app, this would come from WebSocket or polling)
  useEffect(() => {
    const checkVerificationStatus = () => {
      // This would be a real API call to check verification status
      // For demo purposes, we'll simulate a status change after 5 seconds
      if (ageVerificationStatus === 'pending') {
        setTimeout(() => {
          // Simulate admin approval
          setAgeVerificationStatus('verified')
          alert('🎉 Your age verification has been approved! You can now access age-restricted content.')
        }, 5000)
      }
    }

    checkVerificationStatus()
  }, [ageVerificationStatus])

  const handlePaymentMethodUpdated = () => {
    // Update the payment method in the list
    if (selectedPaymentMethod) {
      setPaymentMethods(prev => 
        prev.map(method => 
          method.id === selectedPaymentMethod.id 
            ? { ...method, ...selectedPaymentMethod }
            : method
        )
      )
    }
  }

  const handlePaymentMethodDeleted = () => {
    // Remove the payment method from the list
    if (selectedPaymentMethod) {
      setPaymentMethods(prev => 
        prev.filter(method => method.id !== selectedPaymentMethod.id)
      )
    }
  }

  const formatTransactionDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'subscription':
        return Crown
      case 'tip':
        return DollarSign
      case 'ppv':
        return CreditCard
      case 'payout':
        return Receipt
      default:
        return CreditCard
    }
  }

  const getTransactionStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-600 bg-green-100'
      case 'pending':
        return 'text-yellow-600 bg-yellow-100'
      case 'failed':
        return 'text-red-600 bg-red-100'
      case 'refunded':
        return 'text-blue-600 bg-blue-100'
      default:
        return 'text-gray-600 bg-gray-100'
    }
  }

  const renderProfileSettings = () => (
    <div className="space-y-6">
      {/* Profile Picture */}
      <Card>
        <CardHeader>
          <CardTitle>Profile Information</CardTitle>
          <CardDescription>Update your profile picture and personal details</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-col md:flex-row items-start md:items-center space-y-4 md:space-y-0 md:space-x-6">
            <div className="relative">
              <Avatar className="h-32 w-32">
                <AvatarImage src={profile?.avatar_url} alt={profile?.display_name} />
                <AvatarFallback className="text-8xl">
                  {profile?.display_name?.charAt(0) || user?.email?.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <Button size="sm" className="absolute -bottom-2 -right-2 rounded-full">
                <Camera className="h-5 w-5" />
              </Button>
            </div>
            
            <div className="flex-1 space-y-2">
              <div className="flex items-center space-x-2">
                <h1 className="text-3xl font-bold">{profile?.display_name || 'Display Name'}</h1>
                {profile?.is_verified && (
                  <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Verified
                  </Badge>
                )}
              </div>
              
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-muted-foreground">Username:</span>
                  <span className="text-sm font-medium">@{profile?.username || 'username'}</span>
                </div>
                
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-muted-foreground">User ID:</span>
                  <span className="text-sm font-mono bg-gray-100 px-2 py-1 rounded text-gray-700">
                    {user?.id || 'user-id-12345'}
                  </span>
                </div>
              </div>
              
              <div className="pt-2">
                <Button variant="outline" size="sm">
                  <Camera className="h-4 w-4 mr-2" />
                  Change Profile Picture
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
          <CardDescription>Update your personal information</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="displayName">Display Name</Label>
              <Input
                id="displayName"
                defaultValue={profile?.display_name || ''}
                placeholder="Enter your display name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                defaultValue={profile?.username || ''}
                placeholder="Enter your username"
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="bio">Bio</Label>
            <Textarea
              id="bio"
              defaultValue={profile?.bio || ''}
              placeholder="Tell us about yourself..."
              rows={3}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                placeholder="City, Country"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="website">Website</Label>
              <Input
                id="website"
                placeholder="https://yourwebsite.com"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Interests */}
      <Card>
        <CardHeader>
          <CardTitle>Interests</CardTitle>
          <CardDescription>Select topics you're interested in</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary" className="cursor-pointer">Fitness</Badge>
            <Badge variant="outline" className="cursor-pointer">Art</Badge>
            <Badge variant="outline" className="cursor-pointer">Photography</Badge>
            <Badge variant="outline" className="cursor-pointer">Travel</Badge>
            <Badge variant="outline" className="cursor-pointer">Music</Badge>
            <Badge variant="outline" className="cursor-pointer">Cooking</Badge>
            <Badge variant="outline" className="cursor-pointer">Technology</Badge>
            <Badge variant="outline" className="cursor-pointer">Gaming</Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  )

  const renderAccountSettings = () => (
    <div className="space-y-6">
      {/* Email Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Email Address</CardTitle>
          <CardDescription>Manage your email address and verification</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <div className="flex items-center space-x-2">
              <Input
                id="email"
                defaultValue={user?.email || ''}
                type="email"
                disabled
              />
              <Badge variant="secondary">
                <CheckCircle className="h-3 w-3 mr-1" />
                Verified
              </Badge>
            </div>
          </div>
          <Button variant="outline">
            <Mail className="h-4 w-4 mr-2" />
            Change Email
          </Button>
        </CardContent>
      </Card>

      {/* Password Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Password</CardTitle>
          <CardDescription>Update your password for security</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="currentPassword">Current Password</Label>
            <div className="relative">
              <Input
                id="currentPassword"
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter current password"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="newPassword">New Password</Label>
            <Input
              id="newPassword"
              type="password"
              placeholder="Enter new password"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm New Password</Label>
            <Input
              id="confirmPassword"
              type="password"
              placeholder="Confirm new password"
            />
          </div>
          
          <Button>
            <Lock className="h-4 w-4 mr-2" />
            Update Password
          </Button>
        </CardContent>
      </Card>

      {/* Account Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Account Actions</CardTitle>
          <CardDescription>Manage your account data and settings</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Download Data</h4>
              <p className="text-sm text-muted-foreground">Download a copy of your data</p>
            </div>
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Download
            </Button>
          </div>
          
          <Separator />
          
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Delete Account</h4>
              <p className="text-sm text-muted-foreground">Permanently delete your account</p>
            </div>
            <Button variant="destructive">
              <Trash2 className="h-4 w-4 mr-2" />
              Delete Account
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )

  const renderNotificationSettings = () => (
    <div className="space-y-6">
      {/* Email Notifications */}
      <Card>
        <CardHeader>
          <CardTitle>Email Notifications</CardTitle>
          <CardDescription>Choose what email notifications you want to receive</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">New Followers</h4>
              <p className="text-sm text-muted-foreground">Get notified when someone follows you</p>
            </div>
            <Switch defaultChecked />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Likes and Comments</h4>
              <p className="text-sm text-muted-foreground">Get notified about likes and comments</p>
            </div>
            <Switch defaultChecked />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Direct Messages</h4>
              <p className="text-sm text-muted-foreground">Get notified about new messages</p>
            </div>
            <Switch defaultChecked />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Earnings Updates</h4>
              <p className="text-sm text-muted-foreground">Get notified about your earnings</p>
            </div>
            <Switch />
          </div>
        </CardContent>
      </Card>

      {/* Push Notifications */}
      <Card>
        <CardHeader>
          <CardTitle>Push Notifications</CardTitle>
          <CardDescription>Manage push notifications on your devices</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Enable Push Notifications</h4>
              <p className="text-sm text-muted-foreground">Receive notifications on your device</p>
            </div>
            <Switch defaultChecked />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Sound</h4>
              <p className="text-sm text-muted-foreground">Play sound for notifications</p>
            </div>
            <Switch defaultChecked />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Vibration</h4>
              <p className="text-sm text-muted-foreground">Vibrate for notifications</p>
            </div>
            <Switch />
          </div>
        </CardContent>
      </Card>

      {/* Notification Frequency */}
      <Card>
        <CardHeader>
          <CardTitle>Notification Frequency</CardTitle>
          <CardDescription>How often you want to receive notifications</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Email Digest</Label>
            <Select defaultValue="daily">
              <SelectTrigger>
                <SelectValue placeholder="Select frequency" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="immediate">Immediate</SelectItem>
                <SelectItem value="daily">Daily</SelectItem>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="never">Never</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>
    </div>
  )

  const renderContentSettings = () => (
    <div className="space-y-6">
      {/* Mature Content */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <AlertTriangle className="h-5 w-5 text-orange-500" />
            <span>Mature Content</span>
          </CardTitle>
          <CardDescription>Control access to mature and adult content</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Enable Mature Content</h4>
              <p className="text-sm text-muted-foreground">Allow viewing of content marked as mature (18+)</p>
            </div>
            <Switch 
              checked={contentSettings.matureContent}
              onCheckedChange={(checked) => setContentSettings(prev => ({ ...prev, matureContent: checked }))}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Age Verification</h4>
              <p className="text-sm text-muted-foreground">Require age verification for mature content</p>
            </div>
            <Switch defaultChecked />
          </div>
          
        </CardContent>
      </Card>

      {/* Content Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Filter className="h-5 w-5" />
            <span>Content Filters</span>
          </CardTitle>
          <CardDescription>Filter out unwanted content types</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Violence Filter</h4>
              <p className="text-sm text-muted-foreground">Hide content containing violence</p>
            </div>
            <Switch 
              checked={contentSettings.violenceFilter}
              onCheckedChange={(checked) => setContentSettings(prev => ({ ...prev, violenceFilter: checked }))}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Profanity Filter</h4>
              <p className="text-sm text-muted-foreground">Hide content with profanity</p>
            </div>
            <Switch 
              checked={contentSettings.profanityFilter}
              onCheckedChange={(checked) => setContentSettings(prev => ({ ...prev, profanityFilter: checked }))}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Spam Filter</h4>
              <p className="text-sm text-muted-foreground">Automatically filter spam content</p>
            </div>
            <Switch 
              checked={contentSettings.spamFilter}
              onCheckedChange={(checked) => setContentSettings(prev => ({ ...prev, spamFilter: checked }))}
            />
          </div>
        </CardContent>
      </Card>

      {/* Media Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Video className="h-5 w-5" />
            <span>Media Settings</span>
          </CardTitle>
          <CardDescription>Control media playback and quality</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Auto-play Videos</h4>
              <p className="text-sm text-muted-foreground">Automatically play videos when scrolling</p>
            </div>
            <Switch 
              checked={contentSettings.autoPlay}
              onCheckedChange={(checked) => setContentSettings(prev => ({ ...prev, autoPlay: checked }))}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Data Saver Mode</h4>
              <p className="text-sm text-muted-foreground">Reduce data usage by lowering media quality</p>
            </div>
            <Switch 
              checked={contentSettings.dataSaver}
              onCheckedChange={(checked) => setContentSettings(prev => ({ ...prev, dataSaver: checked }))}
            />
          </div>
          
          <div className="space-y-2">
            <Label>Content Language</Label>
            <Select 
              value={contentSettings.contentLanguage}
              onValueChange={(value) => setContentSettings(prev => ({ ...prev, contentLanguage: value }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="es">Spanish</SelectItem>
                <SelectItem value="fr">French</SelectItem>
                <SelectItem value="de">German</SelectItem>
                <SelectItem value="it">Italian</SelectItem>
                <SelectItem value="pt">Portuguese</SelectItem>
                <SelectItem value="ru">Russian</SelectItem>
                <SelectItem value="ja">Japanese</SelectItem>
                <SelectItem value="ko">Korean</SelectItem>
                <SelectItem value="zh">Chinese</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>
    </div>
  )

  const renderAccessibilitySettings = () => (
    <div className="space-y-6">
      {/* Visual Accessibility */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Eye className="h-5 w-5" />
            <span>Visual Accessibility</span>
          </CardTitle>
          <CardDescription>Adjust visual settings for better accessibility</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">High Contrast Mode</h4>
              <p className="text-sm text-muted-foreground">Increase contrast for better visibility</p>
            </div>
            <Switch 
              checked={accessibilitySettings.highContrast}
              onCheckedChange={(checked) => setAccessibilitySettings(prev => ({ ...prev, highContrast: checked }))}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Color Blind Support</h4>
              <p className="text-sm text-muted-foreground">Use color-blind friendly palettes</p>
            </div>
            <Switch 
              checked={accessibilitySettings.colorBlindSupport}
              onCheckedChange={(checked) => setAccessibilitySettings(prev => ({ ...prev, colorBlindSupport: checked }))}
            />
          </div>
          
        </CardContent>
      </Card>

      {/* Motion & Interaction */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Activity className="h-5 w-5" />
            <span>Motion & Interaction</span>
          </CardTitle>
          <CardDescription>Control motion and interaction preferences</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Reduce Motion</h4>
              <p className="text-sm text-muted-foreground">Minimize animations and transitions</p>
            </div>
            <Switch 
              checked={accessibilitySettings.reducedMotion}
              onCheckedChange={(checked) => setAccessibilitySettings(prev => ({ ...prev, reducedMotion: checked }))}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Keyboard Navigation</h4>
              <p className="text-sm text-muted-foreground">Enable full keyboard navigation support</p>
            </div>
            <Switch 
              checked={accessibilitySettings.keyboardNavigation}
              onCheckedChange={(checked) => setAccessibilitySettings(prev => ({ ...prev, keyboardNavigation: checked }))}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Focus Indicators</h4>
              <p className="text-sm text-muted-foreground">Show clear focus indicators for keyboard users</p>
            </div>
            <Switch 
              checked={accessibilitySettings.focusIndicators}
              onCheckedChange={(checked) => setAccessibilitySettings(prev => ({ ...prev, focusIndicators: checked }))}
            />
          </div>
        </CardContent>
      </Card>

      {/* Screen Reader Support */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Volume2 className="h-5 w-5" />
            <span>Screen Reader Support</span>
          </CardTitle>
          <CardDescription>Optimize for screen readers and assistive technologies</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Screen Reader Mode</h4>
              <p className="text-sm text-muted-foreground">Optimize interface for screen readers</p>
            </div>
            <Switch 
              checked={accessibilitySettings.screenReader}
              onCheckedChange={(checked) => setAccessibilitySettings(prev => ({ ...prev, screenReader: checked }))}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Alt Text for Images</h4>
              <p className="text-sm text-muted-foreground">Always show alt text for images</p>
            </div>
            <Switch 
              checked={accessibilitySettings.altText}
              onCheckedChange={(checked) => setAccessibilitySettings(prev => ({ ...prev, altText: checked }))}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  )

  const renderSecuritySettings = () => (
    <div className="space-y-6">
      {/* Authentication */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <ShieldCheck className="h-5 w-5" />
            <span>Authentication</span>
          </CardTitle>
          <CardDescription>Secure your account with additional authentication methods</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Two-Factor Authentication</h4>
              <p className="text-sm text-muted-foreground">Add an extra layer of security to your account</p>
            </div>
            <Switch 
              checked={securitySettings.twoFactorAuth}
              onCheckedChange={(checked) => setSecuritySettings(prev => ({ ...prev, twoFactorAuth: checked }))}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Biometric Authentication</h4>
              <p className="text-sm text-muted-foreground">Use fingerprint or face recognition</p>
            </div>
            <Switch 
              checked={securitySettings.biometricAuth}
              onCheckedChange={(checked) => setSecuritySettings(prev => ({ ...prev, biometricAuth: checked }))}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Login Alerts</h4>
              <p className="text-sm text-muted-foreground">Get notified of new login attempts</p>
            </div>
            <Switch 
              checked={securitySettings.loginAlerts}
              onCheckedChange={(checked) => setSecuritySettings(prev => ({ ...prev, loginAlerts: checked }))}
            />
          </div>
        </CardContent>
      </Card>

      {/* Session Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Clock className="h-5 w-5" />
            <span>Session Management</span>
          </CardTitle>
          <CardDescription>Control how long you stay logged in</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Session Timeout (minutes)</Label>
            <Select 
              value={securitySettings.sessionTimeout.toString()}
              onValueChange={(value) => setSecuritySettings(prev => ({ ...prev, sessionTimeout: parseInt(value) }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="15">15 minutes</SelectItem>
                <SelectItem value="30">30 minutes</SelectItem>
                <SelectItem value="60">1 hour</SelectItem>
                <SelectItem value="120">2 hours</SelectItem>
                <SelectItem value="480">8 hours</SelectItem>
                <SelectItem value="1440">24 hours</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Device Management</h4>
              <p className="text-sm text-muted-foreground">Manage devices that can access your account</p>
            </div>
            <Switch 
              checked={securitySettings.deviceManagement}
              onCheckedChange={(checked) => setSecuritySettings(prev => ({ ...prev, deviceManagement: checked }))}
            />
          </div>
        </CardContent>
      </Card>

      {/* Privacy & Data */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Lock className="h-5 w-5" />
            <span>Privacy & Data</span>
          </CardTitle>
          <CardDescription>Control your privacy and data security</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Privacy Mode</h4>
              <p className="text-sm text-muted-foreground">Hide your online status and activity</p>
            </div>
            <Switch 
              checked={securitySettings.privacyMode}
              onCheckedChange={(checked) => setSecuritySettings(prev => ({ ...prev, privacyMode: checked }))}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Data Encryption</h4>
              <p className="text-sm text-muted-foreground">Encrypt your data for additional security</p>
            </div>
            <Switch 
              checked={securitySettings.dataEncryption}
              onCheckedChange={(checked) => setSecuritySettings(prev => ({ ...prev, dataEncryption: checked }))}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Secure Backup</h4>
              <p className="text-sm text-muted-foreground">Create encrypted backups of your data</p>
            </div>
            <Switch 
              checked={securitySettings.secureBackup}
              onCheckedChange={(checked) => setSecuritySettings(prev => ({ ...prev, secureBackup: checked }))}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  )

  const renderDataSettings = () => (
    <div className="space-y-6">
      {/* Data Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Database className="h-5 w-5" />
            <span>Data Management</span>
          </CardTitle>
          <CardDescription>Control how your data is stored and managed</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Auto Backup</h4>
              <p className="text-sm text-muted-foreground">Automatically backup your data</p>
            </div>
            <Switch 
              checked={dataSettings.autoBackup}
              onCheckedChange={(checked) => setDataSettings(prev => ({ ...prev, autoBackup: checked }))}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Cloud Sync</h4>
              <p className="text-sm text-muted-foreground">Sync your data across devices</p>
            </div>
            <Switch 
              checked={dataSettings.cloudSync}
              onCheckedChange={(checked) => setDataSettings(prev => ({ ...prev, cloudSync: checked }))}
            />
          </div>
          
          <div className="space-y-2">
            <Label>Data Retention Period (days)</Label>
            <Select 
              value={dataSettings.dataRetention.toString()}
              onValueChange={(value) => setDataSettings(prev => ({ ...prev, dataRetention: parseInt(value) }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="30">30 days</SelectItem>
                <SelectItem value="90">90 days</SelectItem>
                <SelectItem value="180">6 months</SelectItem>
                <SelectItem value="365">1 year</SelectItem>
                <SelectItem value="730">2 years</SelectItem>
                <SelectItem value="0">Forever</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Analytics & Monitoring */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <BarChart3 className="h-5 w-5" />
            <span>Analytics & Monitoring</span>
          </CardTitle>
          <CardDescription>Control data collection and analytics</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Analytics Opt-in</h4>
              <p className="text-sm text-muted-foreground">Help improve the platform with usage analytics</p>
            </div>
            <Switch 
              checked={dataSettings.analyticsOptIn}
              onCheckedChange={(checked) => setDataSettings(prev => ({ ...prev, analyticsOptIn: checked }))}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Crash Reporting</h4>
              <p className="text-sm text-muted-foreground">Send crash reports to help fix bugs</p>
            </div>
            <Switch 
              checked={dataSettings.crashReporting}
              onCheckedChange={(checked) => setDataSettings(prev => ({ ...prev, crashReporting: checked }))}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Performance Monitoring</h4>
              <p className="text-sm text-muted-foreground">Monitor app performance and speed</p>
            </div>
            <Switch 
              checked={dataSettings.performanceMonitoring}
              onCheckedChange={(checked) => setDataSettings(prev => ({ ...prev, performanceMonitoring: checked }))}
            />
          </div>
        </CardContent>
      </Card>

      {/* Privacy Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Shield className="h-5 w-5" />
            <span>Privacy Controls</span>
          </CardTitle>
          <CardDescription>Control your privacy and data sharing</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Personalized Ads</h4>
              <p className="text-sm text-muted-foreground">Show personalized advertisements</p>
            </div>
            <Switch 
              checked={dataSettings.personalizedAds}
              onCheckedChange={(checked) => setDataSettings(prev => ({ ...prev, personalizedAds: checked }))}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Location Tracking</h4>
              <p className="text-sm text-muted-foreground">Allow location-based features</p>
            </div>
            <Switch 
              checked={dataSettings.locationTracking}
              onCheckedChange={(checked) => setDataSettings(prev => ({ ...prev, locationTracking: checked }))}
            />
          </div>
        </CardContent>
      </Card>

      {/* Data Export/Import */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Download className="h-5 w-5" />
            <span>Data Export/Import</span>
          </CardTitle>
          <CardDescription>Export or import your data</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Export Data</h4>
              <p className="text-sm text-muted-foreground">Download a copy of your data</p>
            </div>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Import Data</h4>
              <p className="text-sm text-muted-foreground">Import data from another platform</p>
            </div>
            <Button variant="outline" size="sm">
              <Upload className="h-4 w-4 mr-2" />
              Import
            </Button>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Delete All Data</h4>
              <p className="text-sm text-muted-foreground text-red-600">Permanently delete all your data</p>
            </div>
            <Button variant="destructive" size="sm">
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )

  const renderPrivacySettings = () => (
    <div className="space-y-6">
      {/* Profile Privacy */}
      <Card>
        <CardHeader>
          <CardTitle>Profile Privacy</CardTitle>
          <CardDescription>Control who can see your profile information</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Public Profile</h4>
              <p className="text-sm text-muted-foreground">Make your profile visible to everyone</p>
            </div>
            <Switch defaultChecked />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Show Email</h4>
              <p className="text-sm text-muted-foreground">Display your email on your profile</p>
            </div>
            <Switch />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Show Location</h4>
              <p className="text-sm text-muted-foreground">Display your location on your profile</p>
            </div>
            <Switch defaultChecked />
          </div>
        </CardContent>
      </Card>

      {/* Content Privacy */}
      <Card>
        <CardHeader>
          <CardTitle>Content Privacy</CardTitle>
          <CardDescription>Control who can see your content</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Public Posts</h4>
              <p className="text-sm text-muted-foreground">Make your posts visible to everyone</p>
            </div>
            <Switch defaultChecked />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Allow Comments</h4>
              <p className="text-sm text-muted-foreground">Let others comment on your posts</p>
            </div>
            <Switch defaultChecked />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Allow Shares</h4>
              <p className="text-sm text-muted-foreground">Let others share your posts</p>
            </div>
            <Switch defaultChecked />
          </div>
        </CardContent>
      </Card>

      {/* Blocked Users */}
      <Card>
        <CardHeader>
          <CardTitle>Blocked Users</CardTitle>
          <CardDescription>Manage users you've blocked</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-medium mb-2">No blocked users</h3>
            <p className="text-sm text-muted-foreground">Users you block will appear here</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )

  const renderAppearanceSettings = () => (
    <div className="space-y-6">
      {/* Theme Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Theme</CardTitle>
          <CardDescription>Choose your preferred theme</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button
              variant={theme === 'light' ? 'default' : 'outline'}
              onClick={() => setTheme('light')}
              className="h-20 flex-col space-y-2"
            >
              <Sun className="h-6 w-6" />
              <span>Light</span>
            </Button>
            <Button
              variant={theme === 'dark' ? 'default' : 'outline'}
              onClick={() => setTheme('dark')}
              className="h-20 flex-col space-y-2"
            >
              <Moon className="h-6 w-6" />
              <span>Dark</span>
            </Button>
            <Button
              variant={theme === 'system' ? 'default' : 'outline'}
              onClick={() => setTheme('system')}
              className="h-20 flex-col space-y-2"
            >
              <Monitor className="h-6 w-6" />
              <span>System</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Display Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Display</CardTitle>
          <CardDescription>Customize your display preferences</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Language</Label>
            <Select defaultValue="en">
              <SelectTrigger>
                <SelectValue placeholder="Select language" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="es">Spanish</SelectItem>
                <SelectItem value="fr">French</SelectItem>
                <SelectItem value="de">German</SelectItem>
                <SelectItem value="ja">Japanese</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label>Time Zone</Label>
            <Select defaultValue="utc">
              <SelectTrigger>
                <SelectValue placeholder="Select time zone" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="utc">UTC</SelectItem>
                <SelectItem value="est">Eastern Time</SelectItem>
                <SelectItem value="pst">Pacific Time</SelectItem>
                <SelectItem value="gmt">GMT</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Compact Mode</h4>
              <p className="text-sm text-muted-foreground">Use a more compact layout</p>
            </div>
            <Switch />
          </div>
        </CardContent>
      </Card>
    </div>
  )

  const renderBillingSettings = () => (
    <div className="space-y-6">
      {/* Subscription Status */}
      <Card>
        <CardHeader>
          <CardTitle>Subscription</CardTitle>
          <CardDescription>Manage your subscription and billing</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Current Plan</h4>
              <p className="text-sm text-muted-foreground">Free Plan</p>
            </div>
            <Badge variant="secondary">Active</Badge>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Next Billing Date</h4>
              <p className="text-sm text-muted-foreground">No active subscription</p>
            </div>
          </div>
          
          <Button onClick={() => setShowUpgradeModal(true)}>
            <Crown className="h-4 w-4 mr-2" />
            Upgrade to Creator
          </Button>
        </CardContent>
      </Card>

      {/* Payment Methods */}
      <Card>
        <CardHeader>
          <CardTitle>Payment Methods</CardTitle>
          <CardDescription>Manage your payment methods for subscriptions and purchases</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {paymentMethods.length > 0 ? (
            <>
              <div className="space-y-3">
                {paymentMethods.map((method) => (
                  <div key={method.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center justify-center w-10 h-6 bg-gray-100 rounded">
                        <CreditCard className="h-4 w-4 text-gray-600" />
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-medium">
                            {method.type.toUpperCase()} •••• {method.last4}
                          </span>
                          {method.isDefault && (
                            <Badge variant="secondary" className="text-xs">Default</Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {method.cardholderName} • Expires {method.expiryMonth}/{method.expiryYear}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleEditPaymentMethod(method)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-red-600 hover:text-red-700"
                        onClick={() => handleDeletePaymentMethod(method)}
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
              <Button variant="outline" onClick={() => setShowPaymentModal(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Payment Method
              </Button>
            </>
          ) : (
            <div className="text-center py-8">
              <CreditCard className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-medium mb-2">No payment methods</h3>
              <p className="text-sm text-muted-foreground mb-4">Add a payment method to get started</p>
              <Button variant="outline" onClick={() => setShowPaymentModal(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Payment Method
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Billing History */}
      <Card>
        <CardHeader>
          <CardTitle>Billing History</CardTitle>
          <CardDescription>View your past transactions and payments</CardDescription>
        </CardHeader>
        <CardContent>
          {transactions.length > 0 ? (
            <div className="space-y-3">
              {transactions.map((transaction) => {
                const Icon = getTransactionIcon(transaction.type)
                return (
                  <div key={transaction.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center justify-center w-10 h-10 bg-gray-100 rounded-full">
                        <Icon className="h-5 w-5 text-gray-600" />
                      </div>
                      <div>
                        <div className="font-medium">{transaction.description}</div>
                        <div className="text-sm text-muted-foreground">
                          {formatTransactionDate(transaction.date)} • {transaction.paymentMethod}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">
                        ${transaction.amount.toFixed(2)} {transaction.currency}
                      </div>
                      <Badge 
                        variant="secondary" 
                        className={`text-xs ${getTransactionStatusColor(transaction.status)}`}
                      >
                        {transaction.status}
                      </Badge>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="text-center py-8">
              <Receipt className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-medium mb-2">No billing history</h3>
              <p className="text-sm text-muted-foreground">Your transactions will appear here</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )

  const renderAgeVerificationSettings = () => (
    <div className="space-y-6">
      {/* Age Verification */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Shield className="h-5 w-5" />
            <span>Age Verification</span>
          </CardTitle>
          <CardDescription>
            Verify your age with government ID and facial biometric to access age-restricted content
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Verification Status</h4>
              <p className="text-sm text-muted-foreground">
                {ageVerificationStatus === 'verified' && 'Your age has been verified'}
                {ageVerificationStatus === 'pending' && 'Verification is under review'}
                {ageVerificationStatus === 'rejected' && 'Verification was rejected. Please resubmit.'}
                {ageVerificationStatus === 'not_submitted' && 'Age verification required for some content'}
              </p>
            </div>
            <Badge 
              variant={
                ageVerificationStatus === 'verified' ? 'default' :
                ageVerificationStatus === 'pending' ? 'secondary' :
                ageVerificationStatus === 'rejected' ? 'destructive' : 'outline'
              }
            >
              {ageVerificationStatus === 'verified' && (
                <>
                  <CheckCircle2 className="h-3 w-3 mr-1" />
                  Verified
                </>
              )}
              {ageVerificationStatus === 'pending' && (
                <>
                  <Clock className="h-3 w-3 mr-1" />
                  Pending
                </>
              )}
              {ageVerificationStatus === 'rejected' && (
                <>
                  <AlertCircle className="h-3 w-3 mr-1" />
                  Rejected
                </>
              )}
              {ageVerificationStatus === 'not_submitted' && 'Not Submitted'}
            </Badge>
          </div>

          {ageVerificationStatus !== 'verified' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="government-id">Government ID</Label>
                  <div className="flex items-center space-x-2">
                    <Input
                      id="government-id"
                      type="file"
                      accept="image/*,.pdf"
                      onChange={handleGovernmentIdUpload}
                      className="flex-1"
                    />
                    <IdCard className="h-4 w-4 text-muted-foreground" />
                  </div>
                  {governmentIdFile && (
                    <p className="text-sm text-green-600">
                      ✓ {governmentIdFile.name} uploaded
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="selfie">Selfie Photo</Label>
                  <div className="flex items-center space-x-2">
                    <Input
                      id="selfie"
                      type="file"
                      accept="image/*"
                      onChange={handleSelfieUpload}
                      className="flex-1"
                    />
                    <Camera className="h-4 w-4 text-muted-foreground" />
                  </div>
                  {selfieFile && (
                    <p className="text-sm text-green-600">
                      ✓ {selfieFile.name} uploaded
                    </p>
                  )}
                </div>
              </div>

              <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg">
                <div className="flex items-start space-x-2">
                  <Shield className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div>
                    <h5 className="font-medium text-blue-900 dark:text-blue-100">Privacy & Security</h5>
                    <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                      Your documents are encrypted and processed securely. We only verify your age and do not store your personal information.
                    </p>
                  </div>
                </div>
              </div>

              <Button 
                onClick={handleAgeVerificationSubmit}
                disabled={!governmentIdFile || !selfieFile || isUploadingVerification}
                className="w-full"
              >
                {isUploadingVerification ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Submitting Verification...
                  </>
                ) : (
                  <>
                    <Shield className="h-4 w-4 mr-2" />
                    Submit Age Verification
                  </>
                )}
              </Button>
            </div>
          )}

          {ageVerificationStatus === 'verified' && (
            <div className="bg-green-50 dark:bg-green-950 p-4 rounded-lg">
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
                <div>
                  <h5 className="font-medium text-green-900 dark:text-green-100">Age Verified</h5>
                  <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                    You can now access age-restricted content and features on the platform.
                  </p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )

  const renderBankAccountSettings = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Add Bank Account</CardTitle>
          <CardDescription>Set up a bank account to receive payments and earnings</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center py-8">
            <Building2 className="h-16 w-16 text-blue-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Add Your Bank Account</h3>
            <p className="text-muted-foreground mb-6">
              Connect your bank account to receive payments from subscribers and tips
            </p>
            <Button onClick={() => setShowBankAccountModal(true)} size="lg">
              <Building2 className="h-4 w-4 mr-2" />
              Add Bank Account
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )

  const renderCreditCardSettings = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Add Credit Card</CardTitle>
          <CardDescription>Set up a credit card for subscriptions and purchases</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center py-8">
            <Wallet className="h-16 w-16 text-green-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Add Your Credit Card</h3>
            <p className="text-muted-foreground mb-6">
              Add a credit card to subscribe to creators and make purchases
            </p>
            <Button onClick={() => setShowCreditCardModal(true)} size="lg">
              <Wallet className="h-4 w-4 mr-2" />
              Add Credit Card
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )

  const renderTabContent = () => {
    switch (activeTab) {
      case 'profile':
        return renderProfileSettings()
      case 'account':
        return renderAccountSettings()
      case 'notifications':
        return renderNotificationSettings()
      case 'privacy':
        return renderPrivacySettings()
      case 'appearance':
        return renderAppearanceSettings()
      case 'content':
        return renderContentSettings()
      case 'accessibility':
        return renderAccessibilitySettings()
      case 'security':
        return renderSecuritySettings()
      case 'data':
        return renderDataSettings()
      case 'bank-account':
        return renderBankAccountSettings()
      case 'credit-card':
        return renderCreditCardSettings()
      case 'billing':
        return renderBillingSettings()
      case 'age-verification':
        return renderAgeVerificationSettings()
      default:
        return renderProfileSettings()
    }
  }

  return (
    <AuthGuard>
      <div className="container mx-auto px-4 py-6">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 lg:gap-6">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Settings</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="space-y-1">
                {tabs.map((tab) => {
                  const Icon = tab.icon
                  return (
                    <Button
                      key={tab.id}
                      variant={activeTab === tab.id ? 'secondary' : 'ghost'}
                      className="w-full justify-start"
                      onClick={() => setActiveTab(tab.id)}
                    >
                      <Icon className="h-4 w-4 mr-2" />
                      {tab.label}
                    </Button>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3">
          <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold">
                  {tabs.find(tab => tab.id === activeTab)?.label} Settings
                </h1>
                <p className="text-muted-foreground">
                  Manage your {tabs.find(tab => tab.id === activeTab)?.label.toLowerCase()} preferences
                </p>
              </div>
              <Button onClick={handleSave} disabled={isLoading}>
                <Save className="h-4 w-4 mr-2" />
                {isLoading ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>

            {/* Tab Content */}
            {renderTabContent()}
          </div>
        </div>
      </div>

      {/* Payment Method Modal */}
      <AddPaymentMethodModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        onSuccess={handlePaymentMethodAdded}
      />

      {/* Upgrade Creator Modal */}
      <UpgradeCreatorModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        onSuccess={handleUpgradeSuccess}
      />

      {/* Edit Payment Method Modal */}
      {selectedPaymentMethod && (
        <EditPaymentMethodModal
          isOpen={showEditModal}
          onClose={() => {
            setShowEditModal(false)
            setSelectedPaymentMethod(null)
          }}
          onSuccess={handlePaymentMethodUpdated}
          paymentMethod={selectedPaymentMethod}
        />
      )}

      {/* Delete Payment Method Modal */}
      {selectedPaymentMethod && (
        <DeletePaymentMethodModal
          isOpen={showDeleteModal}
          onClose={() => {
            setShowDeleteModal(false)
            setSelectedPaymentMethod(null)
          }}
          onSuccess={handlePaymentMethodDeleted}
          paymentMethod={selectedPaymentMethod}
        />
      )}

      {/* Add Bank Account Modal */}
      <AddPaymentMethodModal
        isOpen={showBankAccountModal}
        onClose={() => setShowBankAccountModal(false)}
        onSuccess={() => {
          setShowBankAccountModal(false)
          // Handle bank account addition success
        }}
        title="Add Bank Account"
        description="Add a bank account to receive payments and earnings"
        type="bank"
      />

      {/* Add Credit Card Modal */}
      <AddPaymentMethodModal
        isOpen={showCreditCardModal}
        onClose={() => setShowCreditCardModal(false)}
        onSuccess={() => {
          setShowCreditCardModal(false)
          // Handle credit card addition success
        }}
        title="Add Credit Card"
        description="Add a credit card for subscriptions and purchases"
        type="card"
      />
      </div>
    </AuthGuard>
  )
}
