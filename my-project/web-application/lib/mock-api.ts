// Mock API para testes Jest
import { jest } from "@jest/globals"

export const mockApiService = {
  // Dados mockados
  mockUsers: [
    { id: 1, name: "Admin", email: "admin@tiaocarreiro.com", role: "admin" },
    { id: 2, name: "User", email: "user@tiaocarreiro.com", role: "user" },
  ],

  mockSongs: [
    { id: 1, title: "Rei do Gado", artist: "Tião Carreiro & Pardinho", status: "approved", votes: 150 },
    { id: 2, title: "Pagode em Brasília", artist: "Tião Carreiro & Pardinho", status: "approved", votes: 120 },
    { id: 3, title: "Modas de Viola", artist: "Tião Carreiro & Pardinho", status: "pending", votes: 0 },
  ],

  // Métodos da API
  login: jest.fn(),
  logout: jest.fn(),
  me: jest.fn(),
  register: jest.fn(),
  suggestSong: jest.fn(),
  getTopSongs: jest.fn(),
  getRemainingSongs: jest.fn(),
  approveSong: jest.fn(),
  rejectSong: jest.fn(),
  deleteSong: jest.fn(),
}

// Mock do localStorage
export const mockLocalStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
}

// Setup dos mocks
export const setupMocks = () => {
  // Mock localStorage
  Object.defineProperty(window, "localStorage", {
    value: mockLocalStorage,
  })

  // Mock API responses
  mockApiService.login.mockResolvedValue({
    user: mockApiService.mockUsers[0],
    token: "mock-token",
  })

  mockApiService.me.mockResolvedValue(mockApiService.mockUsers[0])

  mockApiService.getTopSongs.mockResolvedValue(mockApiService.mockSongs.slice(0, 2))

  mockApiService.getRemainingSongs.mockResolvedValue(mockApiService.mockSongs.slice(2))
}

// Reset dos mocks
export const resetMocks = () => {
  Object.values(mockApiService).forEach((mock) => {
    if (typeof mock === "function" && mock.mockReset) {
      mock.mockReset()
    }
  })

  Object.values(mockLocalStorage).forEach((mock) => {
    if (typeof mock === "function" && mock.mockReset) {
      mock.mockReset()
    }
  })
}
