<script setup>
import FooterComp from './components/FooterComp.vue';
import { onMounted } from 'vue'
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()

onMounted(() => {
  userStore.restoreSession()
})
</script>

<template>
  <RouterView />
  <FooterComp />
</template>

<style scoped></style>
