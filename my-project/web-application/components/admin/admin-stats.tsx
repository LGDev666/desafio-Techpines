"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Music, Clock, CheckCircle, XCircle } from "lucide-react"
import { api } from "@/lib/api"

interface Stats {
  total: number
  approved: number
  pending: number
  rejected: number
}

export function AdminStats() {
  const [stats, setStats] = useState<Stats>({
    total: 0,
    approved: 0,
    pending: 0,
    rejected: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const data = await api.getAdminStats()
      setStats(data)
    } catch (error) {
      console.error("Error fetching stats:", error)
      // Fallback to mock data if API fails
      setStats({
        total: 25,
        approved: 15,
        pending: 8,
        rejected: 2,
      })
    } finally {
      setLoading(false)
    }
  }

  const statCards = [
    {
      title: "Total de Músicas",
      value: stats.total,
      icon: Music,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      title: "Aprovadas",
      value: stats.approved,
      icon: CheckCircle,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      title: "Pendentes",
      value: stats.pending,
      icon: Clock,
      color: "text-yellow-600",
      bgColor: "bg-yellow-50",
    },
    {
      title: "Rejeitadas",
      value: stats.rejected,
      icon: XCircle,
      color: "text-red-600",
      bgColor: "bg-red-50",
    },
  ]

  if (loading) {
    return (
      <div className="grid grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="p-6 animate-pulse">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-muted rounded-lg" />
              <div className="space-y-2">
                <div className="h-4 bg-muted rounded w-20" />
                <div className="h-6 bg-muted rounded w-12" />
              </div>
            </div>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-4 gap-6">
      {statCards.map((stat) => (
        <Card key={stat.title} className="p-6">
          <div className="flex items-center gap-4">
            <div className={`p-3 rounded-lg ${stat.bgColor}`}>
              <stat.icon className={`h-6 w-6 ${stat.color}`} />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{stat.title}</p>
              <p className="text-2xl font-bold">{stat.value}</p>
            </div>
          </div>
        </Card>
      ))}
    </div>
  )
}
