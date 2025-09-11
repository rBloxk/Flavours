'use client'

import { AdminLayout } from '@/components/admin-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ThemeToggle } from '@/components/theme-toggle'
import { useTheme } from '@/components/theme-provider'
import { 
  Sun, 
  Moon, 
  Monitor,
  Palette,
  Eye,
  CheckCircle
} from 'lucide-react'

export default function ThemeDemoPage() {
  const { theme } = useTheme()

  return (
    <AdminLayout>
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Theme Demo</h1>
            <p className="text-muted-foreground">Test the dark and light mode themes</p>
          </div>
          <ThemeToggle />
        </div>
      </div>

      {/* Current Theme Status */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5" />
            Current Theme
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <Badge variant={theme === 'dark' ? 'default' : 'secondary'}>
              {theme === 'dark' ? (
                <>
                  <Moon className="h-3 w-3 mr-1" />
                  Dark Mode
                </>
              ) : theme === 'light' ? (
                <>
                  <Sun className="h-3 w-3 mr-1" />
                  Light Mode
                </>
              ) : (
                <>
                  <Monitor className="h-3 w-3 mr-1" />
                  System
                </>
              )}
            </Badge>
            <p className="text-sm text-muted-foreground">
              Click the theme toggle button in the header to switch themes
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Theme Features */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              Visual Elements
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="p-3 bg-muted rounded-md">
                <p className="text-sm">Muted background</p>
              </div>
              <div className="p-3 bg-accent rounded-md">
                <p className="text-sm">Accent background</p>
              </div>
              <div className="p-3 border rounded-md">
                <p className="text-sm">Bordered element</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5" />
              Color Scheme
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-primary rounded"></div>
                <span className="text-sm">Primary</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-secondary rounded"></div>
                <span className="text-sm">Secondary</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-destructive rounded"></div>
                <span className="text-sm">Destructive</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-muted rounded"></div>
                <span className="text-sm">Muted</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Interactive Elements</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <Button className="w-full">Primary Button</Button>
              <Button variant="secondary" className="w-full">Secondary Button</Button>
              <Button variant="outline" className="w-full">Outline Button</Button>
              <Button variant="ghost" className="w-full">Ghost Button</Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Text Examples */}
      <Card>
        <CardHeader>
          <CardTitle>Typography Examples</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h1 className="text-4xl font-bold">Heading 1</h1>
              <p className="text-muted-foreground">Large heading text</p>
            </div>
            <div>
              <h2 className="text-3xl font-semibold">Heading 2</h2>
              <p className="text-muted-foreground">Medium heading text</p>
            </div>
            <div>
              <h3 className="text-2xl font-medium">Heading 3</h3>
              <p className="text-muted-foreground">Small heading text</p>
            </div>
            <div>
              <p className="text-base">Regular paragraph text with normal weight and size.</p>
              <p className="text-sm text-muted-foreground">Small muted text for descriptions and captions.</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </AdminLayout>
  )
}
