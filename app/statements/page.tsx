"use client"

import React from 'react'
import { AuthGuard } from '@/components/auth/auth-guard'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { BarChart3, Download, DollarSign, TrendingUp, Calendar } from 'lucide-react'

export default function StatementsPage() {
  const statements = [
    {
      id: 1,
      period: 'December 2024',
      earnings: 1250.75,
      status: 'paid',
      date: '2024-01-01'
    },
    {
      id: 2,
      period: 'November 2024',
      earnings: 980.50,
      status: 'paid',
      date: '2023-12-01'
    },
    {
      id: 3,
      period: 'October 2024',
      earnings: 1456.25,
      status: 'paid',
      date: '2023-11-01'
    }
  ]

  return (
    <AuthGuard>
      <div className="container mx-auto px-4 py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Statements</h1>
          <p className="text-muted-foreground">View your earnings and payment history</p>
        </div>
        <Button variant="outline">
          <Download className="h-4 w-4 mr-2" />
          Export All
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <DollarSign className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm text-muted-foreground">Total Earnings</p>
                <p className="text-2xl font-bold">$3,687.50</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm text-muted-foreground">This Month</p>
                <p className="text-2xl font-bold">$1,250.75</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <BarChart3 className="h-5 w-5 text-purple-600" />
              <div>
                <p className="text-sm text-muted-foreground">Growth</p>
                <p className="text-2xl font-bold">+12.5%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Statements List */}
      <Card>
        <CardHeader>
          <CardTitle>Payment Statements</CardTitle>
          <CardDescription>Your monthly earnings statements</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {statements.map((statement) => (
            <div key={statement.id} className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center space-x-4">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Calendar className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <h3 className="font-medium">{statement.period}</h3>
                  <p className="text-sm text-muted-foreground">
                    Paid on {new Date(statement.date).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="text-right">
                  <p className="font-bold text-lg">${statement.earnings.toFixed(2)}</p>
                  <Badge variant="secondary">{statement.status}</Badge>
                </div>
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
      </div>
    </AuthGuard>
  )
}
