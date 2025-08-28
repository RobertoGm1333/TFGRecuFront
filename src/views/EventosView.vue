<script setup lang="ts">
import { onMounted, ref, computed } from 'vue'

type Evento = {
  Id_Evento: number
  Id_Protectora: number
  Nombre_Evento: string
  Lugar: string
  Fecha_Evento: string // viene como ISO de la API (DATE)
  Hora_Evento?: string
  Descripcion_Evento?: string
  EnclaceMaps?: string | null
  Foto_Evento?: string | null // ruta relativa guardada en la BBDD (ej: Images/Eventos/xxx.jpg)
}

type Protectora = {
  Id_Protectora: number
  Nombre?: string // si el campo en tu API se llama distinto, cámbialo aquí
  // ...otros campos que tenga tu modelo
}

const API_BASE = import.meta.env.VITE_API_BASE ?? 'http://localhost:5167'

// estado
const loading = ref(true)
const errorMsg = ref<string | null>(null)
const eventos = ref<Evento[]>([])
const protectorasCache = ref<Record<number, string>>({})

// helpers
const imgUrl = (ruta?: string | null) =>
  ruta ? `${API_BASE}/${ruta.replace(/^\/+/, '')}` : '/placeholder-evento.jpg'

const formatDate = (iso: string) => {
  try {
    // El backend manda DATE → parse seguro como local
    const d = new Date(iso + 'T00:00:00')
    return new Intl.DateTimeFormat('es-ES', { day: '2-digit', month: 'long', year: 'numeric' }).format(d)
  } catch {
    return iso
  }
}

async function fetchEventos () {
  loading.value = true
  errorMsg.value = null
  try {
    const res = await fetch(`${API_BASE}/api/Evento`)
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const data = await res.json()
    // La API devuelve array plano (según tu repo/ctrl)
    eventos.value = Array.isArray(data) ? data : (data?.items ?? [])
  } catch (e: any) {
    errorMsg.value = 'No se pudieron cargar los eventos. Inténtalo más tarde.'
    console.error(e)
  } finally {
    loading.value = false
  }
}

async function getProtectoraName (id: number): Promise<string> {
  if (!id) return '—'
  // cache
  if (protectorasCache.value[id]) return protectorasCache.value[id]
  try {
    const res = await fetch(`${API_BASE}/api/Protectora/${id}`)
    if (!res.ok) throw new Error('404')
    const p: Protectora = await res.json()
    const nombre = (p?.Nombre && p.Nombre.trim()) ? p.Nombre : `Protectora #${id}`
    protectorasCache.value[id] = nombre
    return nombre
  } catch {
    const fallback = `Protectora #${id}`
    protectorasCache.value[id] = fallback
    return fallback
  }
}

// precarga nombres de protectoras (opcional, para que no “parpadeen”)
async function warmupProtectoras () {
  const ids = [...new Set(eventos.value.map(e => e.Id_Protectora).filter(Boolean))]
  await Promise.all(ids.map(id => getProtectoraName(id)))
}

onMounted(async () => {
  await fetchEventos()
  if (eventos.value.length) warmupProtectoras()
})
</script>

<template>
  <div class="eventos-page">
    <header class="eventos-header">
      <h1>Eventos de protectoras</h1>
      <p class="intro">
        Descubre actividades, jornadas y campañas organizadas por las protectoras.
      </p>
    </header>

    <div v-if="loading" class="state state--loading">
      Cargando eventos…
    </div>

    <div v-else-if="errorMsg" class="state state--error">
      {{ errorMsg }}
    </div>

    <div v-else class="grid">
      <article
        v-for="ev in eventos"
        :key="ev.Id_Evento"
        class="card"
      >
        <div class="card__media">
          <img :src="imgUrl(ev.Foto_Evento)" :alt="ev.Nombre_Evento" />
        </div>

        <div class="card__body">
          <h3 class="card__title">{{ ev.Nombre_Evento }}</h3>

          <dl class="meta">
            <div class="meta__row">
              <dt>Fecha</dt>
              <dd>{{ formatDate(ev.Fecha_Evento) }}</dd>
            </div>
            <div class="meta__row">
              <dt>Lugar</dt>
              <dd>{{ ev.Lugar }}</dd>
            </div>
            <div class="meta__row">
              <dt>Protectora</dt>
              <dd>
                <span v-if="protectorasCache[ev.Id_Protectora]">
                  {{ protectorasCache[ev.Id_Protectora] }}
                </span>
                <span v-else class="skeleton skeleton--text" />
              </dd>
            </div>
          </dl>

          <!-- CTA para detalles (lo implementaremos luego) -->
          <!-- <RouterLink :to="`/eventos/${ev.Id_Evento}`" class="btn">Ver detalles</RouterLink> -->
        </div>
      </article>

      <div v-if="!eventos.length" class="state state--empty">
        No hay eventos publicados por ahora.
      </div>
    </div>
  </div>
