.<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useSolicitudesAdopcionStore } from '@/stores/solicitudesAdopcion';

const props = defineProps<{
  solicitudId: number;
  onSuccess?: () => void;
  onCancel?: () => void;
}>();

const emit = defineEmits(['success', 'cancel']);

const solicitudesStore = useSolicitudesAdopcionStore();
const solicitud = ref<any>(null);
const loading = ref(true);
const error = ref('');
const enviando = ref(false);

const respuesta = ref({
  estado: '',
  comentario_Protectora: ''
});

const estados = [
  { value: 'aprobada', text: 'Aprobar solicitud' },
  { value: 'rechazada', text: 'Rechazar solicitud' },
  { value: 'pendiente', text: 'Dejar pendiente' }
];

onMounted(async () => {
  try {
    loading.value = true;
    const solicitudData = await solicitudesStore.fetchSolicitudById(props.solicitudId);
    if (solicitudData) {
      solicitud.value = solicitudData;
      respuesta.value.estado = solicitudData.estado.toLowerCase();
      respuesta.value.comentario_Protectora = solicitudData.comentario_Protectora || '';
    }
  } catch (err) {
    error.value = 'Error al cargar la solicitud';
    console.error('Error al cargar la solicitud:', err);
  } finally {
    loading.value = false;
  }
});

async function enviarRespuesta() {
  if (!respuesta.value.estado) {
    error.value = 'Debes seleccionar un estado para la solicitud';
    return;
  }

  try {
    enviando.value = true;
    // Obtener el id_Protectora del localStorage
    const user = localStorage.getItem('user');
    if (!user) throw new Error('No hay sesión de usuario');
    const userData = JSON.parse(user);

    const protectoraResponse = await fetch(`http://localhost:5167/api/Protectora/usuario/${userData.id_Usuario}`);
    if (!protectoraResponse.ok) throw new Error('Error al obtener la información de la protectora');
    const protectoraData = await protectoraResponse.json();

    await solicitudesStore.updateEstadoSolicitud(
      props.solicitudId,
      respuesta.value.estado,
      respuesta.value.comentario_Protectora,
      protectoraData.id_Protectora
    );

    emit('success');
  } catch (err) {
    console.error('Error al enviar la respuesta:', err);
    if (err instanceof Error) {
      error.value = err.message;
    } else {
      error.value = 'Error al procesar la respuesta. Por favor, inténtalo de nuevo.';
    }
  } finally {
    enviando.value = false;
  }
}
</script>

