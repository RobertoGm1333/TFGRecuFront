<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router'
import Header from './components/Header.vue';
import Footer from '@/components/Footer.vue';
import { onMounted } from 'vue';

// Creamos un div para las huellas en el área de contenido
onMounted(() => {
  // Eliminar si ya existe
  const existingPawContainer = document.getElementById('paw-prints-container');
  if (existingPawContainer) {
    existingPawContainer.remove();
  }
  
  // Crear contenedor de huellas
  const mainContent = document.querySelector('.main-content');
  if (!mainContent) return;

  const pawContainer = document.createElement('div');
  pawContainer.id = 'paw-prints-container';
  
  // Crear las huellas en sets de 2 en 2, en diagonal
  const pawPositions = [
    { left: '18%', top: '-12%', rotate: '-45deg' },
  
    { left: '15%', top: '7%', rotate: '-45deg' },
    { left: '33%', top: '11%', rotate: '-45deg' },

    { left: '33%', top: '35%', rotate: '-45deg' },
    { left: '53%', top: '40%', rotate: '-45deg' },

    { left: '52%', top: '62%', rotate: '-45deg' },
    { left: '71%', top: '64%', rotate: '-45deg' },

    { left: '70%', top: '86%', rotate: '-45deg' },
    { left: '90%', top: '88%', rotate: '-45deg' },
  ];
  
  pawPositions.forEach((position) => {
    const pawElement = document.createElement('div');
    pawElement.className = 'paw-print';
    pawElement.style.left = position.left;
    pawElement.style.top = position.top;
    pawElement.style.transform = `rotate(${position.rotate})`;
    pawContainer.appendChild(pawElement);
  });
  
  // Añadir al área de contenido principal
  mainContent.appendChild(pawContainer);
});
</script>

<template>
  <div class="app-container">
    <Header />
    <div class="main-content">
      <RouterView />
    </div>
    <Footer />
  </div>
</template>

<style>
.main-content {
  position: relative;
  min-height: calc(100vh - 200px); /* Ajusta según el tamaño de tu header y footer */
  width: 100%;
  padding: 20px 0;
}

#paw-prints-container {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: -1;
  pointer-events: none;
  overflow: hidden;
}

.paw-print {
  position: absolute;
  width: 150px;
  height: 150px;
  background-image: url('/Images/logos/Huella.svg');
  background-size: contain;
  background-repeat: no-repeat;
  background-position: center;
  opacity: 0.1;
}
</style>

<style scoped lang="scss">
.app-container {
  position: relative;
  min-height: 100vh;
  overflow-x: hidden;
  z-index: 2;
}

.v-container {
  font-family: $fuente-textos;
  position: relative;
}

</style> 