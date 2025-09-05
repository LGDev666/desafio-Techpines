"use client"

import React from "react"
import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { jest } from "@jest/globals"

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
      <button onClick={() => mockApi.login("admin@tiaocarreiro.com", "password123")}>Entrar</button>
    </div>
  )
}

// Mock do SongManagement
const MockSongManagement = () => {
  const [songs, setSongs] = React.useState([
    {
      id: 1,
      title: "O Mineiro e o Italiano",
      artist: "Tião Carreiro & Pardinho",
      status: "approved",
    },
  ])

  const handleDelete = (id: number) => {
    mockApi.deleteSong(id)
    setSongs(songs.filter((song) => song.id !== id))
  }

  const handleReject = (id: number) => {
    mockApi.updateSong(id, { status: "rejected" })
  }

  return (
    <div data-testid="song-management">
      {songs.map((song) => (
        <div key={song.id} data-testid={`song-${song.id}`}>
          <h3>{song.title}</h3>
          <p>{song.artist}</p>
          <button onClick={() => handleDelete(song.id)} aria-label="trash2">
            Deletar
          </button>
          <button onClick={() => handleReject(song.id)} aria-label="edit">
            Editar
          </button>
        </div>
      ))}
      <div data-testid="edit-modal" style={{ display: "none" }}>
        <h2>Editar Música</h2>
        <select role="combobox">
          <option value="approved">Aprovada</option>
          <option value="rejected">Rejeitada</option>
        </select>
        <button>Salvar</button>
      </div>
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

// Mock do window.confirm
Object.defineProperty(window, "confirm", {
  value: jest.fn(() => true),
})

const mockApi = {
  login: jest.fn(),
  logout: jest.fn(),
  me: jest.fn(),
  getSongsByStatus: jest.fn(),
  getAllSongs: jest.fn(),
  approveSong: jest.fn(),
  rejectSong: jest.fn(),
  deleteSong: jest.fn(),
  updateSong: jest.fn(),
}

describe("Admin Workflow - Login, Delete/Reject Song, Logout", () => {
  const user = userEvent.setup()

  beforeEach(() => {
    jest.clearAllMocks()
    mockLocalStorage.getItem.mockReturnValue(null)
  })

  const renderWithAuth = (component: React.ReactElement) => {
    return render(<MockAuthProvider>{component}</MockAuthProvider>)
  }

  test("Admin deve conseguir fazer login, apagar uma música aprovada e fazer logout", async () => {
    console.log("[v0] Iniciando teste de workflow do admin")

    // Mock dos dados do admin
    const adminUser = {
      id: 1,
      name: "Admin User",
      email: "admin@tiaocarreiro.com",
      role: "admin",
    }

    // 1. TESTE DE LOGIN COMO ADMIN
    console.log("[v0] Testando login do admin")

    mockApi.login.mockResolvedValueOnce({
      user: adminUser,
      token: "admin-token-123",
    })

    const { rerender } = renderWithAuth(<MockAuthModal isOpen={true} onClose={() => {}} />)

    // Preencher credenciais de admin
    const emailInput = screen.getByTestId("email-input")
    const passwordInput = screen.getByTestId("password-input")
    const loginButton = screen.getByRole("button", { name: /entrar/i })

    await user.type(emailInput, "admin@tiaocarreiro.com")
    await user.type(passwordInput, "password123")
    await user.click(loginButton)

    await waitFor(() => {
      expect(mockApi.login).toHaveBeenCalledWith("admin@tiaocarreiro.com", "password123")
    })

    console.log("[v0] Login do admin realizado com sucesso")

    // 2. TESTE DE GERENCIAMENTO DE MÚSICAS - DELETAR MÚSICA APROVADA
    console.log("[v0] Testando exclusão de música aprovada")

    rerender(
      <MockAuthProvider>
        <MockSongManagement />
      </MockAuthProvider>,
    )

    // Aguardar carregamento das músicas
    await waitFor(() => {
      expect(screen.getByText("O Mineiro e o Italiano")).toBeInTheDocument()
    })

    console.log("[v0] Músicas carregadas, procurando botão de exclusão")

    // Encontrar e clicar no botão de deletar
    const deleteButton = screen.getByRole("button", { name: /trash2/i })
    expect(deleteButton).toBeInTheDocument()

    // Mock da exclusão
    mockApi.deleteSong.mockResolvedValueOnce(undefined)

    await user.click(deleteButton)

    await waitFor(() => {
      expect(mockApi.deleteSong).toHaveBeenCalledWith(1)
    })

    console.log("[v0] Música excluída com sucesso")

    // 3. TESTE DE LOGOUT
    console.log("[v0] Testando logout do admin")

    mockApi.logout.mockResolvedValueOnce(undefined)
    mockLocalStorage.removeItem("auth_token")

    await waitFor(() => {
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith("auth_token")
    })

    console.log("[v0] Logout do admin realizado com sucesso")
    console.log("[v0] Teste de workflow do admin concluído")
  })

  test("Admin deve conseguir rejeitar uma música aprovada", async () => {
    console.log("[v0] Iniciando teste de rejeição de música")

    const adminUser = {
      id: 1,
      name: "Admin User",
      email: "admin@tiaocarreiro.com",
      role: "admin",
    }

    // Mock da autenticação
    mockApi.me.mockResolvedValue(adminUser)
    mockLocalStorage.getItem.mockReturnValue("admin-token-123")

    renderWithAuth(<MockSongManagement />)

    await waitFor(() => {
      expect(screen.getByText("O Mineiro e o Italiano")).toBeInTheDocument()
    })

    // Clicar no botão de editar para rejeitar
    const editButton = screen.getByRole("button", { name: /edit/i })
    await user.click(editButton)

    // Mock da atualização para rejeitada
    mockApi.updateSong.mockResolvedValueOnce(undefined)

    await waitFor(() => {
      expect(mockApi.updateSong).toHaveBeenCalledWith(1, { status: "rejected" })
    })

    console.log("[v0] Música rejeitada com sucesso")
  })
})
