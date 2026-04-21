<template>
  <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
    <!-- Sessions by Status -->
    <div class="card-kahoot p-6">
      <h2 class="text-lg font-bold text-white mb-4">Sessions by Status</h2>
      <div class="flex items-center justify-center h-56">
        <Doughnut v-if="hasStatusData" :data="statusChartData" :options="doughnutOptions" />
        <p v-else class="text-white/30 text-sm">No session data yet</p>
      </div>
    </div>

    <!-- Sessions Over Time -->
    <div class="card-kahoot p-6">
      <h2 class="text-lg font-bold text-white mb-4">Sessions Over Time</h2>
      <div class="h-56">
        <Bar v-if="hasTimeData" :data="timeChartData" :options="barOptions" />
        <p v-else class="flex items-center justify-center h-full text-white/30 text-sm">No session data yet</p>
      </div>
    </div>

    <!-- Accuracy per Session -->
    <div class="card-kahoot p-6 lg:col-span-2">
      <h2 class="text-lg font-bold text-white mb-4">Accuracy per Session</h2>
      <div class="h-56">
        <Line v-if="hasAccuracyData" :data="accuracyChartData" :options="lineOptions" />
        <p v-else class="flex items-center justify-center h-full text-white/30 text-sm">No submission data yet</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { Doughnut, Bar, Line } from 'vue-chartjs'
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Filler,
} from 'chart.js'

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, LineElement, PointElement, Filler)

const props = defineProps({
  sessions: { type: Array, default: () => [] },
})

const STATUS_COLORS = {
  active:    '#26890c',
  completed: '#1368ce',
  lobby:     '#864cbf',
  scheduled: '#ffb800',
}

const hasStatusData   = computed(() => props.sessions.length > 0)
const hasTimeData     = computed(() => props.sessions.length > 0)
const hasAccuracyData = computed(() => props.sessions.some(s => s.accuracy !== null))

const statusChartData = computed(() => {
  const counts = {}
  for (const s of props.sessions) {
    counts[s.status] = (counts[s.status] || 0) + 1
  }
  const labels = Object.keys(counts)
  return {
    labels,
    datasets: [{
      data: labels.map(l => counts[l]),
      backgroundColor: labels.map(l => STATUS_COLORS[l] ?? '#ffffff33'),
      borderWidth: 0,
    }],
  }
})

const timeChartData = computed(() => {
  const counts = {}
  for (const s of props.sessions) {
    if (!s.createdAt) continue
    const day = new Date(s.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    counts[day] = (counts[day] || 0) + 1
  }
  const labels = Object.keys(counts).slice(-14)
  return {
    labels,
    datasets: [{
      label: 'Sessions',
      data: labels.map(l => counts[l]),
      backgroundColor: '#864cbf',
      borderRadius: 6,
    }],
  }
})

const accuracyChartData = computed(() => {
  const withAccuracy = props.sessions
    .filter(s => s.accuracy !== null)
    .slice()
    .reverse()

  return {
    labels: withAccuracy.map(s => s.pin),
    datasets: [{
      label: 'Accuracy %',
      data: withAccuracy.map(s => s.accuracy),
      borderColor: '#ffb800',
      backgroundColor: 'rgba(255,184,0,0.15)',
      pointBackgroundColor: '#ffb800',
      pointRadius: 5,
      tension: 0.3,
      fill: true,
    }],
  }
})

const doughnutOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'bottom',
      labels: { color: 'rgba(255,255,255,0.6)', padding: 16, boxWidth: 12 },
    },
  },
}

const barOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
  },
  scales: {
    x: {
      ticks: { color: 'rgba(255,255,255,0.4)' },
      grid:  { color: 'rgba(255,255,255,0.05)' },
    },
    y: {
      ticks: { color: 'rgba(255,255,255,0.4)', stepSize: 1 },
      grid:  { color: 'rgba(255,255,255,0.05)' },
    },
  },
}

const lineOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    tooltip: {
      callbacks: {
        label: ctx => ` ${ctx.parsed.y}% accuracy`,
      },
    },
  },
  scales: {
    x: {
      ticks: { color: 'rgba(255,255,255,0.4)' },
      grid:  { color: 'rgba(255,255,255,0.05)' },
    },
    y: {
      min: 0,
      max: 100,
      ticks: { color: 'rgba(255,255,255,0.4)', callback: v => v + '%' },
      grid:  { color: 'rgba(255,255,255,0.05)' },
    },
  },
}
</script>
