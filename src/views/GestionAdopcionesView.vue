<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import GraficaHistorialAdopciones from '@/components/GraficaHistorialAdopciones.vue'

/* ======================== Tipos ======================== */
type Protectora = {
  id_Protectora: number
  nombre_Protectora: string
}

type Gato = {
  id_Gato: number
  id_Protectora: number
  nombre_Gato: string
}

type Adopcion = {
  id_Adopcion: number
  id_Protectora: number
  id_Gato: number
  fecha_Adopcion: string
  origenWeb: boolean
  telefono_Adoptante: string
  observaciones?: string
}

type PuntoGrafica = {
  mesYYYYMM: string
  total: number
  id_Protectora?: number
  nombre_Protectora?: string
}

/* ======================== Estado ======================== */
const tab = ref<'listado' | 'grafica'>('listado')

const protectorAs = ref<Protectora[]>([])
const protectoraId = ref<number | 0>(0) // 0 = todas

// cache de gatos por protectora para poder resolver nombre_Gato
const gatosPorProtectora = ref<Record<number, Gato[]>>({})
const gatosCacheCargados = ref<Set<number>>(new Set())

const adopciones = ref<Adopcion[]>([])
const cargandoAdopciones = ref(false)
const errorAdopciones = ref<string | null>(null)

const serieGrafica = ref<PuntoGrafica[]>([])
const cargandoGrafica = ref(true)
const errorGrafica = ref<string | null>(null)

// diálogo CRUD
const dialog = ref(false)
const editando = ref<Adopcion | null>(null)
const form = ref<Adopcion>({
  id_Adopcion: 0,
  id_Protectora: 0,
  id_Gato: 0,
  fecha_Adopcion: new Date().toISOString().slice(0, 10),
  origenWeb: true,
  telefono_Adoptante: '',
  observaciones: ''
})

/* ======================== Headers ======================== */
const headersAdopciones = [
  { title: 'ID', key: 'id_Adopcion' },
  { title: 'Protectora', key: 'nombre_Protectora' },
  { title: 'Gato', key: 'nombre_Gato' },
  { title: 'Fecha adopción', key: 'fecha_Adopcion' },
  { title: 'Origen', key: 'origenWeb' },
  { title: 'Teléfono', key: 'telefono_Adoptante' },
  { title: 'Observaciones', key: 'observaciones' },
  { title: 'Acciones', key: 'acciones', sortable: false },
]

/* ======================== Mapas ======================== */
const protectoraPorId = computed(() => {
  const m = new Map<number, string>()
  for (const p of protectorAs.value) m.set(p.id_Protectora, p.nombre_Protectora)
  return m
})

const gatoPorId = computed(() => {
  const m = new Map<number, string>()
  for (const lista of Object.values(gatosPorProtectora.value)) {
    for (const g of lista) m.set(g.id_Gato, g.nombre_Gato)
  }
  return m
})

/* ======================== Validaciones ======================== */
const telRules = [
  (v: string) => !!v || 'El teléfono es obligatorio',
  (v: string) => /^\d+$/.test(v) || 'Solo dígitos',
  (v: string) => (v?.length ?? 0) >= 9 || 'Mínimo 9 dígitos',
  (v: string) => (v?.length ?? 0) <= 15 || 'Máximo 15 dígitos',
]

function onlyDigitsKeypress(e: KeyboardEvent) {
  const allow = ['Backspace', 'Delete', 'Tab', 'ArrowLeft', 'ArrowRight', 'Home', 'End']
  if (allow.includes(e.key)) return
  if (!/^\d$/.test(e.key)) e.preventDefault()
}

/* ======================== Cargas ======================== */
async function cargarProtectoras() {
  const res = await fetch('http://localhost:5167/api/Protectora', { headers: { Accept: 'application/json' } })
  if (!res.ok) throw new Error('Error HTTP ' + res.status)
  protectorAs.value = await res.json()
}

