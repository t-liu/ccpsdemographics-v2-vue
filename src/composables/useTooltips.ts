import { onUnmounted } from 'vue'
import tippy, { type Instance } from 'tippy.js'

export function useTooltips() {
  let tippyInstances: Instance[] = []

  const initTooltips = (selector: string) => {
    cleanup()

    const elements = document.querySelectorAll(selector)

    if (elements.length === 0) {
      console.warn('No elements found for tooltip selector:', selector)
      return
    }

    try {
      tippyInstances = tippy(Array.from(elements), {
        content(reference) {
          return reference.getAttribute('title') ?? ''
        },
        allowHTML: true,
        placement: 'auto',
        theme: 'custom',
        arrow: true,
        interactive: false,
      })
    } catch (err) {
      console.error('Error creating tooltips:', err)
    }
  }

  const cleanup = () => {
    tippyInstances.forEach((instance) => {
      instance?.destroy()
    })
    tippyInstances = []
  }

  onUnmounted(() => {
    cleanup()
  })

  return {
    initTooltips,
    cleanup,
  }
}
