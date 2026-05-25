import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import App from '../App.vue'

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
          DemographicsChart: true,
          SchoolMap: true,
          SchoolList: true,
        },
      },
    })

    await flushPromises()

    expect(wrapper.text()).toContain('A T-Liu Production')
    expect(wrapper.text()).toContain(
      'The Changing Demographics of Charles County Public Schools',
    )
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
