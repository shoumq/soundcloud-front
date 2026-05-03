import { createRouter, createWebHistory } from 'vue-router'
import AlbumsView from '@/views/AlbumsView.vue'
import HomeView from '@/views/HomeView.vue'
import ProfileView from '@/views/ProfileView.vue'
import StreamView from '@/views/StreamView.vue'
import TrackView from '@/views/TrackView.vue'
import UploadView from '@/views/UploadView.vue'
import UserProfileView from '@/views/UserProfileView.vue'

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
      path: '/tracks/:id',
      name: 'track',
      component: TrackView,
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
    {
      path: '/me',
      name: 'profile',
      component: ProfileView,
    },
    {
      path: '/users/:id',
      name: 'user',
      component: UserProfileView,
    },
  ],
})

export default router
