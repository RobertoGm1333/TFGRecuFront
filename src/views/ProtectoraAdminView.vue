<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useAutenticacion } from '@/stores/Autentificacion';
import { useSolicitudesAdopcionStore } from '@/stores/solicitudesAdopcion'
import GraficaHistorialAdopciones from '@/components/GraficaHistorialAdopciones.vue'

const authStore = useAutenticacion()
const solicitudesStore = useSolicitudesAdopcionStore()

const gatos = ref<any[]>([])
const mostrarDialogo = ref(false)
const mostrarConfirmacion = ref(false)
const gatoAEliminar = ref<any>(null)
const idProtectora = ref<number | null>(null)

// ▼▼▼ NUEVO: selector de panel al estilo "home" (gatos | eventos | adopciones | solicitudes) ▼▼▼
const panel = ref<'gatos' | 'eventos' | 'adopciones' | 'solicitudes'>('gatos')
// ▲▲▲ FIN NUEVO ▲▲▲

const solicitudes = ref<any[]>([])
type PuntoGrafica = {
  mesYYYYMM: string
  total: number
  id_Protectora?: number
  nombre_Protectora?: string
}

const serieGrafica = ref<PuntoGrafica[]>([])
const cargandoGrafica = ref(true)
const errorGrafica = ref<string | null>(null)
const nuevoEstado = ref('')
const comentarioProtectora = ref('')

const gato = ref<any>({
  id_Gato: 0,
  nombre_Gato: '',
  raza: '',
  edad: 0,
  sexo: '',
  esterilizado: false,
  descripcion_Gato: '',
  descripcion_Gato_En: '',
  imagen_Gato: '',
  id_Protectora: null,
  visible: true
})

const formularioGato = ref<any>({
  id_Gato: 0,
  nombre_Gato: '',
  raza: '',
  edad: 0,
  sexo: '',
  esterilizado: false,
  descripcion_Gato: '',
  imagen_Gato: '',
  id_Protectora: null,
  visible: true
})


const RAZAS = [
  'Pardo',
  'Gris', 
  'Tuxedo',
  'Blanco',
  'Naranja y negro',
  'Blanco y pardo',
  'Negro',
  'Carey',
  'Naranja',
  'Naranja y blanco',
  'Tricolor',
  'Siames'
]


const headers = [
  { title: 'ID', key: 'id_Gato' },
  { title: 'Nombre', key: 'nombre_Gato' },
  { title: 'Raza', key: 'raza' },
  { title: 'Edad', key: 'edad' },
  { title: 'Sexo', key: 'sexo' },
  { title: 'Esterilizado', key: 'esterilizado' },
  { title: 'Visible', key: 'visible' },
  { title: 'Acciones', key: 'acciones', sortable: false }
]

const headersSolicitudes = [
  { title: 'ID Solicitud', key: 'id_Solicitud' },
  { title: 'Usuario', key: 'nombre_Usuario' },
  { title: 'Gato', key: 'nombre_Gato' },
  { title: 'Fecha', key: 'fecha_Solicitud' },
  { title: 'Estado', key: 'estado' },
  { title: 'Acciones', key: 'acciones', sortable: false }
]

const fotoPreview = ref<string | null>(null)
const archivoImagen = ref<File | null>(null)

const mensajeSnack = ref(false)
const mensajeTexto = ref('')
const mensajeTipo = ref<'success' | 'error'>('success')

async function cargarSerieGrafica() {
  try {
    const res = await fetch('http://localhost:5167/api/Adopcion/grafica/por-protectora', { headers: { Accept: 'application/json' } })
    if (!res.ok) throw new Error('Error HTTP ' + res.status)
    const data = await res.json()
    let lista = Array.isArray(data) ? data : []
    if (idProtectora.value != null) {
      lista = lista.filter((x: any) => x.id_Protectora === idProtectora.value)
    }
    serieGrafica.value = lista
  } catch (e: any) {
    errorGrafica.value = e?.message ?? 'Error cargando datos de la gráfica'
    serieGrafica.value = []
  } finally {
    cargandoGrafica.value = false
  }
}

// Reglas de validación
const reglas = {
  estado: [(v: string) => !!v || 'El estado es obligatorio'],
  comentario: [(v: string) => !!v || 'El comentario es obligatorio']
}

onMounted(async () => {
  try {
    const response = await fetch(`http://localhost:5167/api/Protectora/usuario/${authStore.obtenerIdUsuario}`);
    if (!response.ok) throw new Error("No se pudo obtener la protectora");

    const protectora = await response.json();
    idProtectora.value = protectora.id_Protectora;

    await cargarGatos()
    await cargarSolicitudes()
    await cargarAdopciones()
    await cargarSerieGrafica()

    // === EVENTOS ===
    await cargarEventos()
  } catch (err) {
    console.error("Error cargando datos de la protectora:", err);
  }
})

async function cargarGatos() {
  if (!idProtectora.value) return

  try {
    const res = await fetch(`http://localhost:5167/api/Gato/protectora/${idProtectora.value}`);
    if (!res.ok) throw new Error("Error al obtener gatos");

    gatos.value = await res.json();
  } catch (err) {
    console.error("Error cargando gatos:", err);
  }
}

async function cargarSolicitudes() {
  if (!idProtectora.value) return

  await solicitudesStore.fetchSolicitudesProtectora(idProtectora.value)
  solicitudes.value = solicitudesStore.solicitudes

  for (const solicitud of solicitudes.value) {
    await cargarDatosGato(solicitud.id_Gato)
    await cargarDatosUsuario(solicitud.id_Usuario)
  }
}

async function cargarDatosGato(idGato: number) {
  try {
    const response = await fetch(`http://localhost:5167/api/Gato/${idGato}`)
    if (!response.ok) throw new Error("Error al obtener datos del gato")

    const gatoData = await response.json()

    const solicitud = solicitudes.value.find(s => s.id_Gato === idGato)

    if (solicitud) {
      solicitud.nombre_Gato = gatoData.nombre_Gato || 'Desconocido'
      solicitud.raza_Gato = gatoData.raza || 'Sin raza'
      solicitud.edad_Gato = gatoData.edad || 'N/A'
      solicitud.sexo_Gato = gatoData.sexo || 'N/A'
      solicitud.esterilizado_Gato = gatoData.esterilizado || false
      solicitud.descripcion_Gato = gatoData.descripcion_Gato || ''
      solicitud.imagen_Gato = gatoData.imagen_Gato || ''
    }
  } catch (error) {
    console.error('Error al cargar datos del gato:', error)
  }
}

async function cargarDatosUsuario(idUsuario: number) {
  try {
    const response = await fetch(`http://localhost:5167/api/Usuario/${idUsuario}`)
    if (!response.ok) throw new Error("Error al obtener datos del usuario")

    const usuarioData = await response.json()

    const solicitud = solicitudes.value.find(s => s.id_Usuario === idUsuario)
    if (solicitud) {
      solicitud.nombre_Usuario = usuarioData.nombre || 'Desconocido'
      solicitud.apellido_Usuario = usuarioData.apellido || ''
      solicitud.email_Usuario = usuarioData.email || 'Sin email'
      solicitud.telefono_Usuario = usuarioData.telefono || 'Sin teléfono'
      solicitud.direccion = usuarioData.direccion || 'Sin dirección'
      solicitud.ciudad = usuarioData.ciudad || 'Sin ciudad'
      solicitud.provincia = usuarioData.provincia || 'Sin provincia'
      solicitud.codigo_Postal = usuarioData.codigo_Postal || 'N/A'
      solicitud.pais = usuarioData.pais || 'Sin país'
    }
  } catch (error) {
    console.error('Error al cargar datos del usuario:', error)
  }
}

