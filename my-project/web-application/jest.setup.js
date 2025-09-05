import { jest } from "@jest/globals"
import "@testing-library/jest-dom"

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
}

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
}

// Mock window.matchMedia
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: jest.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
})

global.fetch = jest.fn()

const originalConsoleLog = console.log
console.log = (...args) => {
  // Permitir logs que começam com [v0] para debug dos testes
  if (args[0] && typeof args[0] === "string" && args[0].startsWith("[v0]")) {
    originalConsoleLog(...args)
  }
}

jest.setTimeout(10000)
