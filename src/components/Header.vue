<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { onMounted, ref, onBeforeUnmount } from 'vue';
import { useAutenticacion } from '@/stores/Autentificacion';
import { useI18n } from '@/stores/useI18n';
import esFlag from '@/assets/es-flag.svg';
import gbFlag from '@/assets/gb-flag.svg';

const { t, cambiarIdioma, idioma } = useI18n();
const Autenticacion = useAutenticacion();
const { usuario } = storeToRefs(Autenticacion);
const mostrarMenu = ref(false);
const mostrarIdiomaMenu = ref(false);
const mostrarMenuHamburguesa = ref(false);
const isHovering = ref(false);
const offsets = ref([0, 0, 0]);
const menuContainer = ref<HTMLElement | null>(null);
const userIcon = ref<HTMLElement | null>(null);
const idiomaMenuRef = ref<HTMLElement | null>(null);
const menuHamburguesaRef = ref<HTMLElement | null>(null);
const hamburguesaBtn = ref<HTMLElement | null>(null);

onMounted(() => {
  Autenticacion.cargarUsuarioDesdeLocalStorage();
  console.log("Usuario cargado en el Header:", usuario.value);

  // Asegurarnos de que el canvas existe y tiene el contexto correcto
  const initCanvas = () => {
    const canvas = document.getElementById('pawCanvas') as HTMLCanvasElement;
    if (canvas) {
      canvas.width = 200;
      canvas.height = 200;
      const ctx = canvas.getContext('2d');

      if (ctx) {
        drawPaw(ctx);
        canvas.addEventListener('mouseenter', () => {
          isHovering.value = true;
          animateRaise(ctx);
        });
        canvas.addEventListener('mouseleave', () => {
          isHovering.value = false;
          resetPaw(ctx);
        });
      }
    }
  };

  // Intentar inicializar el canvas varias veces para asegurar que se dibuja
  initCanvas();
  setTimeout(initCanvas, 100); // Reintento después de 100ms
  setTimeout(initCanvas, 500); // Reintento después de 500ms

  document.addEventListener('click', (event) => {
    closeMenu(event);
    closeIdiomaMenu(event);
    closeMenuHamburguesa(event);
  });
});

onBeforeUnmount(() => {
  document.removeEventListener('click', closeMenu);
  document.removeEventListener('click', closeIdiomaMenu);
  document.removeEventListener('click', closeMenuHamburguesa);
});

const toggleMenu = () => {
  mostrarMenu.value = !mostrarMenu.value;
};

const toggleIdiomaMenu = () => {
  mostrarIdiomaMenu.value = !mostrarIdiomaMenu.value;
};

const toggleMenuHamburguesa = () => {
  mostrarMenuHamburguesa.value = !mostrarMenuHamburguesa.value;
};

const closeMenu = (event: Event) => {
  if (
    mostrarMenu.value &&
    menuContainer.value &&
    !menuContainer.value.contains(event.target as Node) &&
    userIcon.value &&
    !userIcon.value.contains(event.target as Node)
  ) {
    mostrarMenu.value = false;
  }
};

const closeIdiomaMenu = (event: Event) => {
  if (
    mostrarIdiomaMenu.value &&
    idiomaMenuRef.value &&
    !idiomaMenuRef.value.contains(event.target as Node)
  ) {
    mostrarIdiomaMenu.value = false;
  }
};

const closeMenuHamburguesa = (event: Event) => {
  if (
    mostrarMenuHamburguesa.value &&
    menuHamburguesaRef.value &&
    !menuHamburguesaRef.value.contains(event.target as Node) &&
    hamburguesaBtn.value &&
    !hamburguesaBtn.value.contains(event.target as Node)
  ) {
    mostrarMenuHamburguesa.value = false;
  }
};

const cerrarMenuHamburguesa = () => {
  mostrarMenuHamburguesa.value = false;
};

const cambiarIdiomaSeleccionado = (nuevoIdioma: 'es' | 'en') => {
  if (idioma.value !== nuevoIdioma) {
    cambiarIdioma();
  }
  mostrarIdiomaMenu.value = false;
};

function drawPaw(ctx: CanvasRenderingContext2D) {
  ctx.clearRect(0, 0, 200, 200);

  ctx.beginPath();
  ctx.arc(100, 120, 40, 0, Math.PI * 2);
  ctx.fillStyle = "#FF5500";
  ctx.strokeStyle = "#3B2F2F";
  ctx.lineWidth = 5;
  ctx.fill();
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(100, 132, 27, 0, Math.PI * 2);
  ctx.fillStyle = "whitesmoke";
  ctx.fill();

  drawCircle(ctx, 60, 70 + offsets.value[0], 20);
  drawCircle(ctx, 100, 60 + offsets.value[1], 22);
  drawCircle(ctx, 140, 70 + offsets.value[2], 20);
}

