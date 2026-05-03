import { describe, it, expect } from 'vitest'

import { mount } from '@vue/test-utils'
import { createPinia } from 'pinia'
import { createMemoryHistory, createRouter } from 'vue-router'
import App from '../App.vue'

describe('App', () => {
  it('mounts renders properly', async () => {
    const router = createRouter({
      history: createMemoryHistory(),
      routes: [
        { path: '/', name: 'home', component: { template: '<div />' } },
        { path: '/stream', name: 'stream', component: { template: '<div />' } },
        { path: '/favorites', name: 'favorites', component: { template: '<div />' } },
        { path: '/tracks/:id', name: 'track', component: { template: '<div />' } },
        { path: '/albums', name: 'albums', component: { template: '<div />' } },
        { path: '/upload', name: 'upload', component: { template: '<div />' } },
        { path: '/me', name: 'profile', component: { template: '<div />' } },
        { path: '/users/:id', name: 'user', component: { template: '<div />' } },
      ],
    })

    await router.push('/')
    await router.isReady()

    const wrapper = mount(App, {
      global: {
        plugins: [createPinia(), router],
      },
    })

    expect(wrapper.text()).toContain('SoundWave')
  })
})
