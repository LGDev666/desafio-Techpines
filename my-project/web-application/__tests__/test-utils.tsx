import type React from "react"
import { render, type RenderOptions } from "@testing-library/react"
import { AuthProvider } from "@/hooks/use-auth"
import { jest } from "@jest/globals"

// Wrapper customizado com providers necessários
const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  return <AuthProvider>{children}</AuthProvider>
}

// Função customizada de render que inclui os providers
const customRender = (ui: React.ReactElement, options?: Omit<RenderOptions, "wrapper">) =>
  render(ui, { wrapper: AllTheProviders, ...options })

// Re-exportar tudo do testing-library
export * from "@testing-library/react"

// Sobrescrever o render com nossa versão customizada
export { customRender as render }

// Utilitários para mocks comuns
export const mockLocalStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
}

export const setupLocalStorageMock = () => {
  Object.defineProperty(window, "localStorage", {
    value: mockLocalStorage,
    writable: true,
  })
}

// Mock do window.confirm
export const setupWindowConfirmMock = (returnValue = true) => {
  Object.defineProperty(window, "confirm", {
    value: jest.fn(() => returnValue),
    writable: true,
  })
}

// Dados de teste reutilizáveis
export const testUsers = {
  admin: {
    id: 1,
    name: "Admin User",
    email: "admin@tiaocarreiro.com",
    role: "admin" as const,
  },
  user: {
    id: 2,
    name: "Regular User",
    email: "user@tiaocarreiro.com",
    role: "user" as const,
  },
}

export const testSongs = {
  approved: {
    id: 1,
    title: "O Mineiro e o Italiano",
    artist: "Tião Carreiro & Pardinho",
    youtube_url: "https://www.youtube.com/watch?v=s9kVG2ZaTS4",
    youtube_id: "s9kVG2ZaTS4",
    thumbnail: "https://img.youtube.com/vi/s9kVG2ZaTS4/hqdefault.jpg",
    views: 5200000,
    status: "approved" as const,
    formatted_views: "5.2M",
    created_at: "2024-01-01",
  },
  pending: {
    id: 2,
    title: "Nova Música Sugerida",
    artist: "Tião Carreiro & Pardinho",
    youtube_url: "https://www.youtube.com/watch?v=testmusic123",
    youtube_id: "testmusic123",
    thumbnail: "https://img.youtube.com/vi/testmusic123/hqdefault.jpg",
    views: 1000000,
    status: "pending" as const,
    formatted_views: "1M",
    created_at: "2024-01-01",
  },
}
