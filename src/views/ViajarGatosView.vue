<template>
  <div class="viajar-gatos-view">
    <!-- Banner section -->
    <div class="banner" :style="{ backgroundImage: 'url(../../Images/consejos/background-banner.png)' }">
      <h1>{{ t('viajar_gatos_titulo') }}</h1>
    </div>

    <!-- Content section -->
    <div class="content">
      <div class="content-container">
        <img 
          src="../../Images/consejos/viaje-gato.png" 
          alt="Viajar con gatos" 
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
                  src="../../Images/consejos/viaje-gato.png" 
                  :alt="t('viajar_gatos_titulo')" 
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
            <p>{{ t('viajar_gatos_p1') }}</p>
          </section>

          <section class="content-section">
            <p>{{ t('viajar_gatos_p2') }}</p>
          </section>

          <section class="content-section">
            <p>{{ t('viajar_gatos_antes_titulo') }}</p>
            <ul>
              <li>{{ t('viajar_gatos_antes_1') }}</li>
              <li>{{ t('viajar_gatos_antes_2') }}</li>
              <li>{{ t('viajar_gatos_antes_3') }}</li>
              <li>{{ t('viajar_gatos_antes_4') }}</li>
            </ul>
          </section>

          <section class="content-section">
            <p>{{ t('viajar_gatos_durante_titulo') }}</p>
            <ul>
              <li>{{ t('viajar_gatos_durante_1') }}</li>
              <li>{{ t('viajar_gatos_durante_2') }}</li>
              <li>{{ t('viajar_gatos_durante_3') }}</li>
              <li>{{ t('viajar_gatos_durante_4') }}</li>
            </ul>
          </section>

          <section class="content-section">
            <p>{{ t('viajar_gatos_destino_titulo') }}</p>
            <ul>
              <li>{{ t('viajar_gatos_destino_1') }}</li>
              <li>{{ t('viajar_gatos_destino_2') }}</li>
              <li>{{ t('viajar_gatos_destino_3') }}</li>
            </ul>
          </section>

          <section class="content-section">
            <p>{{ t('viajar_gatos_conclusion') }}</p>
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

// Función unificada para obtener coordenadas tanto de mouse como de touch
const getEventCoordinates = (event: MouseEvent | TouchEvent) => {
  if (event instanceof TouchEvent) {
    return {
      clientX: event.touches[0]?.clientX || event.changedTouches[0]?.clientX || 0,
      clientY: event.touches[0]?.clientY || event.changedTouches[0]?.clientY || 0
    }
  }
  return {
    clientX: event.clientX,
    clientY: event.clientY
  }
}

// Función unificada para obtener el rect del target
const getTargetRect = (event: MouseEvent | TouchEvent) => {
  const target = event.target as HTMLElement
  return target.getBoundingClientRect()
}

const handleImageClick = (event: MouseEvent | TouchEvent) => {
  if (hasMoved.value) {
    hasMoved.value = false
    return
  }

  if (!isZoomedIn.value) {
    const rect = getTargetRect(event)
    const coords = getEventCoordinates(event)
    const x = coords.clientX - rect.left
    const y = coords.clientY - rect.top
    
    const centerX = (x / rect.width) * 100
    const centerY = (y / rect.height) * 100
    
    transform.value = {
      x: (50 - centerX) * 1.5,
      y: (50 - centerY) * 1.5,
      scale: 2
    }
    isZoomedIn.value = true
  } else {
    resetZoom()
  }
}

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

// Nueva función para manejar touch start
const startTouch = (event: TouchEvent) => {
  if (isZoomedIn.value && event.touches.length === 1) {
    isDragging.value = true
    hasMoved.value = false
    const coords = getEventCoordinates(event)
    startPosition.value = {
      x: coords.clientX - transform.value.x,
      y: coords.clientY - transform.value.y
    }
    event.preventDefault()
  }
}

const doDrag = (event: MouseEvent) => {
  if (isDragging.value && isZoomedIn.value && event.buttons === 1) {
    performDrag(event, event.clientX, event.clientY)
    event.preventDefault()
  } else if (isDragging.value) {
    stopDrag()
  }
}

// Nueva función para manejar touch move
const doTouch = (event: TouchEvent) => {
  if (isDragging.value && isZoomedIn.value && event.touches.length === 1) {
    const coords = getEventCoordinates(event)
    performDrag(event, coords.clientX, coords.clientY)
    event.preventDefault()
  } else if (isDragging.value) {
    stopTouch()
  }
}

// Función unificada para realizar el arrastre
const performDrag = (event: MouseEvent | TouchEvent, clientX: number, clientY: number) => {
  const deltaX = Math.abs(clientX - (startPosition.value.x + transform.value.x))
  const deltaY = Math.abs(clientY - (startPosition.value.y + transform.value.y))
  
  if (deltaX > 5 || deltaY > 5) {
    hasMoved.value = true
  }

  // Obtener el contenedor y la imagen
  const container = event.currentTarget as HTMLElement
  const image = container.querySelector('.zoomed-image') as HTMLElement

  if (container && image) {
    // Calcular los límites basados en el tamaño de la imagen y el zoom
    const imageRect = image.getBoundingClientRect()
    const maxX = (imageRect.width * (transform.value.scale - 1)) / 2
    const maxY = (imageRect.height * (transform.value.scale - 1)) / 2

    // Calcular la nueva posición limitada
    const newX = clientX - startPosition.value.x
    const newY = clientY - startPosition.value.y

    transform.value = {
      ...transform.value,
      x: Math.max(Math.min(newX, maxX), -maxX),
      y: Math.max(Math.min(newY, maxY), -maxY)
    }
  }
}

const stopDrag = () => {
  isDragging.value = false
}

// Nueva función para detener el touch
const stopTouch = () => {
  isDragging.value = false
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
.viajar-gatos-view {
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
  width: auto;
  max-width: 600px;
  height: auto;
  margin: 0 auto 40px;
  display: block;
  cursor: pointer;
  transition: opacity 0.3s ease;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);

  &:hover {
    opacity: 0.9;
    transform: translateY(-2px);
    box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
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
  touch-action: none;
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

    ul li {
      font-size: 1rem;
    }
  }

  .main-image {
    max-width: 90%;
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

    h2 {
      color: #d0d0d0;
    }
  }
}
</style>