<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { usegatosStore } from '@/stores/gatos';
import { useAutenticacion } from '@/stores/Autentificacion';
import DeseadosGatoCard from '@/components/DeseadosGatoCard.vue';
import { useI18n } from '@/stores/useI18n';

const { t } = useI18n();
const Autenticacion = useAutenticacion();
const gatosStore = usegatosStore();

// Filtrado de gatos visibles
const gatosDeseados = computed(() =>
  gatosStore.gatosDeseados.filter(g => {
    const gato = g as any;
    return gato.visible === true;
  })
);

// Estado para controlar la visualización del mensaje
const mostrarMensaje = ref(false);

onMounted(async () => {
  Autenticacion.cargarUsuarioDesdeLocalStorage();

  if (Autenticacion.usuario?.id_Usuario) {
    await gatosStore.obtenerGatosDeseados(Autenticacion.usuario.id_Usuario);
  }
  console.log('Gatos deseados al montar la vista:', gatosDeseados.value);

  // Esperar 1 segundo antes de mostrar el mensaje si no hay gatos
  setTimeout(() => {
    mostrarMensaje.value = gatosDeseados.value.length === 0;
  }, 500);
});
</script>

<template>
  <div class="deseados">
    <h1 class="deseados__titulo">{{ t('mis_gatos_deseados') }}</h1>

    <!-- Mostrar mensaje solo después de 1 segundo si no hay gatos -->
    <p v-if="mostrarMensaje" class="deseados__mensaje">
      <img src="../../Images/gatos/Blanqui.png" alt="Gato deseado">
      {{ t('no_gatos_deseados') }}
    </p>

    <div v-else class="deseados__lista">
      <DeseadosGatoCard v-for="gato in gatosDeseados" :key="gato.id_Gato" :gato="gato"/>
    </div>
  </div>
</template>

<style scoped lang="scss">
.deseados {
  max-width: 100%;
  margin: $espacio-grande auto;
  text-align: center;

  &__titulo {
    font-size: 2rem;
    margin-bottom: $espacio-grande;
    color: $color-principal;
  }

  &__mensaje {
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

  .gato-card {
    width: 90%;
    max-width: 400px;
    height: 338px;
  }
}

@media (min-width: 600px) {
  .deseados__lista {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (min-width: 1024px) {
  .deseados {
    max-width: 1200px;
    margin-top: 95px;
  }

  .deseados__lista {
    grid-template-columns: repeat(3, 1fr);
  }
}
</style>
