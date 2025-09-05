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
  next_page_url?: string | null
  prev_page_url?: string | null
}

class ApiService {
  private baseUrl: string

  constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api"
    console.log("[v0] API Service initialized with baseUrl:", this.baseUrl)
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const token = localStorage.getItem("auth_token")

    console.log("[v0] API Request:", {
      endpoint: `${this.baseUrl}${endpoint}`,
      method: options.method || "GET",
      hasToken: !!token,
    })

    const config: RequestInit = {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    }

    const response = await fetch(`${this.baseUrl}${endpoint}`, config)

    console.log("[v0] API Response:", {
      endpoint,
      status: response.status,
      statusText: response.statusText,
      ok: response.ok,
    })

    let data: any
    const contentType = response.headers.get("content-type")

    if (contentType && contentType.includes("application/json")) {
      data = await response.json()
    } else {
      data = { message: await response.text() }
    }

    if (!response.ok) {
      console.error("[v0] API Error:", {
        endpoint,
        status: response.status,
        data,
        errors: data.errors,
      })

      if (response.status === 422 && data.errors) {
        const errorMessages = Object.values(data.errors).flat().join(", ")
        throw new Error(errorMessages)
      }
      throw new Error(data.message || `HTTP ${response.status}: ${response.statusText}`)
    }

    console.log("[v0] API Success:", {
      endpoint,
      dataType: Array.isArray(data) ? `array[${data.length}]` : typeof data,
      hasData: !!data,
    })

    if (endpoint.includes("/songs/status/") || endpoint.includes("/songs/remaining") || endpoint.includes("/songs?")) {
      return data // Return full Laravel pagination response
    }
    return data.data !== undefined ? data.data : data
  }

  async login(credentials: LoginRequest): Promise<AuthResponse> {
    console.log("[v0] Login attempt:", { email: credentials.email })
    return await this.request<AuthResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify(credentials),
    })
  }

  async register(userData: RegisterRequest): Promise<AuthResponse> {
    console.log("[v0] Register attempt:", { email: userData.email })
    return await this.request<AuthResponse>("/auth/register", {
      method: "POST",
      body: JSON.stringify(userData),
    })
  }

  async logout(): Promise<void> {
    console.log("[v0] Logout attempt")
    await this.request("/auth/logout", { method: "POST" })
    localStorage.removeItem("auth_token")
  }

  async getProfile(): Promise<User> {
    console.log("[v0] Get profile attempt")
    return await this.request<User>("/auth/profile")
  }

  async getSongs(page = 1, status?: string): Promise<PaginatedResponse<Song>> {
    const params = new URLSearchParams({ page: page.toString() })
    if (status) params.append("status", status)

    console.log("[v0] Get songs attempt:", { page, status })
    return await this.request<PaginatedResponse<Song>>(`/songs?${params}`)
  }

  async submitSong(songData: { title: string; artist: string; youtube_url: string }): Promise<Song> {
    console.log("[v0] Submit song attempt:", songData)
    return await this.request<Song>("/songs", {
      method: "POST",
      body: JSON.stringify(songData),
    })
  }

  async updateSongStatus(songId: number, status: "approved" | "rejected"): Promise<Song> {
    console.log("[v0] Update song status attempt:", { songId, status })
    return await this.request<Song>(`/songs/${songId}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    })
  }

  async getTopSongs(): Promise<Song[]> {
    console.log("[v0] Get top songs attempt")
    return await this.request<Song[]>("/songs/top5")
  }

  async getSongsByStatus(status: string, page = 1): Promise<PaginatedResponse<Song>> {
    console.log("[v0] Get songs by status attempt:", { status, page })
    return await this.request<PaginatedResponse<Song>>(`/songs/status/${status}?page=${page}`)
  }

  async getRemainingSongs(page = 1): Promise<PaginatedResponse<Song>> {
    console.log("[v0] Get remaining songs attempt:", { page })
    return await this.request<PaginatedResponse<Song>>(`/songs/remaining?page=${page}`)
  }

  async suggestSong(songData: { title: string; artist: string; youtube_url: string }): Promise<Song> {
    console.log("[v0] Suggest song attempt:", songData)
    return await this.submitSong(songData)
  }

  async getRemainingSlots(): Promise<{ remaining: number; total: number }> {
    console.log("[v0] Get remaining slots attempt")
    const response = await this.request<PaginatedResponse<Song>>("/songs/remaining")
    return {
      remaining: response.total,
      total: response.total + 5, // 5 são as top songs + as restantes
    }
  }
}

export const apiService = new ApiService()
export const api = apiService // Adicionando exportação 'api' para compatibilidade com importações existentes
export type { ApiResponse, LoginRequest, RegisterRequest, User, AuthResponse, Song, PaginatedResponse }
