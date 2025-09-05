"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import { Music, Settings } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import { useRouter } from "next/navigation"

interface HeaderProps {
  onAuthClick: () => void
  championThumbnail?: string
  championTitle?: string
}

export function Header({ onAuthClick, championThumbnail, championTitle }: HeaderProps) {
  const { user, logout, isAdmin } = useAuth()
  const router = useRouter()

  const handleBackgroundImageError = (e: React.SyntheticEvent<HTMLDivElement>) => {
    const target = e.target as HTMLDivElement
    target.style.backgroundImage = `url('/m-sica-sertaneja-background.jpg')`
  }

  return (
    <header className="relative overflow-hidden">
      {/* Background image with overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/80 to-black/70 z-10" />
      <div
        className="absolute inset-0 bg-cover bg-center transition-all duration-500"
        style={{
          backgroundImage: championThumbnail
            ? `url('${championThumbnail}')`
            : `url('/ti-o-carreiro-pardinho-m-sica-sertaneja.jpg')`,
        }}
        onError={handleBackgroundImageError}
      />

      {/* Content */}
      <div className="relative z-20 container mx-auto px-4 py-16 text-center text-white">
        <div className="flex justify-between items-start mb-8">
          <div className="flex items-center gap-2">
            <Music className="h-8 w-8" />
            <span className="text-xl font-bold bg-black/50 px-3 py-1 rounded-lg">Eu amo Sertanejo</span>
          </div>

          <div className="flex gap-2">
            {user ? (
              <div className="flex items-center gap-4">
                <span className="text-sm bg-black/50 px-2 py-1 rounded">Olá, {user.name}</span>
                {isAdmin && (
                  <Button variant="secondary" size="sm" onClick={() => router.push("/admin")} className="gap-2">
                    <Settings className="h-4 w-4" />
                    Admin
                  </Button>
                )}
                <Button size="sm" onClick={logout}>
                  Sair
                </Button>
              </div>
            ) : (
              <Button size="sm" onClick={onAuthClick}>
                Entrar
              </Button>
            )}
          </div>
        </div>

        <div className="max-w-4xl mx-auto">
          <img
            src={championThumbnail || "/placeholder.svg?height=192&width=192&query=Tião Carreiro Pardinho"}
            alt={championTitle || "Tião Carreiro & Pardinho"}
            className="w-48 h-48 rounded-full mx-auto mb-6 border-4 border-white/20 shadow-2xl object-cover"
            onError={(e) => {
              const target = e.target as HTMLImageElement
              target.src = "/ti-o-carreiro-pardinho.jpg"
            }}
          />
          <div className="bg-black/40 rounded-2xl p-6 backdrop-blur-sm">
            <h1 className="text-6xl font-bold mb-4 text-balance text-white">Top 5 Músicas Mais Tocadas</h1>
            <h2 className="text-3xl font-medium opacity-90 text-balance text-white">Tião Carreiro & Pardinho</h2>
            <p className="text-lg mt-4 opacity-80 max-w-2xl mx-auto text-pretty text-white">
              {championTitle
                ? `Atualmente liderando com "${championTitle}" - O melhor da música sertaneja brasileira`
                : "O melhor da música sertaneja brasileira. Atualmente destacando a dupla que marcou gerações"}
            </p>
          </div>
        </div>
      </div>
    </header>
  )
}