function drawCircle(ctx: CanvasRenderingContext2D, x: number, y: number, r: number) {
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fillStyle = "#FF5500";
  ctx.strokeStyle = "#3B2F2F";
  ctx.lineWidth = 4;
  ctx.fill();
  ctx.stroke();
}

function animateRaise(ctx: CanvasRenderingContext2D) {
  const maxOffset = -30;
  let index = 0;

  function raiseStep() {
    if (!isHovering.value) return;

    if (index < 3) {
      offsets.value[index] = maxOffset;
      index++;
      drawPaw(ctx);
      setTimeout(raiseStep, 200);
    } else {
      setTimeout(() => resetPaw(ctx), 600);
    }
  }

  raiseStep();
}

function resetPaw(ctx: CanvasRenderingContext2D) {
  offsets.value = [0, 0, 0];
  drawPaw(ctx);
}
</script>

<template>
  <main>
    <header>
      <div class="logo-container">
        <RouterLink to="/">
          <canvas id="pawCanvas"></canvas>
        </RouterLink>
      </div>
      
      <div class="header-content">
        <nav class="desktop-nav">
          <RouterLink to="/gato">{{ t('gatos') }}</RouterLink>
          <RouterLink to="/protectoras">{{ t('protectoras') }}</RouterLink>
          <RouterLink to="/consejos-expertos">{{ t('consejos_expertos') }}</RouterLink>
        </nav>
        
        <!-- Botón hamburguesa para móvil -->
        <button 
          class="menu-hamburguesa-btn" 
          @click="toggleMenuHamburguesa"
          ref="hamburguesaBtn"
          :class="{ 'activo': mostrarMenuHamburguesa }"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>

        <!-- Menú hamburguesa desplegable -->
        <nav 
          v-if="mostrarMenuHamburguesa" 
          class="menu-hamburguesa" 
          ref="menuHamburguesaRef"
        >
          <RouterLink to="/gato" @click="cerrarMenuHamburguesa">{{ t('gatos') }}</RouterLink>
          <RouterLink to="/protectoras" @click="cerrarMenuHamburguesa">{{ t('protectoras') }}</RouterLink>
          <RouterLink to="/consejos-expertos" @click="cerrarMenuHamburguesa">{{ t('consejos_expertos') }}</RouterLink>
        </nav>

        <div class="usuario-section">
          <!-- Selector de idioma -->
          <div class="idioma-selector" ref="idiomaMenuRef">
            <button @click="toggleIdiomaMenu" class="idioma-btn">
              <img 
                :src="idioma === 'es' ? esFlag : gbFlag" 
                :alt="idioma === 'es' ? 'Español' : 'English'"
                class="bandera"
              >
              <span class="idioma-texto">{{ idioma.toUpperCase() }}</span>
            </button>
            <div v-if="mostrarIdiomaMenu" class="idioma-menu">
              <button 
                v-if="idioma !== 'es'" 
                @click="cambiarIdiomaSeleccionado('es')" 
                class="idioma-opcion"
              >
                <img 
                  :src="esFlag" 
                  alt="Español"
                  class="bandera"
                >
                <span class="idioma-texto">ES</span>
              </button>
              <button 
                v-if="idioma !== 'en'" 
                @click="cambiarIdiomaSeleccionado('en')" 
                class="idioma-opcion"
              >
                <img 
                  :src="gbFlag" 
                  alt="English"
                  class="bandera"
                >
                <span class="idioma-texto">EN</span>
              </button>
            </div>
          </div>

          <!-- Usuario -->
          <div class="usuario">
            <template v-if="!usuario">
              <RouterLink to="/iniciar-sesion" class="auth-link">{{ t('iniciar_sesion') }}</RouterLink>
              <RouterLink to="/registrarse" class="auth-link">{{ t('registrarse') }}</RouterLink>
            </template>
            <template v-else>
              <div class="usuario-menu">
                <div class="usuario-trigger" @click="toggleMenu" ref="userIcon">
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="12" cy="8" r="4" fill="#FF5500" stroke="#3B2F2F" stroke-width="2" class="circulo-usuario" />
                    <path d="M4 20C4 16.6863 7.58172 14 12 14C16.4183 14 20 16.6863 20 20" stroke="#3B2F2F" stroke-width="2" class="cuerpo-usuario" />
                  </svg>
                  <span class="usuario-nombre">{{ usuario.nombre }}</span>
                </div>
                
                <div v-if="mostrarMenu" ref="menuContainer" class="datos-usuario">
                  <div class="usuario-info">
                    <p class="saludo">{{ t('hola') }} {{ usuario.nombre }}!</p>
                  </div>
                  
                  <div class="menu-options">
                    <RouterLink to="/perfil" class="menu-option primary">
                      <span class="icon">👤</span>
                      <span>{{ t('mi_perfil') }}</span>
                    </RouterLink>
                    
                    <RouterLink to="/deseados" class="menu-option">
                      <span class="icon">❤️</span>
                      <span>{{ t('deseados') }}</span>
                    </RouterLink>
                    
                    <RouterLink to="/solicitudes" class="menu-option">
                      <span class="icon">📋</span>
                      <span>{{ t('solicitudes') }}</span>
                    </RouterLink>
                    
                    <RouterLink v-if="usuario.rol === 'admin'" to="/admin" class="menu-option admin">
                      <span class="icon">⚙️</span>
                      <span>{{ t('panel_admin') }}</span>
                    </RouterLink>
                    
                    <RouterLink v-if="usuario.rol === 'protectora'" to="/protectora-admin" class="menu-option admin">
                      <span class="icon">🏠</span>
                      <span>{{ t('panel_protectora') }}</span>
                    </RouterLink>
                  </div>
                  
                  <div class="menu-footer">
                    <RouterLink to="/">
                      <button class="logout-btn" @click="Autenticacion.cerrarSesion">
                        <span class="icon">🚪</span>
                        <span>{{ t('cerrar_sesion') }}</span>
                      </button>
                    </RouterLink>
                  </div>
                </div>
              </div>
            </template>
          </div>
        </div>
      </div>
    </header>
  </main>