function abrirFormulario() {
  if (!idProtectora.value) return

  formularioGato.value = {
    id_Gato: 0,
    nombre_Gato: '',
    raza: '',
    edad: 0,
    sexo: '',
    esterilizado: false,
    descripcion_Gato: '',
    imagen_Gato: '',
    id_Protectora: idProtectora.value,
    visible: true
  }
  fotoPreview.value = null
  archivoImagen.value = null
  mostrarDialogo.value = true
}

function editarGato(item: any) {
  formularioGato.value = { ...item }
  fotoPreview.value = item.imagen_Gato || null
  archivoImagen.value = null
  mostrarDialogo.value = true
}

function confirmarEliminar(item: any) {
  gatoAEliminar.value = item
  mostrarConfirmacion.value = true
}

async function eliminarGato() {
  if (!gatoAEliminar.value) return
  try {
    const response = await fetch(`http://localhost:5167/api/Gato/${gatoAEliminar.value.id_Gato}`, {
      method: 'DELETE'
    })
    if (!response.ok) throw new Error('Error al eliminar el gato')

    gatos.value = gatos.value.filter(g => g.id_Gato !== gatoAEliminar.value.id_Gato)
    mensaje('Gato eliminado correctamente', 'success')
  } catch (err: any) {
    mensaje(err.message || 'No se pudo eliminar el gato', 'error')
  } finally {
    mostrarConfirmacion.value = false
  }
}

async function guardarGato() {
  try {
    let url = 'http://localhost:5167/api/Gato'
    let method = 'POST'

    if (formularioGato.value.id_Gato && formularioGato.value.id_Gato !== 0) {
      url = `http://localhost:5167/api/Gato/${formularioGato.value.id_Gato}`
      method = 'PUT'
    }

    const formData = new FormData()
    formData.append('nombre_Gato', formularioGato.value.nombre_Gato)
    formData.append('raza', formularioGato.value.raza)
    formData.append('edad', formularioGato.value.edad.toString())
    formData.append('sexo', formularioGato.value.sexo)
    formData.append('esterilizado', formularioGato.value.esterilizado ? 'true' : 'false')
    formData.append('descripcion_Gato', formularioGato.value.descripcion_Gato || '')
    if (archivoImagen.value) {
      formData.append('imagen', archivoImagen.value)
    }
    if (idProtectora.value) {
      formData.append('id_Protectora', idProtectora.value.toString())
    }
    formData.append('visible', formularioGato.value.visible ? 'true' : 'false')

    const response = await fetch(url, {
      method,
      body: formData
    })

    if (!response.ok) throw new Error('Error al guardar el gato')

    const gatoGuardado = await response.json()

    if (method === 'POST') {
      gatos.value.push(gatoGuardado)
    } else {
      const index = gatos.value.findIndex(g => g.id_Gato === gatoGuardado.id_Gato)
      if (index !== -1) gatos.value[index] = gatoGuardado
    }

    mensaje('Gato guardado correctamente', 'success')
    mostrarDialogo.value = false
  } catch (err: any) {
    mensaje(err.message || 'No se pudo guardar el gato', 'error')
  }
}

function cambioImagen(e: Event) {
  const input = e.target as HTMLInputElement
  if (!input.files || !input.files.length) return
  const file = input.files[0]
  archivoImagen.value = file

  const reader = new FileReader()
  reader.onload = () => {
    fotoPreview.value = reader.result as string
  }
  reader.readAsDataURL(file)
}

function mensaje(texto: string, tipo: 'success' | 'error') {
  mensajeTexto.value = texto
  mensajeTipo.value = tipo
  mensajeSnack.value = true
}

function claseEstado(estado: string) {
  switch (estado) {
    case 'Pendiente':
      return 'orange'
    case 'Aprobada':
      return 'green'
    case 'Rechazada':
      return 'red'
    default:
      return 'grey'
  }
}

/* =========================================================================
   NUEVO: Adopciones completadas (CRUD + Tabs con gráfica)
   ====================================================================== */
type Adopcion = {
  id_Adopcion: number
  id_Protectora: number
  id_Gato: number
  fecha_Adopcion: string
  origenWeb: boolean
  telefono_Adoptante: string
  observaciones?: string
}

const adopciones = ref<Adopcion[]>([])
const cargandoAdopciones = ref(false)
const errorAdopciones = ref<string | null>(null)

const headersAdopciones = [
  { title: 'ID', key: 'id_Adopcion' },
  { title: 'Gato', key: 'nombre_Gato' },
  { title: 'Fecha adopción', key: 'fecha_Adopcion' },
  { title: 'Origen', key: 'origenWeb' },
  { title: 'Teléfono', key: 'telefono_Adoptante' },
  { title: 'Observaciones', key: 'observaciones' },
  { title: 'Acciones', key: 'acciones', sortable: false },
]

// mapa para mostrar nombre del gato
const gatoPorId = computed<Map<number, string>>(() => {
  const m = new Map<number, string>()
  for (const g of gatos.value) m.set(g.id_Gato, g.nombre_Gato)
  return m
})

async function cargarAdopciones() {
  if (!idProtectora.value) return
  cargandoAdopciones.value = true
  errorAdopciones.value = null

  try {
    const base = 'http://localhost:5167/api/Adopcion'
    let res = await fetch(`${base}/protectora/${idProtectora.value}`, { headers: { Accept: 'application/json' } })

    if (!res.ok) {
      if (res.status === 404) {
        // Fallback: trae todas y filtra por protectora
        res = await fetch(base, { headers: { Accept: 'application/json' } })
        if (!res.ok) throw new Error('Error HTTP ' + res.status)
        const all = await res.json()
        adopciones.value = (Array.isArray(all) ? all : []).filter((x: any) => x.id_Protectora === idProtectora.value)
      } else {
        throw new Error('Error HTTP ' + res.status)
      }
    } else {
      const list = await res.json()
      adopciones.value = Array.isArray(list) ? list : []
    }
  } catch (e: any) {
    errorAdopciones.value = e?.message ?? 'No se pudieron cargar las adopciones'
    adopciones.value = []
  } finally {
    cargandoAdopciones.value = false
  }
}

const tabAdopciones = ref<'listado'|'grafica'>('listado')

// diálogo crear/editar adopción
const dialogAdopcion = ref(false)
const editandoAdopcion = ref<Adopcion | null>(null)
const formAdopcion = ref<Adopcion>({
  id_Adopcion: 0,
  id_Protectora: 0,
  id_Gato: 0,
  fecha_Adopcion: new Date().toISOString().slice(0,10),
  origenWeb: true,
  telefono_Adoptante: '',
  observaciones: ''
})

// === Validación de teléfono (9 a 15 dígitos, solo números) ===
const MAX_TEL = 15
const MIN_TEL = 9

const reglasTelefono = [
  (v: string) => !!v || 'El teléfono es obligatorio',
  (v: string) => /^\d+$/.test(v || '') || 'Solo se permiten números',
  (v: string) => (v?.length >= MIN_TEL && v?.length <= MAX_TEL) || `Debe tener entre ${MIN_TEL} y ${MAX_TEL} dígitos`,
]

