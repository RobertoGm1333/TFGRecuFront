<template>
  <div class="cuidado-basico-view">
    <!-- Banner section -->
    <div class="banner" :style="{ backgroundImage: 'url(../../Images/consejos/background-banner.png)' }">
      <h1>{{ t('otros_animales_titulo') }}</h1>
    </div>

    <!-- Content section -->
    <div class="content">
      <div class="content-container">
        <img 
          src="../../Images/consejos/otros-animales.png" 
          alt="otros_animales con otros animales" 
          class="main-image" 
          @click="showZoomDialog = true"
        />

        <!-- Dialog para imagen ampliada -->
        <v-dialog
          v-model="showZoomDialog"
          max-width="90vw"
          max-height="90vh"
          :persistent="false"
          :scrim="true"
          @update:model-value="closeDialog"
        >
          <div class="zoom-overlay" @click="closeDialog">
            <div class="zoom-container" @click.stop>
              <v-btn
                icon
                @click="closeDialog"
                class="close-button"
              >
                <v-icon>mdi-close</v-icon>
              </v-btn>
              <div 
                class="image-wrapper"
                @mousedown="startDrag"
                @mousemove="doDrag"
                @mouseup="stopDrag"
                @mouseleave="stopDrag"
                @touchstart="startTouch"
                @touchmove="doTouch"
                @touchend="stopTouch"
                @click="handleImageClick"
              >
                <img 
                  src="../../Images/consejos/otros-animales.png" 
                  alt="Cuidado básico en mascotas" 
                  class="zoomed-image"
                  :class="{ 
                    'can-zoom': !isZoomedIn,
                    'is-dragging': isDragging
                  }"
                  :style="{
                    transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.scale})`,
                    cursor: isZoomedIn ? (isDragging ? 'grabbing' : 'grab') : 'zoom-in'
                  }"
                  @dragstart.prevent
                />
              </div>
            </div>
          </div>
        </v-dialog>
        
        <div class="text-content">
          <section class="content-section">
            <p>{{ t('otros_animales_p1') }}</p>
            <p>{{ t('otros_animales_p2') }}</p>
          </section>
  
          <section class="content-section">
            <p class="destacado">{{ t('otros_animales_posible_titulo') }}</p>
          <p>{{ t('otros_animales_posible_p') }}</p>
          </section>

          <section class="content-section">
            <p class="destacado">{{ t('otros_animales_presentaciones_titulo') }}</p>
            <p>{{ t('otros_animales_presentaciones_p') }}</p>
          </section>

          <section class="content-section">
            <p class="destacado">{{ t('otros_animales_rutinas_titulo') }}</p>
            <p>{{ t('otros_animales_rutinas_p') }}</p>
          </section>

          <section class="content-section">
            <p class="destacado">{{ t('otros_animales_senales_mal_titulo') }}</p>
            <p>{{ t('otros_animales_senales_mal_p') }}</p>
          </section>

          <section class="content-section">
            <p class="destacado">{{ t('otros_animales_no_funciona_titulo') }}</p>
            <p>{{ t('otros_animales_no_funciona_p') }}</p>
          </section>
          <section class="content-section">
            <p >{{ t('otros_animales_conclusion') }}</p>
          </section>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from '@/stores/useI18n'

const { t } = useI18n()
const showZoomDialog = ref(false)
const isZoomedIn = ref(false)
const transform = ref({ x: 0, y: 0, scale: 1 })
const isDragging = ref(false)
const startPosition = ref({ x: 0, y: 0 })
const hasMoved = ref(false)

const handleImageClick = (event: MouseEvent | TouchEvent) => {
  // Si estábamos arrastrando, no consideramos esto como un click
  if (hasMoved.value) {
    hasMoved.value = false
    return
  }

  // Si no está zoomeado, hacer zoom
  if (!isZoomedIn.value) {
    const rect = (event.target as HTMLElement).getBoundingClientRect()
    let x: number, y: number
    
    if (event instanceof TouchEvent && event.touches.length > 0) {
      x = event.touches[0].clientX - rect.left
      y = event.touches[0].clientY - rect.top
    } else if (event instanceof MouseEvent) {
      x = event.clientX - rect.left
      y = event.clientY - rect.top
    } else {
      return
    }
    
    const centerX = (x / rect.width) * 100
    const centerY = (y / rect.height) * 100
    
    transform.value = {
      x: (50 - centerX) * 1.5,
      y: (50 - centerY) * 1.5,
      scale: 2
    }
    isZoomedIn.value = true
  } else {
    // Si está zoomeado y es un click sin arrastre, resetear zoom
    resetZoom()
  }
}

// Funciones para eventos de mouse (PC)
const startDrag = (event: MouseEvent) => {
  if (isZoomedIn.value && event.buttons === 1) {
    isDragging.value = true
    hasMoved.value = false
    startPosition.value = {
      x: event.clientX - transform.value.x,
      y: event.clientY - transform.value.y
    }
    event.preventDefault()
  }
}

const doDrag = (event: MouseEvent) => {
  if (isDragging.value && isZoomedIn.value && event.buttons === 1) {
    performDrag(event.clientX, event.clientY)
    event.preventDefault()
  } else if (isDragging.value) {
    stopDrag()
  }
}

const stopDrag = () => {
  isDragging.value = false
}

// Funciones para eventos táctiles (móvil)
const startTouch = (event: TouchEvent) => {
  if (isZoomedIn.value && event.touches.length === 1) {
    isDragging.value = true
    hasMoved.value = false
    const touch = event.touches[0]
    startPosition.value = {
      x: touch.clientX - transform.value.x,
      y: touch.clientY - transform.value.y
    }
    event.preventDefault()
  }
}

const doTouch = (event: TouchEvent) => {
  if (isDragging.value && isZoomedIn.value && event.touches.length === 1) {
    const touch = event.touches[0]
    performDrag(touch.clientX, touch.clientY)
    event.preventDefault()
  }
}

const stopTouch = (event: TouchEvent) => {
  if (isDragging.value) {
    isDragging.value = false
    event.preventDefault()
  }
}

// Función común para realizar el arrastre
const performDrag = (clientX: number, clientY: number) => {
  const deltaX = Math.abs(clientX - (startPosition.value.x + transform.value.x))
  const deltaY = Math.abs(clientY - (startPosition.value.y + transform.value.y))
  
  if (deltaX > 5 || deltaY > 5) {
    hasMoved.value = true
  }

  // Calcular la nueva posición
  const newX = clientX - startPosition.value.x
  const newY = clientY - startPosition.value.y

  // Calcular los límites para mantener la imagen dentro del contenedor
  const maxMovement = 100 // Límite de movimiento en píxeles
  
  transform.value = {
    ...transform.value,
    x: Math.max(Math.min(newX, maxMovement), -maxMovement),
    y: Math.max(Math.min(newY, maxMovement), -maxMovement)
  }
}

const resetZoom = () => {
  transform.value = { x: 0, y: 0, scale: 1 }
  isZoomedIn.value = false
  isDragging.value = false
  hasMoved.value = false
}

const closeDialog = () => {
  showZoomDialog.value = false
  resetZoom()
}
</script>

<style scoped lang="scss">
.cuidado-basico-view {
  width: 100%;
  min-height: 100vh;
}

.banner {
  width: 100%;
  height: 300px;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.4);
  }

  h1 {
    color: white;
    font-size: 3rem;
    text-align: center;
    position: relative;
    z-index: 1;
    padding: 0 20px;
    font-weight: bold;
  }
}

.content {
  padding: 40px 0;
  background-color: #f8f9fa;
}

.content-container {
  width: 100%;
  max-width: none;
  margin: 0 auto;
}

.main-image {
  width: 100%;
  max-width: none;
  height: 400px;
  margin: 0 0 40px;
  display: block;
  object-fit: cover;
  object-position: center;
  cursor: pointer;
  transition: opacity 0.3s ease;

  &:hover {
    opacity: 0.9;
  }
}

.text-content {
  width: 100%;
  max-width: none;
  margin: 0 auto;
  padding: 0 20px;
  color: #666;
  font-size: 1.1rem;
  line-height: 1.8;
}

.content-section {
  margin-bottom: 2.5rem;
  max-width: none;

  h2 {
    font-size: 1.4rem;
    color: #444;
    margin-bottom: 1.2rem;
    font-weight: 600;
  }

  p {
    margin-bottom: 1.5rem;
    line-height: 1.8;
    color: #666;
  }

  .destacado {
    font-size: 1.2rem;
    font-weight: bold;
    margin-bottom: 1rem;
    line-height: 1.6;
  }

  ul {
    list-style-type: disc;
    margin-left: 2.5rem;
    margin-bottom: 1.5rem;
    color: #666;

    li {
      margin-bottom: 0.8rem;
      line-height: 1.8;
      padding-left: 0.5rem;
    }
  }
}

.zoom-overlay {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px;
}

.zoom-container {
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  background: transparent;
}

.image-wrapper {
  position: relative;
  overflow: hidden;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  touch-action: none; // Prevenir gestos táctiles por defecto
}

.zoomed-image {
  max-width: 100%;
  max-height: 85vh;
  object-fit: contain;
  width: auto;
  height: auto;
  transition: transform 0.3s ease;
  transform-origin: center;
  user-select: none;
  -webkit-user-drag: none;
  -webkit-touch-callout: none; // Prevenir menú contextual en iOS
  -webkit-user-select: none;   // Prevenir selección en iOS
  
  &.can-zoom:hover {
    cursor: zoom-in;
  }

  &.is-dragging {
    transition: none;
    cursor: grabbing !important;
  }
}

.close-button {
  position: absolute;
  top: -40px;
  right: -40px;
  z-index: 1;
  background: rgba(0, 0, 0, 0.5) !important;
  color: white !important;
}

.wsava-link {
  display: inline-block;
  color: $color-principal;
  text-decoration: none;
  font-weight: 500;
  padding: 4px 8px;
  transition: all 0.3s ease;
  border-radius: 4px;

  &:hover {
    color: darken($color-principal, 10%);
    background-color: rgba($color-principal, 0.1);
  }

  &:focus {
    outline: none;
    box-shadow: 0 0 0 2px rgba($color-principal, 0.3);
  }
}

@media (max-width: 768px) {
  .banner {
    height: 200px;

    h1 {
      font-size: 2rem;
    }
  }

  .content {
    padding: 20px 0;
  }

  .text-content {
    padding: 0 25px;
  }

  .content-section {
    h2 {
      font-size: 1.3rem;
    }

    p {
      font-size: 1rem;
    }

    .destacado {
      font-size: 1.2rem;
    }

    ul li {
      font-size: 1rem;
    }
  }

  .main-image {
    height: 250px;
  }

  .close-button {
    top: 8px;
    right: 8px;
  }

  .zoom-overlay {
    padding: 10px;
  }
}

@media (prefers-color-scheme: dark) {
  .content {
    background-color: #1a1a1a;
  }

  .content-section {
    p, ul, li {
      color: #b0b0b0;
    }

    h2, .destacado {
      color: #d0d0d0;
    }
  }

  .wsava-link {
    color: lighten($color-principal, 15%);

    &:hover {
      color: lighten($color-principal, 25%);
      background-color: rgba(lighten($color-principal, 15%), 0.1);
    }

    &:focus {
      box-shadow: 0 0 0 2px rgba(lighten($color-principal, 15%), 0.3);
    }
  }
}
</style>