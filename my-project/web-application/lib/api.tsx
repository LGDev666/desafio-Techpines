interface ApiResponse<T = any> {
  success?: boolean
  data?: T
  message?: string
  errors?: Record<string, string[]>
}

interface LoginRequest {
  email: string
  password: string
}

interface RegisterRequest {
  name: string
  email: string
  password: string
  password_confirmation: string
}

interface User {
  id: number
  name: string
  email: string
  role: "user" | "admin"
}

interface AuthResponse {
  user: User
  token: string
}

interface Song {
  id: number
  title: string
  artist: string
  youtube_url: string
  youtube_id?: string
  thumbnail?: string
  views: number
  status: "pending" | "approved" | "rejected"
  formatted_views?: string
  created_at?: string
  updated_at?: string
}

interface PaginatedResponse<T> {
  data: T[]
  current_page: number
  last_page: number
  per_page: number
  total: number
  next_page_url?: string
  prev_page_url?: string
}

import { mockTopSongs, mockRemainingSongs } from "./mock-data"

class ApiService {
  private baseUrl: string

  constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api"
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const token = typeof window !== "undefined" ? localStorage.getItem("auth_token") : null

    const config: RequestInit = {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    }

    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, config)

      let data: any
      const contentType = response.headers.get("content-type")

      if (contentType && contentType.includes("application/json")) {
        data = await response.json()
      } else {
        data = { message: await response.text() }
      }

      if (!response.ok) {
        if (response.status === 422 && data.errors) {
          const errorMessages = Object.values(data.errors).flat().join(", ")
          throw new Error(errorMessages)
        }
        throw new Error(data.message || `HTTP ${response.status}: ${response.statusText}`)
      }

      if (
        endpoint.includes("/songs/status/") ||
        endpoint.includes("/songs/remaining") ||
        endpoint.includes("/songs?")
      ) {
        return data // Return full Laravel pagination response
      }
      return data.data !== undefined ? data.data : data
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error)
      const errorName = error instanceof Error ? error.name : (error as any)?.name || "unknown"

      const isFailedToFetch = errorMessage === "Failed to fetch"
      const isTypeError = errorName === "TypeError"
      const isOffline = typeof navigator !== "undefined" && !navigator.onLine

      const isNetworkError = isFailedToFetch || isTypeError || isOffline

      if (isNetworkError) {
        // Top songs endpoint
        if (endpoint === "/songs/top5") {
          return mockTopSongs as T
        }

        // Remaining songs endpoint
        if (endpoint.startsWith("/songs/remaining")) {
          return mockRemainingSongs as T
        }

        // Song suggestion endpoint
        if (endpoint.startsWith("/songs/suggest")) {
          const newSong: Song = {
            id: Date.now(),
            title: "Nova Música Sugerida",
            artist: "Tião Carreiro & Pardinho",
            youtube_url: options.body ? JSON.parse(options.body as string).youtube_url : "",
            youtube_id: "mock123",
            thumbnail: "https://img.youtube.com/vi/mock123/hqdefault.jpg",
            views: 0,
            status: "pending",
            formatted_views: "0",
            created_at: new Date().toISOString(),
          }
          return newSong as T
        }

        // Admin endpoints - return mock data for admin operations
        if (endpoint.startsWith("/songs/status/")) {
          const mockPaginatedResponse: PaginatedResponse<Song> = {
            data: mockTopSongs.slice(0, 3),
            current_page: 1,
            last_page: 1,
            per_page: 10,
            total: 3,
            next_page_url: null,
            prev_page_url: null,
          }
          return mockPaginatedResponse as T
        }

        // General songs endpoint
        if (endpoint.startsWith("/songs?") || endpoint === "/songs") {
          const mockPaginatedResponse: PaginatedResponse<Song> = {
            data: [...mockTopSongs, ...mockRemainingSongs.data],
            current_page: 1,
            last_page: 1,
            per_page: 10,
            total: mockTopSongs.length + mockRemainingSongs.data.length,
            next_page_url: null,
            prev_page_url: null,
          }
          return mockPaginatedResponse as T
        }

        // Auth endpoints - return mock success for auth operations
        if (endpoint.startsWith("/auth/")) {
          if (endpoint === "/auth/login") {
            const mockAuthResponse: AuthResponse = {
              user: {
                id: 1,
                name: "Mock User",
                email: "mock@tiaocarreiro.com",
                role: "admin",
              },
              token: "mock-token-" + Date.now(),
            }
            return mockAuthResponse as T
          }

          if (endpoint === "/auth/me") {
            const mockUser: User = {
              id: 1,
              name: "Mock User",
              email: "mock@tiaocarreiro.com",
              role: "admin",
            }
            return mockUser as T
          }

          if (endpoint === "/auth/logout") {
            return {} as T
          }
        }

        // Song operations (approve, reject, delete, update)
        if (endpoint.includes("/approve") || endpoint.includes("/reject")) {
          const mockSong: Song = mockTopSongs[0]
          return mockSong as T
        }

        if (options.method === "DELETE") {
          return {} as T
        }

        if (options.method === "PUT" || options.method === "POST") {
          const mockSong: Song = {
            id: Date.now(),
            title: "Mock Song",
            artist: "Tião Carreiro & Pardinho",
            youtube_url: "https://www.youtube.com/watch?v=mock123",
            youtube_id: "mock123",
            thumbnail: "https://img.youtube.com/vi/mock123/hqdefault.jpg",
            views: 1000,
            status: "approved",
            formatted_views: "1K",
            created_at: new Date().toISOString(),
          }
          return mockSong as T
        }
      }

      throw error
    }
  }

  async login(credentials: LoginRequest): Promise<AuthResponse> {
    return await this.request<AuthResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify(credentials),
    })
  }

  async register(userData: RegisterRequest): Promise<AuthResponse> {
    return await this.request<AuthResponse>("/auth/register", {
      method: "POST",
      body: JSON.stringify(userData),
    })
  }

  async logout(): Promise<void> {
    try {
      await this.request("/auth/logout", {
        method: "POST",
      })
    } catch (error) {
      console.error("Logout API call failed:", error)
    }
    if (typeof window !== "undefined") {
      localStorage.removeItem("auth_token")
    }
  }

  async me(): Promise<User> {
    return await this.request<User>("/auth/me")
  }

  async getTopSongs(): Promise<Song[]> {
    return await this.request<Song[]>("/songs/top5")
  }

  async getRemainingSongs(page = 1, perPage = 6): Promise<PaginatedResponse<Song>> {
    return await this.request<PaginatedResponse<Song>>(`/songs/remaining?page=${page}&per_page=${perPage}`)
  }

  async suggestSong(youtubeUrl: string): Promise<Song> {
    const result = await this.request<Song>("/songs/suggest", {
      method: "POST",
      body: JSON.stringify({ youtube_url: youtubeUrl }),
    })
    return result
  }

  async getAllSongs(page = 1, status?: string): Promise<PaginatedResponse<Song>> {
    const params = new URLSearchParams({ page: page.toString() })
    if (status) params.append("status", status)

    const result = await this.request<PaginatedResponse<Song>>(`/songs?${params}`)
    return result
  }

  async createSong(songData: { title: string; youtube_url: string; artist?: string }): Promise<Song> {
    const result = await this.request<Song>("/songs", {
      method: "POST",
      body: JSON.stringify({
        title: songData.title,
        youtube_url: songData.youtube_url,
        artist: songData.artist || "Tião Carreiro & Pardinho",
      }),
    })
    return result
  }

  async updateSong(id: number, data: { title?: string; status?: string; artist?: string }): Promise<Song> {
    const result = await this.request<Song>(`/songs/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    })
    return result
  }

  async deleteSong(id: number): Promise<void> {
    await this.request(`/songs/${id}`, {
      method: "DELETE",
    })
  }

  async approveSong(id: number): Promise<Song> {
    const result = await this.request<Song>(`/songs/${id}/approve`, {
      method: "POST",
    })
    return result
  }

  async rejectSong(id: number, reason?: string): Promise<Song> {
    const body: any = {}
    if (reason) {
      body.reason = reason
    }

    const result = await this.request<Song>(`/songs/${id}/reject`, {
      method: "POST",
      body: JSON.stringify(body),
    })
    return result
  }

  async getSongsByStatus(
    status: "pending" | "approved" | "rejected",
    page = 1,
    perPage = 10,
  ): Promise<PaginatedResponse<Song>> {
    const result = await this.request<PaginatedResponse<Song>>(
      `/songs/status/${status}?page=${page}&per_page=${perPage}`,
    )
    return result
  }

  async getAdminStats(): Promise<{ total: number; approved: number; pending: number; rejected: number }> {
    try {
      const [pendingSongs, approvedSongs, rejectedSongs] = await Promise.all([
        this.request<PaginatedResponse<Song>>("/songs/status/pending?per_page=1"),
        this.request<PaginatedResponse<Song>>("/songs/status/approved?per_page=1"),
        this.request<PaginatedResponse<Song>>("/songs/status/rejected?per_page=1"),
      ])

      const stats = {
        pending: pendingSongs.total,
        approved: approvedSongs.total,
        rejected: rejectedSongs.total,
        total: pendingSongs.total + approvedSongs.total + rejectedSongs.total,
      }

      return stats
    } catch (error) {
      console.error("Failed to fetch admin stats:", error)
      throw error
    }
  }

  // Helper method to extract YouTube video ID
  private extractYouTubeId(url: string): string | undefined {
    const regex = /(?:youtube\.com\/(?:[^/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?/\s]{11})/
    const match = url.match(regex)
    return match ? match[1] : undefined
  }
}

export const api = new ApiService()
export type { User, AuthResponse, ApiResponse, Song, PaginatedResponse }
