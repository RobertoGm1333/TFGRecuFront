<template>
  <div class="faq-page-wrapper my-4">
    <v-container class="px-4">
      <v-row justify="center">
        <v-col cols="12" sm="10" md="9" lg="8">
          <v-sheet rounded="lg" elevation="1" class="pa-0 mb-4">
            <div class="faq-title text-center py-3">{{ t('faq_titulo') }}</div>
            <v-divider></v-divider>
            
            <div class="px-2 py-1">
              <v-expansion-panels
                variant="accordion"
                multiple
                class="bg-transparent"
              >
                <v-expansion-panel
                  v-for="(categoria, i) in faq"
                  :key="i"
                  class="mb-1 rounded border-0 bg-transparent"
                  elevation="0"
                >
                  <v-expansion-panel-title class="py-1 px-2 rounded category-title" color="white">
                    {{ categoria.titulo }}
                  </v-expansion-panel-title>
                  
                  <v-expansion-panel-text class="px-2 pt-1 pb-2">
                    <div
                      v-for="(pregunta, j) in categoria.preguntas"
                      :key="j"
                      class="faq-item py-1"
                    >
                      <div class="faq-question mb-1">{{ pregunta.pregunta }}</div>
                      <div class="faq-answer">{{ pregunta.respuesta }}</div>
                      <v-divider v-if="j < categoria.preguntas.length - 1" class="my-1"></v-divider>
                    </div>
                  </v-expansion-panel-text>
                </v-expansion-panel>
              </v-expansion-panels>
            </div>
          </v-sheet>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<style scoped lang="scss">
.faq-page-wrapper {
  background-color: transparent;
  padding-top: 0;

  @media (min-width: 1024px) {
    padding-top: 110px; /* Adjust this value based on your header height */
  }
}

.faq-title {
  font-size: 1.25rem;
  font-weight: 500;
  color: #333;

  @media (max-width: 479px) {
    font-size: 1.1rem;
  }
}

.category-title {
  font-size: 0.9rem !important;
  font-weight: 500 !important;
  background-color: $color-blanco !important;
  color: #333 !important;
  border: 1px solid #e0e0e0;

  @media (max-width: 479px) {
    font-size: 0.85rem !important;
  }
}

.faq-question {
  font-size: 0.875rem;
  font-weight: 600;
  color: #424242;
  line-height: 1.2;

  @media (max-width: 479px) {
    font-size: 0.8125rem;
  }
}

.faq-answer {
  font-size: 0.8125rem;
  color: #616161;
  line-height: 1.3;
  padding-left: 4px;
  padding-right: 4px;

  @media (max-width: 479px) {
    font-size: 0.75rem;
    padding-left: 2px;
    padding-right: 2px;
  }
}

@media (max-width: 479px) {
  :deep(.v-expansion-panel-title) {
    min-height: 36px !important;
    padding: 4px 8px !important;
  }

  :deep(.v-expansion-panel-text__wrapper) {
    padding: 0 8px 6px !important;
  }
}

/* Ensure expansion panels don't touch the edges and are $color-blanco */
:deep(.v-expansion-panel) {
  background-color: $color-blanco !important;
  box-shadow: none !important;
  border-bottom: 1px solid rgba(0, 0, 0, 0.1) !important;
}

:deep(.v-expansion-panel-title__overlay) {
  background-color: rgba(255, 255, 255, 0.05) !important;
}

:deep(.v-expansion-panel--active) {
  margin: 0 !important;
}

:deep(.v-expansion-panels) {
  box-shadow: none !important;
}

:deep(.v-expansion-panel-title) {
  background-color: $color-blanco !important;
  padding-left: 8px !important;
  padding-right: 8px !important;
}

:deep(.v-expansion-panel-text) {
  padding-left: 8px !important;
  padding-right: 8px !important;
}
</style>

<script setup lang="ts">
import { ref, computed } from "vue";
import { useI18n } from "@/stores/useI18n";

const { t } = useI18n();

// Usar computed para que las traducciones se actualicen cuando cambie el idioma
const faq = computed(() => [
  {
    titulo: t('faq_plataforma'),
    preguntas: [
      { pregunta: t('faq_que_es'), respuesta: t('faq_que_es_respuesta') },
      { pregunta: t('faq_como_funciona'), respuesta: t('faq_como_funciona_respuesta') },
      { pregunta: t('faq_pertenece'), respuesta: t('faq_pertenece_respuesta') },
    ],
  },
  {
    titulo: t('faq_adopcion'),
    preguntas: [
      { pregunta: t('faq_como_adoptar'), respuesta: t('faq_como_adoptar_respuesta') },
      { pregunta: t('faq_coste'), respuesta: t('faq_coste_respuesta') },
      { pregunta: t('faq_requisitos'), respuesta: t('faq_requisitos_respuesta') },
      { pregunta: t('faq_fuera'), respuesta: t('faq_fuera_respuesta') },
      { pregunta: t('faq_otros_animales'), respuesta: t('faq_otros_animales_respuesta') },
    ],
  },
  {
    titulo: t('faq_gatos'),
    preguntas: [
      { pregunta: t('faq_vacunados'), respuesta: t('faq_vacunados_respuesta') },
      { pregunta: t('faq_conocer'), respuesta: t('faq_conocer_respuesta') },
      { pregunta: t('faq_adaptacion'), respuesta: t('faq_adaptacion_respuesta') },
      { pregunta: t('faq_personalidad'), respuesta: t('faq_personalidad_respuesta') },
    ],
  },
  {
    titulo: t('faq_web'),
    preguntas: [
      { pregunta: t('faq_contacto'), respuesta: t('faq_contacto_respuesta') },
      { pregunta: t('faq_desaparecen'), respuesta: t('faq_desaparecen_respuesta') },
      { pregunta: t('faq_voluntario'), respuesta: t('faq_voluntario_respuesta') },
      { pregunta: t('faq_donacion'), respuesta: t('faq_donacion_respuesta') },
      { pregunta: t('faq_problema'), respuesta: t('faq_problema_respuesta') },
    ],
  },
]);
</script>