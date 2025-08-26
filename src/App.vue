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

  mainContent.appendChild(pawContainer);
});
import { ref, nextTick } from 'vue'

type ChatMsg = { role: 'user' | 'assistant', text: string }

const chatOpen = ref(false)
const chatInput = ref('')
const chatSending = ref(false)
const chatMessages = ref<ChatMsg[]>([])
const chatBox = ref<HTMLElement | null>(null)

const chatLoad = () => {
  const raw = localStorage.getItem('chatbox_state')
  if (!raw) return
  try {
    const { open, messages } = JSON.parse(raw)
    chatOpen.value = !!open
    chatMessages.value = Array.isArray(messages) ? messages : []
  } catch {}
}

const chatSave = () => {
  localStorage.setItem('chatbox_state', JSON.stringify({ open: chatOpen.value, messages: chatMessages.value }))
}

const chatScrollBottom = async () => {
  await nextTick()
  if (chatBox.value) chatBox.value.scrollTop = chatBox.value.scrollHeight
}

const chatOpenPanel = async () => {
  chatOpen.value = true
  chatSave()
  await chatScrollBottom()
}

const chatClosePanel = () => {
  chatOpen.value = false
  chatSave()
}

const chatSend = async () => {
  const text = chatInput.value.trim()
  if (!text || chatSending.value) return
  chatMessages.value.push({ role: 'user', text })
  chatInput.value = ''
  chatSending.value = true
  chatSave()
  await chatScrollBottom()
  try {
    const res = await fetch('http://localhost:5167/api/Catherine/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mensaje: text })
    })
    if (!res.ok) throw new Error('Network')
    const data = await res.json()
    const reply = typeof data?.respuesta === 'string' ? data.respuesta : JSON.stringify(data)
    chatMessages.value.push({ role: 'assistant', text: reply })
  } catch {
    chatMessages.value.push({ role: 'assistant', text: 'No se ha podido obtener respuesta en este momento.' })
  } finally {
    chatSending.value = false
    chatSave()
    chatScrollBottom()
  }
}

onMounted(() => {
  chatLoad()
})
</script>

<template>
  <div class="app-container">
    <Header />
    <div class="main-content">
      <RouterView />
    </div>
    <Footer />
  
  <div class="chatbox">
    <button class="chatbox__fab" @click="chatOpenPanel" v-if="!chatOpen" aria-label="Abrir chat IA">
      <span>IA</span>
    </button>
    <div v-if="chatOpen" class="chatbox__panel">
      <div class="chatbox__header">
        <span>Catherine</span>
        <button class="chatbox__close" @click="chatClosePanel" aria-label="Cerrar chat">✕</button>
      </div>
      <div class="chatbox__messages" ref="chatBox">
        <div v-for="(m,i) in chatMessages" :key="i" class="chatbox__msg" :data-role="m.role">
          <div class="chatbox__bubble">{{ m.text }}</div>
        </div>
        <div v-if="chatSending" class="chatbox__typing">
          <span class="chatbox__dot"></span>
          <span class="chatbox__dot"></span>
          <span class="chatbox__dot"></span>
        </div>
      </div>
      <form class="chatbox__input" @submit.prevent="chatSend">
        <input v-model="chatInput" :disabled="chatSending" placeholder="Escribe tu mensaje" />
        <button type="submit" :disabled="chatSending">Enviar</button>
      </form>
    </div>
  </div>
  
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

.chatbox {
  position: fixed;
  right: 16px;
  bottom: 16px;
  z-index: 9999;
}

.chatbox__fab {
  width: 56px;
  height: 56px;
  border: none;
  border-radius: 9999px;
  background: #FF5500;
  color: #ffffff;
  font-weight: 700;
  cursor: pointer;
  box-shadow: 0 8px 24px rgba(0,0,0,0.2);
}

.chatbox__panel {
  position: fixed;
  /* estaba a la izquierda, lo movemos a la derecha sin tocar nada más */
  right: 16px;
  bottom: 16px;
  width: min(92vw, 380px);
  height: 520px;
  background: var(--chat-bg, #ffffff);
  color: var(--chat-fg, #111111);
  border-radius: 16px;
  box-shadow: 0 16px 40px rgba(0,0,0,0.24);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  z-index: 10000;
}

@media (max-width: 480px) {
  .chatbox__panel {
    width: calc(100vw - 24px);
    height: 70vh;
    left: 12px;
    right: 12px;
  }
}

.chatbox__header {
  padding: 12px 16px;
  font-weight: 700;
  background: #FB7C3C;
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.chatbox__close {
  border: none;
  background: transparent;
  color: #ffffff;
  font-size: 20px;
  cursor: pointer;
  line-height: 1;
}

.chatbox__messages {
  flex: 1;
  padding: 12px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 8px;
  background: var(--chat-body, #f6f6f6);
}

.chatbox__msg {
  display: flex;
}

.chatbox__msg[data-role="user"] {
  justify-content: flex-end;
}

.chatbox__msg[data-role="assistant"] {
  justify-content: flex-start;
}

.chatbox__bubble {
  max-width: 80%;
  padding: 10px 12px;
  border-radius: 14px;
  line-height: 1.3;
  font-size: 14px;
}

.chatbox__msg[data-role="user"] .chatbox__bubble {
  background: #FF5500;
  color: #ffffff;
  border-top-right-radius: 4px;
}

.chatbox__msg[data-role="assistant"] .chatbox__bubble {
  background: #ffffff;
  color: #111111;
  border-top-left-radius: 4px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
}

.chatbox__input {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 8px;
  padding: 12px;
  background: #ffffff;
  border-top: 1px solid rgba(0,0,0,0.06);
}

.chatbox__input input {
  padding: 10px 12px;
  border: 1px solid rgba(0,0,0,0.18);
  border-radius: 10px;
  outline: none;
  font-size: 14px;
}

.chatbox__input button {
  padding: 10px 14px;
  border: none;
  border-radius: 10px;
  background: #FF5500;
  color: #ffffff;
  font-weight: 600;
  cursor: pointer;
}

.chatbox__typing {
  display: inline-flex;
  gap: 4px;
  align-items: center;
  padding: 4px 8px;
}

.chatbox__dot {
  width: 6px;
  height: 6px;
  border-radius: 9999px;
  background: rgba(0,0,0,0.35);
  display: inline-block;
  animation: dotPulse 1s infinite ease-in-out;
}

.chatbox__dot:nth-child(2) { animation-delay: .15s; }
.chatbox__dot:nth-child(3) { animation-delay: .3s; }

@keyframes dotPulse {
  0%, 80%, 100% { transform: scale(0.8); opacity: .6; }
  40% { transform: scale(1); opacity: 1; }
}

:root {
  --chat-bg: #ffffff;
  --chat-fg: #111111;
  --chat-body: #f6f6f6;
}

@media (prefers-color-scheme: dark) {
  :root {
    --chat-bg: #1f1f1f;
    --chat-fg: #f1f1f1;
    --chat-body: #141414;
  }
}
</style>
