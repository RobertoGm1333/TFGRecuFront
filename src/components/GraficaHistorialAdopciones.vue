<script setup lang="ts">
import { computed, watch, ref } from 'vue'
import { Line } from 'vue-chartjs'
import { Chart, LineElement, PointElement, LinearScale, TimeScale, CategoryScale, Tooltip, Legend, Filler } from 'chart.js'
import 'chartjs-adapter-date-fns'

Chart.register(LineElement, PointElement, LinearScale, TimeScale, CategoryScale, Tooltip, Legend, Filler)

type Punto = {
  mesYYYYMM: string
  total: number
  id_Protectora?: number
  nombre_Protectora?: string
}

const props = defineProps<{
  items: Punto[]
  monthsBack?: number
  title?: string
}>()

const monthsBack = computed(() => props.monthsBack ?? 12)

function parseYYYYMM(s: string) {
  const [y, m] = s.split('-').map(Number)
  const d = new Date(y, (m ?? 1) - 1, 1)
  return isNaN(d.getTime()) ? null : d
}

function formatYYYYMM(d: Date) {
  const y = d.getFullYear()
  const m = (d.getMonth() + 1).toString().padStart(2, '0')
  return `${y}-${m}`
}

const rangeLabels = computed(() => {
  const now = new Date()
  const start = new Date(now.getFullYear(), now.getMonth() - (monthsBack.value - 1), 1)
  const out: string[] = []
  const cursor = new Date(start)
  while (cursor <= now) {
    out.push(formatYYYYMM(cursor))
    cursor.setMonth(cursor.getMonth() + 1)
  }
  return out
})

const merged = computed(() => {
  const map = new Map<string, number>()
  for (const l of rangeLabels.value) map.set(l, 0)
  for (const it of props.items) {
    const d = parseYYYYMM(it.mesYYYYMM)
    if (!d) continue
    const key = formatYYYYMM(d)
    if (map.has(key)) map.set(key, (map.get(key) ?? 0) + (it.total ?? 0))
  }
  return rangeLabels.value.map(k => ({ key: k, total: map.get(k) ?? 0 }))
})

const chartData = ref({
  labels: merged.value.map(x => x.key),
  datasets: [
    {
      label: props.title ?? 'Adopciones',
      data: merged.value.map(x => x.total),
      fill: true,
      tension: 0.3,
      pointRadius: 3
    }
  ]
})

const chartOptions = ref({
  responsive: true,
  maintainAspectRatio: false,
  scales: {
    x: { type: 'time', time: { unit: 'month', tooltipFormat: 'MMM yyyy', parser: 'yyyy-MM' } },
    y: { beginAtZero: true, precision: 0 }
  },
  plugins: { legend: { display: false }, tooltip: { intersect: false, mode: 'index' } }
})

watch(merged, () => {
  chartData.value = {
    labels: merged.value.map(x => x.key),
    datasets: [
      {
        label: props.title ?? 'Adopciones',
        data: merged.value.map(x => x.total),
        fill: true,
        tension: 0.3,
        pointRadius: 3
      }
    ]
  }
})
</script>

<template>
  <div class="contenedor-grafica">
    <Line :data="chartData" :options="chartOptions" />
  </div>
</template>

<style scoped lang="scss">
.contenedor-grafica {
  width: 100%;
  height: 280px;
}
@media (min-width: 960px) {
  .contenedor-grafica {
    height: 360px;
  }
}
</style>
