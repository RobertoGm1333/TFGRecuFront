<script setup lang="ts">
import { onMounted, ref, computed } from 'vue'
import { useRoute, RouterLink } from 'vue-router'

type Evento = {
  Id_Evento: number
  Id_Protectora: number
  Nombre_Evento: string
  Lugar: string
  Fecha_Evento: string
  Hora_Evento?: string | null
  Descripcion_Evento?: string | null
  EnclaceMaps?: string | null
  Foto_Evento?: string | null
}

type Protectora = {
  Id_Protectora: number
  Nombre?: string
  Nombre_Protectora?: string
  nombre?: string
  nombre_Protectora?: string
}

const route = useRoute()
const API_BASE = import.meta.env.VITE_API_BASE ?? 'http://localhost:5167'

// estado
const loading = ref(true)
const errorMsg = ref<string | null>(null)
const evento = ref<Evento | null>(null)
const nombreProtectora = ref<string>('')

// helpers
const imgUrl = (ruta?: string | null) =>
  ruta ? `${API_BASE}/${String(ruta).replace(/^\/+/, '')}` : '/placeholder-evento.jpg'

const formatDate = (iso?: string | null) => {
  if (!iso) return '—'
  try {
    const normalized = /\dT\d/.test(iso) ? iso : `${iso}T00:00:00`
    const d = new Date(normalized)
    return new Intl.DateTimeFormat('es-ES', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    }).format(d)
  } catch {
    return iso
  }
}

const formatTime = (t?: string | null) => {
  if (!t) return '—'
  // Acepta "HH:mm" o "HH:mm:ss"
  const hhmm = String(t).slice(0,5)
  return hhmm
}

function normalizaEvento(e: any): Evento {
  return {
    Id_Evento: e.Id_Evento ?? e.id_Evento ?? e.ID_Evento,
    Id_Protectora: e.Id_Protectora ?? e.id_Protectora,
    Nombre_Evento: e.Nombre_Evento ?? e.nombre_Evento,
    Lugar: e.Lugar ?? e.lugar ?? '',
    Fecha_Evento: e.Fecha_Evento ?? e.fecha_Evento ?? '',
    Hora_Evento: e.Hora_Evento ?? e.hora_Evento ?? null,
    Descripcion_Evento: e.Descripcion_Evento ?? e.descripcion_Evento ?? null,
    EnclaceMaps: e.EnclaceMaps ?? e.enclaceMaps ?? e.enlaceMaps ?? null,
    Foto_Evento: e.Foto_Evento ?? e.foto_Evento ?? e.foto ?? null,
  }
}

async function fetchEvento() {
  loading.value = true
  errorMsg.value = null
  try {
    const id = route.params.id
    const res = await fetch(`${API_BASE}/api/Evento/${id}`)
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const data = await res.json()
    evento.value = normalizaEvento(data)
    await fetchProtectoraNombre(evento.value.Id_Protectora)
  } catch (e: any) {
    console.error(e)
    errorMsg.value = 'No se pudo cargar el evento.'
  } finally {
    loading.value = false
  }
}

async function fetchProtectoraNombre(id: number) {
  try {
    if (!id) return
    const r = await fetch(`${API_BASE}/api/Protectora/${id}`)
    if (!r.ok) throw new Error('404')
    const p: Protectora = await r.json()
    nombreProtectora.value =
      (p?.Nombre && p.Nombre.trim()) ||
      (p?.nombre && String(p.nombre).trim()) ||
      (p?.Nombre_Protectora && String(p.Nombre_Protectora).trim()) ||
      (p?.nombre_Protectora && String(p.nombre_Protectora).trim()) ||
      `Protectora #${id}`
  } catch {
    nombreProtectora.value = `Protectora #${id}`
  }
}

onMounted(fetchEvento)
</script>

