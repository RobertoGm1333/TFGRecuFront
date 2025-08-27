<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import { usegatosStore } from "@/stores/gatos.ts";

const gatosStore = usegatosStore();
const gatos = ref<any[]>([]);
const mostrarDialogo = ref(false);
const mostrarConfirmacion = ref(false);
const gatoAEliminar = ref<any|null>(null);
const mostrarMensaje = ref(false);
const mensajeTexto = ref('');
const mensajeTipo = ref<'success'|'error'>('success');

/* NUEVO: búsqueda */
const busqueda = ref("");

const gato = ref({
  id_Gato: 0,
  nombre_Gato: "",
  raza: "",
  edad: 0,
  sexo: "",
  esterilizado: false,
  descripcion_Gato: "", // Descripción en español
  descripcion_Gato_En: "", // Descripción en inglés
  imagen_Gato: "",
  id_Protectora: 0,
  visible: true
});

const formularioGato = ref();

// NUEVO: lista fija de razas disponibles para el selector 
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
];

const headers = [
  { title: 'ID', key: 'id_Gato', align: 'start' },
  { title: 'Nombre', key: 'nombre_Gato' },
  { title: 'Raza', key: 'raza' },
  { title: 'Edad', key: 'edad' },
  { title: 'Sexo', key: 'sexo' },
  { title: 'Esterilizado', key: 'esterilizado' },
  { title: 'Visible', key: 'visible' },
  { title: 'Acciones', key: 'acciones', sortable: false, align: 'end' }
];

// ▼▼▼ NUEVO: soporte de subida de imagen como en Admin Protectora ▼▼▼
const archivoImagen = ref<File|null>(null)
const fotoPreview = ref<string|null>(null)

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
// ▲▲▲ FIN NUEVO ▲▲▲

// ▼▼▼ NUEVO: listado de Protectoras para el select ▼▼▼
const protectoras = ref<any[]>([])
const itemsProtectoras = computed(() =>
  (protectoras.value || []).map((p: any) => ({
    title: p.nombre_Protectora ?? p.nombre ?? `#${p.id_Protectora}`,
    value: p.id_Protectora
  }))
)
// ▲▲▲ FIN NUEVO ▲▲▲

onMounted(async () => {
  await cargarGatos();
  // NUEVO: cargar nombres de Protectoras
  await cargarProtectoras();
});

async function cargarGatos() {
  try {
    await gatosStore.fetchGato();
    gatos.value = gatosStore.gatos;
  } catch (error) {
    console.error("Error al cargar gatos:", error);
    mensajeTipo.value = 'error';
    mensajeTexto.value = 'Error al cargar los gatos';
    mostrarMensaje.value = true;
  }
}

// NUEVO: fetch de protectorAs
async function cargarProtectoras() {
  try {
    const res = await fetch('http://localhost:5167/api/Protectora', { headers: { Accept: 'application/json' } })
    if (!res.ok) throw new Error('Error HTTP ' + res.status)
    const data = await res.json()
    protectoras.value = Array.isArray(data) ? data : []
  } catch (e) {
    console.error('Error al cargar las protectoras:', e)
    protectoras.value = []
  }
}

function abrirFormulario() {
  gato.value = {
    id_Gato: 0,
    nombre_Gato: "",
    raza: "",
    edad: 0,
    sexo: "",
    esterilizado: false,
    descripcion_Gato: "", // Descripción en español
    descripcion_Gato_En: "", // Descripción en inglés
    imagen_Gato: "",
    id_Protectora: 0,
    visible: true
  };
  // NUEVO: reset de imagen
  archivoImagen.value = null
  fotoPreview.value = null
  mostrarDialogo.value = true;
}

function editarGato(item: any) {
  gato.value = { ...item };
  // NUEVO: reset/preview desde URL existente (si la hay)
  archivoImagen.value = null
  fotoPreview.value = gato.value.imagen_Gato || null
  mostrarDialogo.value = true;
}