</template>

<style scoped>
.eventos-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: clamp(16px, 2vw, 24px);
  font-family: system-ui, -apple-system, Segoe UI, Roboto, Inter, "Helvetica Neue", Arial, "Noto Sans", sans-serif;
}

.eventos-header {
  text-align: center;
  margin-bottom: clamp(16px, 3vw, 28px);
}

.eventos-header h1 {
  font-size: clamp(1.6rem, 2.5vw, 2.2rem);
  margin: 0 0 6px;
  color: #eee;
}

.intro {
  color: #cfcfcf;
  opacity: .9;
  margin: 0;
}

/* estados */
.state {
  text-align: center;
  padding: 32px 12px;
  border-radius: 12px;
  background: rgba(255,255,255,0.04);
  color: #ddd;
}
.state--error { color: #ffb4a9; background: rgba(255, 86, 48, 0.08); }
.state--empty { color: #bbb; }

/* grid de cards */
.grid {
  display: grid;
  gap: clamp(12px, 2vw, 20px);
  grid-template-columns: 1fr;
}
@media (min-width: 700px) {
  .grid { grid-template-columns: repeat(2, 1fr); }
}
@media (min-width: 1024px) {
  .grid { grid-template-columns: repeat(3, 1fr); }
}

/* card */
.card {
  display: grid;
  grid-template-rows: auto 1fr;
  background: rgba(255,255,255,0.06);
  border-radius: 14px;
  overflow: hidden;
  box-shadow: 0 4px 18px rgba(0,0,0,0.25);
  transition: transform .18s ease, box-shadow .18s ease;
}
.card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0,0,0,0.35);
}
.card__media {
  aspect-ratio: 16 / 10;
  background: rgba(0,0,0,.2);
}
.card__media img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}
.card__body {
  padding: 14px 14px 16px;
}
.card__title {
  margin: 0 0 10px;
  font-size: 1.05rem;
  color: #fff;
}

/* metadata */
.meta {
  margin: 0;
  display: grid;
  gap: 8px;
}
.meta__row {
  display: grid;
  grid-template-columns: 92px 1fr;
  gap: 8px;
  align-items: baseline;
}
.meta dt {
  color: #b9b9b9;
  font-weight: 600;
  font-size: .9rem;
}
.meta dd {
  margin: 0;
  color: #eaeaea;
  font-size: .95rem;
}

/* esqueletos para protectora mientras carga nombre */
.skeleton {
  display: inline-block;
  border-radius: 6px;
  background: linear-gradient(90deg, rgba(255,255,255,0.08), rgba(255,255,255,0.14), rgba(255,255,255,0.08));
  background-size: 200% 100%;
  animation: shimmer 1.4s infinite;
}
.skeleton--text { width: 160px; height: 0.9rem; }

@keyframes shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

/* botón (por si activas detalles) */
.btn {
  display: inline-block;
  margin-top: 12px;
  padding: 10px 14px;
  border-radius: 999px;
  background: #ff6a2b;
  color: #fff;
  font-weight: 700;
  text-decoration: none;
  transition: background .2s ease;
}
.btn:hover { background: #ff7e49; }
</style>
