"use client"

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu'
import { useAuth } from '@/components/providers/auth-provider'
import { useTheme } from 'next-themes'
import { 
  Bell, 
  Heart, 
  User, 
  Settings, 
  Moon, 
  Sun, 
  LogOut
} from 'lucide-react'

export function Navigation() {
  const pathname = usePathname()
  const { user, profile, signOut } = useAuth()
  const { theme, setTheme } = useTheme()

  if (!user) return null

  const getPageTitle = () => {
    switch (pathname) {
      case '/feed':
        return 'Home'
      case '/explore':
        return 'Explore'
      case '/messages':
        return 'Messages'
      case '/notifications':
        return 'Notifications'
      case '/profile':
        return 'Profile'
      case '/settings':
        return 'Settings'
      case '/collections':
        return 'Collections'
      case '/vault':
        return 'Vault'
      case '/queue':
        return 'Queue'
      case '/statements':
        return 'Statements'
      case '/statistics':
        return 'Statistics'
      case '/more':
        return 'More'
      case '/creator/dashboard':
        return 'Creator Dashboard'
      default:
        return 'Flavours'
    }
  }

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-16 items-center justify-between px-6">
        {/* Page Title */}
        <div className="flex items-center">
          <h1 className="text-xl font-bold">{getPageTitle()}</h1>
        </div>

        {/* Right Section - User Actions */}
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/notifications" prefetch={true}>
              <Bell className="h-5 w-5" />
            </Link>
          </Button>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/favorites" prefetch={true}>
              <Heart className="h-5 w-5" />
            </Link>
          </Button>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={profile?.avatar_url} alt={profile?.display_name} />
                  <AvatarFallback>
                    {profile?.display_name?.charAt(0) || user.email?.charAt(0)}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <div className="flex items-center justify-start gap-2 p-2">
                <div className="flex flex-col space-y-1 leading-none">
                  <p className="font-medium">{profile?.display_name}</p>
                  <p className="w-[200px] truncate text-sm text-muted-foreground">
                    @{profile?.username}
                  </p>
                </div>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/profile" prefetch={true}>
                  <User className="mr-2 h-4 w-4" />
                  Profile
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/settings" prefetch={true}>
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
                {theme === 'dark' ? (
                  <Sun className="mr-2 h-4 w-4" />
                ) : (
                  <Moon className="mr-2 h-4 w-4" />
                )}
                Toggle theme
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={signOut}>
                <LogOut className="mr-2 h-4 w-4" />
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </nav>
  )
}