function cerrarDialogo() {
  mostrarDialogo.value = false;
}

async function guardarGato() {
  try {
    const { valid } = await formularioGato.value?.validate();
    if (!valid) return;

    // ▼▼▼ NUEVO: si hay archivo seleccionado, subimos con FormData al backend ▼▼▼
    if (archivoImagen.value) {
      const creando = gato.value.id_Gato === 0
      const url = creando
        ? 'http://localhost:5167/api/Gato'
        : `http://localhost:5167/api/Gato/${gato.value.id_Gato}`
      const method = creando ? 'POST' : 'PUT'

      const formData = new FormData()
      formData.append('nombre_Gato', gato.value.nombre_Gato)
      formData.append('raza', gato.value.raza)
      formData.append('edad', String(gato.value.edad))
      formData.append('sexo', gato.value.sexo)
      formData.append('esterilizado', gato.value.esterilizado ? 'true' : 'false')
      formData.append('descripcion_Gato', gato.value.descripcion_Gato || '')
      formData.append('descripcion_Gato_En', gato.value.descripcion_Gato_En || '')
      formData.append('id_Protectora', String(gato.value.id_Protectora || 0))
      formData.append('visible', gato.value.visible ? 'true' : 'false')
      formData.append('imagen', archivoImagen.value) // archivo real

      const res = await fetch(url, { method, body: formData })
      if (!res.ok) throw new Error('Error al guardar el gato')

      mensajeTexto.value = creando ? 'Gato agregado exitosamente' : 'Gato actualizado exitosamente'
    } else {
      // ▲▲▲ Si no hay archivo, mantenemos el flujo anterior con la URL ▲▲▲
      if (gato.value.id_Gato === 0) {
        await gatosStore.createGato(gato.value);
        mensajeTexto.value = 'Gato agregado exitosamente';
      } else {
        await gatosStore.updateGato(gato.value);
        mensajeTexto.value = 'Gato actualizado exitosamente';
      }
    }
    // ▲▲▲ FIN NUEVO ▲▲▲
    
    mensajeTipo.value = 'success';
    mostrarMensaje.value = true;
    cerrarDialogo();
    await cargarGatos();
  } catch (error) {
    console.error("Error al guardar el gato:", error);
    mensajeTipo.value = 'error';
    mensajeTexto.value = 'Error al guardar el gato';
    mostrarMensaje.value = true;
  }
}

function pedirConfirmacion(item: any) {
  gatoAEliminar.value = item;
  mostrarConfirmacion.value = true;
}

async function confirmarEliminacion() {
  if (!gatoAEliminar.value) return;

  try {
    await gatosStore.deleteGato(gatoAEliminar.value.id_Gato);
    mensajeTipo.value = 'success';
    mensajeTexto.value = 'Gato eliminado exitosamente';
    mostrarMensaje.value = true;
    mostrarConfirmacion.value = false;
    await cargarGatos();
  } catch (error) {
    console.error("Error al eliminar el gato:", error);
    mensajeTipo.value = 'error';
    mensajeTexto.value = 'Error al eliminar el gato';
    mostrarMensaje.value = true;
  }
}

/* NUEVO: lista filtrada por búsqueda */
const gatosFiltrados = computed(() => {
  const q = busqueda.value.trim().toLowerCase();
  if (!q) return gatos.value;
  return gatos.value.filter((g: any) =>
    (g?.nombre_Gato ?? '').toLowerCase().includes(q) ||
    (g?.raza ?? '').toLowerCase().includes(q) ||
    (g?.sexo ?? '').toLowerCase().includes(q)
  );
});
</script>

