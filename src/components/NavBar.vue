<template>
  <header class="bg-white border-b border-gray-200">
    <nav class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <div class="flex h-16 items-center justify-between">
        <RouterLink to="/" class="text-xl font-bold text-primary-600">
          CoHooter
        </RouterLink>
        <div class="flex items-center gap-4">
          <RouterLink
            to="/"
            class="rounded-md px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 hover:text-gray-900 transition"
          >
            Home
          </RouterLink>
        </div>
      </div>
    </nav>
  </header>
</template>
