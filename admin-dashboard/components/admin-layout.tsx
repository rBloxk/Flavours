'use client'

import { ReactNode } from 'react'
import { AdminSidebar } from './admin-sidebar'
import { AdminHeader } from './admin-header'

interface AdminLayoutProps {
  children: ReactNode
}

export function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      <AdminHeader />
      <div className="flex">
        <AdminSidebar />
        <main className="flex-1 p-6 lg:ml-64 mt-20">
          {children}
        </main>
      </div>
    </div>
  )
}
