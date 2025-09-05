"use client"

import { useState, useEffect } from "react"
import { Header } from "@/components/header"
import { TopSongs } from "@/components/top-songs"
import { SuggestSong } from "@/components/suggest-song"
import { RemainingSongs } from "@/components/remaining-songs"
import { AuthModal } from "@/components/auth-modal"
import { useAuth } from "@/hooks/use-auth"
import { api, type Song } from "@/lib/api"

export default function HomePage() {
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [championSong, setChampionSong] = useState<Song | null>(null)
  const { user } = useAuth()

  useEffect(() => {
    const fetchChampionSong = async () => {
      try {
        const songs = await api.getTopSongs()
        if (songs && songs.length > 0) {
          setChampionSong(songs[0])
        }
      } catch (error) {
        console.error("Error fetching champion song:", error)
        const mockChampion: Song = {
          id: 1,
          title: "O Mineiro e o Italiano",
          artist: "Tião Carreiro & Pardinho",
          youtube_url: "https://www.youtube.com/watch?v=s9kVG2ZaTS4",
          youtube_id: "s9kVG2ZaTS4",
          thumbnail: "https://img.youtube.com/vi/s9kVG2ZaTS4/hqdefault.jpg",
          views: 5200000,
          status: "approved",
          formatted_views: "5.2M",
        }
        setChampionSong(mockChampion)
      }
    }

    fetchChampionSong()
  }, [])

  return (
    <div className="min-h-screen bg-background">
      <Header
        onAuthClick={() => setShowAuthModal(true)}
        championThumbnail={championSong?.thumbnail ?? undefined}
        championTitle={championSong?.title ?? undefined}
      />

      <main className="container mx-auto px-4 py-8 space-y-12">
        <TopSongs />
        <SuggestSong />
        <RemainingSongs />
      </main>

      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
    </div>
  )
}
