<script setup>
import { ref, onMounted } from 'vue'
import { useUserStore } from '@/stores/user'
import WishlistBlock from '../components/WishlistBlock.vue'
import NavBar from '@/components/NavBar.vue'

const wishlists = ref([])
const userStore = useUserStore()
const loading = ref(true)
const error = ref('')

onMounted(async () => {
  try {
    const response = await fetch('http://localhost:3000/api/wishlists', {
      headers: {
        'Authorization': `Bearer ${userStore.token}`
      },
      credentials: 'include'
    })

    if (!response.ok) {
      throw new Error('Failed to load wishlists')
    }

    wishlists.value = await response.json()
  } catch (err) {
    error.value = err.message
  } finally {
    loading.value = false
  }
})
</script>

<template>
	<NavBar/>
	<div class="page-container">
		<div class="column">
			<WishlistBlock
				v-for="w in wishlists"
				:key="w.id"
				:id="w.id"
				:title="w.title"
				:description="w.description"
				:itemCount="w.itemCount"
			/>
		</div>
	</div>
</template>

<style scoped>
.column {
	display: flex;
	flex-direction: column;
	gap: 20px;
	padding: 20px;
}
</style>
