<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue';
import { useAutenticacion } from '@/stores/Autentificacion';
import { useSolicitudesAdopcionStore } from '@/stores/solicitudesAdopcion';

const props = defineProps<{
  idGato: number;
  nombreGato: string;
  onSuccess: () => void;
  onCancel: () => void;
}>();

const emit = defineEmits(['success', 'cancel']);

const handleEscKey = (event: KeyboardEvent) => {
  if (event.key === 'Escape') {
    emit('cancel');
  }
};

onMounted(() => {
  document.addEventListener('keydown', handleEscKey);
});

onBeforeUnmount(() => {
  document.removeEventListener('keydown', handleEscKey);
});

const autenticacion = useAutenticacion();
const solicitudesStore = useSolicitudesAdopcionStore();

const reglas = {
  required: (v: any) => !!v || 'Este campo es obligatorio',
  numero: (v: number) => v > 0 || 'El número debe ser positivo',
  email: (v: string) => /.+@.+\\..+/.test(v) || 'El email debe ser válido',
  telefono: (v: string) => /^\\d{9}$/.test(v) || 'El teléfono debe tener 9 dígitos',
  soloNumeros: (v: string) => !v || /^\\d+$/.test(v) || 'Solo se permiten números'
};

// Valores por defecto para los campos
const formulario = ref({
  nombreCompleto: '',
  edad: null as number | null,
  direccion: '',
  dni: '',
  telefono: '',
  email: '',
  tipoVivienda: '',
  propiedadAlquiler: '',
  permiteAnimales: false,
  numeroPersonas: null as number | null,
  hayNinos: false,
  edadesNinos: '',
  experienciaGatos: false,
  tieneOtrosAnimales: false,
  cortarUnas: false,
  animalesVacunadosEsterilizados: false,
  historialMascotas: '',
  motivacionAdopcion: '',
  problemasComportamiento: '',
  enfermedadesCostosas: '',
  vacaciones: '',
  seguimientoPostAdopcion: false,
  visitaHogar: false
});

const form = ref<any>(null);
const enviando = ref(false);
const error = ref('');

