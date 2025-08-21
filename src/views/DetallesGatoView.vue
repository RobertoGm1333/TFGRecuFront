<script setup lang="ts">
import { ref, onMounted, watch, computed } from "vue";
import { useRoute } from "vue-router";
import DetallesGatoCard from "@/components/DetallesGatoCard.vue";
import FormularioAdopcion from "@/components/FormularioAdopcion.vue";
import { usegatosStore } from "@/stores/gatos";
import { useprotectorasStore } from "@/stores/protectoras";
import { useSolicitudesAdopcionStore } from "@/stores/solicitudesAdopcion";
import { useAutenticacion } from '@/stores/Autentificacion';
import { useI18n } from '@/stores/useI18n';

const { t } = useI18n();
const route = useRoute();
const gatosStore = usegatosStore();
const protectorasStore = useprotectorasStore();
const solicitudesStore = useSolicitudesAdopcionStore();
const Autenticacion = useAutenticacion();

const gato = ref<any>(null);
const protectora = ref<any>(null);
const cargando = ref(true);
const solicitudExistente = ref<any>(null);
const solicitudesGato = ref<any[]>([]);
const solicitud = ref<any>(null);
const nuevoEstado = ref<string>('');
const comentarioProtectora = ref<string>('');
const esProtectoraDelGato = computed(() => {
  return Autenticacion.esProtectora && 
         protectora.value?.id_Protectora === gato.value?.id_Protectora;
});

const mostrarFormulario = computed(() => {
  return Autenticacion.esAutenticado && 
         !solicitudExistente.value && 
         !esProtectoraDelGato.value;
});
const dialogoFormulario = ref(false);
const dialogoDetallesSolicitud = ref(false);

const reglas = {
  estado: [(v: string) => !!v || 'El estado es requerido'],
  comentario: [(v: string) => !!v || 'El comentario es requerido']
};

// Usuario logueado dinámico
const idUsuario = computed(() => Autenticacion.usuario?.id_Usuario ?? 0);

