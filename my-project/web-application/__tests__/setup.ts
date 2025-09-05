import "@testing-library/jest-dom"

// Mock global do fetch para testes de API
global.fetch = jest.fn()

// Mock do IntersectionObserver para componentes que usam
global.IntersectionObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}))

// Mock do ResizeObserver
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}))

// Configurar console.error para falhar testes em caso de erros React
const originalError = console.error
const beforeAll = global.beforeAll
const afterAll = global.afterAll

beforeAll(() => {
  console.error = (...args: any[]) => {
  if (
    typeof args[0] === "string" &&
    (args[0].includes("Warning: ReactDOM.render is deprecated") ||
    args[0].includes("Function components cannot be given refs"))
  ) {
    return
  }
    originalError.call(console, ...args)
  }
})

afterAll(() => {
  console.error = originalError
})