async function cargarGatosDeProtectora(id: number) {
  if (gatosCacheCargados.value.has(id)) return
  const res = await fetch(`http://localhost:5167/api/Gato/protectora/${id}`, { headers: { Accept: 'application/json' } })
  if (!res.ok) throw new Error('Error HTTP ' + res.status)
  const list = await res.json()
  gatosPorProtectora.value[id] = Array.isArray(list) ? list : []
  gatosCacheCargados.value.add(id)
}

// Carga adopciones y, muy importante, carga gatos de sus protectorAs para poder mostrar el nombre del gato
async function cargarAdopciones() {
  cargandoAdopciones.value = true
  errorAdopciones.value = null
  try {
    const base = 'http://localhost:5167/api/Adopcion'
    let lista: Adopcion[] = []

    if (!protectoraId.value || protectoraId.value === 0) {
      const res = await fetch(base, { headers: { Accept: 'application/json' } })
      if (!res.ok) throw new Error('Error HTTP ' + res.status)
      lista = await res.json()
    } else {
      const res = await fetch(`${base}/protectora/${protectoraId.value}`, { headers: { Accept: 'application/json' } })
      if (res.ok) {
        lista = await res.json()
      } else if (res.status === 404) {
        // Fallback por si el endpoint devolviera 404
        const resAll = await fetch(base, { headers: { Accept: 'application/json' } })
        if (!resAll.ok) throw new Error('Error HTTP ' + resAll.status)
        const all = await resAll.json()
        lista = (Array.isArray(all) ? all : []).filter(
          (x: any) => Number(x.id_Protectora) === Number(protectoraId.value)
        )
      } else {
        throw new Error('Error HTTP ' + res.status)
      }
    }

    adopciones.value = Array.isArray(lista) ? lista : []

    // cargar los gatos de todas las protectorAs presentes en las adopciones
    const idsProtectoras = [...new Set(adopciones.value.map(a => Number(a.id_Protectora)))]
    for (const id of idsProtectoras) {
      await cargarGatosDeProtectora(id)
    }
  } catch (e: any) {
    adopciones.value = []
    errorAdopciones.value = e?.message ?? 'No se pudieron cargar las adopciones'
  } finally {
    cargandoAdopciones.value = false
  }
}

async function cargarGrafica() {
  cargandoGrafica.value = true
  errorGrafica.value = null
  try {
    const res = await fetch('http://localhost:5167/api/Adopcion/grafica/por-protectora', { headers: { Accept: 'application/json' } })
    if (!res.ok) throw new Error('Error HTTP ' + res.status)
    const data = await res.json()
    let lista: PuntoGrafica[] = Array.isArray(data) ? data : []
    if (protectoraId.value && protectoraId.value !== 0) {
      lista = lista.filter(x => Number(x.id_Protectora) === Number(protectoraId.value))
    }
    serieGrafica.value = lista
  } catch (e: any) {
    errorGrafica.value = e?.message ?? 'Error cargando la gráfica'
    serieGrafica.value = []
  } finally {
    cargandoGrafica.value = false
  }
}

/* ======================== CRUD ======================== */
function openCrear() {
  editando.value = null
  form.value = {
    id_Adopcion: 0,
    id_Protectora: protectoraId.value && protectoraId.value !== 0 ? Number(protectoraId.value) : 0,
    id_Gato: 0,
    fecha_Adopcion: new Date().toISOString().slice(0, 10),
    origenWeb: true,
    telefono_Adoptante: '',
    observaciones: ''
  }
  if (form.value.id_Protectora) cargarGatosDeProtectora(form.value.id_Protectora)
  dialog.value = true
}

async function openEditar(a: Adopcion) {
  editando.value = a
  form.value = { ...a }
  if (form.value.id_Protectora) await cargarGatosDeProtectora(form.value.id_Protectora)
  dialog.value = true
}

