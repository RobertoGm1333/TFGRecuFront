<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';
import { useprotectorasStore } from '@/stores/protectoras';
import DetallesProtectoraCard from "@/components/DetallesProtectoraCard.vue";

const route = useRoute();
const store = useprotectorasStore();
const cargando = ref(true);

onMounted(async () => {
  try {
    const protectoraId = Number(route.params.id);
    await store.fetchProtectoraById(protectoraId);
  } catch (error) {
    console.error('Error al cargar la protectora:', error);
  } finally {
    cargando.value = false;
  }
});
</script>

<template>
  <v-container class="pa-0 overflow-x-hidden">
    <h1 v-if="store.currentProtectora" class="titulo-detalles">
      {{ store.currentProtectora.nombre_Protectora }}
    </h1>
    <v-row justify="center" class="ma-0" no-gutters>
      <v-col cols="12" md="9" class="container-detalles-protectora pa-0">
        <DetallesProtectoraCard 
          v-if="store.currentProtectora" 
          :protectora="store.currentProtectora" 
        />
        <v-alert v-else-if="cargando" type="info" class="ma-4">Cargando...</v-alert>
        <v-alert v-else type="error" class="ma-4">No se encontró la protectora.</v-alert>
      </v-col>
    </v-row>
  </v-container>
</template>

<style scoped lang="scss">
.container-detalles-protectora {
  display: flex;
  justify-content: center;
  max-width: 100%;
  width: 100%;
  overflow-x: hidden;
  
  @media (max-width: 599px) {
    padding: 0 3% !important;
  }
}

.titulo-detalles {
  margin: $espacio-grande 0;
  text-align: center;
  color: $color-principal;
  font-size: 1.5rem;
  padding: 0 2%;

  @media (min-width: 600px) {
    font-size: 2rem;
    padding: 0;
  }
}

:deep(.v-alert.info) {
  background-color: $color-principal !important;
  border-color: $color-principal !important;
  color: white !important;
}

.v-container {
  padding-top: $espacio-grande;
  min-height: 100vh;
  width: 100%;
  max-width: 100vw;
  box-sizing: border-box;
  
  @media (min-width: 600px) {
    padding-top: calc($espacio-grande * 2);
    padding-left: $espacio-mediano;
    padding-right: $espacio-mediano;
  }

  @media (min-width: 1010px) {
    margin-top: 95px;
    padding-top: $espacio-grande;
    max-width: 1200px;
  }
}

// Ajustes para modo oscuro
@media (prefers-color-scheme: dark) {
  .titulo-detalles {
    color: lighten($color-principal, 10%);
  }
}
</style> 