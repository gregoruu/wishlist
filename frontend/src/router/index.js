import { createRouter, createWebHistory } from 'vue-router'
import { useUserStore } from '@/stores/user'
import HomeView from '@/views/HomeView.vue'
import LoginView from '@/views/LoginView.vue'
import RegisterView from '@/views/RegisterView.vue'
import WishlistView from '@/views/WishlistView.vue'
import SharedView from '@/views/SharedView.vue'
import ContactView from '@/views/ContactView.vue'

const routes = [
  { path: '/', component: HomeView },
  { path: '/login', component: LoginView },
  { path: '/register', component: RegisterView },
  {
    path: '/wishlists',
    component: WishlistView,
    meta: { requiresAuth: true }
  },
  {
    path: '/shared',
    component: SharedView,
    meta: { requiresAuth: true }
  },
  { path: '/contact', component: ContactView }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  const userStore = useUserStore()

	if (!userStore.token) {
		userStore.restoreSession()
	}
  
  if (to.meta.requiresAuth && !userStore.isLoggedIn) {
    next('/login')
  } else if ((to.path === '/login' || to.path === '/register') && userStore.isLoggedIn) {
    next('/wishlists')
  } else {
    next()
  }
})

export default router