async function enviarSolicitud() {
  console.log("Iniciando envío de solicitud...");
  
  if (!autenticacion.usuario?.id_Usuario) {
    error.value = 'Debes iniciar sesión para enviar una solicitud';
    return;
  }

  const { valid } = await form.value.validate();
  
  if (!valid) {
    error.value = 'Por favor, completa todos los campos obligatorios marcados en rojo';
    // Hacer scroll al primer error
    const firstError = document.querySelector('.v-input.error');
    if (firstError) {
      firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
    return;
  }

  try {
    enviando.value = true;
    error.value = '';

    // Asegurarse de que los valores no sean nulos
    const solicitud = {
      id_Solicitud: 0,
      id_Usuario: autenticacion.usuario.id_Usuario,
      id_Gato: props.idGato,
      fecha_Solicitud: new Date(),
      estado: 'pendiente',
      nombreCompleto: formulario.value.nombreCompleto?.trim() || '',
      edad: formulario.value.edad || null,
      direccion: formulario.value.direccion?.trim() || '',
      dni: formulario.value.dni?.trim() || '',
      telefono: formulario.value.telefono?.trim() || '',
      email: formulario.value.email?.trim() || '',
      tipoVivienda: formulario.value.tipoVivienda || '',
      propiedadAlquiler: formulario.value.propiedadAlquiler || '',
      permiteAnimales: formulario.value.permiteAnimales === true,
      numeroPersonas: formulario.value.numeroPersonas || null,
      hayNinos: formulario.value.hayNinos === true,
      edadesNinos: formulario.value.edadesNinos?.trim() || '',
      experienciaGatos: formulario.value.experienciaGatos === true,
      tieneOtrosAnimales: formulario.value.tieneOtrosAnimales === true,
      cortarUnas: formulario.value.cortarUnas === true,
      animalesVacunadosEsterilizados: formulario.value.animalesVacunadosEsterilizados === true,
      historialMascotas: formulario.value.historialMascotas?.trim() || '',
      motivacionAdopcion: formulario.value.motivacionAdopcion?.trim() || '',
      problemasComportamiento: formulario.value.problemasComportamiento?.trim() || '',
      enfermedadesCostosas: formulario.value.enfermedadesCostosas?.trim() || '',
      vacaciones: formulario.value.vacaciones?.trim() || '',
      seguimientoPostAdopcion: formulario.value.seguimientoPostAdopcion === true,
      visitaHogar: formulario.value.visitaHogar === true,
      comentario_Protectora: ''
    };

    try {
      console.log('Enviando solicitud:', JSON.stringify(solicitud, null, 2));
      await solicitudesStore.createSolicitud(solicitud);
      console.log('Solicitud enviada correctamente');
      emit('success');
    } catch (err) {
      console.error('Error al enviar la solicitud:', err);
      if (err instanceof Error) {
        error.value = `Error: ${err.message}`;
      } else {
        error.value = 'Error al enviar la solicitud. Por favor, inténtalo de nuevo.';
      }
    }
  } catch (err) {
    console.error('Error en la validación o procesamiento:', err);
    if (err instanceof Error) {
      error.value = `Error: ${err.message}`;
    } else {
      error.value = 'Error al procesar la solicitud. Por favor, inténtalo de nuevo.';
    }
  } finally {
    enviando.value = false;
  }
}
</script>

<template>
  <v-card class="formulario-adopcion">
    <v-card-title class="formulario-adopcion__titulo">
      Solicitud de Adopción para {{ nombreGato }}
    </v-card-title>

    <v-card-text class="formulario-adopcion__contenido">
      <v-form 
        ref="form"
        @submit.prevent="enviarSolicitud"
        class="formulario-adopcion__form"
        validate-on="submit"
      >
        <!-- Información Personal -->
        <div class="formulario-adopcion__seccion">
          <h3>Información Personal</h3>
          <v-row>
            <v-col cols="12" sm="6">
              <v-text-field
                v-model="formulario.nombreCompleto"
                label="Nombre completo *"
                :rules="[v => !!v || 'El nombre es obligatorio']"
                required
              ></v-text-field>
            </v-col>
            <v-col cols="12" sm="6">
              <v-text-field
                v-model="formulario.edad"
                label="Edad *"
                type="number"
                :rules="[
                  v => !!v || 'La edad es obligatoria',
                  v => v > 17 || 'Debes ser mayor de edad'
                ]"
                required
              ></v-text-field>
            </v-col>
          </v-row>

          <v-row>
            <v-col cols="12">
              <v-text-field
                v-model="formulario.direccion"
                label="Dirección completa *"
                :rules="[v => !!v || 'La dirección es obligatoria']"
                required
              ></v-text-field>
            </v-col>
          </v-row>

          <v-row>
            <v-col cols="12" sm="6">
              <v-text-field
                v-model="formulario.dni"
                label="DNI/NIE *"
                :rules="[
                  v => !!v || 'El DNI/NIE es obligatorio',
                  v => /^[0-9]{8}[A-Z]$|^[XYZ][0-9]{7}[A-Z]$/.test(v) || 'DNI/NIE no válido'
                ]"
                required
              ></v-text-field>
            </v-col>
            <v-col cols="12" sm="6">
              <v-text-field
                v-model="formulario.telefono"
                label="Teléfono *"
                :rules="[
                  v => !!v || 'El teléfono es obligatorio',
                  v => /^[0-9]{9}$/.test(v) || 'Teléfono no válido'
                ]"
                required
              ></v-text-field>
            </v-col>
          </v-row>

          <v-row>
            <v-col cols="12">
              <v-text-field
                v-model="formulario.email"
                label="Email *"
                :rules="[
                  v => !!v || 'El email es obligatorio',
                  v => /.+@.+\..+/.test(v) || 'Email no válido'
                ]"
                required
              ></v-text-field>
            </v-col>
          </v-row>
        </div>

        <!-- Información de Vivienda -->
        <div class="formulario-adopcion__seccion">
          <h3>Información de Vivienda</h3>
          <v-row>
            <v-col cols="12" sm="6">
              <v-select
                v-model="formulario.tipoVivienda"
                :items="['Piso', 'Casa', 'Chalet', 'Otro']"
                label="Tipo de vivienda *"
                :rules="[v => !!v || 'El tipo de vivienda es obligatorio']"
                required
              ></v-select>
            </v-col>
            <v-col cols="12" sm="6">
              <v-select
                v-model="formulario.propiedadAlquiler"
                :items="['Propiedad', 'Alquiler']"
                label="Propiedad o alquiler *"
                :rules="[v => !!v || 'Este campo es obligatorio']"
                required
              ></v-select>
            </v-col>
          </v-row>

          <v-row>
            <v-col cols="12" sm="6">
              <v-checkbox
                v-model="formulario.permiteAnimales"
                label="¿Se permiten animales? *"
                :rules="[v => v || 'Debe permitirse tener animales']"
                required
              ></v-checkbox>
            </v-col>
            <v-col cols="12" sm="6">
              <v-text-field
                v-model="formulario.numeroPersonas"
                label="Número de personas en la vivienda *"
                type="number"
                :rules="[v => !!v || 'Este campo es obligatorio']"
                required
              ></v-text-field>
            </v-col>
          </v-row>

          <v-row>
            <v-col cols="12" sm="6">
              <v-checkbox
                v-model="formulario.hayNinos"
                label="¿Hay niños?"
              ></v-checkbox>
            </v-col>
            <v-col cols="12" sm="6" v-if="formulario.hayNinos">
              <v-text-field
                v-model="formulario.edadesNinos"
                label="Edades de los niños *"
                :rules="[v => !formulario.hayNinos || !!v || 'Indique las edades']"
              ></v-text-field>
            </v-col>
          </v-row>
        </div>

        <!-- Experiencia con Mascotas -->
        <div class="formulario-adopcion__seccion">
          <h3>Experiencia con Mascotas</h3>

          <v-checkbox
            v-model="formulario.experienciaGatos"
            label="¿Tiene experiencia con gatos? *"
            :rules="[v => v !== null || 'Debes indicar si tienes experiencia con gatos']"
            required
          ></v-checkbox>

          <v-checkbox
            v-model="formulario.tieneOtrosAnimales"
            label="¿Tiene otros animales? *"
            :rules="[v => v !== null || 'Debes indicar si tienes otros animales']"
            required
          ></v-checkbox>

          <v-checkbox
            v-model="formulario.cortarUnas"
            label="¿Sabe cortar uñas? *"
            :rules="[v => v !== null || 'Debes indicar si sabes cortar uñas']"
            required
          ></v-checkbox>

          <v-checkbox
            v-model="formulario.animalesVacunadosEsterilizados"
            label="¿Animales vacunados/esterilizados? *"
            :rules="[v => v !== null || 'Debes indicar si tus animales están vacunados/esterilizados']"
            required
          ></v-checkbox>

          <v-textarea
            v-model="formulario.historialMascotas"
            label="Historial con mascotas *"
            :rules="[reglas.required]"
            required
          ></v-textarea>
        </div>

        <!-- Compromiso y Responsabilidad -->
        <div class="formulario-adopcion__seccion">
          <h3>Compromiso y Responsabilidad</h3>

          <v-textarea
            v-model="formulario.motivacionAdopcion"
            label="Motivación para adoptar *"
            :rules="[reglas.required]"
            required
          ></v-textarea>

          <v-textarea
            v-model="formulario.problemasComportamiento"
            label="¿Qué harías ante problemas de comportamiento? *"
            :rules="[reglas.required]"
            required
          ></v-textarea>

          <v-textarea
            v-model="formulario.enfermedadesCostosas"
            label="¿Qué harías ante enfermedades costosas? *"
            :rules="[reglas.required]"
            required
          ></v-textarea>

          <v-textarea
            v-model="formulario.vacaciones"
            label="Plan para vacaciones *"
            :rules="[reglas.required]"
            required
          ></v-textarea>

          <v-checkbox
            v-model="formulario.seguimientoPostAdopcion"
            label="¿Acepta seguimiento post-adopción? *"
            :rules="[v => v || 'Debes aceptar el seguimiento post-adopción']"
            required
          ></v-checkbox>

          <v-checkbox
            v-model="formulario.visitaHogar"
            label="¿Acepta visita al hogar? *"
            :rules="[v => v || 'Debes aceptar la visita al hogar']"
            required
          ></v-checkbox>
        </div>

        <!-- Botones de acción -->
        <div class="formulario-adopcion__acciones">
          <v-btn
            color="error"
            variant="outlined"
            @click="emit('cancel')"
            :disabled="enviando"
          >
            Cancelar
          </v-btn>
          <v-btn
            color="primary"
            type="submit"
            :loading="enviando"
          >
            Enviar solicitud
          </v-btn>
        </div>

        <v-alert
          v-if="error"
          type="error"
          class="mt-4"
          variant="tonal"
          closable
        >
          {{ error }}
        </v-alert>
      </v-form>
    </v-card-text>
  </v-card>
</template>

<style scoped lang="scss">
.formulario-adopcion {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: white;

  &__titulo {
    background-color: $color-principal;
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

  &__form {
    display: flex;
    flex-direction: column;
    gap: 24px;
  }

  &__seccion {
    background: #f8f8f8;
    padding: 20px;
    border-radius: 8px;
    
    h3 {
      color: $color-principal;
      font-size: 1.1rem;
      margin-bottom: 16px;
      padding-bottom: 8px;
      border-bottom: 2px solid $color-principal;
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

  :deep(.v-input.error) {
    .v-field {
      border-color: rgb(var(--v-theme-error)) !important;
    }
    
    .v-messages {
      color: rgb(var(--v-theme-error));
      font-size: 0.875rem;
      margin-top: 4px;
    }
  }

  :deep(.v-checkbox.error) {
    .v-selection-control {
      color: rgb(var(--v-theme-error));
    }
    
    .v-messages {
      color: rgb(var(--v-theme-error));
      font-size: 0.875rem;
      margin-top: 4px;
    }
  }
}

@media (prefers-color-scheme: dark) {
  .formulario-adopcion {
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