// Función para formatear la fecha y hora
function formatearFechaHora(fecha: Date): string {
  return new Date(fecha).toLocaleString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

// Comprobar si ya existe una solicitud para este gato
async function comprobarSolicitudExistente() {
  if (!idUsuario.value || !gato.value) return;
  
  try {
    const response = await fetch(`http://localhost:5167/api/SolicitudAdopcion/usuario/${idUsuario.value}/gato/${gato.value.id_Gato}`);
    if (response.ok) {
      solicitudExistente.value = await response.json();
    }
  } catch (error) {
    console.error('Error al comprobar solicitud existente:', error);
  }
}

const obtenerGato = async () => {
  cargando.value = true;
  gato.value = null;
  protectora.value = null;
  solicitudExistente.value = null;
  solicitudesGato.value = [];

  const id = Number(route.params.id);
 
  if (gatosStore.gatos.length === 0) {
    await gatosStore.fetchGato();
  }

  gato.value = gatosStore.gatos.find((g) => g.id_Gato === id);

  if (gato.value) {
    if (protectorasStore.protectoras.length === 0) {
      await protectorasStore.fetchProtectora();
    }
    protectora.value = protectorasStore.protectoras.find(
      (p) => p.id_Protectora === gato.value.id_Protectora
    );
    
    if (Autenticacion.esAutenticado) {
      if (esProtectoraDelGato.value) {
        // Si es la protectora del gato, cargar las solicitudes
        await cargarSolicitudesGato();
      } else {
        // Si no es la protectora, comprobar si tiene una solicitud existente
        await comprobarSolicitudExistente();
      }
    }
  }

  cargando.value = false;
};

async function cargarSolicitudesGato() {
  if (!gato.value?.id_Gato) return;
  
  try {
    const response = await fetch(`http://localhost:5167/api/SolicitudAdopcion/gato/${gato.value.id_Gato}`);
    if (!response.ok) throw new Error('Error al obtener las solicitudes');
    
    const solicitudes = await response.json();
    solicitudesGato.value = solicitudes;
  } catch (error) {
    console.error('Error al cargar las solicitudes del gato:', error);
  }
}

const handleSolicitudSuccess = async () => {
  dialogoFormulario.value = false;
  await comprobarSolicitudExistente();
};

async function cargarSolicitud(id_Solicitud: number) {
  try {
    const solicitudData = await solicitudesStore.fetchSolicitudById(id_Solicitud)
    if (solicitudData) {
      solicitud.value = solicitudData
      nuevoEstado.value = solicitudData.estado.toLowerCase()
      comentarioProtectora.value = solicitudData.comentario_Protectora || ''
      dialogoDetallesSolicitud.value = true
    }
  } catch (error) {
    console.error('Error al cargar la solicitud:', error)
  }
}

async function actualizarEstado(solicitud: any) {
  try {
    await solicitudesStore.updateEstadoSolicitud(
      solicitud.id_Solicitud,
      nuevoEstado.value,
      comentarioProtectora.value,
      gato.value.id_Protectora
    );
    dialogoDetallesSolicitud.value = false;
    await cargarSolicitudesGato();
  } catch (error) {
    console.error('Error al actualizar el estado:', error);
  }
}

onMounted(() => {
  obtenerGato();
});

watch(() => route.params.id, obtenerGato);
</script>

<template>
  <v-container>
    <h1 v-if="gato?.nombre_Gato" class="titulo-detalles">{{ t('conoceme', { nombre: gato.nombre_Gato }) }}</h1>
    <v-row justify="center">
      <v-col cols="11" md="9" class="ContainerDetallesGatos">
        <DetallesGatoCard v-if="gato" :gato="gato" :protectora="protectora" />
        <v-alert v-else-if="cargando" type="info">{{ t('cargando') }}</v-alert>
        <v-alert v-else type="error">{{ t('gato_no_encontrado') }}</v-alert>
      </v-col>
    </v-row>

    <!-- Bloque solicitud con estilo limpio -->
    <v-row justify="center" v-if="gato">
      <v-col cols="11" md="9">
        <v-card class="pa-4 mt-6">
          <!-- Si el usuario no está autenticado -->
          <template v-if="!Autenticacion.esAutenticado">
            <v-alert type="info" class="mb-4">
              {{ t('login_adoptar', { nombre: gato.nombre_Gato }) }}
            </v-alert>
            <v-btn color="primary" to="/iniciar-sesion">
              {{ t('iniciar_sesion') }}
            </v-btn>
          </template>

          <!-- Si es la protectora del gato -->
          <template v-else-if="esProtectoraDelGato">
            <h3>{{ t('solicitudes_adopcion', { nombre: gato.nombre_Gato }) }}</h3>
            <div v-if="solicitudesGato.length === 0" class="mt-4">
              <v-alert type="info">
                {{ t('no_solicitudes') }}
              </v-alert>
            </div>
            <div v-else class="mt-4">
              <v-data-table
                :headers="[
                  { title: 'ID', key: 'id_Solicitud', align: 'start' },
                  { title: t('solicitante'), key: 'nombreCompleto' },
                  { title: t('estado'), key: 'estado' },
                  { title: t('fecha'), key: 'fecha_Solicitud' },
                  { title: t('acciones'), key: 'actions', sortable: false, align: 'end' }
                ]"
                :items="solicitudesGato"
                class="elevation-1 protectora-admin__tabla"
                :class="{'protectora-admin__tabla--mobile': $vuetify.display.smAndDown}"
              >
                <template v-slot:item.fecha_Solicitud="{ item }">
                  {{ formatearFechaHora(item.fecha_Solicitud) }}
                </template>
                
                <template v-slot:item.estado="{ item }">
                  <v-chip
                    :color="item.estado.toLowerCase() === 'pendiente' ? 'orange' : 
                           item.estado.toLowerCase() === 'aceptada' ? 'green' : 
                           item.estado.toLowerCase() === 'rechazada' ? 'red' : 'grey'"
                    text-color="white"
                    small
                  >
                    {{ t(item.estado.toLowerCase()) }}
                  </v-chip>
                </template>

                <template v-slot:item.actions="{ item }">
                  <v-btn
                    color="primary"
                    size="small"
                    @click="cargarSolicitud(item.id_Solicitud)"
                  >
                    <v-icon>mdi-eye</v-icon>
                    <span class="ml-2">{{ t('ver_detalles') }}</span>
                  </v-btn>
                </template>
              </v-data-table>
            </div>
          </template>

          <!-- Si ya existe una solicitud -->
          <template v-else-if="solicitudExistente">
            <h3>{{ t('ya_solicitado', { nombre: gato.nombre_Gato }) }}</h3>
            <v-alert
              :type="solicitudExistente.estado.toLowerCase() === 'pendiente' ? 'warning' : 
                    solicitudExistente.estado.toLowerCase() === 'aceptada' ? 'success' : 'error'"
              class="mt-4"
            >
              <p><strong>{{ t('estado_solicitud') }}:</strong> 
                <v-chip
                  :color="solicitudExistente.estado.toLowerCase() === 'pendiente' ? 'orange' : 
                         solicitudExistente.estado.toLowerCase() === 'aceptada' ? 'green' : 
                         solicitudExistente.estado.toLowerCase() === 'rechazada' ? 'red' : 'grey'"
                  text-color="white"
                  small
                  class="ml-2"
                >
                  {{ t(solicitudExistente.estado.toLowerCase()) }}
                </v-chip>
              </p>
              <p><strong>{{ t('fecha') }}:</strong> {{ formatearFechaHora(solicitudExistente.fecha_Solicitud) }}</p>
              <template v-if="solicitudExistente.comentario_Protectora">
                <p><strong>{{ t('comentario_protectora') }}:</strong> {{ solicitudExistente.comentario_Protectora }}</p>
              </template>
            </v-alert>
            <v-btn color="primary" to="/solicitudes" class="mt-3">
              {{ t('ver_solicitudes') }}
            </v-btn>
          </template>

          <!-- Botón para mostrar el formulario -->
          <template v-else>
            <div class="text-center Formcontainer">
              <v-btn
                color="primary"
                size="small"
                @click="dialogoFormulario = true"
                class="mb-4 Formcontainer"
              >
                {{ t('rellenar_solicitud') }}
              </v-btn>
            </div>
          </template>
        </v-card>
      </v-col>
    </v-row>

    <!-- Diálogo del formulario -->
    <v-dialog
      v-model="dialogoFormulario"
      max-width="800px"
      persistent
    >
      <v-card class="formulario-dialog">
        <v-card-text class="pa-0">
          <div class="formulario-container">
            <FormularioAdopcion
              v-if="dialogoFormulario"
              :idGato="gato?.id_Gato"
              :nombreGato="gato?.nombre_Gato"
              @success="handleSolicitudSuccess"
              @cancel="dialogoFormulario = false"
            />
          </div>
        </v-card-text>
      </v-card>
    </v-dialog>

    <!-- Diálogo de detalles de solicitud -->
    <v-dialog
      v-model="dialogoDetallesSolicitud"
      max-width="800px"
    >
      <v-card class="protectora-admin__dialogo">
        <v-card-title class="protectora-admin__dialogo-titulo">
          Detalles de la Solicitud
        </v-card-title>
        <v-card-text class="protectora-admin__dialogo-contenido">
          <div v-if="solicitud" class="solicitud-detalles">
            <!-- Información Personal -->
            <h3 class="mb-4">Información Personal</h3>
            <v-row>
              <v-col cols="12" sm="6">
                <v-text-field
                  :model-value="solicitud.nombreCompleto"
                  label="Nombre completo"
                  readonly
                  variant="outlined"
                  density="comfortable"
                ></v-text-field>
              </v-col>
              <v-col cols="12" sm="6">
                <v-text-field
                  :model-value="solicitud.edad"
                  label="Edad"
                  readonly
                  variant="outlined"
                  density="comfortable"
                ></v-text-field>
              </v-col>
            </v-row>
            <v-row>
              <v-col cols="12">
                <v-text-field
                  :model-value="solicitud.direccion"
                  label="Dirección"
                  readonly
                  variant="outlined"
                  density="comfortable"
                ></v-text-field>
              </v-col>
            </v-row>
            <v-row>
              <v-col cols="12" sm="6">
                <v-text-field
                  :model-value="solicitud.telefono"
                  label="Teléfono"
                  readonly
                  variant="outlined"
                  density="comfortable"
                ></v-text-field>
              </v-col>
              <v-col cols="12" sm="6">
                <v-text-field
                  :model-value="solicitud.email"
                  label="Email"
                  readonly
                  variant="outlined"
                  density="comfortable"
                ></v-text-field>
              </v-col>
            </v-row>

            <!-- Información de Vivienda -->
            <h3 class="mb-4 mt-6">Información de Vivienda</h3>
            <v-row>
              <v-col cols="12" sm="6">
                <v-text-field
                  :model-value="solicitud.tipoVivienda"
                  label="Tipo de vivienda"
                  readonly
                  variant="outlined"
                  density="comfortable"
                ></v-text-field>
              </v-col>
              <v-col cols="12" sm="6">
                <v-text-field
                  :model-value="solicitud.propiedadAlquiler"
                  label="Propiedad/Alquiler"
                  readonly
                  variant="outlined"
                  density="comfortable"
                ></v-text-field>
              </v-col>
            </v-row>
            <v-row>
              <v-col cols="12" sm="6">
                <v-checkbox
                  :model-value="solicitud.permiteAnimales"
                  label="¿Se permiten animales?"
                  readonly
                  disabled
                ></v-checkbox>
              </v-col>
              <v-col cols="12" sm="6">
                <v-text-field
                  :model-value="solicitud.numeroPersonas"
                  label="Número de personas"
                  readonly
                  variant="outlined"
                  density="comfortable"
                ></v-text-field>
              </v-col>
            </v-row>
            <v-row v-if="solicitud.hayNinos">
              <v-col cols="12">
                <v-text-field
                  :model-value="solicitud.edadesNinos"
                  label="Edades de los niños"
                  readonly
                  variant="outlined"
                  density="comfortable"
                ></v-text-field>
              </v-col>
            </v-row>

            <!-- Experiencia con Mascotas -->
            <h3 class="mb-4 mt-6">Experiencia con Mascotas</h3>
            <v-row>
              <v-col cols="12" sm="6">
                <v-checkbox
                  :model-value="solicitud.experienciaGatos"
                  label="¿Tiene experiencia con gatos?"
                  readonly
                  disabled
                ></v-checkbox>
              </v-col>
              <v-col cols="12" sm="6">
                <v-checkbox
                  :model-value="solicitud.tieneOtrosAnimales"
                  label="¿Tiene otros animales?"
                  readonly
                  disabled
                ></v-checkbox>
              </v-col>
            </v-row>
            <v-row>
              <v-col cols="12" sm="6">
                <v-checkbox
                  :model-value="solicitud.cortarUnas"
                  label="¿Sabe cortar uñas?"
                  readonly
                  disabled
                ></v-checkbox>
              </v-col>
              <v-col cols="12" sm="6">
                <v-checkbox
                  :model-value="solicitud.animalesVacunadosEsterilizados"
                  label="¿Animales vacunados/esterilizados?"
                  readonly
                  disabled
                ></v-checkbox>
              </v-col>
            </v-row>
            <v-row>
              <v-col cols="12">
                <v-textarea
                  :model-value="solicitud.historialMascotas"
                  label="Historial con mascotas"
                  readonly
                  variant="outlined"
                  density="comfortable"
                  auto-grow
                  rows="3"
                ></v-textarea>
              </v-col>
            </v-row>

            <!-- Compromiso y Responsabilidad -->
            <h3 class="mb-4 mt-6">Compromiso y Responsabilidad</h3>
            <v-row>
              <v-col cols="12">
                <v-textarea
                  :model-value="solicitud.motivacionAdopcion"
                  label="Motivación para adoptar"
                  readonly
                  variant="outlined"
                  density="comfortable"
                  auto-grow
                  rows="3"
                ></v-textarea>
              </v-col>
            </v-row>
            <v-row>
              <v-col cols="12">
                <v-textarea
                  :model-value="solicitud.problemasComportamiento"
                  label="Plan ante problemas de comportamiento"
                  readonly
                  variant="outlined"
                  density="comfortable"
                  auto-grow
                  rows="3"
                ></v-textarea>
              </v-col>
            </v-row>
            <v-row>
              <v-col cols="12">
                <v-textarea
                  :model-value="solicitud.enfermedadesCostosas"
                  label="Plan ante enfermedades costosas"
                  readonly
                  variant="outlined"
                  density="comfortable"
                  auto-grow
                  rows="3"
                ></v-textarea>
              </v-col>
            </v-row>
            <v-row>
              <v-col cols="12">
                <v-textarea
                  :model-value="solicitud.vacaciones"
                  label="Plan para vacaciones"
                  readonly
                  variant="outlined"
                  density="comfortable"
                  auto-grow
                  rows="3"
                ></v-textarea>
              </v-col>
            </v-row>
            <v-row>
              <v-col cols="12" sm="6">
                <v-checkbox
                  :model-value="solicitud.seguimientoPostAdopcion"
                  label="¿Acepta seguimiento post-adopción?"
                  readonly
                  disabled
                ></v-checkbox>
              </v-col>
              <v-col cols="12" sm="6">
                <v-checkbox
                  :model-value="solicitud.visitaHogar"
                  label="¿Acepta visita al hogar?"
                  readonly
                  disabled
                ></v-checkbox>
              </v-col>
            </v-row>

            <!-- Gestión de la Solicitud -->
            <h3 class="mb-4 mt-6">Gestión de la Solicitud</h3>
            <v-select
              v-model="nuevoEstado"
              :items="[
                { value: 'pendiente', text: 'Pendiente' },
                { value: 'aprobada', text: 'Aprobar solicitud' },
                { value: 'rechazada', text: 'Rechazar solicitud' }
              ]"
              item-title="text"
              item-value="value"
              label="Nuevo Estado"
              :rules="reglas.estado"
              class="mb-4"
              required
            ></v-select>
            
            <v-textarea
              v-model="comentarioProtectora"
              label="Comentario de la Protectora"
              rows="3"
              :rules="reglas.comentario"
              class="mb-4"
              required
            ></v-textarea>
          </div>
        </v-card-text>
        
        <v-card-actions class="protectora-admin__dialogo-acciones">
          <v-spacer></v-spacer>
          <v-btn
            color="grey"
            @click="dialogoDetallesSolicitud = false"
            class="me-2"
          >
            Cancelar
          </v-btn>
          <v-btn
            color="success"
            @click="actualizarEstado(solicitud)"
            :disabled="!nuevoEstado || !comentarioProtectora"
          >
            Guardar
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<style scoped lang="scss">
body {
  overflow-x: hidden;  /* Prevenir el desbordamiento horizontal */
}

