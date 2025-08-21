<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useprotectorasStore } from "@/stores/protectoras.ts";

const protectorasStore = useprotectorasStore();
const protectoras = ref([]);
const mostrarDialogo = ref(false);
const mostrarConfirmacion = ref(false);
const protectoraAEliminar = ref(null);
const mostrarMensaje = ref(false);
const mensajeTexto = ref('');
const mensajeTipo = ref('success');

const protectora = ref({
  id_Protectora: 0,
  nombre_Protectora: "",
  direccion: "",
  correo_Protectora: "",
  telefono_Protectora: "",
  pagina_Web: "",
  imagen_Protectora: "",
  id_Usuario: 0,
  ubicacion: "",
  descripcion_Protectora: "",
  descripcion_Protectora_En: "" // Descripción en inglés añadida
});

const formularioProtectora = ref();

const headers = [
  { title: 'ID', key: 'id_Protectora', align: 'start' },
  { title: 'Nombre', key: 'nombre_Protectora' },
  { title: 'Dirección', key: 'direccion' },
  { title: 'Email', key: 'correo_Protectora' },
  { title: 'Teléfono', key: 'telefono_Protectora' },
  { title: 'Acciones', key: 'acciones', sortable: false, align: 'end' }
];

onMounted(async () => {
  await cargarProtectoras();
});

async function cargarProtectoras() {
  try {
    await protectorasStore.fetchProtectora();
    protectoras.value = protectorasStore.protectoras;
  } catch (error) {
    console.error("Error al cargar protectoras:", error);
    mensajeTipo.value = 'error';
    mensajeTexto.value = 'Error al cargar las protectoras';
    mostrarMensaje.value = true;
  }
}

function abrirFormulario() {
  protectora.value = {
    id_Protectora: 0,
    nombre_Protectora: "",
    direccion: "",
    correo_Protectora: "",
    telefono_Protectora: "",
    pagina_Web: "",
    imagen_Protectora: "",
    id_Usuario: 0,
    ubicacion: "",
    descripcion_Protectora: "",
    descripcion_Protectora_En: "" // Inicializando el campo en inglés
  };
  mostrarDialogo.value = true;
}

function editarProtectora(item) {
  protectora.value = { ...item };
  mostrarDialogo.value = true;
}

function cerrarDialogo() {
  mostrarDialogo.value = false;
}

async function guardarProtectora() {
  try {
    const { valid } = await formularioProtectora.value?.validate();
    if (!valid) return;

    if (protectora.value.id_Protectora === 0) {
      await protectorasStore.createProtectora(protectora.value);
      mensajeTexto.value = 'Protectora agregada exitosamente';
    } else {
      await protectorasStore.updateProtectora(protectora.value.id_Protectora, protectora.value);
      mensajeTexto.value = 'Protectora actualizada exitosamente';
    }
    
    mensajeTipo.value = 'success';
    mostrarMensaje.value = true;
    cerrarDialogo();
    await cargarProtectoras();
  } catch (error) {
    console.error("Error al guardar la protectora:", error);
    mensajeTipo.value = 'error';
    mensajeTexto.value = 'Error al guardar la protectora';
    mostrarMensaje.value = true;
  }
}

function pedirConfirmacion(item) {
  protectoraAEliminar.value = item;
  mostrarConfirmacion.value = true;
}

async function confirmarEliminacion() {
  if (!protectoraAEliminar.value) return;

  try {
    await protectorasStore.deleteProtectora(protectoraAEliminar.value.id_Protectora);
    mensajeTipo.value = 'success';
    mensajeTexto.value = 'Protectora eliminada exitosamente';
    mostrarMensaje.value = true;
    mostrarConfirmacion.value = false;
    await cargarProtectoras();
  } catch (error) {
    console.error("Error al eliminar la protectora:", error);
    mensajeTipo.value = 'error';
    mensajeTexto.value = 'Error al eliminar la protectora';
    mostrarMensaje.value = true;
  }
}
</script>