</template>

<style scoped lang="scss">
header {
  font-family: $fuente-titulos;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: $espacio-mediano 15px;
  width: 100%;
  min-height: 80px;
  background: transparent;
  position: relative;
}

.logo-container {
  flex-shrink: 0;
}

.header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex: 1;
  margin-left: 20px;
  position: relative;
}

.desktop-nav {
  display: none;
  flex-direction: row;
  gap: $espacio-mediano;
  align-items: center;

  a {
    white-space: nowrap;
    font-size: 0.95rem;
    text-decoration: none;
    padding: 8px 12px;
    border-radius: 6px;
    transition: all 0.2s ease;

    &:hover {
      background-color: rgba(255, 85, 0, 0.1);
    }
  }
}

.menu-hamburguesa-btn {
  display: flex;
  flex-direction: column;
  justify-content: space-around;
  width: 30px;
  height: 30px;
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 0;
  z-index: 1001;
  
  span {
    width: 100%;
    height: 3px;
    background-color: #FF5500;
    border-radius: 3px;
    transition: all 0.3s ease;
    transform-origin: center;
  }

  &.activo {
    span:nth-child(1) {
      transform: rotate(45deg) translate(5px, 5px);
    }
    
    span:nth-child(2) {
      opacity: 0;
      transform: translateX(20px);
    }
    
    span:nth-child(3) {
      transform: rotate(-45deg) translate(7px, -6px);
    }
  }
}

.menu-hamburguesa {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 1500;
  padding: 15px;
  margin-top: 10px;
  display: flex;
  flex-direction: column;
  gap: 8px;

  a {
    padding: 12px 15px;
    border-radius: 6px;
    transition: background-color 0.2s;
    text-decoration: none;
    color: inherit;
    font-size: 0.95rem;

    &:hover {
      background-color: rgba(255, 85, 0, 0.1);
    }
  }
}

.usuario-section {
  display: flex;
  align-items: center;
  gap: 15px;
  position: relative;
}

.idioma-selector {
  position: relative;
  display: inline-block;
}

.idioma-btn {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 85, 0, 0.3);
  border-radius: 6px;
  padding: 8px 12px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: all 0.2s ease;

  &:hover {
    background-color: rgba(255, 85, 0, 0.1);
    transform: scale(1.02);
  }

  .bandera {
    width: 18px;
    height: 13px;
    object-fit: cover;
    border-radius: 2px;
  }

  .idioma-texto {
    font-size: 0.85rem;
    font-weight: 600;
  }
}

.idioma-menu {
  position: absolute;
  top: calc(100% + 5px);
  left: 0;
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 1300;
  min-width: 100%;
  overflow: hidden;

  .idioma-opcion {
    display: flex;
    align-items: center;
    gap: 8px;
    width: 100%;
    padding: 10px 12px;
    border: none;
    background: none;
    cursor: pointer;
    transition: background-color 0.2s;
    font-size: 0.85rem;

    &:hover {
      background-color: rgba(255, 85, 0, 0.1);
    }

    .bandera {
      width: 18px;
      height: 13px;
      object-fit: cover;
      border-radius: 2px;
    }

    .idioma-texto {
      font-weight: 600;
    }
  }
}

.usuario {
  position: relative;
}

.auth-link {
  font-size: 0.9rem;
  text-decoration: none;
  padding: 8px 12px;
  border-radius: 6px;
  transition: all 0.2s ease;
  white-space: nowrap;

  &:hover {
    background-color: rgba(255, 85, 0, 0.1);
  }
}

