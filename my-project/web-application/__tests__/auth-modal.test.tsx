"use client"

import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { AuthModal } from "@/components/auth-modal"
import "@testing-library/jest-dom"

const mockLogin = jest.fn()
const mockRegister = jest.fn()
const mockLogout = jest.fn()

jest.mock("@/hooks/use-auth", () => ({
  useAuth: () => ({
    login: mockLogin,
    register: mockRegister,
    user: null,
    logout: mockLogout,
    isLoading: false,
  }),
}))


describe("AuthModal", () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it("renderiza inputs de login e envia credenciais", async () => {
    render(<AuthModal isOpen={true} onClose={() => {}} />)

    fireEvent.change(screen.getByPlaceholderText(/admin@tiaocarreiro.com/i), {
      target: { value: "admin@tiaocarreiro.com" },
    })
    fireEvent.change(screen.getByPlaceholderText(/password123/i), {
      target: { value: "password123" },
    })

    fireEvent.click(screen.getByRole("button", { name: /entrar/i }))

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith("admin@tiaocarreiro.com", "password123")
    })
  })

  it("mostra erro se login falhar", async () => {
    mockLogin.mockRejectedValueOnce(new Error("Credenciais inválidas"))

    render(<AuthModal isOpen={true} onClose={() => {}} />)

    fireEvent.change(screen.getByPlaceholderText(/admin@tiaocarreiro.com/i), {
      target: { value: "wrong@user.com" },
    })
    fireEvent.change(screen.getByPlaceholderText(/password123/i), {
      target: { value: "wrongpass" },
    })

    fireEvent.click(screen.getByRole("button", { name: /entrar/i }))

    expect(await screen.findByText((text) => text.includes("Credenciais inválidas"))).toBeInTheDocument()
  })

  it("permite trocar para aba de cadastro", async () => {
    render(<AuthModal isOpen={true} onClose={() => {}} />)

    const user = userEvent.setup()
    await user.click(screen.getByRole("tab", { name: /cadastrar/i }))

    await waitFor(() => {
      expect(screen.getByLabelText("Nome")).toBeInTheDocument()
    })

    expect(screen.getByRole("button", { name: /criar conta/i })).toBeInTheDocument()
  })
})
