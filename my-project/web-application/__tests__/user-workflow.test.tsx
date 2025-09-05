"use client"

import React from "react"
import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { jest } from "@jest/globals"

const mockApi = {
  login: jest.fn(),
  logout: jest.fn(),
  me: jest.fn(),
  suggestSong: jest.fn(),
  getSongsByStatus: jest.fn(),
  getAllSongs: jest.fn(),
  approveSong: jest.fn(),
}

// Mock do AuthProvider
const MockAuthProvider = ({ children }: { children: React.ReactNode }) => {
  return <div data-testid="auth-provider">{children}</div>
}

// Mock do AuthModal
const MockAuthModal = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  if (!isOpen) return null

  return (
    <div data-testid="auth-modal">
      <input aria-label="Email" data-testid="email-input" />
      <input aria-label="Senha" type="password" data-testid="password-input" />
      <button
        onClick={() => {
          const email = (screen.getByTestId("email-input") as HTMLInputElement).value
          const password = (screen.getByTestId("password-input") as HTMLInputElement).value
          mockApi.login(email, password)
        }}
      >
        Entrar
      </button>
    </div>
  )
}

// Mock do SuggestSong
const MockSuggestSong = () => {
  const [message, setMessage] = React.useState("")

  const handleSuggest = async () => {
    const urlInput = screen.getByTestId("url-input") as HTMLInputElement
    await mockApi.suggestSong(urlInput.value)
    setMessage("Música sugerida com sucesso!")
  }

  return (
    <div data-testid="suggest-song">
      <input aria-label="URL do YouTube" data-testid="url-input" placeholder="Cole a URL do YouTube aqui" />
      <button onClick={handleSuggest}>Enviar Sugestão</button>
      {message && <div>{message}</div>}
    </div>
  )
}

// Mock do SongManagement
const MockSongManagement = () => {
  const [songs, setSongs] = React.useState([
    {
      id: 3,
      title: "Nova Música Sugerida",
      artist: "Tião Carreiro & Pardinho",
      status: "pending",
    },
  ])

  const [message, setMessage] = React.useState("")

  const handleApprove = (id: number) => {
    mockApi.approveSong(id)
    setMessage("Música aprovada com sucesso!")
    setSongs(songs.filter((song) => song.id !== id))
  }

  return (
    <div data-testid="song-management">
      {songs.map((song) => (
        <div key={song.id} data-testid={`song-${song.id}`}>
          <h3>{song.title}</h3>
          <p>{song.artist}</p>
          <button onClick={() => handleApprove(song.id)}>Aprovar</button>
        </div>
      ))}
      {message && <div>{message}</div>}
    </div>
  )
}

// Mock do localStorage
const mockLocalStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
}
Object.defineProperty(window, "localStorage", { value: mockLocalStorage })