<template>
  <v-card class="respuesta-protectora">
    <v-card-title class="respuesta-protectora__titulo">
      Solicitud de Adopción #{{ solicitudId }}
    </v-card-title>

    <v-card-text class="respuesta-protectora__contenido">
      <v-progress-circular
        v-if="loading"
        indeterminate
        color="primary"
      ></v-progress-circular>

      <template v-else-if="solicitud">
        <!-- Información del solicitante -->
        <div class="respuesta-protectora__seccion">
          <h3>Información Personal</h3>
          <v-row>
            <v-col cols="12" sm="6">
              <v-text-field
                v-model="solicitud.nombreCompleto"
                label="Nombre completo"
                readonly
                variant="outlined"
                density="comfortable"
              ></v-text-field>
            </v-col>
            <v-col cols="12" sm="6">
              <v-text-field
                v-model="solicitud.edad"
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
                v-model="solicitud.direccion"
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
                v-model="solicitud.telefono"
                label="Teléfono"
                readonly
                variant="outlined"
                density="comfortable"
              ></v-text-field>
            </v-col>
            <v-col cols="12" sm="6">
              <v-text-field
                v-model="solicitud.email"
                label="Email"
                readonly
                variant="outlined"
                density="comfortable"
              ></v-text-field>
            </v-col>
          </v-row>
        </div>

        <!-- Información de Vivienda -->
        <div class="respuesta-protectora__seccion">
          <h3>Información de Vivienda</h3>
          <v-row>
            <v-col cols="12" sm="6">
              <v-text-field
                v-model="solicitud.tipoVivienda"
                label="Tipo de vivienda"
                readonly
                variant="outlined"
                density="comfortable"
              ></v-text-field>
            </v-col>
            <v-col cols="12" sm="6">
              <v-text-field
                v-model="solicitud.propiedadAlquiler"
                label="Propiedad o alquiler"
                readonly
                variant="outlined"
                density="comfortable"
              ></v-text-field>
            </v-col>
          </v-row>

          <v-row>
            <v-col cols="12" sm="6">
              <v-checkbox
                v-model="solicitud.permiteAnimales"
                label="¿Se permiten animales?"
                readonly
                density="comfortable"
              ></v-checkbox>
            </v-col>
            <v-col cols="12" sm="6">
              <v-text-field
                v-model="solicitud.numeroPersonas"
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
                v-model="solicitud.edadesNinos"
                label="Edades de los niños"
                readonly
                variant="outlined"
                density="comfortable"
              ></v-text-field>
            </v-col>
          </v-row>
        </div>

        <!-- Experiencia con Mascotas -->
        <div class="respuesta-protectora__seccion">
          <h3>Experiencia con Mascotas</h3>
          <v-row>
            <v-col cols="12" sm="6">
              <v-checkbox
                v-model="solicitud.experienciaGatos"
                label="¿Tiene experiencia con gatos?"
                readonly
                density="comfortable"
              ></v-checkbox>
            </v-col>
            <v-col cols="12" sm="6">
              <v-checkbox
                v-model="solicitud.tieneOtrosAnimales"
                label="¿Tiene otros animales?"
                readonly
                density="comfortable"
              ></v-checkbox>
            </v-col>
          </v-row>

          <v-textarea
            v-model="solicitud.historialMascotas"
            label="Historial con mascotas"
            readonly
            variant="outlined"
            density="comfortable"
          ></v-textarea>
        </div>

        <!-- Compromiso y Responsabilidad -->
        <div class="respuesta-protectora__seccion">
          <h3>Compromiso y Responsabilidad</h3>
          <v-textarea
            v-model="solicitud.motivacionAdopcion"
            label="Motivación para adoptar"
            readonly
            variant="outlined"
            density="comfortable"
          ></v-textarea>

          <v-textarea
            v-model="solicitud.problemasComportamiento"
            label="Plan ante problemas de comportamiento"
            readonly
            variant="outlined"
            density="comfortable"
          ></v-textarea>

          <v-textarea
            v-model="solicitud.enfermedadesCostosas"
            label="Plan ante enfermedades costosas"
            readonly
            variant="outlined"
            density="comfortable"
          ></v-textarea>

          <v-textarea
            v-model="solicitud.vacaciones"
            label="Plan para vacaciones"
            readonly
            variant="outlined"
            density="comfortable"
          ></v-textarea>
        </div>

        <!-- Respuesta de la Protectora -->
        <div class="respuesta-protectora__seccion">
          <h3>Respuesta de la Protectora</h3>
          <v-select
            v-model="respuesta.estado"
            :items="estados"
            item-title="text"
            item-value="value"
            label="Estado de la solicitud *"
            :rules="[v => !!v || 'Debes seleccionar un estado']"
            required
          ></v-select>

          <v-textarea
            v-model="respuesta.comentario_Protectora"
            label="Comentario de la protectora"
            placeholder="Añade un comentario explicando tu decisión..."
            variant="outlined"
            density="comfortable"
            :rules="[v => !!v || 'Por favor, añade un comentario explicando tu decisión']"
            required
          ></v-textarea>
        </div>

        <v-alert
          v-if="error"
          type="error"
          variant="tonal"
          closable
          class="mt-4"
        >
          {{ error }}
        </v-alert>

        <!-- Botones de acción -->
        <div class="respuesta-protectora__acciones">
          <v-btn
            color="error"
            variant="outlined"
            @click="$emit('cancel')"
            :disabled="enviando"
          >
            Cancelar
          </v-btn>
          <v-btn
            color="primary"
            @click="enviarRespuesta"
            :loading="enviando"
          >
            Enviar respuesta
          </v-btn>
        </div>
      </template>
    </v-card-text>
  </v-card>
</template>

<style scoped lang="scss">
.respuesta-protectora {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: white;

  &__titulo {
    background-color: var(--v-theme-primary);
    color: white;
    padding: 16px 20px;
    font-size: 1.2rem;
    position: sticky;
    top: 0;
    z-index: 1;
  }

  &__contenido {
    flex: 1;
    overflow-y: auto;
    padding: 20px;
  }

  &__seccion {
    background: #f8f8f8;
    padding: 20px;
    border-radius: 8px;
    margin-bottom: 24px;
    
    h3 {
      color: var(--v-theme-primary);
      font-size: 1.1rem;
      margin-bottom: 16px;
      padding-bottom: 8px;
      border-bottom: 2px solid var(--v-theme-primary);
    }

    h4 {
      color: var(--v-theme-primary);
      font-size: 1rem;
      margin-bottom: 12px;
    }
  }

  &__acciones {
    position: sticky;
    bottom: 0;
    background: white;
    padding: 16px 0;
    display: flex;
    justify-content: flex-end;
    gap: 12px;
    margin-top: 24px;
    border-top: 1px solid rgba(0, 0, 0, 0.12);
  }

  .imagenes-container {
    margin-top: 16px;

    .imagen-preview {
      margin: 8px 0;
      max-width: 100%;
      overflow: hidden;
      border-radius: 4px;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);

      img {
        width: 100%;
        height: auto;
        display: block;
      }
    }
  }
}

@media (prefers-color-scheme: dark) {
  .respuesta-protectora {
    background: #272727;
    color: white;

    &__seccion {
      background: #1e1e1e;
    }

    &__acciones {
      background: #272727;
      border-top-color: rgba(255, 255, 255, 0.12);
    }
  }
}
</style>