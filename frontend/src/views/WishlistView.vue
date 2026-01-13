<script setup>
import { ref, onMounted } from 'vue'
import WishlistBlock from '../components/WishlistBlock.vue'
import NavBar from '@/components/NavBar.vue'

const wishlists = ref([])

onMounted(async () => {
	try {
    const res = await fetch('http://localhost:3000/api/wishlists')
    wishlists.value = await res.json()
  } catch (err) {
    console.log(err.message)
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