function soloDigitos(e: KeyboardEvent) {
  const key = e.key
  if (!/^\d$/.test(key)) e.preventDefault()
}
function pegarSoloDigitos(e: ClipboardEvent) {
  e.preventDefault()
  const texto = (e.clipboardData?.getData('text') || '').replace(/\D/g, '').slice(0, MAX_TEL)
  formAdopcion.value.telefono_Adoptante = texto
}
function normalizarTelefono() {
  formAdopcion.value.telefono_Adoptante = (formAdopcion.value.telefono_Adoptante || '').replace(/\D/g, '').slice(0, MAX_TEL)
}
const telefonoOk = computed(() =>
  /^\d+$/.test(formAdopcion.value.telefono_Adoptante || '') &&
  formAdopcion.value.telefono_Adoptante.length >= MIN_TEL &&
  formAdopcion.value.telefono_Adoptante.length <= MAX_TEL
)
const formAdopcionValido = computed(() => {
  return telefonoOk.value && formAdopcion.value.id_Gato > 0 && !!formAdopcion.value.fecha_Adopcion
})
// === /Validación de teléfono ===

function abrirNuevaAdopcion() {
  if (!idProtectora.value) return
  editandoAdopcion.value = null
  formAdopcion.value = {
    id_Adopcion: 0,
    id_Protectora: idProtectora.value!,
    id_Gato: 0,
    fecha_Adopcion: new Date().toISOString().slice(0,10),
    origenWeb: true,
    telefono_Adoptante: '',
    observaciones: ''
  }
  dialogAdopcion.value = true
}

function abrirEditarAdopcion(a: Adopcion) {
  editandoAdopcion.value = a
  formAdopcion.value = { ...a, id_Protectora: idProtectora.value! }
  dialogAdopcion.value = true
}

async function guardarAdopcion() {
  try {
    const creando = !editandoAdopcion.value
    const url = creando
      ? 'http://localhost:5167/api/Adopcion'
      : `http://localhost:5167/api/Adopcion/${formAdopcion.value.id_Adopcion}`
    const method = creando ? 'POST' : 'PUT'

    const payload = { ...formAdopcion.value, id_Protectora: idProtectora.value! }

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(payload)
    })
    if (!res.ok) throw new Error('Error HTTP ' + res.status)

    if (method === 'PUT' && res.status === 204) {
      const i = adopciones.value.findIndex(x => x.id_Adopcion === formAdopcion.value.id_Adopcion)
      if (i !== -1) adopciones.value[i] = { ...formAdopcion.value }
    } else {
      const saved = await res.json()
      if (creando) {
        adopciones.value.push(saved)
      } else {
        const i = adopciones.value.findIndex(x => x.id_Adopcion === saved.id_Adopcion)
        if (i !== -1) adopciones.value[i] = saved
      }
    }

    dialogAdopcion.value = false
    mensaje('Adopción guardada', 'success')

    await cargarAdopciones()
    cargandoGrafica.value = true
    await cargarSerieGrafica()
  } catch (e: any) {
    mensaje(e?.message ?? 'No se pudo guardar la adopción', 'error')
  }
}

async function borrarAdopcion(a: Adopcion) {
  try {
    const res = await fetch(`http://localhost:5167/api/Adopcion/${a.id_Adopcion}`, { method: 'DELETE' })
    if (!res.ok) throw new Error('Error HTTP ' + res.status)
    adopciones.value = adopciones.value.filter(x => x.id_Adopcion !== a.id_Adopcion)
    mensaje('Adopción eliminada', 'success')

    cargandoGrafica.value = true
    await cargarSerieGrafica()
  } catch (e: any) {
    mensaje(e?.message ?? 'No se pudo eliminar la adopción', 'error')
  }
}
/* ===================================================================== */

/* =====================================================================
   === EVENTOS: listado + formulario con subida de imagen ==============
   ===================================================================== */
const eventos = ref<any[]>([])
const headersEventos = [
  { title: 'ID', key: 'Id_Evento' },
  { title: 'Nombre', key: 'Nombre_Evento' },
  { title: 'Lugar', key: 'Lugar' },
  { title: 'Fecha', key: 'Fecha_Evento' },
  { title: 'Foto', key: 'Foto_Evento' },
  { title: 'Acciones', key: 'acciones', sortable: false }
]

const mostrarDialogoEvento = ref(false)
const mostrarConfirmacionEvento = ref(false)
const eventoAEliminar = ref<any>(null)

const formularioEvento = ref<any>({
  Id_Evento: 0,
  Id_Protectora: null,
  Nombre_Evento: '',
  Lugar: '',
  Fecha_Evento: new Date().toISOString().slice(0,10),
  Hora_Evento: '12:00',
  Descripcion_Evento: '',
  EnclaceMaps: '',
  Foto_Evento: null
})

const fotoPreviewEvento = ref<string | null>(null)
const archivoFotoEvento = ref<File | null>(null)

// Normaliza las propiedades que llegan del API (snake/camel/casing) a las que usa la UI.
function normalizaEvento(e: any) {
  return {
    Id_Evento: e.Id_Evento ?? e.id_Evento ?? e.ID_Evento,
    Id_Protectora: e.Id_Protectora ?? e.id_Protectora,
    Nombre_Evento: e.Nombre_Evento ?? e.nombre_Evento,
    Lugar: e.Lugar ?? e.lugar ?? '',
    Fecha_Evento: e.Fecha_Evento ?? e.fecha_Evento ?? '',
    Hora_Evento: e.Hora_Evento ?? e.hora_Evento ?? '',
    Descripcion_Evento: e.Descripcion_Evento ?? e.descripcion_Evento ?? '',
    EnclaceMaps: e.EnclaceMaps ?? e.enclaceMaps ?? e.enlaceMaps ?? '',
    Foto_Evento: e.Foto_Evento ?? e.foto_Evento ?? e.foto ?? null,
  }
}

async function cargarEventos() {
  if (!idProtectora.value) return
  try {
    const res = await fetch(`http://localhost:5167/api/Evento/protectora/${idProtectora.value}`)
    if (!res.ok) throw new Error('Error HTTP ' + res.status)
    const list = await res.json()
    eventos.value = (Array.isArray(list) ? list : []).map(normalizaEvento)
  } catch (e) {
    console.error('Error cargando eventos:', e)
    eventos.value = []
  }
}

function abrirFormularioEvento() {
  if (!idProtectora.value) return
  formularioEvento.value = {
    Id_Evento: 0,
    Id_Protectora: idProtectora.value,
    Nombre_Evento: '',
    Lugar: '',
    Fecha_Evento: new Date().toISOString().slice(0,10),
    Hora_Evento: '12:00',
    Descripcion_Evento: '',
    EnclaceMaps: '',
    Foto_Evento: null
  }
  archivoFotoEvento.value = null
  fotoPreviewEvento.value = null
  mostrarDialogoEvento.value = true
}

function editarEvento(item: any) {
  formularioEvento.value = {
    Id_Evento: item.Id_Evento,
    Id_Protectora: item.Id_Protectora,
    Nombre_Evento: item.Nombre_Evento,
    Lugar: item.Lugar,
    Fecha_Evento: (item.Fecha_Evento || '').slice(0,10),
    Hora_Evento: (item.Hora_Evento || '12:00').toString().slice(0,5),
    Descripcion_Evento: item.Descripcion_Evento || '',
    EnclaceMaps: item.EnclaceMaps || '',
    Foto_Evento: item.Foto_Evento || null
  }
  archivoFotoEvento.value = null
  fotoPreviewEvento.value = item.Foto_Evento ? `http://localhost:5167/${String(item.Foto_Evento).replace(/^\/+/, '')}` : null
  mostrarDialogoEvento.value = true
}

