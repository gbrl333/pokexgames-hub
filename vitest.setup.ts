import '@testing-library/jest-dom'
import { configure } from '@testing-library/react'

// Configura Testing Library para ignorar elementos aria-hidden (comportamento esperado)
configure({ defaultHidden: true })

// Polyfill para Radix UI: jsdom não implementa Pointer Events API nem scrollIntoView
// https://github.com/radix-ui/primitives/issues/1822
if (typeof window !== 'undefined') {
  window.HTMLElement.prototype.hasPointerCapture = () => false
  window.HTMLElement.prototype.setPointerCapture = () => {}
  window.HTMLElement.prototype.releasePointerCapture = () => {}
  window.HTMLElement.prototype.scrollIntoView = () => {}
}
