<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useAutenticacion } from '@/stores/Autentificacion';
import { useSolicitudesAdopcionStore } from '@/stores/solicitudesAdopcion';
import { storeToRefs } from 'pinia';
import type SolicitudAdopcionDto from '@/stores/dtos/solicitudadopcion.dto';
import { useI18n } from '@/stores/useI18n';

const { t } = useI18n();
interface SolicitudExtendida extends SolicitudAdopcionDto {
  nombre_Gato?: string;
  imagen_Gato?: string;
  showDetails?: boolean;
}

const autenticacion = useAutenticacion();
const solicitudesStore = useSolicitudesAdopcionStore();
const { solicitudes } = storeToRefs(solicitudesStore);
const cargandoSolicitudes = ref(true);

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

// Función para cargar las solicitudes del usuario
async function cargarMisSolicitudes() {
  if (!autenticacion.usuario?.id_Usuario) return;
  
  cargandoSolicitudes.value = true;
  try {
    await solicitudesStore.fetchMisSolicitudes();

    // Obtener los nombres y las imágenes de los gatos para cada solicitud
    for (const solicitud of solicitudes.value as SolicitudExtendida[]) {
      const response = await fetch(`http://localhost:5167/api/Gato/${solicitud.id_Gato}`);
      if (response.ok) {
        const gato = await response.json();
        solicitud.nombre_Gato = gato.nombre_Gato;
        solicitud.imagen_Gato = gato.imagen_Gato;
        solicitud.showDetails = false;
      }
    }
  } catch (error) {
    console.error('Error al cargar solicitudes:', error);
  } finally {
    cargandoSolicitudes.value = false;
  }
}

onMounted(async () => {
  autenticacion.cargarUsuarioDesdeLocalStorage();
  await cargarMisSolicitudes();
});
</script>

<template>
  <div class="solicitudes">
    <h1 class="solicitudes__titulo">{{ t('mis_solicitudes') }}</h1>

    <v-alert v-if="cargandoSolicitudes" type="info" class="solicitudes__cargando solicitudes__alert">
      {{ t('cargando_solicitudes') }}
    </v-alert>

    <div v-else-if="solicitudes.length === 0" class="solicitudes__vacio">
      <img src="../../Images/gatos/Blanqui.png" alt="Sin solicitudes">
      <p>{{ t('no_solicitudes_realizadas') }}</p>
    </div>

    <div v-else class="solicitudes__lista">
      <v-card v-for="solicitud in solicitudes" :key="solicitud.id_Solicitud" class="solicitud-card">
        <div class="solicitud-card__contenido">
          <div class="solicitud-card__imagen">
            <v-img
              :src="(solicitud as SolicitudExtendida).imagen_Gato"
              :alt="(solicitud as SolicitudExtendida).nombre_Gato"
              height="200"
              cover
            ></v-img>
          </div>
          <div class="solicitud-card__info">
            <v-card-title>{{ (solicitud as SolicitudExtendida).nombre_Gato }}</v-card-title>
            <v-card-text>
              <p><strong>{{ t('estado_solicitud') }}:</strong> 
                <v-chip
                  :color="solicitud.estado.toLowerCase() === 'pendiente' ? 'orange' : 
                         solicitud.estado.toLowerCase() === 'aceptada' ? 'green' : 
                         solicitud.estado.toLowerCase() === 'rechazada' ? 'red' : 'grey'"
                  text-color="white"
                  small
                >
                  {{ solicitud.estado.charAt(0).toUpperCase() + solicitud.estado.slice(1).toLowerCase() }}
                </v-chip>
              </p>
              <p><strong>{{ t('fecha_solicitud') }}:</strong> {{ formatearFechaHora(solicitud.fecha_Solicitud) }}</p>
              <template v-if="solicitud.comentario_Protectora">
                <p><strong>{{ t('respuesta_protectora') }}:</strong> {{ solicitud.comentario_Protectora }}</p>
              </template>

              <v-btn
                color="primary"
                variant="text"
                @click="(solicitud as SolicitudExtendida).showDetails = !(solicitud as SolicitudExtendida).showDetails"
                class="mt-2"
              >
                {{ (solicitud as SolicitudExtendida).showDetails ? t('ocultar_detalles') : t('ver_detalles') }}
                <v-icon>{{ (solicitud as SolicitudExtendida).showDetails ? 'mdi-chevron-up' : 'mdi-chevron-down' }}</v-icon>
              </v-btn>

              <div v-if="(solicitud as SolicitudExtendida).showDetails" class="solicitud-card__detalles">
                <!-- Información Personal -->
                <h3>{{ t('informacion_personal') }}</h3>
                <div class="detalles-seccion">
                  <p><strong>{{ t('nombre') }}:</strong> {{ solicitud.nombreCompleto }}</p>
                  <p><strong>{{ t('edad') }}:</strong> {{ solicitud.edad }} {{ t('años') }}</p>
                  <p><strong>{{ t('direccion') }}:</strong> {{ solicitud.direccion }}</p>
                  <p><strong>{{ t('telefono') }}:</strong> {{ solicitud.telefono }}</p>
                  <p><strong>{{ t('email') }}:</strong> {{ solicitud.email }}</p>
                </div>

                <!-- Información de Vivienda -->
                <h3>{{ t('informacion_vivienda') }}</h3>
                <div class="detalles-seccion">
                  <p><strong>{{ t('tipo_vivienda') }}:</strong> {{ solicitud.tipoVivienda }}</p>
                  <p><strong>{{ t('propiedad_alquiler') }}:</strong> {{ solicitud.propiedadAlquiler }}</p>
                  <p><strong>{{ t('permite_animales') }}</strong> {{ solicitud.permiteAnimales ? t('si') : t('no') }}</p>
                  <p><strong>{{ t('numero_personas') }}:</strong> {{ solicitud.numeroPersonas }}</p>
                  <p v-if="solicitud.hayNinos"><strong>{{ t('edades_niños') }}:</strong> {{ solicitud.edadesNinos }}</p>
                </div>

                <!-- Experiencia con Mascotas -->
                <h3>{{ t('experiencia_mascotas') }}</h3>
                <div class="detalles-seccion">
                  <p><strong>{{ t('experiencia_gatos') }}</strong> {{ solicitud.experienciaGatos ? t('si') : t('no') }}</p>
                  <p><strong>{{ t('tiene_otros_animales') }}</strong> {{ solicitud.tieneOtrosAnimales ? t('si') : t('no') }}</p>
                  <p><strong>{{ t('sabe_cortar_uñas') }}</strong> {{ solicitud.cortarUnas ? t('si') : t('no') }}</p>
                  <p><strong>{{ t('animales_vacunados') }}</strong> {{ solicitud.animalesVacunadosEsterilizados ? t('si') : t('no') }}</p>
                  <p><strong>{{ t('historial_mascotas') }}:</strong> {{ solicitud.historialMascotas }}</p>
                </div>

                <!-- Compromiso y Responsabilidad -->
                <h3>{{ t('compromiso_responsabilidad') }}</h3>
                <div class="detalles-seccion">
                  <p><strong>{{ t('motivacion_adopcion') }}:</strong> {{ solicitud.motivacionAdopcion }}</p>
                  <p><strong>{{ t('plan_comportamiento') }}:</strong> {{ solicitud.problemasComportamiento }}</p>
                  <p><strong>{{ t('plan_enfermedades') }}:</strong> {{ solicitud.enfermedadesCostosas }}</p>
                  <p><strong>{{ t('plan_vacaciones') }}:</strong> {{ solicitud.vacaciones }}</p>
                  <p><strong>{{ t('acepta_seguimiento') }}</strong> {{ solicitud.seguimientoPostAdopcion ? t('si') : t('no') }}</p>
                  <p><strong>{{ t('acepta_visita') }}</strong> {{ solicitud.visitaHogar ? t('si') : t('no') }}</p>
                </div>
              </div>
            </v-card-text>
          </div>
        </div>
      </v-card>
    </div>
  </div>
