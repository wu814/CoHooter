<template>
  <div class="min-h-screen flex flex-col bg-kahoot-purple-deep">
    <NavBar />
    <main class="flex-1 flex flex-col">
      <RouterView />
    </main>
  </div>
</template>

<script setup>
import NavBar from '@/components/NavBar.vue'
</script>
