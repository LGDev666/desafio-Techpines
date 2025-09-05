"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Play, ExternalLink, Crown, Trophy } from "lucide-react"
import { Button } from "@/components/ui/button"
import { api, type Song } from "@/lib/api"

export function TopSongs() {
  const [songs, setSongs] = useState<Song[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [imageErrors, setImageErrors] = useState<Set<string>>(new Set())

  useEffect(() => {
    fetchTopSongs()
  }, [])

  const fetchTopSongs = async () => {
    try {
      setLoading(true)
      setError("")
      const data = await api.getTopSongs()
      setSongs(data)
    } catch (error) {
      console.error("Error fetching top songs:", error)
      setError("Erro ao carregar as músicas. Verifique se a API está rodando em localhost:8000")
    } finally {
      setLoading(false)
    }
  }

  const handleImageError = (songId: string) => {
    setImageErrors((prev) => new Set(prev).add(songId))
  }

  const getThumbnailUrl = (song: Song) => {
    const youtubeId = song.youtube_id || ""
    if (imageErrors.has(youtubeId)) {
      return `/placeholder.svg?height=180&width=320&query=música ${song.title}`
    }
    return song.thumbnail || `/placeholder.svg?height=180&width=320&query=música ${song.title}`
  }

  if (loading) {
    return (
      <section className="space-y-8">
        <h2 className="text-3xl font-bold text-center">Ranking Atual</h2>
        <div className="space-y-6">
          {/* Champion placeholder */}
          <Card className="p-8 animate-pulse">
            <div className="flex flex-col md:flex-row items-center gap-8">
              <div className="w-80 h-48 bg-muted rounded-xl" />
              <div className="flex-1 space-y-4 text-center md:text-left">
                <div className="h-8 bg-muted rounded w-3/4 mx-auto md:mx-0" />
                <div className="h-6 bg-muted rounded w-1/2 mx-auto md:mx-0" />
              </div>
            </div>
          </Card>
          {/* Other songs placeholder */}
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="p-6 animate-pulse">
              <div className="flex items-center gap-6">
                <div className="w-16 h-16 bg-muted rounded-lg" />
                <div className="flex-1 space-y-2">
                  <div className="h-6 bg-muted rounded w-3/4" />
                  <div className="h-4 bg-muted rounded w-1/2" />
                </div>
                <div className="w-32 h-20 bg-muted rounded" />
              </div>
            </Card>
          ))}
        </div>
      </section>
    )
  }

  if (error) {
    return (
      <section className="space-y-8">
        <div className="text-center space-y-2">
          <h2 className="text-4xl font-bold">Ranking Atual</h2>
          <p className="text-muted-foreground text-lg">As 5 músicas mais tocadas no YouTube</p>
        </div>
        <Card className="p-8 text-center">
          <div className="space-y-4">
            <div className="text-red-500 font-semibold">{error}</div>
            <Button onClick={fetchTopSongs} variant="outline">
              Tentar Novamente
            </Button>
          </div>
        </Card>
      </section>
    )
  }

  if (songs.length === 0) {
    return (
      <section className="space-y-8">
        <div className="text-center space-y-2">
          <h2 className="text-4xl font-bold">Ranking Atual</h2>
          <p className="text-muted-foreground text-lg">As 5 músicas mais tocadas no YouTube</p>
        </div>
        <Card className="p-8 text-center">
          <div className="space-y-4">
            <div className="text-muted-foreground">Nenhuma música encontrada no ranking</div>
            <Button onClick={fetchTopSongs} variant="outline">
              Recarregar
            </Button>
          </div>
        </Card>
      </section>
    )
  }

  const [champion, ...otherSongs] = songs

  return (
    <section className="space-y-8">
      <div className="text-center space-y-2">
        <h2 className="text-4xl font-bold">Ranking Atual</h2>
        <p className="text-muted-foreground text-lg">As 5 músicas mais tocadas no YouTube</p>
      </div>

      {champion && (
        <div className="relative">
          <Card className="overflow-hidden border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-accent/5 shadow-2xl">
            <div className="absolute top-4 right-4 z-10">
              <div className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-full font-bold shadow-lg">
                <Crown className="h-5 w-5" />
                CAMPEÃO
              </div>
            </div>

            <div className="p-8">
              <div className="flex flex-col lg:flex-row items-center gap-8">
                {/* Champion thumbnail */}
                <div className="relative group/champion">
                  <div className="absolute -inset-2 bg-gradient-to-r from-primary to-accent rounded-2xl opacity-75 group-hover/champion:opacity-100 transition-opacity blur-sm"></div>
                  <div className="relative">
                    <img
                      src={getThumbnailUrl(champion) || "/placeholder.svg"}
                      alt={`Thumbnail ${champion.title}`}
                      className="w-80 h-48 object-cover rounded-xl shadow-xl"
                      onError={() => handleImageError(champion.youtube_id || "")}
                    />
                    <div className="absolute inset-0 bg-black/30 opacity-0 group-hover/champion:opacity-100 transition-opacity rounded-xl flex items-center justify-center">
                      <Button
                        size="lg"
                        onClick={() => window.open(champion.youtube_url, "_blank")}
                        className="gap-3 bg-primary text-primary-foreground hover:bg-primary/90"
                      >
                        <Play className="h-5 w-5" />
                        Assistir Agora
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Champion info */}
                <div className="flex-1 text-center lg:text-left space-y-4">
                  <div className="flex items-center justify-center lg:justify-start gap-3 mb-4">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-accent text-white flex items-center justify-center text-3xl font-bold shadow-lg">
                      1
                    </div>
                    <Trophy className="h-8 w-8 text-primary" />
                  </div>

                  <h3 className="text-4xl font-bold text-balance leading-tight">{champion.title}</h3>
                  <p className="text-xl text-muted-foreground">{champion.artist}</p>

                  <div className="flex items-center justify-center lg:justify-start gap-4">
                    <Badge variant="secondary" className="gap-2 px-4 py-2 text-lg">
                      <Play className="h-4 w-4" />
                      {champion.formatted_views || `${champion.views.toLocaleString()} visualizações`}
                    </Badge>
                  </div>

                  <p className="text-muted-foreground text-lg max-w-md">A música mais tocada no YouTube!</p>
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}

      <div className="space-y-4">
        <h3 className="text-2xl font-semibold text-center mb-6">Outras Posições</h3>
        {otherSongs.map((song, index) => {
          const position = index + 2
          return (
            <Card
              key={song.id}
              className="group hover:shadow-xl hover:scale-[1.02] transition-all duration-300 overflow-hidden border-l-4 border-l-primary/20"
            >
              <div className="p-6">
                <div className="flex items-center gap-6">
                  {/* Position number with enhanced styling */}
                  <div className="flex-shrink-0">
                    <div
                      className={`w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold shadow-lg ${
                        position === 2
                          ? "bg-gradient-to-br from-gray-400 to-gray-600 text-white"
                          : position === 3
                            ? "bg-gradient-to-br from-amber-600 to-amber-800 text-white"
                            : "bg-gradient-to-br from-muted to-muted-foreground/20 text-foreground"
                      }`}
                    >
                      {position}
                    </div>
                  </div>

                  {/* Song info */}
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xl font-semibold mb-2 group-hover:text-primary transition-colors text-balance">
                      {song.title}
                    </h4>
                    <p className="text-muted-foreground mb-2">{song.artist}</p>
                    <div className="flex items-center gap-4 text-muted-foreground">
                      <Badge variant="outline" className="gap-1">
                        <Play className="h-3 w-3" />
                        {song.formatted_views || `${song.views.toLocaleString()} visualizações`}
                      </Badge>
                    </div>
                  </div>

                  {/* Thumbnail and action */}
                  <div className="flex-shrink-0 relative group/thumb">
                    <img
                      src={getThumbnailUrl(song) || "/placeholder.svg"}
                      alt={`Thumbnail ${song.title}`}
                      className="w-40 h-24 object-cover rounded-lg shadow-md group-hover/thumb:shadow-xl transition-shadow"
                      onError={() => handleImageError(song.youtube_id || "")}
                    />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover/thumb:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => window.open(song.youtube_url, "_blank")}
                        className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
                      >
                        <ExternalLink className="h-4 w-4" />
                        Assistir
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          )
        })}
      </div>
    </section>
  )
}