function confirmarEliminarEvento(item: any) {
  eventoAEliminar.value = item
  mostrarConfirmacionEvento.value = true
}

async function eliminarEvento() {
  if (!eventoAEliminar.value) return
  try {
    const res = await fetch(`http://localhost:5167/api/Evento/${eventoAEliminar.value.Id_Evento}`, { method: 'DELETE' })
    if (!res.ok) throw new Error('Error HTTP ' + res.status)
    eventos.value = eventos.value.filter(e => e.Id_Evento !== eventoAEliminar.value.Id_Evento)
    mensaje('Evento eliminado', 'success')
  } catch (e: any) {
    mensaje(e?.message ?? 'No se pudo eliminar el evento', 'error')
  } finally {
    mostrarConfirmacionEvento.value = false
  }
}

function cambioFotoEvento(e: Event) {
  const input = e.target as HTMLInputElement
  if (!input.files || !input.files.length) return
  const file = input.files[0]
  archivoFotoEvento.value = file

  const reader = new FileReader()
  reader.onload = () => { fotoPreviewEvento.value = reader.result as string }
  reader.readAsDataURL(file)
}

async function guardarEvento() {
  try {
    const creando = !(formularioEvento.value.Id_Evento && formularioEvento.value.Id_Evento !== 0)
    let url = 'http://localhost:5167/api/Evento'
    let method = 'POST'
    if (!creando) {
      url = `http://localhost:5167/api/Evento/${formularioEvento.value.Id_Evento}`
      method = 'PUT'
    }

    const fd = new FormData()
    fd.append('Id_Protectora', String(formularioEvento.value.Id_Protectora))
    fd.append('Nombre_Evento', formularioEvento.value.Nombre_Evento || '')
    fd.append('Lugar', formularioEvento.value.Lugar || '')
    fd.append('Fecha_Evento', formularioEvento.value.Fecha_Evento || '')
    // Hora_Evento: el controller espera TimeSpan → formato HH:mm
    fd.append('Hora_Evento', (formularioEvento.value.Hora_Evento || '12:00').toString().slice(0,5))
    fd.append('Descripcion_Evento', formularioEvento.value.Descripcion_Evento || '')
    if (formularioEvento.value.EnclaceMaps) fd.append('EnclaceMaps', formularioEvento.value.EnclaceMaps)
    if (archivoFotoEvento.value) fd.append('Foto', archivoFotoEvento.value)

    const res = await fetch(url, { method, body: fd })
    if (!res.ok) throw new Error('Error HTTP ' + res.status)

    if (creando) {
      const saved = await res.json()
      eventos.value.push(normalizaEvento(saved))   // 👈 guardamos normalizado
    } else {
      // PUT puede devolver 204 (NoContent). Si no hay body, recargamos.
      try {
        const updated = await res.json()
        const norm = normalizaEvento(updated)
        const i = eventos.value.findIndex(e => e.Id_Evento === norm.Id_Evento)
        if (i !== -1) eventos.value[i] = norm
        else await cargarEventos()
      } catch {
        await cargarEventos()
      }
    }

    mensaje('Evento guardado', 'success')
    mostrarDialogoEvento.value = false
  } catch (e: any) {
    mensaje(e?.message ?? 'No se pudo guardar el evento', 'error')
  }
}
/* ===================================================================== */
</script>