.ContainerDetallesGatos {
  display: flex;
  justify-content: center;
  padding: 0;
  overflow-x: hidden;  /* Asegurarse de que no haya desbordamiento */
}

.titulo-detalles {
  margin-bottom: 10px;  /* Reducir margen para pantallas pequeñas */
  text-align: center;
  color: $color-principal;
  font-size: 1.5rem;  /* Ajuste para pantallas pequeñas */
}

.v-col-12 {
  flex: 0 0 100%;  /* Ajuste para dispositivos móviles */
  max-width: 100%;  /* Asegurarse de que no se exceda el ancho */
}

:deep(.v-alert.info) {
  background-color: $color-principal !important;
  border-color: $color-principal !important;
  color: white !important;
}

:deep(.v-btn.primary) {
  background-color: $color-principal !important;
  border-color: $color-principal !important;
}


.formulario-dialog {
  display: flex;
  flex-direction: column;
  height: 80vh;
  margin: 0;
  overflow-y: auto;  /* Habilitar scroll solo vertical */
  max-width: 600px;  /* Limitar el ancho del formulario */
  padding: 16px;

  :deep(.v-card) {
    border-radius: 0;
    box-shadow: none;
  }

  :deep(.v-card-text) {
    height: 100%;
    padding: 0;
  }

  &__titulo {
    background-color: $color-principal;
    color: $color-blanco;
    padding: 12px 16px;
    font-size: 1.1rem;
    position: sticky;
    top: 0;
    z-index: 1;
  }

  &__contenido {
    padding: 16px;

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
      &.v-checkbox--readonly {
        opacity: 0.7;
      }
    }

    :deep(.v-label) {
      font-size: 0.875rem;
      opacity: 0.8;
    }

    .v-row {
      margin: 0 -12px;
    }

    .v-col {
      padding: 12px;
    }
  }

  &__acciones {
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
  .formulario-dialog {
    background-color: #272727;

    &__contenido {
      h3 {
        border-bottom-color: $color-principal;
      }

      :deep(.v-text-field--readonly) {
        .v-field__input {
          color: rgba(255, 255, 255, 0.7);
        }
      }

      :deep(.v-textarea--readonly) {
        .v-field__input {
          color: rgba(255, 255, 255, 0.7);
        }
      }
    }

    &__acciones {
      background-color: #1e1e1e;
      border-top-color: rgba(255, 255, 255, 0.12);
    }
  }
}

