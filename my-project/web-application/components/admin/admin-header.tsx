"use client"

import { Button } from "@/components/ui/button"
import { Music, Home, LogOut } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import { useRouter } from "next/navigation"

export function AdminHeader() {
  const { user, logout } = useAuth()
  const router = useRouter()

  const handleLogout = async () => {
    await logout()
    router.push("/")
  }

  return (
    <header className="border-b bg-card">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Music className="h-6 w-6 text-primary" />
              <span className="text-xl font-bold">Admin - Tião Carreiro</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">Olá, {user?.name}</span>
            <Button variant="outline" size="sm" onClick={() => router.push("/")} className="gap-2">
              <Home className="h-4 w-4" />
              Site Principal
            </Button>
            <Button variant="outline" size="sm" onClick={handleLogout} className="gap-2 bg-transparent">
              <LogOut className="h-4 w-4" />
              Sair
            </Button>
          </div>
        </div>
      </div>
    </header>
  )
}
