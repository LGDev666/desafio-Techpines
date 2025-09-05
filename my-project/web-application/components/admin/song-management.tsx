"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  CheckCircle,
  XCircle,
  Edit,
  Trash2,
  ExternalLink,
  Search,
  ChevronLeft,
  ChevronRight,
  Plus,
  AlertCircle,
} from "lucide-react"
import { api, type Song } from "@/lib/api"

interface PaginationData {
  current_page: number
  last_page: number
  per_page: number
  total: number
}

export function SongManagement() {
  const [songs, setSongs] = useState<Song[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("pending")
  const [searchTerm, setSearchTerm] = useState("")
  const [editingSong, setEditingSong] = useState<Song | null>(null)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [showRejectDialog, setShowRejectDialog] = useState(false)
  const [rejectingSong, setRejectingSong] = useState<Song | null>(null)
  const [rejectReason, setRejectReason] = useState("")
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [pagination, setPagination] = useState<PaginationData>({
    current_page: 1,
    last_page: 1,
    per_page: 10,
    total: 0,
  })
  const [tabCounts, setTabCounts] = useState({
    pending: 0,
    approved: 0,
    rejected: 0,
    all: 0,
  })

  const [newSong, setNewSong] = useState({
    title: "",
    artist: "Tião Carreiro & Pardinho",
    youtube_url: "",
  })

  useEffect(() => {
    fetchSongs(1, activeTab === "all" ? undefined : activeTab)
    fetchTabCounts()
  }, [activeTab])

  const fetchTabCounts = async () => {
    try {
      const [pendingData, approvedData, rejectedData, allData] = await Promise.all([
        api.getSongsByStatus("pending", 1, 1),
        api.getSongsByStatus("approved", 1, 1),
        api.getSongsByStatus("rejected", 1, 1),
        api.getAllSongs(1),
      ])

      setTabCounts({
        pending: pendingData.total,
        approved: approvedData.total,
        rejected: rejectedData.total,
        all: allData.total,
      })
    } catch (error) {
      console.error("Error fetching tab counts:", error)
    }
  }

  const fetchSongs = async (page = 1, status?: string) => {
    try {
      setLoading(true)
      setError("")

      let response
      if (status && status !== "all") {
        response = await api.getSongsByStatus(status as "pending" | "approved" | "rejected", page, 10)
      } else {
        response = await api.getAllSongs(page, status)
      }

      setSongs(response.data || [])
      setPagination({
        current_page: response.current_page,
        last_page: response.last_page,
        per_page: response.per_page,
        total: response.total,
      })
      console.log("[v0] Songs fetched successfully:", { status, total: response.total, page })
    } catch (error) {
      console.error("Error fetching songs:", error)
      setError("Erro ao carregar as músicas. Tente novamente.")
      setSongs([])
      setPagination({
        current_page: 1,
        last_page: 1,
        per_page: 10,
        total: 0,
      })
    } finally {
      setLoading(false)
    }
  }

  const handleStatusChange = async (songId: number, newStatus: "approved" | "rejected") => {
    try {
      setError("")
      setSuccess("")

      if (newStatus === "approved") {
        await api.approveSong(songId)
        setSuccess("Música aprovada com sucesso!")
      } else {
        const song = songs.find((s) => s.id === songId)
        if (song) {
          setRejectingSong(song)
          setShowRejectDialog(true)
          return
        }
      }

      await fetchSongs(pagination.current_page, activeTab === "all" ? undefined : activeTab)
      await fetchTabCounts()
      setTimeout(() => setSuccess(""), 3000)
    } catch (error) {
      console.error("Error updating song status:", error)
      setError("Erro ao atualizar o status da música. Tente novamente.")
    }
  }

  const handleRejectWithReason = async () => {
    if (!rejectingSong) return

    try {
      setError("")
      await api.rejectSong(rejectingSong.id, rejectReason)
      setSuccess("Música rejeitada com sucesso!")
      setShowRejectDialog(false)
      setRejectingSong(null)
      setRejectReason("")
      await fetchSongs(pagination.current_page, activeTab === "all" ? undefined : activeTab)
      await fetchTabCounts()
      setTimeout(() => setSuccess(""), 3000)
    } catch (error) {
      console.error("Error rejecting song:", error)
      setError("Erro ao rejeitar a música. Tente novamente.")
    }
  }

  const handleEditSong = (song: Song) => {
    setEditingSong(song)
    setShowEditDialog(true)
  }

  const handleSaveEdit = async () => {
    if (!editingSong) return

    try {
      setError("")
      if (!editingSong.title.trim()) {
        setError("O título da música é obrigatório.")
        return
      }

      await api.updateSong(editingSong.id, {
        title: editingSong.title.trim(),
        artist: editingSong.artist,
        status: editingSong.status,
      })

      setSuccess("Música atualizada com sucesso!")
      setShowEditDialog(false)
      setEditingSong(null)
      await fetchSongs(pagination.current_page, activeTab === "all" ? undefined : activeTab)
      setTimeout(() => setSuccess(""), 3000)
    } catch (error) {
      console.error("Error updating song:", error)
      setError("Erro ao atualizar a música. Tente novamente.")
    }
  }

  const handleCreateSong = async () => {
    try {
      setError("")
      if (!newSong.title.trim()) {
        setError("O título da música é obrigatório.")
        return
      }

      if (!newSong.youtube_url.trim()) {
        setError("A URL do YouTube é obrigatória.")
        return
      }

      const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/)[\w-]+/
      if (!youtubeRegex.test(newSong.youtube_url)) {
        setError("Por favor, insira uma URL válida do YouTube.")
        return
      }

      await api.createSong({
        title: newSong.title.trim(),
        artist: newSong.artist.trim(),
        youtube_url: newSong.youtube_url.trim(),
      })

      setSuccess("Música criada com sucesso!")
      setShowCreateDialog(false)
      setNewSong({
        title: "",
        artist: "Tião Carreiro & Pardinho",
        youtube_url: "",
      })
      await fetchSongs(pagination.current_page, activeTab === "all" ? undefined : activeTab)
      await fetchTabCounts()
      setTimeout(() => setSuccess(""), 3000)
    } catch (error) {
      console.error("Error creating song:", error)
      setError("Erro ao criar a música. Tente novamente.")
    }
  }

  const handleDeleteSong = async (songId: number) => {
    const song = songs.find((s) => s.id === songId)
    const confirmMessage = `Tem certeza que deseja excluir a música "${song?.title}"? Esta ação não pode ser desfeita.`

    if (!confirm(confirmMessage)) return

    try {
      setError("")
      await api.deleteSong(songId)
      setSuccess("Música excluída com sucesso!")
      await fetchSongs(pagination.current_page, activeTab === "all" ? undefined : activeTab)
      await fetchTabCounts()
      setTimeout(() => setSuccess(""), 3000)
    } catch (error) {
      console.error("Error deleting song:", error)
      setError("Erro ao excluir a música. Tente novamente.")
    }
  }

  const getStatusBadge = (status: string) => {
    const variants = {
      pending: { variant: "secondary" as const, color: "text-yellow-600", label: "Pendente" },
      approved: { variant: "default" as const, color: "text-green-600", label: "Aprovada" },
      rejected: { variant: "destructive" as const, color: "text-red-600", label: "Rejeitada" },
    }

    const config = variants[status as keyof typeof variants] || variants.pending
    return (
      <Badge variant={config.variant} className={config.color}>
        {config.label}
      </Badge>
    )
  }

  const filteredSongs = songs.filter((song) => song.title.toLowerCase().includes(searchTerm.toLowerCase()))

  const getThumbnailUrl = (song: Song) => {
    if (song.thumbnail) return song.thumbnail
    if (song.youtube_id) return `https://img.youtube.com/vi/${song.youtube_id}/hqdefault.jpg`
    return "/placeholder.svg?height=90&width=160&text=No+Image"
  }

  return (
    <Card className="p-6">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Gerenciar Músicas</h2>
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar músicas..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-64"
              />
            </div>
            <Button onClick={() => setShowCreateDialog(true)} className="gap-2">
              <Plus className="h-4 w-4" />
              Nova Música
            </Button>
          </div>
        </div>

        {error && (
          <Alert className="border-red-200 bg-red-50">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">{success}</AlertDescription>
          </Alert>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="pending">Pendentes ({tabCounts.pending})</TabsTrigger>
            <TabsTrigger value="approved">Aprovadas ({tabCounts.approved})</TabsTrigger>
            <TabsTrigger value="rejected">Rejeitadas ({tabCounts.rejected})</TabsTrigger>
            <TabsTrigger value="all">Todas ({tabCounts.all})</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="space-y-4">
            {loading ? (
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <Card key={i} className="p-4 animate-pulse">
                    <div className="flex items-center gap-4">
                      <div className="w-20 h-12 bg-muted rounded" />
                      <div className="flex-1 space-y-2">
                        <div className="h-5 bg-muted rounded w-3/4" />
                        <div className="h-4 bg-muted rounded w-1/2" />
                      </div>
                      <div className="flex gap-2">
                        <div className="w-20 h-8 bg-muted rounded" />
                        <div className="w-8 h-8 bg-muted rounded" />
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            ) : filteredSongs.length > 0 ? (
              <>
                <div className="space-y-4">
                  {filteredSongs.map((song) => (
                    <Card key={song.id} className="p-4">
                      <div className="flex items-center gap-4">
                        <img
                          src={getThumbnailUrl(song) || "/placeholder.svg"}
                          alt={song.title}
                          className="w-20 h-12 object-cover rounded"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement
                            target.src = "/placeholder.svg?height=90&width=160&text=No+Image"
                          }}
                        />

                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold truncate">{song.title}</h3>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span>{song.formatted_views || `${song.views.toLocaleString()} visualizações`}</span>
                            <span>
                              {song.created_at
                                ? new Date(song.created_at).toLocaleDateString("pt-BR")
                                : "Data não disponível"}
                            </span>
                            {getStatusBadge(song.status)}
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          {song.status === "pending" && (
                            <>
                              <Button
                                size="sm"
                                onClick={() => handleStatusChange(song.id, "approved")}
                                className="gap-1"
                              >
                                <CheckCircle className="h-4 w-4" />
                                Aprovar
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => handleStatusChange(song.id, "rejected")}
                                className="gap-1"
                              >
                                <XCircle className="h-4 w-4" />
                                Rejeitar
                              </Button>
                            </>
                          )}

                          <Button size="sm" variant="outline" onClick={() => handleEditSong(song)}>
                            <Edit className="h-4 w-4" />
                          </Button>

                          <Button size="sm" variant="outline" onClick={() => window.open(song.youtube_url, "_blank")}>
                            <ExternalLink className="h-4 w-4" />
                          </Button>

                          <Button size="sm" variant="outline" onClick={() => handleDeleteSong(song.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>

                {pagination.last_page > 1 && (
                  <div className="flex justify-center items-center gap-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        fetchSongs(pagination.current_page - 1, activeTab === "all" ? undefined : activeTab)
                      }
                      disabled={pagination.current_page === 1}
                      className="gap-2"
                    >
                      <ChevronLeft className="h-4 w-4" />
                      Anterior
                    </Button>

                    <span className="text-sm text-muted-foreground">
                      Página {pagination.current_page} de {pagination.last_page}
                    </span>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        fetchSongs(pagination.current_page + 1, activeTab === "all" ? undefined : activeTab)
                      }
                      disabled={pagination.current_page === pagination.last_page}
                      className="gap-2"
                    >
                      Próxima
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </>
            ) : (
              <Card className="p-12 text-center">
                <div className="space-y-4">
                  <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto">
                    <Search className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Nenhuma música encontrada</h3>
                    <p className="text-muted-foreground">
                      {searchTerm ? "Tente ajustar sua busca." : "Não há músicas nesta categoria."}
                    </p>
                  </div>
                </div>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>

      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Criar Nova Música</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="create-title">Título *</Label>
              <Input
                id="create-title"
                placeholder="Nome da música"
                value={newSong.title}
                onChange={(e) => setNewSong((prev) => ({ ...prev, title: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="create-artist">Artista</Label>
              <Input
                id="create-artist"
                placeholder="Nome do artista"
                value={newSong.artist}
                onChange={(e) => setNewSong((prev) => ({ ...prev, artist: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="create-url">URL do YouTube *</Label>
              <Input
                id="create-url"
                placeholder="https://www.youtube.com/watch?v=..."
                value={newSong.youtube_url}
                onChange={(e) => setNewSong((prev) => ({ ...prev, youtube_url: e.target.value }))}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={handleCreateSong}>Criar Música</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Música</DialogTitle>
          </DialogHeader>

          {editingSong && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="edit-title">Título</Label>
                <Input
                  id="edit-title"
                  value={editingSong.title}
                  onChange={(e) => setEditingSong((prev) => (prev ? { ...prev, title: e.target.value } : null))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-artist">Artista</Label>
                <Input
                  id="edit-artist"
                  value={editingSong.artist}
                  onChange={(e) => setEditingSong((prev) => (prev ? { ...prev, artist: e.target.value } : null))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-status">Status</Label>
                <Select
                  value={editingSong.status}
                  onValueChange={(value: "pending" | "approved" | "rejected") =>
                    setEditingSong((prev) => (prev ? { ...prev, status: value } : null))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pendente</SelectItem>
                    <SelectItem value="approved">Aprovada</SelectItem>
                    <SelectItem value="rejected">Rejeitada</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSaveEdit}>Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rejeitar Música</DialogTitle>
          </DialogHeader>

          {rejectingSong && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Você está rejeitando a música: <strong>{rejectingSong.title}</strong>
              </p>

              <div className="space-y-2">
                <Label htmlFor="reject-reason">Motivo da rejeição (opcional)</Label>
                <Textarea
                  id="reject-reason"
                  placeholder="Explique o motivo da rejeição..."
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  rows={3}
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowRejectDialog(false)
                setRejectingSong(null)
                setRejectReason("")
              }}
            >
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleRejectWithReason}>
              Rejeitar Música
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  )
}
