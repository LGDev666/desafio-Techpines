"use client"

import type React from "react"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Music, Send, CheckCircle, AlertCircle } from "lucide-react"
import { api } from "@/lib/api"

export function SuggestSong() {
  const [url, setUrl] = useState("")
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!url.trim()) return

    setLoading(true)
    setMessage(null)

    try {
      await api.suggestSong(url.trim())

      setMessage({
        type: "success",
        text: "Música sugerida com sucesso! Ela será analisada pela nossa equipe.",
      })
      setUrl("")
    } catch (error: any) {
      setMessage({
        type: "error",
        text: error.message || "Erro ao processar a URL do YouTube. Verifique se o link está correto.",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold">Sugerir Nova Música</h2>
        <p className="text-muted-foreground">Conhece alguma música do Tião Carreiro que deveria estar no ranking?</p>
      </div>

      <Card className="w-full">
        <div className="p-8">
          <div className="flex items-center gap-4 mb-8">
            <div className="p-3 bg-primary/10 rounded-lg">
              <Music className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">Adicionar Música</h3>
              <p className="text-muted-foreground">Cole o link do YouTube da música</p>
            </div>
          </div>

          {message && (
            <Alert
              className={`mb-6 ${message.type === "success" ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}`}
            >
              {message.type === "success" ? (
                <CheckCircle className="h-4 w-4 text-green-600" />
              ) : (
                <AlertCircle className="h-4 w-4 text-red-600" />
              )}
              <AlertDescription className={message.type === "success" ? "text-green-800" : "text-red-800"}>
                {message.text}
              </AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-3">
              <Label htmlFor="youtube-url" className="text-base font-medium">
                URL do YouTube
              </Label>
              <Input
                id="youtube-url"
                type="url"
                placeholder="https://www.youtube.com/watch?v=..."
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                disabled={loading}
                className="text-base h-12"
              />
            </div>

            <Button type="submit" className="w-full gap-2 h-12 text-base" disabled={loading || !url.trim()}>
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent" />
                  Processando...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  Enviar Sugestão
                </>
              )}
            </Button>
          </form>

          <div className="mt-8 p-6 bg-muted/50 rounded-lg">
            <p className="text-muted-foreground">
              <strong>Dica:</strong> Sua sugestão será analisada pela nossa equipe antes de aparecer no ranking. Apenas
              músicas do Tião Carreiro & Pardinho serão aprovadas.
            </p>
          </div>
        </div>
      </Card>
    </section>
  )
}