<template>
  <v-container fluid class="protectora-admin pa-0">

    <!-- ▼▼▼ NUEVO: Menú de botones estilo "Panel general" (responsive) ▼▼▼ -->
    <div class="panel-selector py-8 px-4">
      <h2 class="panel-selector__title text-center mb-2">Panel de Administración</h2>
      <p class="panel-selector__subtitle text-center mb-6">Elige qué quieres gestionar</p>

      <v-row class="panel-selector__grid" justify="center" align="stretch" dense>
        <v-col cols="12" sm="6" md="3" class="mb-3">
          <v-btn
            block
            size="large"
            class="menu-btn"
            :class="panel==='gatos' ? 'menu-btn--active' : ''"
            prepend-icon="mdi-cat"
            @click="panel='gatos'"
          >Gestión de Gatos</v-btn>
        </v-col>

        <v-col cols="12" sm="6" md="3" class="mb-3">
          <v-btn
            block
            size="large"
            class="menu-btn"
            :class="panel==='eventos' ? 'menu-btn--active' : ''"
            prepend-icon="mdi-calendar-star"
            @click="panel='eventos'"
          >Gestión de Eventos</v-btn>
        </v-col>

        <v-col cols="12" sm="6" md="3" class="mb-3">
          <v-btn
            block
            size="large"
            class="menu-btn"
            :class="panel==='adopciones' ? 'menu-btn--active' : ''"
            prepend-icon="mdi-heart"
            @click="panel='adopciones'"
          >Gestión de Adopciones</v-btn>
        </v-col>

        <v-col cols="12" sm="6" md="3" class="mb-3">
          <v-btn
            block
            size="large"
            class="menu-btn"
            :class="panel==='solicitudes' ? 'menu-btn--active' : ''"
            prepend-icon="mdi-account-multiple"
            @click="panel='solicitudes'"
          >Solicitudes</v-btn>
        </v-col>
      </v-row>
    </div>
    <!-- ▲▲▲ FIN NUEVO ▲▲▲ -->

    <!-- ======= GATOS ======= -->
    <div v-if="panel==='gatos'">
      <v-row justify="space-between" align="center" class="mb-4 mx-0">
        <v-col cols="12" sm="auto" class="text-center text-sm-start px-4">
          <h1 class="protectora-admin__titulo">Gestión de Gatos - Protectora</h1>
        </v-col>
        <v-col cols="12" sm="auto" class="text-center text-sm-start mt-4 mt-sm-0 px-4">
          <v-btn color="primary" @click="abrirFormulario" class="protectora-admin__boton">Nuevo gato</v-btn>
        </v-col>
      </v-row>

      <div class="protectora-admin__tabla-container px-4">
        <!-- ▼▼▼ WRAP para scroll horizontal en móvil ▼▼▼ -->
        <div class="table-wrap">
          <v-data-table
            :headers="headers"
            :items="gatos"
            class="elevation-1 protectora-admin__tabla"
            density="compact"
            mobile-breakpoint="sm"
            item-value="id_Gato"
            :items-per-page="10"
          >
            <template #item.esterilizado="{ item }">
              <v-chip :color="item.esterilizado ? 'green' : 'red'" variant="flat" size="small">
                {{ item.esterilizado ? 'Sí' : 'No' }}
              </v-chip>
            </template>

            <template #item.visible="{ item }">
              <v-chip :color="item.visible ? 'blue' : 'grey'" variant="flat" size="small">
                {{ item.visible ? 'Sí' : 'No' }}
              </v-chip>
            </template>

            <template #item.acciones="{ item }">
              <v-btn icon="mdi-pencil" size="small" class="mr-2" @click="editarGato(item)"></v-btn>
              <v-btn icon="mdi-delete" size="small" color="error" @click="confirmarEliminar(item)"></v-btn>
            </template>

            <template #no-data>
              <div class="text-center pa-6">No hay gatos registrados para esta protectora.</div>
            </template>
          </v-data-table>
        </div>
        <!-- ▲▲▲ WRAP ▲▲▲ -->
      </div>
    </div>
    <!-- ======= /GATOS ======= -->

    <!-- === EVENTOS: Listado y botón crear === -->
    <v-container v-if="panel==='eventos'" fluid class="protectora-admin__solicitudes px-4 mt-8">
      <div class="d-flex align-center justify-space-between">
        <h2 class="protectora-admin__subtitulo">Eventos de protectora</h2>
        <v-btn color="primary" variant="tonal" prepend-icon="mdi-plus" @click="abrirFormularioEvento">Nuevo evento</v-btn>
      </div>

      <!-- ▼▼▼ WRAP para scroll horizontal en móvil ▼▼▼ -->
      <div class="table-wrap">
        <v-data-table
          :headers="headersEventos"
          :items="eventos"
          class="elevation-1 protectora-admin__tabla mt-3"
          density="compact"
          mobile-breakpoint="sm"
          item-value="Id_Evento"
          :items-per-page="10"
        >
          <!-- ✅ usar item directo -->
          <template #item.Fecha_Evento="{ item }">
            {{ item?.Fecha_Evento ? new Date(item.Fecha_Evento).toLocaleDateString() : '—' }}
          </template>

          <template #item.Foto_Evento="{ item }">
            <v-avatar size="44" v-if="item?.Foto_Evento">
              <v-img :src="`http://localhost:5167/${String(item.Foto_Evento).replace(/^\/+/, '')}`" alt="foto evento" />
            </v-avatar>
            <span v-else class="text-disabled">—</span>
          </template>

          <template #item.acciones="{ item }">
            <v-btn icon="mdi-pencil" size="small" class="mr-2" @click="editarEvento(item)"></v-btn>
            <v-btn icon="mdi-delete" size="small" color="error" @click="confirmarEliminarEvento(item)"></v-btn>
          </template>

          <template #no-data>
            <div class="text-center pa-6">No hay eventos registrados.</div>
          </template>
        </v-data-table>
      </div>
      <!-- ▲▲▲ WRAP ▲▲▲ -->
    </v-container>
    <!-- === /EVENTOS === -->

    <!-- ======= SOLICITUDES ======= -->
    <v-container v-if="panel==='solicitudes'" fluid class="protectora-admin__solicitudes px-4">
      <h2 class="protectora-admin__subtitulo">Solicitudes de adopción</h2>
      <!-- ▼▼▼ WRAP para scroll horizontal en móvil ▼▼▼ -->
      <div class="table-wrap">
        <v-data-table
          :headers="headersSolicitudes"
          :items="solicitudes"
          class="elevation-1 protectora-admin__tabla"
          density="compact"
          mobile-breakpoint="sm"
          item-value="id_Solicitud"
          :items-per-page="10"
        >
          <template #item.fecha_Solicitud="{ item }">
            {{ new Date(item.fecha_Solicitud).toLocaleDateString() }}
          </template>

          <template #item.estado="{ item }">
            <v-chip :color="claseEstado(item.estado)" variant="flat" size="small">
              {{ item.estado }}
            </v-chip>
          </template>

          <template #item.acciones="{ item }">
            <v-menu>
              <template #activator="{ props }">
                <v-btn v-bind="props" icon="mdi-dots-vertical" size="small"></v-btn>
              </template>
              <v-list>
                <v-list-item @click="solicitudesStore.verSolicitud(item)">
                  <v-list-item-title>Ver</v-list-item-title>
                </v-list-item>
                <v-list-item @click="solicitudesStore.abrirActualizar(item)">
                  <v-list-item-title>Actualizar estado</v-list-item-title>
                </v-list-item>
              </v-list>
            </v-menu>
          </template>

          <template #no-data>
            <div class="text-center pa-6">No hay solicitudes registradas para esta protectora.</div>
          </template>
        </v-data-table>
      </div>
      <!-- ▲▲▲ WRAP ▲▲▲ -->
    </v-container>
    <!-- ======= /SOLICITUDES ======= -->

    <!-- ======= ADOPCIONES COMPLETADAS ======= -->
    <v-card v-if="panel==='adopciones'" class="adopciones-card mx-2 mx-sm-4 mb-6" elevation="2">
      <v-card-title class="d-flex align-center justify-space-between flex-column flex-sm-row ga-2">
        <div>Adopciones completadas</div>
        <div>
          <v-btn color="primary" variant="tonal" prepend-icon="mdi-plus" @click="abrirNuevaAdopcion()">Nueva adopción</v-btn>
        </div>
      </v-card-title>

      <v-card-subtitle class="px-4 pt-0">Gestiona las adopciones completadas y visualiza su evolución.</v-card-subtitle>

      <v-tabs v-model="tabAdopciones" class="px-4 adopciones-tabs">
        <v-tab value="listado">LISTADO</v-tab>
        <v-tab value="grafica">GRÁFICA</v-tab>
      </v-tabs>

      <v-window v-model="tabAdopciones">
        <v-window-item value="listado">
          <v-card-text>
            <div v-if="cargandoAdopciones">Cargando…</div>
            <div v-else-if="errorAdopciones">{{ errorAdopciones }}</div>
            <!-- ▼▼▼ WRAP para scroll horizontal en móvil ▼▼▼ -->
            <div class="table-wrap" v-else>
              <v-data-table
                :headers="headersAdopciones"
                :items="adopciones.map(a => ({ ...a, nombre_Gato: gatoPorId.get(a.id_Gato) || ('#' + a.id_Gato) }))"
                class="elevation-1 adopciones-table"
                density="compact"
                mobile-breakpoint="sm"
                item-value="id_Adopcion"
                :items-per-page="10"
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
                  <v-btn icon="mdi-pencil" size="small" class="mr-2" @click="abrirEditarAdopcion(item)"></v-btn>
                  <v-btn icon="mdi-delete" size="small" color="error" @click="borrarAdopcion(item)"></v-btn>
                </template>

                <template #no-data>
                  <div class="text-center pa-6">No hay adopciones registradas.</div>
                </template>
              </v-data-table>
            </div>
            <!-- ▲▲▲ WRAP ▲▲▲ -->
          </v-card-text>
        </v-window-item>

        <v-window-item value="grafica">
          <v-card-text>
            <div v-if="cargandoGrafica">Cargando…</div>
            <div v-else-if="errorGrafica">{{ errorGrafica }}</div>
            <GraficaHistorialAdopciones v-else :items="serieGrafica" :monthsBack="12" title="Últimos 12 meses" />
          </v-card-text>
        </v-window-item>
      </v-window>
    </v-card>
    <!-- ======= /ADOPCIONES COMPLETADAS ======= -->

    <v-dialog v-model="mostrarDialogo" max-width="700">
      <v-card class="protectora-admin__dialogo">
        <v-card-title>Gato</v-card-title>
        <v-card-text>
          <v-row>
            <v-col cols="12" sm="6">
              <v-text-field v-model="formularioGato.nombre_Gato" label="Nombre" variant="outlined" density="comfortable"></v-text-field>
            </v-col>
            <v-col cols="12" sm="6">
              <!-- Sustituido input de texto por selector de razas -->
              <v-select
                v-model="formularioGato.raza"
                :items="RAZAS"
                label="Raza"
                variant="outlined"
                density="comfortable"
                :menu-props="{ maxHeight: 300 }"
              ></v-select>
            </v-col>
          </v-row>

          <v-row>
            <v-col cols="12" sm="4">
              <v-text-field v-model="formularioGato.edad" label="Edad" type="number" variant="outlined" density="comfortable"></v-text-field>
            </v-col>
            <v-col cols="12" sm="4">
              <v-select
                v-model="formularioGato.sexo"
                :items="['Macho', 'Hembra']"
                label="Sexo"
                variant="outlined"
                density="comfortable"
              ></v-select>
            </v-col>
            <v-col cols="12" sm="4">
              <v-switch
                v-model="formularioGato.esterilizado"
                label="Esterilizado"
                inset
                color="primary"
              ></v-switch>
            </v-col>
          </v-row>

          <v-row>
            <v-col cols="12">
              <v-textarea
                v-model="formularioGato.descripcion_Gato"
                label="Descripción"
                variant="outlined"
                density="comfortable"
                auto-grow
                rows="3"
              ></v-textarea>
            </v-col>
          </v-row>

          <v-row>
            <v-col cols="12" sm="6">
              <v-file-input
                label="Imagen del gato"
                accept="image/*"
                variant="outlined"
                density="comfortable"
                @change="cambioImagen"
              ></v-file-input>
            </v-col>
            <v-col cols="12" sm="6" class="d-flex justify-center align-center">
              <v-avatar size="120" v-if="fotoPreview">
                <v-img :src="fotoPreview" alt="Preview"></v-img>
              </v-avatar>
              <div v-else class="text-caption">Sin imagen</div>
            </v-col>
          </v-row>

          <v-row>
            <v-col cols="12" sm="6">
              <v-switch
                v-model="formularioGato.visible"
                label="Visible"
                inset
                color="primary"
              ></v-switch>
            </v-col>
          </v-row>
        </v-card-text>
        <v-card-actions class="justify-end">
          <v-btn variant="text" @click="mostrarDialogo = false">Cancelar</v-btn>
          <v-btn color="primary" @click="guardarGato">Guardar</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="mostrarConfirmacion" max-width="500">
      <v-card>
        <v-card-title>Confirmar eliminación</v-card-title>
        <v-card-text>¿Seguro que deseas eliminar este gato?</v-card-text>
        <v-card-actions class="justify-end">
          <v-btn variant="text" @click="mostrarConfirmacion = false">Cancelar</v-btn>
          <v-btn color="error" @click="eliminarGato">Eliminar</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- === EVENTOS: Diálogo crear/editar === -->
    <v-dialog v-model="mostrarDialogoEvento" max-width="720">
      <v-card class="protectora-admin__dialogo">
        <v-card-title>Evento</v-card-title>
        <v-card-text>
          <v-row>
            <v-col cols="12" sm="7">
              <v-text-field v-model="formularioEvento.Nombre_Evento" label="Nombre del evento" variant="outlined" density="comfortable" />
            </v-col>
            <v-col cols="12" sm="5">
              <v-text-field v-model="formularioEvento.Lugar" label="Lugar" variant="outlined" density="comfortable" />
            </v-col>
          </v-row>

          <v-row>
            <v-col cols="12" sm="6">
              <v-text-field v-model="formularioEvento.Fecha_Evento" type="date" label="Fecha" variant="outlined" density="comfortable" />
            </v-col>
            <v-col cols="12" sm="6">
              <v-text-field v-model="formularioEvento.Hora_Evento" type="time" label="Hora" variant="outlined" density="comfortable" />
            </v-col>
          </v-row>

          <v-row>
            <v-col cols="12">
              <v-textarea v-model="formularioEvento.Descripcion_Evento" label="Descripción / Objetivo" variant="outlined" density="comfortable" auto-grow rows="3" />
            </v-col>
          </v-row>

          <v-row>
            <v-col cols="12" sm="6">
              <v-text-field v-model="formularioEvento.EnclaceMaps" label="Enlace de Google Maps (opcional)" variant="outlined" density="comfortable" />
            </v-col>
            <v-col cols="12" sm="6">
              <v-file-input label="Foto del evento" accept="image/*" variant="outlined" density="comfortable" @change="cambioFotoEvento" />
            </v-col>
          </v-row>

          <v-row>
            <v-col cols="12" class="d-flex justify-center">
              <v-avatar size="140" v-if="fotoPreviewEvento">
                <v-img :src="fotoPreviewEvento" alt="Preview evento" />
              </v-avatar>
              <div v-else class="text-caption">Sin foto</div>
            </v-col>
          </v-row>
        </v-card-text>
        <v-card-actions class="justify-end">
          <v-btn variant="text" @click="mostrarDialogoEvento = false">Cancelar</v-btn>
          <v-btn color="primary" @click="guardarEvento">Guardar</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Confirmar borrado evento -->
    <v-dialog v-model="mostrarConfirmacionEvento" max-width="500">
      <v-card>
        <v-card-title>Confirmar eliminación</v-card-title>
        <v-card-text>¿Seguro que deseas eliminar este evento?</v-card-text>
        <v-card-actions class="justify-end">
          <v-btn variant="text" @click="mostrarConfirmacionEvento = false">Cancelar</v-btn>
          <v-btn color="error" @click="eliminarEvento">Eliminar</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-snackbar v-model="mensajeSnack" :timeout="3000" :color="mensajeTipo">
      {{ mensajeTexto }}
    </v-snackbar>

    <v-dialog v-model="solicitudesStore.dialogoVer" max-width="900">
      <v-card class="solicitud-detalle">
        <v-card-title class="solicitud-detalle__titulo">Solicitud de adopción</v-card-title>
        <v-card-text class="solicitud-detalle__contenido">
          <v-row>
            <v-col cols="12" md="6">
              <h3>Datos del solicitante</h3>
              <v-row>
                <v-col cols="12" sm="6">
                  <v-text-field :model-value="solicitudesStore.solicitudSeleccionada?.nombre_Usuario" label="Nombre" readonly variant="outlined" density="comfortable"></v-text-field>
                </v-col>
                <v-col cols="12" sm="6">
                  <v-text-field :model-value="solicitudesStore.solicitudSeleccionada?.apellido_Usuario" label="Apellido" readonly variant="outlined" density="comfortable"></v-text-field>
                </v-col>
              </v-row>
              <v-row>
                <v-col cols="12" sm="6">
                  <v-text-field :model-value="solicitudesStore.solicitudSeleccionada?.email_Usuario" label="Email" readonly variant="outlined" density="comfortable"></v-text-field>
                </v-col>
                <v-col cols="12" sm="6">
                  <v-text-field :model-value="solicitudesStore.solicitudSeleccionada?.telefono_Usuario" label="Teléfono" readonly variant="outlined" density="comfortable"></v-text-field>
                </v-col>
              </v-row>

              <h3 class="mt-6">Dirección</h3>
              <v-row>
                <v-col cols="12" sm="8">
                  <v-text-field :model-value="solicitudesStore.solicitudSeleccionada?.direccion" label="Dirección" readonly variant="outlined" density="comfortable"></v-text-field>
                </v-col>
                <v-col cols="12" sm="4">
                  <v-text-field :model-value="solicitudesStore.solicitudSeleccionada?.ciudad" label="Ciudad" readonly variant="outlined" density="comfortable"></v-text-field>
                </v-col>
              </v-row>
              <v-row>
                <v-col cols="12" sm="4">
                  <v-text-field :model-value="solicitudesStore.solicitudSeleccionada?.provincia" label="Provincia" readonly variant="outlined" density="comfortable"></v-text-field>
                </v-col>
                <v-col cols="12" sm="4">
                  <v-text-field :model-value="solicitudesStore.solicitudSeleccionada?.codigo_Postal" label="Código Postal" readonly variant="outlined" density="comfortable"></v-text-field>
                </v-col>
                <v-col cols="12" sm="4">
                  <v-text-field :model-value="solicitudesStore.solicitudSeleccionada?.pais" label="País" readonly variant="outlined" density="comfortable"></v-text-field>
                </v-col>
              </v-row>
            </v-col>

            <v-col cols="12" md="6">
              <h3>Datos del gato</h3>
              <v-row>
                <v-col cols="12" sm="6">
                  <v-text-field :model-value="solicitudesStore.solicitudSeleccionada?.nombre_Gato" label="Nombre" readonly variant="outlined" density="comfortable"></v-text-field>
                </v-col>
                <v-col cols="12" sm="6">
                  <v-text-field :model-value="solicitudesStore.solicitudSeleccionada?.raza_Gato" label="Raza" readonly variant="outlined" density="comfortable"></v-text-field>
                </v-col>
              </v-row>
              <v-row>
                <v-col cols="12" sm="4">
                  <v-text-field :model-value="solicitudesStore.solicitudSeleccionada?.edad_Gato" label="Edad" readonly variant="outlined" density="comfortable"></v-text-field>
                </v-col>
                <v-col cols="12" sm="4">
                  <v-text-field :model-value="solicitudesStore.solicitudSeleccionada?.sexo_Gato" label="Sexo" readonly variant="outlined" density="comfortable"></v-text-field>
                </v-col>
                <v-col cols="12" sm="4">
                  <v-text-field :model-value="solicitudesStore.solicitudSeleccionada?.esterilizado_Gato ? 'Sí' : 'No'" label="Esterilizado" readonly variant="outlined" density="comfortable"></v-text-field>
                </v-col>
              </v-row>
              <v-row>
                <v-col cols="12">
                  <v-textarea :model-value="solicitudesStore.solicitudSeleccionada?.descripcion_Gato" label="Descripción" readonly variant="outlined" density="comfortable" auto-grow rows="3"></v-textarea>
                </v-col>
              </v-row>
              <v-row>
                <v-col cols="12" class="d-flex justify-center">
                  <v-avatar size="120">
                    <v-img :src="solicitudesStore.solicitudSeleccionada?.imagen_Gato" alt="Gato"></v-img>
                  </v-avatar>
                </v-col>
              </v-row>
            </v-col>
          </v-row>

          <h3 class="mb-4 mt-6">Compromiso y Responsabilidad</h3>
          <v-row>
            <v-col cols="12">
              <v-textarea :model-value="solicitudesStore.solicitudSeleccionada?.motivacionAdopcion" label="Motivación para adoptar" readonly variant="outlined" density="comfortable" auto-grow rows="3"></v-textarea>
            </v-col>
          </v-row>
          <v-row>
            <v-col cols="12" sm="6">
              <v-text-field :model-value="solicitudesStore.solicitudSeleccionada?.tiempoDisponible" label="Tiempo disponible al día" readonly variant="outlined" density="comfortable"></v-text-field>
            </v-col>
            <v-col cols="12" sm="6">
              <v-text-field :model-value="solicitudesStore.solicitudSeleccionada?.gastosEstimados" label="Gastos estimados mensuales (€)" readonly variant="outlined" density="comfortable"></v-text-field>
            </v-col>
          </v-row>

          <h3 class="mb-4 mt-6">Otros Animales en el Hogar</h3>
          <v-row>
            <v-col cols="12" sm="6">
              <v-text-field :model-value="solicitudesStore.solicitudSeleccionada?.otrosAnimales" label="¿Hay otros animales?" readonly variant="outlined" density="comfortable"></v-text-field>
            </v-col>
            <v-col cols="12" sm="6">
              <v-text-field :model-value="solicitudesStore.solicitudSeleccionada?.tipoOtrosAnimales" label="Tipo de animales" readonly variant="outlined" density="comfortable"></v-text-field>
            </v-col>
          </v-row>

          <h3 class="mb-4 mt-6">Vivienda y Seguridad</h3>
          <v-row>
            <v-col cols="12" sm="6">
              <v-text-field :model-value="solicitudesStore.solicitudSeleccionada?.tipoVivienda" label="Tipo de vivienda" readonly variant="outlined" density="comfortable"></v-text-field>
            </v-col>
            <v-col cols="12" sm="6">
              <v-text-field :model-value="solicitudesStore.solicitudSeleccionada?.jardinPatio" label="¿Hay jardín o patio?" readonly variant="outlined" density="comfortable"></v-text-field>
            </v-col>
          </v-row>
          <v-row>
            <v-col cols="12" sm="6">
              <v-checkbox :model-value="solicitudesStore.solicitudSeleccionada?.ventanasSeguras" label="¿Tiene ventanas seguras?" readonly disabled></v-checkbox>
            </v-col>
            <v-col cols="12" sm="6">
              <v-checkbox :model-value="solicitudesStore.solicitudSeleccionada?.vallasSeguras" label="¿Tiene vallas seguras?" readonly disabled></v-checkbox>
            </v-col>
          </v-row>
        </v-card-text>
        <v-card-actions class="justify-end">
          <v-btn variant="text" @click="solicitudesStore.cerrarVer()">Cerrar</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="solicitudesStore.dialogoActualizar" max-width="600">
      <v-card>
        <v-card-title>Actualizar estado</v-card-title>
        <v-card-text>
          <v-form @submit.prevent="solicitudesStore.actualizarEstado({ estado: nuevoEstado, comentario: comentarioProtectora })">
            <v-select v-model="nuevoEstado" :items="['Pendiente', 'Aprobada', 'Rechazada', 'Completada']" label="Estado" :rules="reglas.estado" variant="outlined" density="comfortable"></v-select>
            <v-textarea v-model="comentarioProtectora" label="Comentario" :rules="reglas.comentario" variant="outlined" density="comfortable"></v-textarea>
            <div class="text-right">
              <v-btn color="primary" type="submit">Guardar</v-btn>
            </div>
          </v-form>
        </v-card-text>
        <v-card-actions class="justify-end">
          <v-btn variant="text" @click="solicitudesStore.cerrarActualizar()">Cancelar</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="dialogAdopcion" max-width="720">
      <v-card>
        <v-card-title>{{ editandoAdopcion ? 'Editar adopción' : 'Nueva adopción' }}</v-card-title>
        <v-card-text>
          <v-form @submit.prevent="guardarAdopcion()">
            <v-row>
              <v-col cols="12" sm="4">
                <v-text-field
                  v-model="formAdopcion.fecha_Adopcion"
                  type="date"
                  label="Fecha adopción"
                  variant="outlined"
                  density="comfortable"
                />
              </v-col>
              <v-col cols="12" sm="4">
                <v-select
                  v-model="formAdopcion.id_Gato"
                  :items="gatos.map(g => ({ title: g.nombre_Gato, value: g.id_Gato }))"
                  label="Gato"
                  variant="outlined"
                  density="comfortable"
                />
              </v-col>
              <v-col cols="12" sm="4">
                <v-text-field
                  v-model="formAdopcion.telefono_Adoptante"
                  label="Teléfono adoptante"
                  type="tel"
                  inputmode="numeric"
                  :rules="reglasTelefono"
                  :maxlength="MAX_TEL"
                  :counter="MAX_TEL"
                  variant="outlined"
                  density="comfortable"
                  @keypress="soloDigitos"
                  @paste="pegarSoloDigitos"
                  @input="normalizarTelefono"
                />
              </v-col>
            </v-row>

            <v-row>
              <v-col cols="12" sm="6">
                <v-switch
                  v-model="formAdopcion.origenWeb"
                  label="¿Adopción hecha desde la web?"
                  inset
                  color="primary"
                />
              </v-col>
            </v-row>

            <v-row>
              <v-col cols="12">
                <v-textarea
                  v-model="formAdopcion.observaciones"
                  label="Observaciones"
                  variant="outlined"
                  density="comfortable"
                  auto-grow
                  rows="3"
                />
              </v-col>
            </v-row>

            <div class="text-right">
              <v-btn variant="text" @click="dialogAdopcion = false">Cancelar</v-btn>
              <v-btn color="primary" type="submit" :disabled="!formAdopcionValido">
                {{ editandoAdopcion ? 'Guardar cambios' : 'Crear adopción' }}
              </v-btn>
            </div>
          </v-form>
        </v-card-text>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<style scoped lang="scss">