<template>
  <v-container fluid class="admin-view pa-0">
    <v-row justify="space-between" align="center" class="mb-4 mx-0">
      <v-col cols="12" sm="auto" class="text-center text-sm-start px-4">
        <h1 class="admin-view__titulo">Gestión de Protectoras</h1>
      </v-col>
      <v-col cols="12" sm="auto" class="text-center text-sm-start mt-4 mt-sm-0 px-4">
        <v-btn color="primary" @click="abrirFormulario" class="admin-view__boton">Nueva protectora</v-btn>
      </v-col>
    </v-row>

    <!-- Tabla responsive -->
    <div class="admin-view__tabla-container px-4">
      <v-data-table
        :headers="headers"
        :items="protectoras"
        class="elevation-1 admin-view__tabla"
        :class="{'admin-view__tabla--mobile': $vuetify.display.smAndDown}"
      >
        <template v-slot:item.acciones="{ item }">
          <div class="admin-view__acciones">
            <v-btn color="primary" @click="editarProtectora(item)" class="mb-2 mb-sm-0 me-sm-2">
              <v-icon>mdi-pencil</v-icon>
              <span class="d-none d-sm-inline ms-2">Editar</span>
            </v-btn>
            <v-btn color="error" @click="pedirConfirmacion(item)">
              <v-icon>mdi-delete</v-icon>
              <span class="d-none d-sm-inline ms-2">Eliminar</span>
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
          {{ protectora.id_Protectora ? 'Editar Protectora' : 'Nueva Protectora' }}
        </v-card-title>
        <v-card-text class="admin-view__dialogo-contenido">
          <v-form ref="formularioProtectora">
            <v-row>
              <v-col cols="12" sm="6">
                <v-text-field
                  v-model="protectora.nombre_Protectora"
                  label="Nombre de la protectora"
                  :rules="[v => !!v || 'Campo obligatorio']"
                  variant="outlined"
                  density="comfortable"
                />
              </v-col>
              <v-col cols="12" sm="6">
                <v-text-field
                  v-model="protectora.direccion"
                  label="Dirección"
                  :rules="[v => !!v || 'Campo obligatorio']"
                  variant="outlined"
                  density="comfortable"
                />
              </v-col>
            </v-row>
            <v-row>
              <v-col cols="12" sm="6">
                <v-text-field
                  v-model="protectora.correo_Protectora"
                  label="Email"
                  type="email"
                  :rules="[
                    v => !!v || 'Campo obligatorio',
                    v => /.+@.+\..+/.test(v) || 'Email inválido'
                  ]"
                  variant="outlined"
                  density="comfortable"
                />
              </v-col>
              <v-col cols="12" sm="6">
                <v-text-field
                  v-model="protectora.telefono_Protectora"
                  label="Teléfono"
                  :rules="[v => !!v || 'Campo obligatorio']"
                  variant="outlined"
                  density="comfortable"
                />
              </v-col>
            </v-row>
            <v-row>
              <v-col cols="12" sm="6">
                <v-text-field
                  v-model="protectora.pagina_Web"
                  label="Página web"
                  :rules="[v => !!v || 'Campo obligatorio']"
                  variant="outlined"
                  density="comfortable"
                />
              </v-col>
              <v-col cols="12" sm="6">
                <v-text-field
                  v-model.number="protectora.id_Usuario"
                  label="ID Usuario"
                  type="number"
                  :rules="[v => v > 0 || 'Debe ser mayor que 0']"
                  variant="outlined"
                  density="comfortable"
                />
              </v-col>
            </v-row>
            <v-text-field
              v-model="protectora.imagen_Protectora"
              label="URL de imagen"
              :rules="[v => !!v || 'Campo obligatorio']"
              variant="outlined"
              density="comfortable"
            />
            <v-text-field
              v-model="protectora.ubicacion"
              label="URL de Google Maps (Embed)"
              variant="outlined"
              density="comfortable"
            />
            <v-textarea
              v-model="protectora.descripcion_Protectora"
              label="Descripción en español"
              rows="3"
              variant="outlined"
            />
            <v-textarea
              v-model="protectora.descripcion_Protectora_En"
              label="Descripción en inglés"
              rows="3"
              variant="outlined"
            />
          </v-form>
        </v-card-text>
        <v-card-actions class="admin-view__dialogo-acciones">
          <v-spacer></v-spacer>
          <v-btn color="grey" @click="cerrarDialogo" class="me-2">Cancelar</v-btn>
          <v-btn color="success" @click="guardarProtectora">Guardar</v-btn>
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
          ¿Estás seguro que quieres eliminar la protectora <strong>{{ protectoraAEliminar?.nombre_Protectora }}</strong>?
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
        min-width: 64px !important;
        padding: 0 16px !important;
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
