<script setup lang="ts">
import { defineProps } from 'vue'
import { useRouter } from 'vue-router'

interface ConsejoProps {
  imagen: string;
  titulo: string;
  descripcion: string;
  ruta?: string;
}

const router = useRouter()
const props = defineProps<ConsejoProps>()

const navegarAConsejo = () => {
  if (props.ruta) {
    router.push(props.ruta)
  }
}
</script>

<template>
  <v-card class="consejo-card" max-width="500" @click="navegarAConsejo">
    <v-img class="consejo-card__image" :src="imagen" cover></v-img>
    <v-card-title class="consejo-card__title">{{ titulo }}</v-card-title>
    <v-card-text class="consejo-card__content">
      <p class="consejo-card__descripcion">{{ descripcion }}</p>
    </v-card-text>
  </v-card>
</template>

<style scoped lang="scss">
.consejo-card {
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  cursor: pointer;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
  }
}

.consejo-card__image {
  max-height: 260px;
  min-height: 260px;
  width: 100%;
  margin: 0;
  padding: 0;

  :deep(.v-img__img) {
    object-fit: cover;
  }
}

.consejo-card__title {
  font-size: 1.5rem;
  color: $color-principal;
  margin-bottom: $espacio-pequeno;
  white-space: normal;
  word-wrap: break-word;
  line-height: 1.2;
  padding: $espacio-pequeno $espacio-pequeno 0;
}

.consejo-card__content {
  padding: $espacio-mediano;
}

.consejo-card__descripcion {
  font-family: $fuente-textos;
  line-height: 1.6;
  color: #333;
}

@media (prefers-color-scheme: dark) {
  .consejo-card {
    background: rgba(39, 39, 39, 0.9);
  }

  .consejo-card__descripcion {
    color: #ddd;
  }
}
</style>