$color-fondo: #f8f9fb;
$color-texto: #1e293b;
$color-primario: #FF5500;
$color-rojo: #FB7C3C;
$color-borde: #e2e8f0;
$color-muted: #64748b;
$color-tarjeta: #ffffff;
$color-blanco: #ffffff;

.protectora-admin {
  background-color: $color-fondo;
  color: $color-texto;

  &__titulo {
    font-weight: 700;
    font-size: 1.5rem;
  }

  &__subtitulo {
    font-weight: 600;
    font-size: 1.25rem;
    margin: 1rem 0 0.5rem 0;
  }

  &__boton {
    background: linear-gradient(90deg, $color-primario, $color-rojo);
    color: $color-blanco;
    font-weight: 600;
  }

  &__tabla-container {
    background: $color-tarjeta;
    border: 1px solid $color-borde;
    border-radius: 12px;
    padding: 8px 0 0 0;
    margin-bottom: 24px;

    :deep(.v-table) {
      border-radius: 12px;
    }
  }

  &__tabla {
    :deep(thead th) {
      font-weight: 700;
      color: $color-muted;
    }

    :deep(tbody td) {
      vertical-align: middle;
    }
  }

  &__dialogo {
    :deep(.v-card-title) {
      font-weight: 700;
    }
  }

  &__solicitudes {
    background: $color-tarjeta;
    border: 1px solid $color-borde;
    border-radius: 12px;
    padding: 8px 0 0 0;
    margin-bottom: 24px;

    :deep(.v-table) {
      border-radius: 12px;
    }

    :deep(thead th) {
      font-weight: 700;
      color: $color-muted;
    }

    :deep(tbody td) {
      vertical-align: middle;
    }
  }
}

