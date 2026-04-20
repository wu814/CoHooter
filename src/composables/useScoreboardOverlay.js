import { ref } from 'vue'

const visible = ref(false)
const pin = ref('')

/**
 * Global scoreboard drawer (used from NavBar / Host) without leaving the current route.
 */
export function useScoreboardOverlay() {
  function open(rawPin) {
    const p = String(rawPin ?? '').trim()
    if (!p) return
    pin.value = p
    visible.value = true
  }

  function close() {
    visible.value = false
  }

  return { visible, pin, open, close }
}
