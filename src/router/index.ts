import { createRouter, createWebHistory } from 'vue-router'
import AlbumsView from '@/views/AlbumsView.vue'
import HomeView from '@/views/HomeView.vue'
import StreamView from '@/views/StreamView.vue'
import UploadView from '@/views/UploadView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/stream',
      name: 'stream',
      component: StreamView,
    },
    {
      path: '/albums',
      name: 'albums',
      component: AlbumsView,
    },
    {
      path: '/upload',
      name: 'upload',
      component: UploadView,
    },
  ],
})

export default router
