<script setup lang="ts">
import ConsejoCard from '@/components/ConsejoCard.vue'
import { useI18n } from '@/stores/useI18n'
import { computed } from 'vue'

const { t } = useI18n()

const consejos = computed(() => [
  {
    imagen: '../../Images/consejos/condicion-corporal.png',
    titulo: t('consejo_condicion_titulo'),
    descripcion: t('consejo_condicion_descripcion'),
    ruta: '/condicion-corporal'
  },
  {
    imagen: '../../Images/consejos/viaje-gato.png',
    titulo: t('consejo_viaje_titulo'),
    descripcion: t('consejo_viaje_descripcion'),
    ruta: '/viajar-gatos'
  },
  {
    imagen: '../../Images/consejos/cuidado-basico.jpg',
    titulo: t('cuidado_basico_titulo'),
    descripcion: t('cuidado_basico_descripcion'),
    ruta: '/cuidado-basico'
  },
  {
    imagen: '../../Images/consejos/controlar-reproduccion.png',
    titulo: t('control_reproduccion_titulo'),
    descripcion: t('control_reproduccion_descripcion'),
    ruta: '/control-reproduccion'
  },
  {
    imagen: '../../Images/consejos/presentacion-bebe.png',
    titulo: t('presentacion_bebe_titulo'),
    descripcion: t('presentacion_bebe_descripcion'),
    ruta: '/presentacion-bebe'
  },
  {
    imagen: '../../Images/consejos/otros-animales.png',
    titulo: t('otros_animales_titulo'),
    descripcion: t('otros_animales_descripcion'),
    ruta: '/convivencia-animales'
  }
])
</script>

<template>
  <div class="consejos-expertos-view">
    <div class="consejos-header">
      <h1>{{ t('consejos_expertos') }}</h1>
      <p class="consejos-descripcion">
        {{ t('consejos_descripcion') }}
      </p>
    </div>

    <div class="consejos-grid">
      <ConsejoCard
        v-for="consejo in consejos"
        :key="consejo.titulo"
        :imagen="consejo.imagen"
        :titulo="consejo.titulo"
        :descripcion="consejo.descripcion"
        :ruta="consejo.ruta"
      />
    </div>
  </div>
</template>

<style scoped lang="scss">
.consejos-expertos-view {
  padding: $espacio-grande;
  max-width: 1400px;
  margin: 0 auto;
}

.consejos-header {
  text-align: center;
  margin-bottom: $espacio-extra-grande;

  h1 {
    color: $color-principal;
    font-size: 2.5rem;
    margin-bottom: $espacio-mediano;
  }
}

.consejos-descripcion {
  font-family: $fuente-textos;
  font-size: 1.2rem;
  color: #666;
  max-width: 800px;
  margin: 0 auto;
  line-height: 1.6;
}

.consejos-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: $espacio-grande;
  padding: $espacio-mediano;
}

@media (prefers-color-scheme: dark) {
  .consejos-descripcion {
    color: #aaa;
  }
}

@media (max-width: 768px) {
  .consejos-expertos-view {
    padding: $espacio-mediano;
  }

  .consejos-header {
    h1 {
      font-size: 2rem;
    }
  }

  .consejos-descripcion {
    font-size: 1.1rem;
  }

  .consejos-grid {
    grid-template-columns: 1fr;
    padding: 10px;
  }
}
</style>