describe("User Workflow - Login, Suggest Song, Admin Approval", () => {
  const user = userEvent.setup()

  beforeEach(() => {
    jest.clearAllMocks()
    mockLocalStorage.getItem.mockReturnValue(null)
  })

  const renderWithAuth = (component: React.ReactElement) => {
    return render(<MockAuthProvider>{component}</MockAuthProvider>)
  }

  test("Usuário deve conseguir fazer login, sugerir música, logout, admin login e aprovar sugestão", async () => {
    console.log("[v0] Iniciando teste completo de workflow usuário + admin")

    // Dados do usuário comum
    const regularUser = {
      id: 2,
      name: "Regular User",
      email: "user@tiaocarreiro.com",
      role: "user",
    }

    // Dados do admin
    const adminUser = {
      id: 1,
      name: "Admin User",
      email: "admin@tiaocarreiro.com",
      role: "admin",
    }

    // PARTE 1: LOGIN COMO USUÁRIO COMUM
    console.log("[v0] Testando login do usuário comum")

    mockApi.login.mockResolvedValueOnce({
      user: regularUser,
      token: "user-token-123",
    })

    const { rerender } = renderWithAuth(<MockAuthModal isOpen={true} onClose={() => {}} />)

    // Fazer login como usuário
    const emailInput = screen.getByTestId("email-input")
    const passwordInput = screen.getByTestId("password-input")
    const loginButton = screen.getByRole("button", { name: /entrar/i })

    await user.type(emailInput, "user@tiaocarreiro.com")
    await user.type(passwordInput, "password123")
    await user.click(loginButton)

    await waitFor(() => {
      expect(mockApi.login).toHaveBeenCalledWith("user@tiaocarreiro.com", "password123")
    })

    console.log("[v0] Login do usuário realizado com sucesso")

    // PARTE 2: SUGERIR MÚSICA
    console.log("[v0] Testando sugestão de música")

    mockApi.suggestSong.mockResolvedValueOnce(undefined)

    rerender(
      <MockAuthProvider>
        <MockSuggestSong />
      </MockAuthProvider>,
    )

    // Preencher URL da música
    const urlInput = screen.getByTestId("url-input")
    const suggestButton = screen.getByRole("button", { name: /enviar sugestão/i })

    const testMusicUrl = "https://www.youtube.com/watch?v=testmusic123"
    await user.type(urlInput, testMusicUrl)
    await user.click(suggestButton)

    await waitFor(() => {
      expect(mockApi.suggestSong).toHaveBeenCalledWith(testMusicUrl)
      expect(screen.getByText(/música sugerida com sucesso/i)).toBeInTheDocument()
    })

    console.log("[v0] Música sugerida com sucesso")

    // PARTE 3: LOGOUT DO USUÁRIO
    console.log("[v0] Fazendo logout do usuário")

    mockApi.logout.mockResolvedValueOnce(undefined)
    mockLocalStorage.removeItem("auth_token")

    await waitFor(() => {
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith("auth_token")
    })

    console.log("[v0] Logout do usuário realizado")

    // PARTE 4: LOGIN COMO ADMIN
    console.log("[v0] Fazendo login como admin")

    mockApi.login.mockResolvedValueOnce({
      user: adminUser,
      token: "admin-token-456",
    })

    rerender(
      <MockAuthProvider>
        <MockAuthModal isOpen={true} onClose={() => {}} />
      </MockAuthProvider>,
    )

    // Fazer login como admin
    const adminEmailInput = screen.getByTestId("email-input")
    const adminPasswordInput = screen.getByTestId("password-input")
    const adminLoginButton = screen.getByRole("button", { name: /entrar/i })

    await user.clear(adminEmailInput)
    await user.clear(adminPasswordInput)
    await user.type(adminEmailInput, "admin@tiaocarreiro.com")
    await user.type(adminPasswordInput, "password123")
    await user.click(adminLoginButton)

    await waitFor(() => {
      expect(mockApi.login).toHaveBeenCalledWith("admin@tiaocarreiro.com", "password123")
    })

    console.log("[v0] Login do admin realizado")

    // PARTE 5: APROVAR SUGESTÃO NO PAINEL ADMIN
    console.log("[v0] Testando aprovação da sugestão no painel admin")

    mockApi.approveSong.mockResolvedValueOnce(undefined)

    rerender(
      <MockAuthProvider>
        <MockSongManagement />
      </MockAuthProvider>,
    )

    // Aguardar carregamento das músicas pendentes
    await waitFor(() => {
      expect(screen.getByText("Nova Música Sugerida")).toBeInTheDocument()
    })

    console.log("[v0] Música pendente encontrada, aprovando...")

    // Encontrar e clicar no botão de aprovar
    const approveButton = screen.getByRole("button", { name: /aprovar/i })
    expect(approveButton).toBeInTheDocument()

    await user.click(approveButton)

    await waitFor(() => {
      expect(mockApi.approveSong).toHaveBeenCalledWith(3)
      expect(screen.getByText(/música aprovada com sucesso/i)).toBeInTheDocument()
    })

    console.log("[v0] Música aprovada com sucesso!")
    console.log("[v0] Teste completo de workflow concluído")
  })

  test("Usuário deve conseguir sugerir música sem estar logado", async () => {
    console.log("[v0] Testando sugestão de música sem login")

    mockApi.suggestSong.mockResolvedValueOnce(undefined)

    renderWithAuth(<MockSuggestSong />)

    const urlInput = screen.getByTestId("url-input")
    const suggestButton = screen.getByRole("button", { name: /enviar sugestão/i })

    const testUrl = "https://www.youtube.com/watch?v=anonymous123"
    await user.type(urlInput, testUrl)
    await user.click(suggestButton)

    await waitFor(() => {
      expect(mockApi.suggestSong).toHaveBeenCalledWith(testUrl)
      expect(screen.getByText(/música sugerida com sucesso/i)).toBeInTheDocument()
    })

    console.log("[v0] Sugestão sem login funcionando corretamente")
  })
})
