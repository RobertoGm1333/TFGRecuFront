<script setup lang="ts">
import { ref, onMounted } from "vue";
import { usegatosStore } from "@/stores/gatos.ts";

const gatosStore = usegatosStore();
const gatos = ref([]);
const mostrarDialogo = ref(false);
const mostrarConfirmacion = ref(false);
const gatoAEliminar = ref(null);
const mostrarMensaje = ref(false);
const mensajeTexto = ref('');
const mensajeTipo = ref('success');

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

onMounted(async () => {
  await cargarGatos();
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
  mostrarDialogo.value = true;
}

function editarGato(item) {
  gato.value = { ...item };
  mostrarDialogo.value = true;
}

function cerrarDialogo() {
  mostrarDialogo.value = false;
}

async function guardarGato() {
  try {
    const { valid } = await formularioGato.value?.validate();
    if (!valid) return;

    if (gato.value.id_Gato === 0) {
      await gatosStore.createGato(gato.value);
      mensajeTexto.value = 'Gato agregado exitosamente';
    } else {
      await gatosStore.updateGato(gato.value);
      mensajeTexto.value = 'Gato actualizado exitosamente';
    }
    
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

function pedirConfirmacion(item) {
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
</script>

<template>
  <v-container fluid class="admin-view pa-0">
    <v-row justify="space-between" align="center" class="mb-4 mx-0">
      <v-col cols="12" sm="auto" class="text-center text-sm-start px-4">
        <h1 class="admin-view__titulo">Gestión de Gatos</h1>
      </v-col>
      <v-col cols="12" sm="auto" class="text-center text-sm-start mt-4 mt-sm-0 px-4">
        <v-btn color="primary" @click="abrirFormulario" class="admin-view__boton">Nuevo gato</v-btn>
      </v-col>
    </v-row>

    <!-- Tabla responsive -->
    <div class="admin-view__tabla-container px-4">
      <v-data-table
        :headers="headers"
        :items="gatos"
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
            <v-btn color="primary" @click="editarGato(item)" class="mb-2 mb-sm-0 me-sm-2">
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
                <v-text-field
                  v-model="gato.raza"
                  label="Raza"
                  :rules="[v => !!v || 'Campo obligatorio']"
                  variant="outlined"
                  density="comfortable"
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
                <v-text-field
                  v-model.number="gato.id_Protectora"
                  label="ID Protectora"
                  type="number"
                  :rules="[v => v > 0 || 'Debe ser mayor que 0']"
                  variant="outlined"
                  density="comfortable"
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
            <v-text-field
              v-model="gato.imagen_Gato"
              label="URL de imagen"
              :rules="[v => !!v || 'Campo obligatorio']"
              variant="outlined"
              density="comfortable"
            />
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