.solicitud-detalle {
  &__titulo {
    font-weight: 700;
    font-size: 1.25rem;
  }

  &__contenido {
    h3 {
      font-weight: 600;
      font-size: 1.1rem;
      margin-bottom: .5rem;
    }

    :deep(.v-text-field) {
      font-size: 0.875rem;

      &.v-text-field--readonly {
        .v-field__input {
          color: rgba(0, 0, 0, 0.7);
        }
      }
    }

    :deep(.v-textarea) {
      font-size: 0.875rem;

      &.v-textarea--readonly {
        .v-field__input {
          color: rgba(0, 0, 0, 0.7);
        }
      }
    }

    :deep(.v-checkbox) {
      .v-label {
        opacity: 1;
      }
    }
  }
}

.protectora-admin {
  &__dialogo {
    background-color: #272727;
    color: $color-blanco;

    :deep(.v-text-field),
    :deep(.v-select),
    :deep(.v-textarea) {
      color: $color-blanco;
    }
  }
}

/* ▼▼▼ NUEVO: estilos del menú de botones (responsive) ▼▼▼ */
.panel-selector__title {
  font-weight: 700;
  font-size: 1.6rem;
}
.panel-selector__subtitle {
  color: $color-muted;
}
.menu-btn {
  background: rgba(255, 85, 0, .12);
  border: 1px solid rgba(255, 85, 0, .35);
  font-weight: 600;
  border-radius: 12px;
  padding-top: 16px;
  padding-bottom: 16px;
}
.menu-btn--active {
  background: linear-gradient(90deg, $color-primario, $color-rojo);
  color: $color-blanco;
  border-color: transparent;
}
/* ▲▲▲ FIN NUEVO ▲▲▲ */

