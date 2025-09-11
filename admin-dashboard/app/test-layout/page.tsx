'use client'

import { AdminLayout } from '@/components/admin-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function TestLayoutPage() {
  return (
    <AdminLayout>
          <div className="mb-8">
            <h1 className="text-3xl font-bold">Layout Test Page</h1>
            <p className="text-muted-foreground">Testing the sidebar and main content layout</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Test Card 1</CardTitle>
              </CardHeader>
              <CardContent>
                <p>This card should not be hidden behind the sidebar.</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Test Card 2</CardTitle>
              </CardHeader>
              <CardContent>
                <p>The main content should have proper left margin.</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Test Card 3</CardTitle>
              </CardHeader>
              <CardContent>
                <p>All content should be visible and properly spaced.</p>
              </CardContent>
            </Card>
          </div>

          <div className="mt-8">
            <Card>
              <CardHeader>
                <CardTitle>Full Width Test</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="mb-4">This is a full-width card to test the layout.</p>
                <div className="bg-muted p-4 rounded-md">
                  <p className="text-sm text-muted-foreground">
                    The content should extend to the right edge of the screen but not overlap with the sidebar.
                    On desktop (lg and above), there should be a 256px (w-64) left margin.
                    On mobile, the content should be full width with the sidebar hidden.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
    </AdminLayout>
  )
}