async function guardar() {
  const creando = !editando.value
  const url = creando
    ? 'http://localhost:5167/api/Adopcion'
    : `http://localhost:5167/api/Adopcion/${form.value.id_Adopcion}`
  const method = creando ? 'POST' : 'PUT'

  const payload = { ...form.value }
  const res = await fetch(url, {
    method,
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify(payload)
  })
  if (!res.ok) throw new Error('Error HTTP ' + res.status)

  if (method === 'PUT' && res.status === 204) {
    const i = adopciones.value.findIndex(x => x.id_Adopcion === form.value.id_Adopcion)
    if (i !== -1) adopciones.value[i] = { ...form.value }
  } else {
    const saved = await res.json()
    if (creando) {
      adopciones.value.push(saved)
    } else {
      const i = adopciones.value.findIndex(x => x.id_Adopcion === saved.id_Adopcion)
      if (i !== -1) adopciones.value[i] = saved
    }
  }

  dialog.value = false
  await cargarAdopciones()
  await cargarGrafica()
}

async function borrar(a: Adopcion) {
  const res = await fetch(`http://localhost:5167/api/Adopcion/${a.id_Adopcion}`, { method: 'DELETE' })
  if (!res.ok) throw new Error('Error HTTP ' + res.status)
  adopciones.value = adopciones.value.filter(x => x.id_Adopcion !== a.id_Adopcion)
  await cargarGrafica()
}

/* ======================== Watchers/Mount ======================== */
watch(protectoraId, async (id) => {
  await cargarAdopciones()
  await cargarGrafica()
  if (id && id !== 0) await cargarGatosDeProtectora(Number(id))
})

watch(() => form.value.id_Protectora, async (id) => {
  if (id) await cargarGatosDeProtectora(Number(id))
})

onMounted(async () => {
  await cargarProtectoras()
  await cargarAdopciones()
  await cargarGrafica()
})
</script>

