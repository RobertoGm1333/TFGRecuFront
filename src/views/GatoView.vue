<script setup lang="ts">
import { usegatosStore } from '@/stores/gatos'
import GatoCard from '@/components/GatoCard.vue'
import FiltrosGato from '@/components/FiltrosGato.vue'
import { computed, ref } from 'vue'
import { useI18n } from '@/stores/useI18n'

const store = usegatosStore()

store.fetchGato()

const { t } = useI18n()

const edadMinima = ref(1)
const edadMaxima = ref(15)
const razaSeleccionada = ref('')

// Función para actualizar los filtros desde el componente hijo
const actualizarFiltros = (filtros) => {
  edadMinima.value = filtros.edadMin
  edadMaxima.value = filtros.edadMax
  razaSeleccionada.value = filtros.razaSeleccionada
  // Al aplicar filtros, volvemos a la página 1
  paginaActual.value = 1
}

// Gatos filtrados como propiedad computada
const gatosFiltrados = computed(() => {
  return store.gatos.filter(gato => {
    const visible = gato.visible === true
    // Filtrar por edad
    const edadEnRango = gato.edad >= edadMinima.value && gato.edad <= edadMaxima.value
    
    // Filtrar por raza (si hay una seleccionada)
    const razaCoincide = razaSeleccionada.value === '' || gato.raza === razaSeleccionada.value
    
    return visible && edadEnRango && razaCoincide
  })
})

// Paginación
const gatosPorPagina = 12
const paginaActual = ref(1)

// Función para obtener los gatos de la página actual
const gatosPaginados = computed(() => {
  const startIndex = (paginaActual.value - 1) * gatosPorPagina
  const endIndex = paginaActual.value * gatosPorPagina
  return gatosFiltrados.value.slice(startIndex, endIndex)
})

// Cambiar página
const cambiarPagina = (pagina) => {
  paginaActual.value = pagina
}

// Calcular el total de páginas
const totalPaginas = computed(() => {
  return Math.ceil(gatosFiltrados.value.length / gatosPorPagina)
})
</script>

<template>
  <v-container fluid>
    <!-- Componente de filtros desplegable horizontal -->
    <v-row>
      <v-col cols="12">
        <FiltrosGato @actualizar-filtros="actualizarFiltros" />
      </v-col>
    </v-row>
    
    <!-- Contenido principal con los gatos filtrados -->
    <v-row class="justify-center">
      <!-- Mensaje si no hay gatos que coincidan con los filtros -->
      <v-col v-if="gatosFiltrados.length === 0" cols="12" class="NoFiltroContenedor">
        <v-alert
          text="Todavía no tenemos gatos que cumplan estas condiciones."
          class="NoFiltro"
        ></v-alert>
      </v-col>
      
      <!-- Mostrar los gatos filtrados -->
      <v-col v-for="gato in gatosPaginados" :key="gato.id_Gato" cols="12" sm="6" md="4" lg="3">
        <GatoCard :gato="gato" style="object-fit: cover;"/>
      </v-col>
    </v-row>

    <!-- Paginación -->
    <v-row justify="center" class="my-4">
      <v-btn @click="cambiarPagina(paginaActual - 1)" :disabled="paginaActual === 1">
        {{ t('anterior') }}
      </v-btn>
      
      <span class="mx-2">{{ t('pagina') }} {{ paginaActual }} {{ t('de') }} {{ totalPaginas }}</span>
      
      <v-btn @click="cambiarPagina(paginaActual + 1)" :disabled="paginaActual === totalPaginas">
        {{ t('siguiente') }}
      </v-btn>
    </v-row>
  </v-container>
</template>

<style scoped lang="scss">
.v-row + .v-row {
  margin-top: 8px;
  padding-right: 0%;
  padding-left: 2%;
}

.NoFiltroContenedor {
  display: flex;
  justify-content: center;
}

.NoFiltro {
  background-color: $color-principal;
  max-width: 500px;
  display: flex;
  justify-content: center;
  color:$color-blanco;
}

:deep(.v-btn.primary),
:deep(.v-alert.info) {
  background-color: $color-principal !important;
  border-color: $color-principal !important;
}

@media (min-width: 620px) {
  .v-row + .v-row {
  padding-left: 0%;
  }
}
</style>