</template>

<style scoped lang="scss">
.solicitudes {
  max-width: 100%;
  margin: $espacio-grande auto;
  text-align: center;
  padding: 0 $espacio-grande;

  &__titulo {
    font-size: 2rem;
    margin-bottom: $espacio-grande;
    color: $color-principal;
  }

  &__cargando {
    max-width: 600px;
    margin: 0 auto;
  }

  &__alert {
    background-color: $color-principal !important;
    border-color: $color-principal !important;
    color: $color-blanco !important;
  }

  &__vacio {
    font-size: 1.2rem;
    color: gray;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 10px;

    img {
      width: 150px;
      height: auto;
    }
  }

  &__lista {
    display: grid;
    grid-template-columns: 1fr;
    gap: $espacio-grande;
    justify-items: center;
  }
}

.solicitud-card {
  width: 90%;
  max-width: 800px;
  margin: 0 auto;

  &__contenido {
    display: flex;
    flex-direction: column;

    @media (min-width: 768px) {
      flex-direction: row;
    }
  }

  &__imagen {
    width: 100%;
    
    @media (min-width: 768px) {
      width: 300px;
      min-width: 300px;
    }

    .v-img {
      border-radius: 8px 8px 0 0;

      @media (min-width: 768px) {
        border-radius: 8px 0 0 8px;
      }
    }
  }

  &__info {
    flex: 1;
    padding: $espacio-mediano;
  }

  &__detalles {
    margin-top: $espacio-mediano;
    text-align: left;

    h3 {
      color: $color-principal;
      font-size: 1.1rem;
      margin: $espacio-mediano 0 $espacio-pequeno;
      padding-bottom: $espacio-pequeno;
      border-bottom: 2px solid $color-principal;
    }

    .detalles-seccion {
      margin-bottom: $espacio-mediano;
      padding: 0 $espacio-pequeno;

      p {
        margin: $espacio-pequeno 0;
        line-height: 1.4;
      }
    }
  }

  .v-card-title {
    color: $color-principal;
    font-size: 1.2rem;
  }

  .v-card-text p {
    margin-bottom: 0.5rem;
    text-align: left;
  }
}

@media (min-width: 1024px) {
  .solicitudes {
    max-width: 1200px;
    margin-top: 95px;
  }
}

@media (prefers-color-scheme: dark) {
  .solicitud-card {
    background-color: #272727;
    color: whitesmoke;
    
    .v-card-title {
      color: $color-principal;
    }

    &__detalles {
      h3 {
        border-bottom-color: $color-principal;
      }
    }
  }
}
</style> 