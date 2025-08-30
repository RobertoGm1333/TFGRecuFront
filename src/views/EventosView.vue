<script setup lang="ts">
import { onMounted, ref, computed } from 'vue'

type Evento = {
  Id_Evento: number
  Id_Protectora: number
  Nombre_Evento: string
  Lugar: string
  Fecha_Evento: string 
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
    // El backend puede mandar DATE ("2025-09-07") o DATETIME ("2025-09-07T00:00:00")
    const normalized = /\dT\d/.test(iso) ? iso : `${iso}T00:00:00`
    const d = new Date(normalized)
    return new Intl.DateTimeFormat('es-ES', { day: '2-digit', month: 'long', year: 'numeric' }).format(d)
  } catch {
    return iso
  }
}

// Normaliza el shape que devuelve la API (snake/camel/lowercase) al que usa la UI.
function normalizaEvento(e: any): Evento {
  return {
    Id_Evento: e.Id_Evento ?? e.id_Evento ?? e.ID_Evento,
    Id_Protectora: e.Id_Protectora ?? e.id_Protectora,
    Nombre_Evento: e.Nombre_Evento ?? e.nombre_Evento,
    Lugar: e.Lugar ?? e.lugar ?? '',
    Fecha_Evento: e.Fecha_Evento ?? e.fecha_Evento ?? '',
    Hora_Evento: e.Hora_Evento ?? e.hora_Evento ?? '',
    Descripcion_Evento: e.Descripcion_Evento ?? e.descripcion_Evento ?? '',
    EnclaceMaps: e.EnclaceMaps ?? e.enclaceMaps ?? e.enlaceMaps ?? null,
    Foto_Evento: e.Foto_Evento ?? e.foto_Evento ?? e.foto ?? null,
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
    const arr = Array.isArray(data) ? data : (data?.items ?? [])
    eventos.value = arr.map(normalizaEvento)
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
    const p: any = await res.json()
    // Intentamos varios nombres de propiedad habituales
    const nombre =
      (p?.Nombre && p.Nombre.trim()) ||
      (p?.nombre && String(p.nombre).trim()) ||
      (p?.Nombre_Protectora && String(p.Nombre_Protectora).trim()) ||
      (p?.nombre_Protectora && String(p.nombre_Protectora).trim()) ||
      `Protectora #${id}`

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
      <h2 class="intro">
        Descubre actividades, jornadas y campañas organizadas por las protectoras.
      </h2>
    </header>

    <div v-if="loading" class="state state--loading">
      Cargando eventos…
    </div>

    <div v-else-if="errorMsg" class="state state--error">
      {{ errorMsg }}
    </div>

    <div v-else class="grid">
      <RouterLink
        v-for="ev in eventos"
        :key="ev.Id_Evento"
        :to="`/eventos/${ev.Id_Evento}`"
        class="card-link"
      >
        <article class="card">
          <div class="card__media">
            <img :src="imgUrl(ev.Foto_Evento)" :alt="ev.Nombre_Evento" />
          </div>

          <div class="card__body">
            <!-- Fila: Título (izq) + Fecha (der) -->
            <div class="title-row">
              <h3 class="card__title">{{ ev.Nombre_Evento }}</h3>
              <div class="card__date">{{ formatDate(ev.Fecha_Evento) }}</div>
            </div>

            <!-- Lugar -->
            <dl class="meta">
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
          </div>
        </article>
      </RouterLink>

      <div v-if="!eventos.length" class="state state--empty">
        No hay eventos publicados por ahora.
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
/* === Contenedor principal === */
/* PC un poco más estrecho y con más separación */
.eventos-page {
  max-width: 640px; /* ↓ más estrecho que antes */
  margin: 0 auto;
  padding: clamp(12px, 2vw, 24px); /* reduce padding superior en general */
  font-family: system-ui, -apple-system, Segoe UI, Roboto, Inter, "Helvetica Neue", Arial, "Noto Sans", sans-serif;
}

/* En móviles quitamos margen visual arriba (compacto bajo el header de la web) */
@media (max-width: 600px) {
  .eventos-page { padding-top: 6px; }
  .eventos-header { margin-bottom: 10px; }
}

/* === Cabecera === */
.eventos-header {
  text-align: center;
  margin-bottom: clamp(16px, 3vw, 28px);
}

.eventos-header h1 {
  font-size: clamp(1.6rem, 2.5vw, 2.2rem);
  margin: 0 0 6px;
  color: $color-principal;
}

.intro {
  color: #cfcfcf;
  opacity: .9;
  margin: 0;
}

/* === Estados === */
.state {
  text-align: center;
  padding: 32px 12px;
  border-radius: 12px;
  background: rgba(255,255,255,0.04);
  color: #ddd;
}
.state--error { color: #ffb4a9; background: rgba(255, 86, 48, 0.08); }
.state--empty { color: #bbb; }

/* === Grid: una por fila siempre === */
.grid {
  display: grid;
  gap: clamp(16px, 2.4vw, 26px); /* más gap base */
  grid-template-columns: 1fr;
}
/* Más gap en pantallas grandes */
@media (min-width: 1024px) {
  .grid { gap: 45px; }
}

/* === Tarjeta === */
.card-link {
  text-decoration: none;
  color: inherit;
}
.card {
  display: grid;
  grid-template-rows: auto 1fr;
  background: rgba(255,255,255,0.06);
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 6px 24px rgba(0,0,0,0.28);
  transition: transform .18s ease, box-shadow .18s ease;
  cursor: pointer;
}
.card:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 30px rgba(0,0,0,0.36);
}
.card__media {
  aspect-ratio: 16 / 9;
  background: rgba(0,0,0,.2);
}
.card__media img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}
.card__body {
  padding: 18px 18px 20px;
}

/* Fila de Título a la izquierda y Fecha a la derecha */
.title-row {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 12px;
  align-items: baseline;
  margin-bottom: 12px;
}
.card__title {
  margin: 0;
  font-size: 1.32rem;
  color: #fff;
}
.card__date {
  color: #eaeaea;
  font-weight: 600;
  white-space: nowrap;
  font-size: 1rem;
  opacity: .95;
}

/* metadata */
.meta {
  margin: 0;
  display: grid;
  gap: 10px;
}
.meta__row {
  display: grid;
  grid-template-columns: 120px 1fr;
  gap: 10px;
  align-items: baseline;
}
.meta dt {
  color: #b9b9b9;
  font-weight: 700;
  font-size: 1rem;
}
.meta dd {
  margin: 0;
  color: #eaeaea;
  font-size: 1.02rem;
}

/* esqueletos para protectora mientras carga nombre */
.skeleton {
  display: inline-block;
  border-radius: 6px;
  background: linear-gradient(90deg, rgba(255,255,255,0.08), rgba(255,255,255,0.14), rgba(255,255,255,0.08));
  background-size: 200% 100%;
  animation: shimmer 1.4s infinite;
}
.skeleton--text { width: 200px; height: 1rem; }

@keyframes shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

/* botón (por si activas detalles) */
.btn {
  display: inline-block;
  margin-top: 14px;
  padding: 12px 16px;
  border-radius: 999px;
  background: #ff6a2b;
  color: #fff;
  font-weight: 700;
  text-decoration: none;
  transition: background .2s ease;
}
.btn:hover { background: #ff7e49; }
</style>
