<template>
  <header class="bg-kahoot-purple-dark/80 backdrop-blur-md border-b border-white/10 sticky top-0 z-50">
    <nav class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <div class="flex h-16 items-center justify-between">
        <RouterLink to="/" class="flex items-center gap-1 group">
          <span class="text-xl font-black text-white group-hover:text-white/90 transition">Co</span>
          <span class="text-xl font-black text-kahoot-yellow group-hover:text-kahoot-yellow/90 transition">Hooter</span>
        </RouterLink>
        <div class="flex items-center gap-2">
          <RouterLink
            v-for="link in navLinks"
            :key="link.to"
            :to="link.to"
            class="rounded-lg px-3 py-2 text-sm font-semibold text-white/60 hover:bg-white/10 hover:text-white transition"
          >
            {{ link.label }}
          </RouterLink>
        </div>
      </div>
    </nav>
  </header>
</template>

<script setup>
const navLinks = [
  { to: '/', label: 'Home' },
  { to: '/scoreboard', label: 'Scoreboard' },
  { to: '/admin', label: 'Admin' },
]
</script>