<template>
  <div class="detalle-page">
    <header class="detalle-header">
      <h1>Detalle del evento</h1>
      <h2 class="intro">
        <template v-if="evento">
          Consulta toda la información sobre <b>{{ evento.Nombre_Evento }}</b>
        </template>
        <template v-else>
          Consulta toda la información del evento seleccionado.
        </template>
      </h2>
    </header>

    <div v-if="loading" class="state state--loading">Cargando evento…</div>
    <div v-else-if="errorMsg" class="state state--error">{{ errorMsg }}</div>

    <div v-else-if="evento" class="wrap">
      <article class="card">
        <div class="card__media">
          <img :src="imgUrl(evento.Foto_Evento)" :alt="evento.Nombre_Evento" />
        </div>

        <div class="card__body">
          <!-- Título + fecha -->
          <div class="title-row">
            <h2 class="card__title">{{ evento.Nombre_Evento }}</h2>
            <div class="card__date">{{ formatDate(evento.Fecha_Evento) }}</div>
          </div>

          <!-- Grid de datos -->
          <dl class="meta">
            <div class="meta__row">
              <dt>Hora</dt>
              <dd>{{ formatTime(evento.Hora_Evento) }}</dd>
            </div>

            <div class="meta__row">
              <dt>Lugar</dt>
              <dd>
                <template v-if="evento.EnclaceMaps">
                  <a :href="evento.EnclaceMaps" target="_blank" rel="noopener noreferrer">
                    {{ evento.Lugar || 'Ver en Google Maps' }}
                  </a>
                </template>
                <template v-else>
                  {{ evento.Lugar || '—' }}
                </template>
              </dd>
            </div>

            <div class="meta__row">
              <dt>Protectora</dt>
              <dd>{{ nombreProtectora || `Protectora #${evento.Id_Protectora}` }}</dd>
            </div>

            <div class="meta__row meta__row--full">
              <dt>Descripción</dt>
              <dd>{{ evento.Descripcion_Evento || 'Sin descripción' }}</dd>
            </div>
          </dl>

          <div class="actions">
            <RouterLink to="/eventos" class="btn btn--secondary">← Volver a eventos</RouterLink>
          </div>
        </div>
      </article>
    </div>

    <div v-else class="state state--empty">
      No se encontraron datos para este evento.
    </div>
  </div>
</template>

<style scoped lang="scss">
.detalle-page {
  max-width: 880px;
  margin: 0 auto;
  padding: clamp(14px, 2.2vw, 28px);
  font-family: system-ui, -apple-system, Segoe UI, Roboto, Inter, "Helvetica Neue", Arial, "Noto Sans", sans-serif;
}

.detalle-header {
  text-align: center;
  margin-bottom: clamp(16px, 3vw, 28px);
}
.detalle-header h1 {
  font-size: clamp(1.6rem, 2.2vw, 2.1rem);
  color: $color-principal; /* ahora el título usa el color primario */
  margin: 0 0 6px;
}
.detalle-header h2 {
  font-size: 1.15rem;
  font-weight: 400;
  color: #cfcfcf;
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

.wrap {
  display: grid;
  grid-template-columns: 1fr;
}

/* tarjeta */
.card {
  display: grid;
  grid-template-rows: auto 1fr;
  background: rgba(255,255,255,0.06);
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 6px 24px rgba(0,0,0,0.28);
  border: 1px solid rgba(255,255,255,0.06);
}
.card__media {
  aspect-ratio: 16/9;
  background: rgba(0,0,0,.2);
}
.card__media img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}
.card__body {
  padding: 20px 20px 22px;
}

/* cabecera de tarjeta */
.title-row {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 12px;
  align-items: baseline;
  margin-bottom: 14px;
}
.card__title {
  margin: 0;
  font-size: 1.4rem;
  color: #fff;
}
.card__date {
  color: #eaeaea;
  font-weight: 600;
  white-space: nowrap;
  font-size: 1rem;
  opacity: .95;
}

/* datos */
.meta {
  margin: 0;
  display: grid;
  gap: 12px;
}
.meta__row {
  display: grid;
  grid-template-columns: 140px 1fr;
  gap: 12px;
  align-items: start;
}
.meta__row--full {
  grid-template-columns: 140px 1fr;
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
.meta a {
  color: #ffb074;
  text-decoration: none;
}
.meta a:hover {
  text-decoration: underline;
}

/* acciones */
.actions {
  margin-top: 18px;
}
.btn {
  display: inline-block;
  padding: 10px 14px;
  border-radius: 999px;
  text-decoration: none;
  font-weight: 700;
}
.btn--secondary {
  background: rgba(255,255,255,0.08);
  color: #fff;
}
.btn--secondary:hover { background: rgba(255,255,255,0.14); }
</style>
