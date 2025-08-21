<script setup lang="ts">
import { defineProps } from 'vue'
import type ProtectoraDto from '@/stores/dtos/protectoras.dto'
import { useI18n } from '@/stores/useI18n'

const { t } = useI18n();

const props = defineProps<{
  protectora: ProtectoraDto
}>()
</script>

<template>
  <v-card 
    class="protectora-card" 
    max-width="500"
    :to="{ name: 'protectora-details', params: { id: protectora.id_Protectora }}"
  >
    <v-img class="protectora-card__image" :src="protectora.imagen_Protectora" cover></v-img>
    <v-card-title class="protectora-card__title">{{ protectora.nombre_Protectora }}</v-card-title>
    <v-card-text class="protectora-card__content">
      <div class="protectora-card__direccion"><strong>{{ t('protectora_direccion') }}:</strong> {{ protectora.direccion }}</div>
      <div class="protectora-card__correo"><strong>{{ t('protectora_correo') }}:</strong> <span class="email-text"> <br>{{ protectora.correo_Protectora }}</span></div>
    </v-card-text>
  </v-card>
</template>

<style scoped lang="scss">
.protectora-card {
  cursor: pointer;
}

.protectora-card__image {
  max-height: 260px;
  min-height: 260px;
  width: 100%;
  margin: 0;
  padding: 0;

  :deep(.v-img__img) {
    object-fit: cover;
  }
}

.protectora-card__content {
  div {
    margin-bottom: $espacio-pequeno;
  }
}

.protectora-card__correo {
  .email-text {
    color: $color-principal;
  }
}
</style>