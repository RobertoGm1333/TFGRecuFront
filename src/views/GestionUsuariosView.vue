<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import { useusuariosStore } from "@/stores/usuarios.ts";

const usuariosStore = useusuariosStore();
const usuarios = ref([]);
const mostrarDialogo = ref(false);
const mostrarConfirmacion = ref(false);
const usuarioAEliminar = ref(null);
const mostrarMensaje = ref(false);
const mensajeTexto = ref('');
const mensajeTipo = ref('success');
const busqueda = ref("");

const usuario = ref({
  id_Usuario: 0,
  nombre: "",
  apellido: "",
  email: "",
  contraseña: "",
  fecha_Registro: new Date(),
  rol: "",
  activo: true
});

const formularioUsuario = ref();

const headers = [
  { title: 'ID', key: 'id_Usuario', align: 'start' },
  { title: 'Nombre', key: 'nombre' },
  { title: 'Apellido', key: 'apellido' },
  { title: 'Email', key: 'email' },
  { title: 'Rol', key: 'rol' },
  { title: 'Activo', key: 'activo' },
  { title: 'Acciones', key: 'acciones', sortable: false, align: 'end' }
];

onMounted(async () => {
  await cargarUsuarios();
});

async function cargarUsuarios() {
  try {
    await usuariosStore.fetchUsuarios();
    usuarios.value = usuariosStore.usuarios;
  } catch (error) {
    console.error("Error al cargar usuarios:", error);
    mensajeTipo.value = 'error';
    mensajeTexto.value = 'Error al cargar los usuarios';
    mostrarMensaje.value = true;
  }
}

function editarUsuario(item) {
  usuario.value = { ...item };
  mostrarDialogo.value = true;
}

function cerrarDialogo() {
  mostrarDialogo.value = false;
}

async function guardarUsuario() {
  try {
    const { valid } = await formularioUsuario.value?.validate();
    if (!valid) return;

    await usuariosStore.updateUsuario(usuario.value);
    mensajeTipo.value = 'success';
    mensajeTexto.value = 'Usuario actualizado exitosamente';
    mostrarMensaje.value = true;
    cerrarDialogo();
    await cargarUsuarios();
  } catch (error) {
    console.error("Error al guardar el usuario:", error);
    mensajeTipo.value = 'error';
    mensajeTexto.value = 'Error al guardar el usuario';
    mostrarMensaje.value = true;
  }
}

function pedirConfirmacion(item) {
  usuarioAEliminar.value = item;
  mostrarConfirmacion.value = true;
}

async function confirmarEliminacion() {
  if (!usuarioAEliminar.value) return;

  try {
    await usuariosStore.deleteUsuario(usuarioAEliminar.value.id_Usuario);
    mensajeTipo.value = 'success';
    mensajeTexto.value = 'Usuario eliminado exitosamente';
    mostrarMensaje.value = true;
    mostrarConfirmacion.value = false;
    await cargarUsuarios();
  } catch (error) {
    console.error("Error al eliminar el usuario:", error);
    mensajeTipo.value = 'error';
    mensajeTexto.value = 'Error al eliminar el usuario';
    mostrarMensaje.value = true;
  }
}

const usuariosFiltrados = computed(() => {
  if (!busqueda.value) return usuarios.value;
  
  return usuarios.value.filter(usuario =>
    usuario.nombre.toLowerCase().includes(busqueda.value.toLowerCase()) ||
    usuario.apellido.toLowerCase().includes(busqueda.value.toLowerCase()) ||
    usuario.email.toLowerCase().includes(busqueda.value.toLowerCase())
  );
});
</script>

<template>
  <v-container fluid class="admin-view pa-0">
    <v-row justify="space-between" align="center" class="mb-4 mx-0">
      <v-col cols="12" sm="auto" class="text-center text-sm-start px-4">
        <h1 class="admin-view__titulo">Gestión de Usuarios</h1>
      </v-col>
    </v-row>

    <!-- Buscador -->
    <div class="px-4 mb-4">
      <v-text-field
        v-model="busqueda"
        label="Buscar usuario"
        prepend-inner-icon="mdi-magnify"
        density="comfortable"
        variant="outlined"
        hide-details
        clearable
      ></v-text-field>
    </div>

    <!-- Tabla responsive -->
    <div class="admin-view__tabla-container px-4">
      <v-data-table
        :headers="headers"
        :items="usuariosFiltrados"
        class="elevation-1 admin-view__tabla"
        :class="{'admin-view__tabla--mobile': $vuetify.display.smAndDown}"
      >
        <template v-slot:item.activo="{ item }">
          <v-icon :color="item.activo ? 'success' : 'error'">
            {{ item.activo ? 'mdi-check' : 'mdi-close' }}
          </v-icon>
        </template>
        
        <template v-slot:item.acciones="{ item }">
          <div class="admin-view__acciones">
            <v-btn color="primary" @click="editarUsuario(item)" class="mb-2 mb-sm-0 me-sm-2">
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

    <!-- Formulario de edición -->
    <v-dialog v-model="mostrarDialogo" max-width="600px">
      <v-card class="admin-view__dialogo">
        <v-card-title class="admin-view__dialogo-titulo">
          Editar Usuario
        </v-card-title>
        <v-card-text class="admin-view__dialogo-contenido">
          <v-form ref="formularioUsuario">
            <v-row>
              <v-col cols="12" sm="6">
                <v-text-field
                  v-model="usuario.nombre"
                  label="Nombre"
                  :rules="[v => !!v || 'Campo obligatorio']"
                  variant="outlined"
                  density="comfortable"
                />
              </v-col>
              <v-col cols="12" sm="6">
                <v-text-field
                  v-model="usuario.apellido"
                  label="Apellido"
                  :rules="[v => !!v || 'Campo obligatorio']"
                  variant="outlined"
                  density="comfortable"
                />
              </v-col>
            </v-row>
            <v-row>
              <v-col cols="12" sm="6">
                <v-text-field
                  v-model="usuario.email"
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
                  v-model="usuario.contraseña"
                  label="Contraseña"
                  variant="outlined"
                  density="comfortable"
                />
              </v-col>
            </v-row>
            <v-row>
              <v-col cols="12" sm="6">
                <v-select
                  v-model="usuario.rol"
                  :items="['admin', 'usuario', 'protectora']"
                  label="Rol"
                  variant="outlined"
                  density="comfortable"
                />
              </v-col>
              <v-col cols="12" sm="6">
                <v-checkbox v-model="usuario.activo" label="Activo" />
              </v-col>
            </v-row>
          </v-form>
        </v-card-text>
        <v-card-actions class="admin-view__dialogo-acciones">
          <v-spacer></v-spacer>
          <v-btn color="grey" @click="cerrarDialogo" class="me-2">Cancelar</v-btn>
          <v-btn color="success" @click="guardarUsuario">Guardar</v-btn>
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
          ¿Estás seguro que quieres eliminar al usuario <strong>{{ usuarioAEliminar?.nombre }} {{ usuarioAEliminar?.apellido }}</strong>?
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