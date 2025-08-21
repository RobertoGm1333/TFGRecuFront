<template>
  <div class="condicion-corporal-view">
    <!-- Banner section -->
    <div class="banner" :style="{ backgroundImage: 'url(../../Images/consejos/background-banner.png)' }">
      <h1>{{ t('condicion_corporal_titulo') }}</h1>
    </div>

    <!-- Content section -->
    <div class="content">
      <div class="content-container">
        <img 
          src="../../Images/consejos/condicion-corporal.png" 
          alt="Condición corporal en mascotas" 
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
                @touchstart="startDrag"
                @touchmove="doDrag"
                @touchend="stopDrag"
                @touchcancel="stopDrag"
                @click="handleImageClick"
              >
                <img 
                  src="../../Images/consejos/condicion-corporal.png" 
                  alt="Condición corporal en mascotas" 
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
            <p>{{ t('condicion_corporal_p1') }}</p>
          </section>

          <section class="content-section">
            <p>{{ t('condicion_corporal_p2') }}</p>
          </section>

          <section class="content-section">
            <p>{{ t('condicion_corporal_p3') }}</p>
          </section>

          <section class="content-section">
            <p>{{ t('condicion_corporal_ideal') }}</p>
            <ul>
              <li>{{ t('condicion_corporal_punto1') }}</li>
              <li>{{ t('condicion_corporal_punto2') }}</li>
              <li>{{ t('condicion_corporal_punto3') }}</li>
            </ul>
          </section>

          <section class="content-section">
            <p>{{ t('condicion_corporal_variaciones') }}</p>
            <p>{{ t('condicion_corporal_medidas') }}</p>
            <ul>
              <li>{{ t('condicion_corporal_medida1') }}</li>
              <li>{{ t('condicion_corporal_medida2') }}</li>
              <li>{{ t('condicion_corporal_medida3') }}</li>
              <li>{{ t('condicion_corporal_medida4') }}</li>
            </ul>
          </section>

          <section class="content-section">
            <p>{{ t('condicion_corporal_conclusion') }}</p>
          </section>

          <section class="content-section">
            <p>{{ t('condicion_corporal_guias') }}</p>
            <a 
              href="../../Images/consejos/condicion-corporal.pdf" 
              target="_blank" 
              rel="noopener noreferrer" 
              class="wsava-link"
            >
              {{ t('condicion_corporal_wsava') }}
            </a>
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

// Función para obtener las coordenadas del evento (mouse o touch)
const getEventCoordinates = (event: MouseEvent | TouchEvent) => {
  if (event.type.startsWith('touch')) {
    const touchEvent = event as TouchEvent
    const touch = touchEvent.touches[0] || touchEvent.changedTouches[0]
    return { x: touch.clientX, y: touch.clientY }
  } else {
    const mouseEvent = event as MouseEvent
    return { x: mouseEvent.clientX, y: mouseEvent.clientY }
  }
}

// Función para verificar si el evento está activo (botón presionado o touch activo)
const isEventActive = (event: MouseEvent | TouchEvent) => {
  if (event.type.startsWith('touch')) {
    const touchEvent = event as TouchEvent
    return touchEvent.touches.length > 0
  } else {
    const mouseEvent = event as MouseEvent
    return mouseEvent.buttons === 1
  }
}

const handleImageClick = (event: MouseEvent | TouchEvent) => {
  // Si estábamos arrastrando, no consideramos esto como un click
  if (hasMoved.value) {
    hasMoved.value = false
    return
  }

  // Si no está zoomeado, hacer zoom
  if (!isZoomedIn.value) {
    const coordinates = getEventCoordinates(event)
    const rect = (event.target as HTMLElement).getBoundingClientRect()
    const x = coordinates.x - rect.left
    const y = coordinates.y - rect.top
    
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

const startDrag = (event: MouseEvent | TouchEvent) => {
  if (isZoomedIn.value && isEventActive(event)) {
    isDragging.value = true
    hasMoved.value = false
    
    const coordinates = getEventCoordinates(event)
    startPosition.value = {
      x: coordinates.x - transform.value.x,
      y: coordinates.y - transform.value.y
    }
    
    event.preventDefault() // Prevenir comportamiento por defecto
  }
}

const doDrag = (event: MouseEvent | TouchEvent) => {
  if (isDragging.value && isZoomedIn.value && isEventActive(event)) {
    const coordinates = getEventCoordinates(event)
    const deltaX = Math.abs(coordinates.x - (startPosition.value.x + transform.value.x))
    const deltaY = Math.abs(coordinates.y - (startPosition.value.y + transform.value.y))
    
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
      const newX = coordinates.x - startPosition.value.x
      const newY = coordinates.y - startPosition.value.y

      transform.value = {
        ...transform.value,
        x: Math.max(Math.min(newX, maxX), -maxX),
        y: Math.max(Math.min(newY, maxY), -maxY)
      }
    }

    event.preventDefault() // Prevenir comportamiento por defecto
  } else if (isDragging.value && !isEventActive(event)) {
    // Si no hay interacción activa pero estábamos arrastrando, detener
    stopDrag()
  }
}

const stopDrag = () => {
  isDragging.value = false
  // No resetear la posición, solo detener el arrastre
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
.condicion-corporal-view {
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
    color: #444;
    font-weight: 500;
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