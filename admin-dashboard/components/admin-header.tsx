'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ThemeToggle } from '@/components/theme-toggle'
import { useAuth } from './auth-provider'
import { 
  Bell,
  Search,
  Settings,
  User,
  LogOut,
  ChevronDown
} from 'lucide-react'

export function AdminHeader() {
  const [notifications] = useState(5) // Mock notification count
  const [showUserMenu, setShowUserMenu] = useState(false)
  const { user, logout } = useAuth()
  const router = useRouter()

  const handleLogout = async () => {
    await logout()
    router.push('/login')
  }

  return (
    <header className="bg-card border-b lg:ml-64 fixed top-0 right-0 left-0 lg:left-64 z-30">
      <div className="flex items-center justify-between h-16 px-6">
        {/* Search */}
        <div className="flex-1 max-w-lg">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search users, content, or reports..."
              className="w-full pl-10 pr-4 py-2 border border-input rounded-md bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
            />
          </div>
        </div>

        {/* Demo Mode Indicator */}
        <div className="hidden md:flex items-center space-x-2 mr-4">
          <Badge variant="outline" className="text-xs">
            DEMO MODE
          </Badge>
        </div>

        {/* Right side */}
        <div className="flex items-center space-x-4">
          {/* Theme Toggle */}
          <ThemeToggle />

          {/* Notifications */}
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-4 w-4" />
            {notifications > 0 && (
              <Badge 
                variant="destructive" 
                className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center text-xs"
              >
                {notifications}
              </Badge>
            )}
          </Button>

          {/* Settings */}
          <Button variant="ghost" size="icon">
            <Settings className="h-4 w-4" />
          </Button>

          {/* User menu */}
          <div className="relative">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center space-x-2"
            >
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                <span className="text-sm font-medium text-primary-foreground">
                  {user?.name?.charAt(0) || 'U'}
                </span>
              </div>
              <span className="hidden md:block text-sm font-medium">{user?.name || 'User'}</span>
              <ChevronDown className="h-4 w-4" />
            </Button>

            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-card border rounded-md shadow-lg z-50">
                <div className="p-3 border-b">
                  <p className="text-sm font-medium">{user?.name}</p>
                  <p className="text-xs text-muted-foreground">{user?.email}</p>
                  <Badge variant="secondary" className="mt-1 text-xs">
                    {user?.role}
                  </Badge>
                </div>
                <div className="p-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleLogout}
                    className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