<template>
  <v-container fluid class="px-4">
    <!-- Encabezado + acciones -->
    <v-row class="mb-4" align="center" justify="space-between">
      <v-col cols="12" sm="auto">
        <h1 class="text-h5 font-weight-bold">Gestión de Adopciones</h1>
      </v-col>
      <v-col cols="12" sm="6" class="d-flex gap-3 align-center">
        <v-select
          v-model.number="protectoraId"
          :items="[{ title: 'Todas las protectoras', value: 0 }, ...protectorAs.map(p => ({ title: p.nombre_Protectora, value: p.id_Protectora }))]"
          label="Filtrar por protectora"
          density="comfortable"
          variant="outlined"
          hide-details
        />
        <v-btn color="primary" variant="tonal" prepend-icon="mdi-plus" @click="openCrear">Nueva adopción</v-btn>
      </v-col>
    </v-row>

    <v-card class="admin-card" elevation="2">
      <v-tabs v-model="tab" class="px-4">
        <v-tab value="listado">LISTADO</v-tab>
        <v-tab value="grafica">GRÁFICA</v-tab>
      </v-tabs>

      <v-window v-model="tab">
        <!-- LISTADO -->
        <v-window-item value="listado">
          <v-card-text>
            <div v-if="cargandoAdopciones">Cargando…</div>
            <div v-else-if="errorAdopciones">{{ errorAdopciones }}</div>

            <div v-else class="tabla-wrapper">
              <v-data-table
                :headers="headersAdopciones"
                :items="adopciones.map(a => ({
                  ...a,
                  nombre_Protectora: protectoraPorId.get(a.id_Protectora) || ('#' + a.id_Protectora),
                  // AQUÍ: nombre del gato resuelto desde el cache
                  nombre_Gato: gatoPorId.get(a.id_Gato) || 'Desconocido',
                }))"
                density="comfortable"
                item-value="id_Adopcion"
                :items-per-page="10"
                class="admin-table elevation-1"
              >
                <template #item.fecha_Adopcion="{ item }">
                  {{ new Date(item.fecha_Adopcion).toLocaleDateString() }}
                </template>

                <template #item.origenWeb="{ item }">
                  <v-chip :color="item.origenWeb ? 'blue' : 'grey'" size="small" variant="flat">
                    {{ item.origenWeb ? 'Web' : 'Manual' }}
                  </v-chip>
                </template>

                <template #item.acciones="{ item }">
                  <v-btn icon="mdi-pencil" size="small" class="mr-2" @click="openEditar(item)" />
                  <v-btn icon="mdi-delete" size="small" color="error" @click="borrar(item)" />
                </template>

                <template #no-data>
                  <div class="text-center pa-6">No hay adopciones registradas.</div>
                </template>
              </v-data-table>
            </div>
          </v-card-text>
        </v-window-item>

        <!-- GRÁFICA -->
        <v-window-item value="grafica">
          <v-card-text>
            <div v-if="cargandoGrafica">Cargando…</div>
            <div v-else-if="errorGrafica">{{ errorGrafica }}</div>
            <GraficaHistorialAdopciones v-else :items="serieGrafica" :monthsBack="12" title="Últimos 12 meses" />
          </v-card-text>
        </v-window-item>
      </v-window>
    </v-card>

    <!-- Diálogo CRUD -->
    <v-dialog v-model="dialog" max-width="760">
      <v-card>
        <v-card-title>{{ editando ? 'Editar adopción' : 'Nueva adopción' }}</v-card-title>
        <v-card-text>
          <v-form @submit.prevent="guardar">
            <v-row>
              <v-col cols="12" sm="6">
                <v-select
                  v-model.number="form.id_Protectora"
                  :items="protectorAs.map(p => ({ title: p.nombre_Protectora, value: p.id_Protectora }))"
                  label="Protectora"
                  density="comfortable"
                  variant="outlined"
                  :disabled="!!editando"
                  required
                />
              </v-col>
              <v-col cols="12" sm="6">
                <v-select
                  v-model.number="form.id_Gato"
                  :items="(gatosPorProtectora[form.id_Protectora] || []).map(g => ({ title: g.nombre_Gato, value: g.id_Gato }))"
                  label="Gato"
                  density="comfortable"
                  variant="outlined"
                  required
                />
              </v-col>
            </v-row>

            <v-row>
              <v-col cols="12" sm="4">
                <v-text-field
                  v-model="form.fecha_Adopcion"
                  type="date"
                  label="Fecha adopción"
                  variant="outlined"
                  density="comfortable"
                  required
                />
              </v-col>
              <v-col cols="12" sm="4">
                <v-text-field
                  v-model="form.telefono_Adoptante"
                  label="Teléfono adoptante"
                  variant="outlined"
                  density="comfortable"
                  :rules="telRules"
                  required
                  @keypress="onlyDigitsKeypress"
                  inputmode="numeric"
                  pattern="[0-9]*"
                />
              </v-col>
              <v-col cols="12" sm="4" class="d-flex align-center">
                <v-switch
                  v-model="form.origenWeb"
                  label="¿Desde la web?"
                  inset
                  color="primary"
                />
              </v-col>
            </v-row>

            <v-row>
              <v-col cols="12">
                <v-textarea
                  v-model="form.observaciones"
                  label="Observaciones"
                  variant="outlined"
                  density="comfortable"
                  auto-grow
                  rows="3"
                />
              </v-col>
            </v-row>

            <div class="text-right">
              <v-btn variant="text" @click="dialog = false">Cancelar</v-btn>
              <v-btn color="primary" type="submit">{{ editando ? 'Guardar cambios' : 'Crear adopción' }}</v-btn>
            </div>
          </v-form>
        </v-card-text>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<style scoped lang="scss">
.admin-card {
  border-radius: 12px;
}

.tabla-wrapper {
  width: 100%;
  overflow-x: auto;
}

.admin-table :deep(thead th) {
  font-weight: 700;
  white-space: nowrap;
}

.admin-table :deep(tbody td) {
  vertical-align: middle;
  white-space: nowrap;
}
</style>
