  <script setup lang="ts">
  import { ref, onMounted } from 'vue'
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
    descripcion_Gato: '', // Descripción en español
    descripcion_Gato_En: '', // Descripción en inglés
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
  const mensajeTipo = ref('success')

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
      await cargarSerieGrafica()
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
  </script>


  <template>
    <v-container fluid class="protectora-admin pa-0">
      <v-row justify="space-between" align="center" class="mb-4 mx-0">
        <v-col cols="12" sm="auto" class="text-center text-sm-start px-4">
          <h1 class="protectora-admin__titulo">Gestión de Gatos - Protectora</h1>
        </v-col>
        <v-col cols="12" sm="auto" class="text-center text-sm-start mt-4 mt-sm-0 px-4">
          <v-btn color="primary" @click="abrirFormulario" class="protectora-admin__boton">Nuevo gato</v-btn>
        </v-col>
      </v-row>

      <!-- Tabla responsive -->
      <div class="protectora-admin__tabla-container px-4">
        <v-data-table
          :headers="headers"
          :items="gatos"
          class="elevation-1 protectora-admin__tabla"
          density="comfortable"
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

      <v-container fluid class="protectora-admin__solicitudes px-4">
        <h2 class="protectora-admin__subtitulo">Solicitudes de adopción</h2>
        <v-data-table
          :headers="headersSolicitudes"
          :items="solicitudes"
          class="elevation-1 protectora-admin__tabla"
          density="comfortable"
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
      </v-container>

      <v-dialog v-model="mostrarDialogo" max-width="700">
        <v-card class="protectora-admin__dialogo">
          <v-card-title>Gato</v-card-title>
          <v-card-text>
            <v-row>
              <v-col cols="12" sm="6">
                <v-text-field v-model="formularioGato.nombre_Gato" label="Nombre" variant="outlined" density="comfortable"></v-text-field>
              </v-col>
              <v-col cols="12" sm="6">
                <v-text-field v-model="formularioGato.raza" label="Raza" variant="outlined" density="comfortable"></v-text-field>
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

            <h3 class="mb-4 mt-6">Experiencia y Convivencia</h3>
            <v-row>
              <v-col cols="12" sm="6">
                <v-text-field :model-value="solicitudesStore.solicitudSeleccionada?.experienciaConGatos" label="Experiencia con gatos" readonly variant="outlined" density="comfortable"></v-text-field>
              </v-col>
              <v-col cols="12" sm="6">
                <v-text-field :model-value="solicitudesStore.solicitudSeleccionada?.alergiasHogar" label="Alergias en el hogar" readonly variant="outlined" density="comfortable"></v-text-field>
              </v-col>
            </v-row>
            <v-row>
              <v-col cols="12" sm="6">
                <v-text-field :model-value="solicitudesStore.solicitudSeleccionada?.personasEnCasa" label="Número de personas en casa" readonly variant="outlined" density="comfortable"></v-text-field>
              </v-col>
              <v-col cols="12" sm="6">
                <v-text-field :model-value="solicitudesStore.solicitudSeleccionada?.ninosEnCasa" label="¿Hay niños en casa?" readonly variant="outlined" density="comfortable"></v-text-field>
              </v-col>
            </v-row>

            <h3 class="mb-4 mt-6">Seguimiento</h3>
            <v-row>
              <v-col cols="12" sm="6">
                <v-checkbox :model-value="solicitudesStore.solicitudSeleccionada?.seguimientoPostAdopcion" label="¿Acepta seguimiento post-adopción?" readonly disabled></v-checkbox>
              </v-col>
              <v-col cols="12" sm="6">
                <v-checkbox :model-value="solicitudesStore.solicitudSeleccionada?.visitaHogar" label="¿Acepta visita al hogar?" readonly disabled></v-checkbox>
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

      <!-- Gráfica al final -->
      <v-card class="mb-6 mx-4" elevation="2">
        <v-card-title>Historial de adopciones</v-card-title>
        <v-card-text>
          <div v-if="cargandoGrafica">Cargando…</div>
          <div v-else-if="errorGrafica">{{ errorGrafica }}</div>
          <GraficaHistorialAdopciones v-else :items="serieGrafica" :monthsBack="12" title="Últimos 12 meses" />
        </v-card-text>
      </v-card>
    </v-container>
  </template>

  <style scoped lang="scss">
  $color-fondo: #f8f9fb;
  $color-texto: #1e293b;
  $color-primario: #FF5500;
  $color-secundario: #FB7C3C;
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
      background: linear-gradient(90deg, $color-primario, $color-secundario);
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
  </style>