@media (max-width: 600px) {
  .formulario-dialog {
    height: 100vh;
    margin: 0;
  }

  .v-btn.primary {
    width: 100%;  /* Botón de ancho completo en móviles */
    padding: 10px 20px;  /* Reducir padding */
    font-size: 0.9rem;  /* Ajustar texto */
  }

  .v-col-12 {
    padding: 0;
    width: 100%;  /* Asegurar que las columnas no excedan el ancho */
  }

  /* Ajustes para imágenes de gatos */
  .FotoDetallesGato {
    max-height: 200px;
    object-fit: cover;
  }

  .titulo-detalles {
    font-size: 1.2rem;  /* Reducir tamaño de título en móviles */
  }
}

@media (min-width: 1010px) {
  .v-container {
    margin-top: 105px;
  }

  .v-btn.primary {
    width: auto;
    padding: 12px 24px;  /* Aumentar tamaño en pantallas grandes */
  }
  
}

.protectora-admin__tabla {
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
  .Formcontainer {
  font-size: small;
}
}

.protectora-admin__dialogo {
  margin: 8px;
  width: auto;
  max-height: 90vh;
  overflow-y: auto;
  background-color: $color-blanco;
  color: #000000;
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
    :deep(.v-text-field), :deep(.v-select), :deep(.v-textarea) {
      font-size: 0.875rem;
      color: #000000;
      background-color: $color-blanco;
      &.v-text-field--readonly, &.v-textarea--readonly {
        .v-field__input {
          color: #000000;
        }
      }
    }
    :deep(.v-checkbox) {
      &.v-checkbox--readonly {
        opacity: 0.7;
      }
    }
    :deep(.v-label) {
      font-size: 0.875rem;
      opacity: 0.8;
      color: #000000;
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
  .protectora-admin__tabla {
    background-color: #272727;
    color: $color-blanco;
  }
  .protectora-admin__dialogo {
    background-color: #272727;
    color: $color-blanco;
    &-contenido {
      h3 {
        border-bottom-color: $color-principal;
      }
      :deep(.v-text-field), :deep(.v-select), :deep(.v-textarea) {
        color: $color-blanco;
        background-color: #272727;
        &.v-text-field--readonly, &.v-textarea--readonly {
          .v-field__input {
            color: $color-blanco;
          }
        }
      }
      :deep(.v-label) {
        color: $color-blanco;
      }
    }
    &-acciones {
      background-color: #1e1e1e;
      border-top-color: rgba(255, 255, 255, 0.12);
    }
  }
}




</style>