/* ======= SOLO CAMBIOS RESPONSIVE MÓVIL ======= */
.table-wrap {
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
}
.table-wrap::-webkit-scrollbar {
  height: 8px;
}
.table-wrap::-webkit-scrollbar-thumb {
  background: #e2e8f0;
  border-radius: 8px;
}

.adopciones-card {
  margin-inline: auto;
}
.adopciones-tabs {
  :deep(.v-tab) { font-weight: 600; }
}

/* Ocultar columnas poco críticas en móvil (ID, Origen, Observaciones) */
@media (max-width: 600px) {
  .panel-selector { padding: 4px 8px !important; }
  .panel-selector__title { font-size: 1.1rem; }
  .panel-selector__subtitle { font-size: .85rem; margin-bottom: .5rem; }

  .menu-btn {
    padding-top: 12px;
    padding-bottom: 12px;
    border-radius: 12px;
    font-size: .95rem;
  }

  .protectora-admin__titulo { font-size: 1rem; }

  .protectora-admin__tabla-container,
  .protectora-admin__solicitudes {
    margin: 8px auto 12px !important; max-width: 360px; padding: 6px 0 0 0;
  }

  :deep(.v-data-table) { font-size: .8rem; }
  :deep(.v-data-table .v-btn--icon) { width: 24px; height: 24px; }
  :deep(.v-chip) { font-size: .7rem; height: 20px; }

  /* Evita que las cards queden estrechas */
  .mx-4 { margin-inline: auto !important; max-width: 360px; }

  /* Panel de adopciones más estrecho y centrado */
  .adopciones-card { max-width: 360px; }

  /* Título en dos líneas si hace falta */
  .adopciones-card :deep(.v-card-title) {
    gap: 8px;
    padding-bottom: 8px;
  }

  /* Tabla de adopciones: oculta columnas 1,4,6 en móvil */
  .adopciones-table :deep(table thead th:nth-child(1)),
  .adopciones-table :deep(table thead th:nth-child(4)),
  .adopciones-table :deep(table thead th:nth-child(6)),
  .adopciones-table :deep(table tbody td:nth-child(1)),
  .adopciones-table :deep(table tbody td:nth-child(4)),
  .adopciones-table :deep(table tbody td:nth-child(6)) {
    display: none;
  }
}

/* Ajustes tablet */
@media (min-width: 600px) and (max-width: 960px) {
  .menu-btn { padding-top: 14px; padding-bottom: 14px; }
  .protectora-admin__tabla-container,
  .protectora-admin__solicitudes {
    margin: 16px 12px 22px !important;
  }
}
</style>
 