<template>
  <v-container fluid class="admin-view pa-0">
    <v-row justify="space-between" align="center" class="mb-4 mx-0">
      <v-col cols="12" sm="auto" class="text-center text-sm-start px-4">
        <h1 class="admin-view__titulo">Gestión de Gatos</h1>
      </v-col>
      <v-col cols="12" sm="auto" class="text-center text-sm-start mt-4 mt-sm-0 px-4">
        <v-btn color="primary" @click="abrirFormulario" class="admin-view__boton">+ Nuevo gato</v-btn>
      </v-col>
    </v-row>

    <!-- NUEVO: barra de búsqueda -->
    <div class="px-4 mb-4">
      <v-text-field
        v-model="busqueda"
        label="Buscar gato"
        prepend-inner-icon="mdi-magnify"
        density="comfortable"
        variant="outlined"
        hide-details
        clearable
      />
    </div>

    <!-- Tabla responsive -->
    <div class="admin-view__tabla-container px-4">
      <v-data-table
        :headers="headers"
        :items="gatosFiltrados"
        class="elevation-1 admin-view__tabla"
        :class="{'admin-view__tabla--mobile': $vuetify.display.smAndDown}"
      >
        <template v-slot:item.esterilizado="{ item }">
          <v-icon :color="item.esterilizado ? 'success' : 'error'">
            {{ item.esterilizado ? 'mdi-check' : 'mdi-close' }}
          </v-icon>
        </template>
        
        <template v-slot:item.visible="{ item }">
          <v-icon :color="item.visible ? 'success' : 'error'">
            {{ item.visible ? 'mdi-check' : 'mdi-close' }}
          </v-icon>
        </template>
        
        <template v-slot:item.acciones="{ item }">
          <div class="admin-view__acciones">
            <!-- Iconos circulares, solo símbolo -->
            <v-btn icon color="blue" size="small" class="mb-2 mb-sm-0 me-sm-2" @click="editarGato(item)">
              <v-icon>mdi-pencil</v-icon>
            </v-btn>
            <v-btn icon color="red" size="small" @click="pedirConfirmacion(item)">
              <v-icon>mdi-delete</v-icon>
            </v-btn>
          </div>
        </template>
      </v-data-table>
    </div>

    <!-- Mensaje de confirmación/error -->
    <v-snackbar
      v-model="mostrarMensaje"
      :color="mensajeTipo"
      :timeout="3000"
    >
      {{ mensajeTexto }}
    </v-snackbar>

    <!-- Formulario de creación/edición -->
    <v-dialog v-model="mostrarDialogo" max-width="600px">
      <v-card class="admin-view__dialogo">
        <v-card-title class="admin-view__dialogo-titulo">
          {{ gato.id_Gato ? 'Editar Gato' : 'Nuevo Gato' }}
        </v-card-title>
        <v-card-text class="admin-view__dialogo-contenido">
          <v-form ref="formularioGato">
            <v-row>
              <v-col cols="12" sm="6">
                <v-text-field
                  v-model="gato.nombre_Gato"
                  label="Nombre del gato"
                  :rules="[v => !!v || 'Campo obligatorio']"
                  variant="outlined"
                  density="comfortable"
                />
              </v-col>
              <v-col cols="12" sm="6">
                <!-- Sustituido input de texto por selector de razas -->
                <v-select
                  v-model="gato.raza"
                  :items="RAZAS"
                  label="Raza"
                  :rules="[v => !!v || 'Campo obligatorio']"
                  variant="outlined"
                  density="comfortable"
                  :menu-props="{ maxHeight: 300 }"
                />
              </v-col>
            </v-row>
            <v-row>
              <v-col cols="12" sm="6">
                <v-text-field
                  v-model.number="gato.edad"
                  label="Edad"
                  type="number"
                  :rules="[v => v > 0 || 'Debe ser mayor que 0']"
                  variant="outlined"
                  density="comfortable"
                />
              </v-col>
              <v-col cols="12" sm="6">
                <v-select
                  v-model="gato.sexo"
                  :items="['Macho', 'Hembra']"
                  label="Sexo"
                  :rules="[v => !!v || 'Campo obligatorio']"
                  variant="outlined"
                  density="comfortable"
                />
              </v-col>
            </v-row>
            <v-row>
              <v-col cols="12" sm="6">
                <!-- NUEVO: en vez de ID, selector por nombre de protectora -->
                <v-select
                  v-model="gato.id_Protectora"
                  :items="itemsProtectoras"
                  item-title="title"
                  item-value="value"
                  label="Protectora"
                  :rules="[v => v > 0 || 'Selecciona una protectora']"
                  variant="outlined"
                  density="comfortable"
                  :menu-props="{ maxHeight: 300 }"
                />
              </v-col>
              <v-col cols="12" sm="6">
                <v-checkbox v-model="gato.esterilizado" label="Esterilizado" />
              </v-col>
            </v-row>
            <v-textarea
              v-model="gato.descripcion_Gato"
              label="Descripción en Español"
              :rules="[v => !!v || 'Campo obligatorio']"
              rows="3"
              variant="outlined"
              class="mb-4"
            />
            <v-textarea
              v-model="gato.descripcion_Gato_En"
              label="Descripción en Inglés"
              :rules="[v => !!v || 'Campo obligatorio']"
              rows="3"
              variant="outlined"
              class="mb-4"
            />
            <!-- ▼▼▼ NUEVO: botón de subida de imagen + preview (reemplaza URL) ▼▼▼ -->
            <v-row>
              <v-col cols="12" sm="6">
                <v-file-input
                  label="Imagen del gato"
                  accept="image/*"
                  variant="outlined"
                  density="comfortable"
                  @change="cambioImagen"
                  clearable
                />
              </v-col>
              <v-col cols="12" sm="6" class="d-flex justify-center align-center">
                <v-avatar size="120" v-if="fotoPreview">
                  <v-img :src="fotoPreview" alt="Preview" />
                </v-avatar>
                <div v-else class="text-caption">Sin imagen</div>
              </v-col>
            </v-row>
            <!-- ▲▲▲ FIN NUEVO ▲▲▲ -->
            <v-checkbox v-model="gato.visible" label="Visible públicamente" />
          </v-form>
        </v-card-text>
        <v-card-actions class="admin-view__dialogo-acciones">
          <v-spacer></v-spacer>
          <v-btn color="grey" @click="cerrarDialogo" class="me-2">Cancelar</v-btn>
          <v-btn color="success" @click="guardarGato">Guardar</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Confirmación para eliminar -->
    <v-dialog v-model="mostrarConfirmacion" max-width="500px">
      <v-card class="admin-view__dialogo">
        <v-card-title class="admin-view__dialogo-titulo">
          Confirmar eliminación
        </v-card-title>
        <v-card-text class="py-4">
          ¿Estás seguro que quieres eliminar a <strong>{{ gatoAEliminar?.nombre_Gato }}</strong>?
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="grey" @click="mostrarConfirmacion = false" class="me-2">Cancelar</v-btn>
          <v-btn color="error" @click="confirmarEliminacion">Eliminar</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<style scoped lang="scss">