.usuario-menu {
  position: relative;
}

.usuario-trigger {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  padding: 6px 10px;
  border-radius: 8px;
  transition: all 0.2s ease;

  &:hover {
    background-color: rgba(255, 85, 0, 0.1);
  }
}

.usuario-nombre {
  font-size: 0.9rem;
  font-weight: 500;
  max-width: 80px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.datos-usuario {
  position: absolute;
  top: calc(100% + 10px);
  right: 0;
  width: 250px;
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
  z-index: 1400;
  overflow: hidden;
  animation: fadeInDown 0.2s ease-out;
}

@keyframes fadeInDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.usuario-info {
  padding: 20px 20px 15px;
  background: linear-gradient(135deg, #FF5500, #ff6b1a);
  color: white;
  text-align: center;

  .saludo {
    margin: 0;
    font-size: 0.95rem;
    font-weight: 600;
  }
}

.menu-options {
  padding: 10px 0;
}

.menu-option {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 20px;
  text-decoration: none;
  color: #333;
  transition: all 0.2s ease;
  font-size: 0.9rem;

  .icon {
    width: 20px;
    text-align: center;
    font-size: 1rem;
  }

  &:hover {
    background-color: rgba(255, 85, 0, 0.08);
    color: #FF5500;
  }

  &.primary {
    background-color: rgba(255, 85, 0, 0.1);
    color: #FF5500;
    font-weight: 500;
  }

  &.admin {
    border-top: 1px solid #f0f0f0;
    color: #007bff;

    &:hover {
      background-color: rgba(0, 123, 255, 0.08);
    }
  }
}

.menu-footer {
  padding: 10px 20px 15px;
  border-top: 1px solid #f0f0f0;
}

.logout-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
  padding: 10px;
  background: #dc3545;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 500;
  transition: all 0.2s ease;

  .icon {
    font-size: 1rem;
  }

  &:hover {
    background: #c82333;
    transform: translateY(-1px);
  }
}

canvas {
  display: block;
  width: 80px;
  height: 80px;
}

// Dark mode
@media (prefers-color-scheme: dark) {
  .datos-usuario {
    background: #2d2d2d;
    border-color: #404040;
    color: whitesmoke;
  }

  .usuario-info {
    background: linear-gradient(135deg, #FF5500, #ff6b1a);
  }

  .menu-option {
    color: whitesmoke;

    &:hover {
      background-color: rgba(255, 85, 0, 0.15);
      color: #ff6b1a;
    }

    &.primary {
      background-color: rgba(255, 85, 0, 0.2);
      color: #ff6b1a;
    }

    &.admin {
      border-color: #505050;
      color: #4dabf7;

      &:hover {
        background-color: rgba(77, 171, 247, 0.15);
      }
    }
  }

  .menu-footer {
    border-color: #505050;
  }

  .usuario-menu svg {
    .circulo-usuario {
      stroke: #ddd;
    }
    .cuerpo-usuario {
      stroke: #ddd;
    }
  }

  .idioma-menu {
    background: #2d2d2d;
    border-color: #404040;

    .idioma-opcion {
      color: whitesmoke;

      &:hover {
        background-color: rgba(255, 85, 0, 0.15);
      }
    }
  }

  .idioma-btn {
    color: whitesmoke;
    background: rgba(255, 255, 255, 0.05);
    border-color: rgba(255, 85, 0, 0.4);
  }

  .menu-hamburguesa {
    background: #2d2d2d;
    border-color: #404040;
    color: whitesmoke;

    a {
      color: whitesmoke;

      &:hover {
        background-color: rgba(255, 85, 0, 0.15);
      }
    }
  }
}

// Responsive
@media (min-width: 768px) {
  header {
    padding: 15px $espacio-extra-grande;
  }

  .header-content {
    margin-left: 40px;
  }

  .desktop-nav {
    display: flex;
    flex: 1;
    justify-content: flex-start;
  }

  .menu-hamburguesa-btn {
    display: none !important;
  }

  .menu-hamburguesa {
    display: none !important;
  }

  .usuario-section {
    gap: 20px;
  }

  .usuario-nombre {
    max-width: 120px;
  }

  .datos-usuario {
    width: 280px;
  }
}

@media (min-width: 1024px) {
  header {
    position: sticky;
    top: 0;
    z-index: 1000;
    backdrop-filter: blur(10px);
    background: rgba(255, 255, 255, 0.95);
  }

  .header-content {
    max-width: 1200px;
    margin: 0 auto;
    width: 100%;
  }

  .desktop-nav {
    gap: $espacio-grande;
  }

  .usuario-section {
    gap: 25px;
  }

  canvas {
    width: 90px;
    height: 90px;
  }

  @media (prefers-color-scheme: dark) {
    header {
      background: rgba(24,24,24,255);
    }
  }
}
</style>