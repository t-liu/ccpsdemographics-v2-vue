import { onUnmounted } from 'vue'
import tippy from 'tippy.js'
import 'tippy.js/dist/tippy.css'

export function useTooltips() {
  let tippyInstances = []

  const initTooltips = (selector) => {
    console.log('Initializing tooltips for selector:', selector)
    
    // Clean up existing tooltips
    cleanup()
    
    const elements = document.querySelectorAll(selector)
    console.log('Found elements:', elements.length)
    
    if (elements.length === 0) {
      console.warn('No elements found for tooltip selector:', selector)
      return
    }
    
    try {
      tippyInstances = tippy(elements, {
        content(reference) {
          const title = reference.getAttribute('title')
          console.log('Tooltip content:', title)
          return title
        },
        allowHTML: true,
        placement: 'auto',
        theme: 'custom',
        arrow: true,
        interactive: false
      })
      console.log('Tooltips created:', tippyInstances.length)
    } catch (error) {
      console.error('Error creating tooltips:', error)
    }
  }

  const cleanup = () => {
    tippyInstances.forEach(instance => {
      if (instance && instance.destroy) {
        instance.destroy()
      }
    })
    tippyInstances = []
  }

  onUnmounted(() => {
    cleanup()
  })

  return {
    initTooltips,
    cleanup
  }
}