.admin-view {
  width: 100%;
  margin: 0 auto;
  margin-bottom: $espacio-grande;

  &__titulo {
    font-size: 1.25rem;
    color: $color-principal;
    margin: $espacio-mediano 0;
    text-align: center;

    @media (min-width: 600px) {
      font-size: 2rem;
      text-align: left;
      margin-bottom: $espacio-grande;
    }
  }

  &__subtitulo {
    font-size: 1.1rem;
    color: $color-principal;
    margin: $espacio-mediano 0;
    text-align: center;

    @media (min-width: 600px) {
      font-size: 1.8rem;
      text-align: left;
    }
  }

  &__tabla-container {
    overflow-x: auto;
    width: 100%;
    -webkit-overflow-scrolling: touch;
    margin: 0;
    padding: 0;

    :deep(.v-data-table) {
      width: 100%;
      font-size: 0.875rem;
      border-radius: 0;

      @media (min-width: 600px) {
        font-size: 1rem;
        border-radius: $espacio-pequeno;
      }
    }

    :deep(.v-data-table-header) {
      th {
        padding: 12px 16px !important;
        font-size: 0.875rem !important;
        height: 48px !important;
        background-color: $color-blanco;
      }
    }

    :deep(.v-data-table__wrapper) {
      td {
        padding: 12px 16px !important;
        font-size: 0.875rem !important;
        height: 48px !important;
      }
    }
  }

  &__tabla {
    width: 100%;
    background-color: $color-blanco;
    box-shadow: none;
    border: 1px solid rgba(0, 0, 0, 0.12);

    @media (min-width: 600px) {
      box-shadow: $sombra-contenedor;
    }

    &--mobile {
      :deep(.v-data-table__wrapper) {
        overflow-x: auto;
        -webkit-overflow-scrolling: touch;
        width: 100%;
        margin: 0;
        padding: 0;
        
        table {
          width: 100%;
          min-width: 500px;
        }
      }

      :deep(th), :deep(td) {
        white-space: nowrap;
        min-width: 100px;
        padding: 12px 16px !important;
      }

      :deep(td:first-child), :deep(th:first-child) {
        padding-left: 16px !important;
      }

      :deep(td:last-child), :deep(th:last-child) {
        padding-right: 16px !important;
      }
    }
  }

  &__acciones {
    display: flex;
    flex-direction: row;
    gap: 8px;
    align-items: center;
    justify-content: flex-end;
    padding: 0;

    .v-btn {
      min-width: 40px !important;
      padding: 0 12px !important;
      height: 36px !important;

      @media (min-width: 600px) {
        min-width: 40px !important;
        padding: 0 12px !important;
      }
    }
  }

  &__boton {
    width: auto;
    min-width: 120px !important;
    height: 36px !important;
    font-size: 0.875rem !important;

    @media (min-width: 600px) {
      height: 40px !important;
      font-size: 1rem !important;
    }
  }

  &__dialogo {
    margin: 8px;
    width: auto;
    max-height: 90vh;
    overflow-y: auto;

    @media (min-width: 600px) {
      margin: 0;
      min-width: 600px;
    }

    &-titulo {
      background-color: $color-principal;
      color: $color-blanco;
      padding: 16px 20px;
      font-size: 1.2rem;
      position: sticky;
      top: 0;
      z-index: 1;
    }

    &-contenido {
      padding: 24px 20px;

      h3 {
        color: $color-principal;
        font-size: 1.1rem;
        font-weight: 500;
        border-bottom: 2px solid $color-principal;
        padding-bottom: 8px;
      }

      :deep(.v-input) {
        margin-bottom: 12px;
      }

      .v-row {
        margin: 0 -12px;
      }

      .v-col {
        padding: 12px;
      }
    }

    &-acciones {
      padding: 16px 20px;
      display: flex;
      justify-content: flex-end;
      gap: 12px;
      border-top: 1px solid rgba(0, 0, 0, 0.12);
      background-color: #f5f5f5;
      position: sticky;
      bottom: 0;
      z-index: 1;
    }
  }

  @media (prefers-color-scheme: dark) {
    &__dialogo {
      background-color: #272727;

      &-contenido {
        h3 {
          border-bottom-color: $color-principal;
        }
      }

      &-acciones {
        background-color: #1e1e1e;
        border-top-color: rgba(255, 255, 255, 0.12);
      }
    }
  }

  @media (min-width: 960px) {
    max-width: 1200px;
    padding: $espacio-grande;
    margin-top: 95px;
  }
}

@media (prefers-color-scheme: dark) {
  .admin-view {
    &__tabla {
      background-color: #272727;
      color: $color-blanco;
    }

    &__dialogo {
      background-color: #272727;
      color: $color-blanco;
    }
  }
}
</style>
