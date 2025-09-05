"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ChevronLeft, ChevronRight, ExternalLink, Play, Music, Search, Filter, MoreHorizontal } from "lucide-react"
import { api } from "@/lib/api"

interface Song {
  id: number
  title: string
  artist: string
  views: number
  youtube_id?: string
  thumbnail?: string
  formatted_views: string
  youtube_url: string
}

interface PaginationData {
  current_page: number
  last_page: number
  per_page: number
  total: number
}

export function RemainingSongs() {
  const [songs, setSongs] = useState<Song[]>([])
  const [pagination, setPagination] = useState<PaginationData>({
    current_page: 1,
    last_page: 1,
    per_page: 6,
    total: 0,
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const [sortBy, setSortBy] = useState<"views" | "title" | "date">("views")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc")
  const [itemsPerPage, setItemsPerPage] = useState(6)

  useEffect(() => {
    fetchRemainingSongs(1)
  }, [itemsPerPage, sortBy, sortOrder])

  useEffect(() => {
    const delayedSearch = setTimeout(() => {
      if (searchTerm !== "") {
        fetchRemainingSongs(1)
      }
    }, 500)

    return () => clearTimeout(delayedSearch)
  }, [searchTerm])

  const fetchRemainingSongs = async (page: number) => {
    setLoading(true)
    setError("")
    try {
      const response = await api.getRemainingSongs(page, itemsPerPage)
      let fetchedSongs = response.data || []

      if (searchTerm) {
        fetchedSongs = fetchedSongs.filter(
          (song: Song) =>
            song.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            song.artist.toLowerCase().includes(searchTerm.toLowerCase()),
        )
      }

      // Sort songs
      fetchedSongs.sort((a: Song, b: Song) => {
        let comparison = 0
        switch (sortBy) {
          case "views":
            comparison = a.views - b.views
            break
          case "title":
            comparison = a.title.localeCompare(b.title)
            break
          case "date":
            comparison = a.id - b.id // Using ID as proxy for date
            break
        }
        return sortOrder === "asc" ? comparison : -comparison
      })

      setSongs(fetchedSongs)
      setPagination({
        current_page: response.current_page,
        last_page: response.last_page,
        per_page: response.per_page,
        total: response.total,
      })
    } catch (error) {
      console.error("Error fetching remaining songs:", error)
      setError("Erro ao carregar as músicas. Verifique se a API está rodando em localhost:8000")
    } finally {
      setLoading(false)
    }
  }

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= pagination.last_page) {
      fetchRemainingSongs(page)
      // Smooth scroll to top of section
      document.querySelector("#remaining-songs")?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      })
    }
  }

  const renderPaginationButtons = () => {
    const buttons = []
    const { current_page, last_page } = pagination

    // Always show first page
    if (last_page > 1) {
      buttons.push(
        <Button
          key={1}
          variant={current_page === 1 ? "default" : "outline"}
          size="sm"
          onClick={() => handlePageChange(1)}
          className="w-10"
        >
          1
        </Button>,
      )
    }

    // Show ellipsis if needed
    if (current_page > 3) {
      buttons.push(
        <Button key="ellipsis1" variant="ghost" size="sm" disabled className="w-10">
          <MoreHorizontal className="h-4 w-4" />
        </Button>,
      )
    }

    // Show pages around current page
    for (let i = Math.max(2, current_page - 1); i <= Math.min(last_page - 1, current_page + 1); i++) {
      buttons.push(
        <Button
          key={i}
          variant={current_page === i ? "default" : "outline"}
          size="sm"
          onClick={() => handlePageChange(i)}
          className="w-10"
        >
          {i}
        </Button>,
      )
    }

    // Show ellipsis if needed
    if (current_page < last_page - 2) {
      buttons.push(
        <Button key="ellipsis2" variant="ghost" size="sm" disabled className="w-10">
          <MoreHorizontal className="h-4 w-4" />
        </Button>,
      )
    }

    // Always show last page
    if (last_page > 1) {
      buttons.push(
        <Button
          key={last_page}
          variant={current_page === last_page ? "default" : "outline"}
          size="sm"
          onClick={() => handlePageChange(last_page)}
          className="w-10"
        >
          {last_page}
        </Button>,
      )
    }

    return buttons
  }

  if (loading) {
    return (
      <section id="remaining-songs" className="space-y-6">
        <h2 className="text-3xl font-bold text-center">Outras Músicas</h2>
        <div className="grid grid-cols-3 gap-6">
          {[...Array(itemsPerPage)].map((_, i) => (
            <Card key={i} className="p-4 animate-pulse">
              <div className="aspect-video bg-muted rounded-lg mb-4" />
              <div className="space-y-2">
                <div className="h-5 bg-muted rounded w-3/4" />
                <div className="h-4 bg-muted rounded w-1/2" />
              </div>
            </Card>
          ))}
        </div>
      </section>
    )
  }

  if (error) {
    return (
      <section id="remaining-songs" className="space-y-6">
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-bold">Outras Músicas</h2>
          <p className="text-muted-foreground">Explore mais sucessos</p>
        </div>
        <Card className="p-8 text-center">
          <div className="space-y-4">
            <div className="text-red-500 font-semibold">{error}</div>
            <Button onClick={() => fetchRemainingSongs(1)} variant="outline">
              Tentar Novamente
            </Button>
          </div>
        </Card>
      </section>
    )
  }

  return (
    <section id="remaining-songs" className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold">Outras Músicas</h2>
        <p className="text-muted-foreground">Explore mais sucessos</p>
      </div>

      <div className="flex gap-4 items-center justify-between">
        <div className="flex gap-4 items-center">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar músicas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-64"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <Select value={sortBy} onValueChange={(value: "views" | "title" | "date") => setSortBy(value)}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="views">Visualizações</SelectItem>
                <SelectItem value="title">Título</SelectItem>
                <SelectItem value="date">Data</SelectItem>
              </SelectContent>
            </Select>

            <Select value={sortOrder} onValueChange={(value: "asc" | "desc") => setSortOrder(value)}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="desc">Maior</SelectItem>
                <SelectItem value="asc">Menor</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Por página:</span>
          <Select value={itemsPerPage.toString()} onValueChange={(value) => setItemsPerPage(Number(value))}>
            <SelectTrigger className="w-20">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="6">6</SelectItem>
              <SelectItem value="9">9</SelectItem>
              <SelectItem value="12">12</SelectItem>
              <SelectItem value="18">18</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {pagination.total > 0 && (
        <div className="text-sm text-muted-foreground text-center">
          Mostrando {(pagination.current_page - 1) * pagination.per_page + 1} a{" "}
          {Math.min(pagination.current_page * pagination.per_page, pagination.total)} de {pagination.total} músicas
          {searchTerm && ` (filtrado por "${searchTerm}")`}
        </div>
      )}

      {songs.length > 0 ? (
        <>
          <div
            className={`grid gap-6 ${
              itemsPerPage <= 6 ? "grid-cols-3" : itemsPerPage <= 9 ? "grid-cols-3" : "grid-cols-4"
            }`}
          >
            {songs.map((song, index) => (
              <Card key={song.id} className="group hover:shadow-lg transition-all duration-300 overflow-hidden">
                <div className="relative">
                  <img
                    src={song.thumbnail || `/placeholder.svg?height=300&width=400&query=música ${song.title}`}
                    alt={`Thumbnail ${song.title}`}
                    className="w-full aspect-video object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement
                      target.src = `/placeholder.svg?height=300&width=400&query=música ${song.title}`
                    }}
                  />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => window.open(song.youtube_url, "_blank")}
                      className="gap-2"
                    >
                      <ExternalLink className="h-4 w-4" />
                      Assistir
                    </Button>
                  </div>
                  <div className="absolute top-3 left-3">
                    <Badge variant="secondary" className="bg-black/70 text-white">
                      #
                      {pagination.current_page === 1
                        ? index + 6
                        : (pagination.current_page - 1) * pagination.per_page + index + 6}
                    </Badge>
                  </div>
                </div>

                <div className="p-4">
                  <h3 className="font-semibold mb-2 group-hover:text-primary transition-colors text-balance">
                    {song.title}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-2">{song.artist}</p>
                  <Badge variant="outline" className="gap-1">
                    <Play className="h-3 w-3" />
                    {song.formatted_views || `${song.views.toLocaleString()} visualizações`}
                  </Badge>
                </div>
              </Card>
            ))}
          </div>

          {pagination.last_page > 1 && (
            <div className="flex justify-center items-center gap-4">
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(1)}
                  disabled={pagination.current_page === 1}
                  className="gap-2"
                >
                  Primeira
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(pagination.current_page - 1)}
                  disabled={pagination.current_page === 1}
                  className="gap-2"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Anterior
                </Button>
              </div>

              <div className="flex items-center gap-1">{renderPaginationButtons()}</div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(pagination.current_page + 1)}
                  disabled={pagination.current_page === pagination.last_page}
                  className="gap-2"
                >
                  Próxima
                  <ChevronRight className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(pagination.last_page)}
                  disabled={pagination.current_page === pagination.last_page}
                  className="gap-2"
                >
                  Última
                </Button>
              </div>
            </div>
          )}
        </>
      ) : (
        <Card className="p-12 text-center">
          <div className="space-y-4">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto">
              <Music className="h-8 w-8 text-muted-foreground" />
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2">
                {searchTerm ? "Nenhuma música encontrada" : "Nenhuma música encontrada"}
              </h3>
              <p className="text-muted-foreground">
                {searchTerm
                  ? `Não encontramos músicas com "${searchTerm}". Tente outro termo.`
                  : "Não há outras músicas cadastradas no momento."}
              </p>
              {searchTerm && (
                <Button variant="outline" size="sm" onClick={() => setSearchTerm("")} className="mt-4">
                  Limpar busca
                </Button>
              )}
            </div>
          </div>
        </Card>
      )}
    </section>
  )
}
