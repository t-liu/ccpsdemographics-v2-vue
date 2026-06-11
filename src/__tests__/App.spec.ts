import { describe, it, expect, vi, beforeAll, beforeEach, afterEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import App from '../App.vue'

beforeAll(() => {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation(query => ({
      matches: false, // Default to light mode fallback for testing
      media: query,
      onchange: null,
      addListener: vi.fn(), 
      removeListener: vi.fn(), 
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  })
})

describe('App', () => {
  beforeEach(() => {
    vi.stubEnv('VITE_API_BASE_URL', 'https://api.example.com')
    vi.stubEnv('VITE_API_KEY', 'test-api-key')
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => [],
      }),
    )
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    vi.unstubAllEnvs()
  })

  it('mounts and renders the main heading', async () => {
    const wrapper = mount(App, {
      global: {
        stubs: {
          'font-awesome-icon': true, // Silences the Vue component resolution warnings
          DemographicsChart: true,
          SchoolMap: true,
          SchoolList: true,
        },
      },
    })

    await flushPromises()

    expect(wrapper.text()).toContain('A T-Liu Production')
    expect(wrapper.text()).toContain('The Changing Demographics of Charles County Public Schools')
    expect(fetch).toHaveBeenCalledWith(
      'https://api.example.com/schools',
      expect.objectContaining({
        method: 'GET',
        headers: expect.objectContaining({
          'x-api-key': 'test-api-key',
        }),
      }),
    )
  })
})