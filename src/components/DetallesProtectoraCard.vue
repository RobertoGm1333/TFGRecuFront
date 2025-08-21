<script setup lang="ts">
import { defineProps } from 'vue';
import type ProtectoraDto from '@/stores/dtos/protectoras.dto';
import { useI18n } from '@/stores/useI18n';

const { t, idioma } = useI18n(); // Obtener el idioma actual del store
const props = defineProps<{
  protectora: ProtectoraDto
}>();
</script>

<template>
  <v-card class="protectora-card-details">
    <div class="image-container">
      <v-img 
        :src="protectora.imagen_Protectora" 
        class="protectora-image"
        :height="250"
      ></v-img>
    </div>
    <v-card-title>{{ protectora.nombre_Protectora }}</v-card-title>
    <v-card-text>
      <div class="info-section">
        <p><strong>{{ t('protectora_direccion') }}:</strong> {{ protectora.direccion }}</p>
        <p><strong>{{ t('protectora_telefono') }}:</strong> {{ protectora.telefono_Protectora }}</p>
        <p><strong>{{ t('protectora_correo') }}:</strong> {{ protectora.correo_Protectora }}</p>
        <p v-if="protectora.pagina_Web">
          <strong>{{ t('pagina_protectora') }}:</strong> 
          <a :href="protectora.pagina_Web" target="_blank" rel="noopener noreferrer">
            {{ protectora.pagina_Web }}
          </a>
        </p>
      </div>

      <div class="description-section">
        <h3>{{ t('protectora_descripcion') }}</h3>
        <p>
          <!-- Verifica específicamente español e inglés con más claridad -->
          <template v-if="idioma === 'en'">
            {{ protectora.descripcion_Protectora_En }}
          </template>
          <template v-else>
            {{ protectora.descripcion_Protectora }}
          </template>
        </p>
      </div>

      <div class="map-section" v-if="protectora.ubicacion">
        <h3>{{ t('protectora_ubicacion') }}</h3>
        <div class="map-container">
          <iframe
            :src="protectora.ubicacion"
            class="google-map"
            style="border:0;"
            allowfullscreen="true"
            loading="lazy"
            referrerpolicy="no-referrer-when-downgrade"
          ></iframe>
        </div>
      </div>
    </v-card-text>
    <v-card-actions>
      <v-btn color="#FF5500" to="/protectoras">{{ t('volver_protectoras') }}</v-btn>
      <v-btn color="green" :href="`mailto:${protectora.correo_Protectora}`">
        {{ t('protectora_contactar') }}
      </v-btn>
    </v-card-actions>
  </v-card>
</template>

<style scoped lang="scss">
.protectora-card-details {
  width: 100%;
  max-width: 800px;
  margin: 0 auto;
  border-radius: $espacio-pequeno;
  overflow: hidden;
  box-sizing: border-box;

  @media (max-width: 599px) {
    width: 94%;
  }
}

.image-container {
  background-color: rgba(0, 0, 0, 0.05);
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  overflow: hidden;
}

.protectora-image {
  max-height: 250px;
  width: 100%;
  background-color: transparent;

  :deep(.v-img__img) {
    object-fit: contain;
  }
}

.v-card-text {
  width: 100%;
  box-sizing: border-box;
  word-wrap: break-word;
}

.info-section {
  margin: $espacio-mediano 0;
  width: 100%;
  box-sizing: border-box;
  
  p {
    margin-bottom: $espacio-pequeno;
    word-wrap: break-word;
  }
}

.map-section {
  margin: $espacio-mediano 0;

  h3 {
    color: $color-principal;
    margin-bottom: $espacio-pequeno;
  }
}

.map-container {
  position: relative;
  width: 100%;
  padding-bottom: 45%;
  height: 0;
  overflow: hidden;
  border-radius: $espacio-pequeno;
  box-shadow: $sombra-contenedor;
}

.google-map {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

.description-section {
  margin-top: $espacio-mediano;
  
  h3 {
    color: $color-principal;
    margin-bottom: $espacio-pequeno;
  }
  
  p {
    line-height: 1.5;
    text-align: justify;
  }
}

.v-card-actions {
  padding: $espacio-mediano;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: $espacio-pequeno;

  @media (max-width: 599px) {
    padding: $espacio-mediano calc(3% + #{$espacio-pequeno});
  }
}

// Tablet
@media (min-width: 600px) {
  .map-container {
    padding-bottom: 40%;
  }

  .v-card-actions {
    flex-wrap: nowrap;
  }
}

// Desktop
@media (min-width: 960px) {
  .protectora-card-details {
    padding: $espacio-mediano;
    width: 50%;
  }

  .map-container {
    padding-bottom: 35%;
  }
}
</style>