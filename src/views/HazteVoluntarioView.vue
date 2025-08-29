<script setup lang="ts">
import { ref } from 'vue'

type Paso = {
  id: number
  titulo: string
  texto: string
  icono?: string
}

const pasos = ref<Paso[]>([
  {
    id: 1,
    titulo: 'Elige una protectora cercana',
    texto: 'Cada protectora organiza el voluntariado de forma independiente. Busca una de tu zona para que la ayuda sea constante y útil.',
    icono: '📍'
  },
  {
    id: 2,
    titulo: 'Contacta directamente',
    texto: 'Escríbeles por correo o redes. Preséntate, indica tu disponibilidad y en qué te gustaría ayudar (acogida, traslados, eventos, difusión…).',
    icono: '✉️'
  },
  {
    id: 3,
    titulo: 'Sigue sus protocolos',
    texto: 'Te explicarán cómo funcionan: turnos, seguros, formaciones, listas de WhatsApp/Telegram, etc.',
    icono: '📋'
  },
  {
    id: 4,
    titulo: 'Empieza poco a poco',
    texto: 'Una o dos tareas regulares valen más que muchas esporádicas. La constancia es oro para los animales.',
    icono: '⏱️'
  }
])

const faqAbiertas = ref<number[]>([])
const toggleFaq = (i: number) => {
  faqAbiertas.value = faqAbiertas.value.includes(i)
    ? faqAbiertas.value.filter(id => id !== i)
    : [...faqAbiertas.value, i]
}

// Texto plantilla para correo
const plantillaCorreo = `Hola, 

Me llamo ______ y me gustaría colaborar como voluntari@ con vuestra protectora. 
Disponibilidad aproximada: ______ (días/horarios).
Tareas que me interesan: ______ (acogida temporal, difusión, eventos, traslados, apoyo en redes, fotografía, etc.).
Vivo en ______ y dispongo de ______ (coche, transporte público, experiencia previa…).

¿Podríais indicarme los pasos para empezar y si tenéis algún protocolo o formación inicial?

¡Gracias por la labor que hacéis!
`

const copiado = ref(false)
const copiarPlantilla = async () => {
  try {
    await navigator.clipboard.writeText(plantillaCorreo)
    copiado.value = true
    setTimeout(() => (copiado.value = false), 1600)
  } catch {
    copiado.value = false
  }
}

const mailto = `mailto:?subject=${encodeURIComponent('Solicitud para colaborar como voluntario/a')}&body=${encodeURIComponent(plantillaCorreo)}`
</script>

<template>
  <div class="vol-page">
    <header class="hero">
      <h1 class="hero__title">Hazte voluntario</h1>
      <h2 class="hero__subtitle">
        Esta web no gestiona voluntariado directamente. Para ayudar, <b>contacta con las protectoras</b> que encontrarás aquí.
      </h2>
      <div class="hero__cta">
        <RouterLink to="/protectoras" class="btn">Ver protectoras</RouterLink>
      </div>
    </header>

    <section class="notice">
      <div class="notice__card">
        <strong>Importante:</strong> esta plataforma sirve para <i>visibilizar</i> gatos y conectar con protectoras,
        pero no acepta solicitudes de voluntariado. Las altas, turnos y protocolos dependen de cada entidad.
      </div>
    </section>

    <section class="pasos">
      <h3 class="section__title">Cómo empezar</h3>
      <ol class="pasos__list">
        <li v-for="p in pasos" :key="p.id" class="paso">
          <div class="paso__icono" aria-hidden="true">{{ p.icono }}</div>
          <div class="paso__body">
            <h4 class="paso__title">{{ p.titulo }}</h4>
            <p class="paso__texto">{{ p.texto }}</p>
          </div>
        </li>
      </ol>
    </section>

    <section class="alternativas">
      <h3 class="section__title">Si no puedes ir físicamente</h3>
      <div class="alt__grid">
        <article class="alt">
          <h4>Acogida temporal</h4>
          <p>Ofrece tu hogar de forma puntual para gatos en recuperación o espera de adopción. Pregunta a tu protectora por los requisitos.</p>
        </article>
        <article class="alt">
          <h4>Difusión y redes</h4>
          <p>Ayuda a mover publicaciones, hacer fotos o escribir descripciones para aumentar las posibilidades de adopción.</p>
        </article>
        <article class="alt">
          <h4>Traslados / logística</h4>
          <p>Si tienes coche, puedes apoyar en traslados a clínicas, casas de acogida o eventos.</p>
        </article>
        <article class="alt">
          <h4>Apoyo remoto</h4>
          <p>Diseño, desarrollo, administración, contabilidad o atención de consultas en línea. ¡Toda experiencia suma!</p>
        </article>
      </div>
    </section>

    <section class="faq">
      <h3 class="section__title">Preguntas frecuentes</h3>
      <ul class="faq__list">
        <li class="faq__item" v-for="(q, i) in [
          {q: '¿Hay edad mínima?', a: 'Suele requerirse mayoría de edad; algunas entidades permiten menores acompañados. Consulta siempre con la protectora.'},
          {q: '¿Necesito formación previa?', a: 'No necesariamente. Cada protectora suele explicarte protocolos y puede dar una formación inicial.'},
          {q: '¿Cuánto tiempo debo dedicar?', a: 'Lo que puedas mantener con constancia. Es mejor un turno fijo semanal que muchos esporádicos.'},
          {q: '¿Puedo ayudar si vivo lejos?', a: 'Sí: difusión, tareas remotas, donaciones o apadrinamiento. También puedes apoyar a una protectora de tu zona.'}
        ]" :key="i">
          <button class="faq__btn" :aria-expanded="faqAbiertas.includes(i)" @click="toggleFaq(i)">
            <span>{{ q.q }}</span>
            <svg class="chev" viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
              <path d="M6 9l6 6 6-6" fill="none" stroke="currentColor" stroke-width="2" />
            </svg>
          </button>
          <transition name="collapse">
            <p v-show="faqAbiertas.includes(i)" class="faq__answer">{{ q.a }}</p>
          </transition>
        </li>
      </ul>
    </section>
  </div>
</template>

<style scoped lang="scss">
$accent: if(global-variable-exists(color-principal), $color-principal, #ff6a2b);
$pad-sm: if(global-variable-exists(espacio-pequeno), $espacio-pequeno, 10px);
$pad-md: if(global-variable-exists(espacio-mediano), $espacio-mediano, 20px);
$pad-lg: if(global-variable-exists(espacio-grande), $espacio-grande, 30px);
$radius: 16px;

.vol-page {
  max-width: 1000px;
  margin: 0 auto;
  padding: clamp(14px, 2vw, 24px);
}

.hero {
  text-align: center;
  margin-bottom: clamp(16px, 3vw, 28px);
}
.hero__title {
  margin: 0 0 6px;
  font-size: clamp(1.8rem, 3vw, 2.2rem);
  color: $accent;
  font-weight: 700;
}
.hero__subtitle {
  margin: 0;
  color: #cfcfcf;
  opacity: .9;
  font-size: clamp(1rem, 2vw, 1.1rem);
}
.hero__cta { margin-top: 12px; }

.notice__card {
  background: rgba(255,255,255,0.06);
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: $radius;
  padding: clamp(12px, 2vw, 18px);
  color: #eee;
}

/* Pasos */
.pasos { margin-top: $pad-lg; }
.section__title {
  margin: 0 0 12px;
  color: #eee;
  font-weight: 700;
  font-size: 1.15rem;
}
.pasos__list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: grid;
  gap: 12px;
}
.paso {
  display: grid;
  grid-template-columns: 42px 1fr;
  gap: 12px;
  align-items: start;
  background: rgba(255,255,255,0.06);
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: $radius;
  padding: 12px;
}
.paso__icono {
  width: 42px; height: 42px; border-radius: 12px;
  display: grid; place-items: center;
  background: rgba($accent,.15);
  border: 1px solid rgba($accent,.35);
  font-size: 20px;
}
.paso__title { margin: 0 0 4px; color: #fff; font-weight: 700; }
.paso__texto { margin: 0; color: #ddd; line-height: 1.45; }
.pasos__cta { margin-top: 10px; }

/* Plantilla */
.plantilla { margin-top: $pad-lg; }
.plantilla__wrap {
  background: rgba(255,255,255,0.06);
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: $radius;
  padding: 12px;
}
.plantilla__textarea {
  width: 100%;
  min-height: 180px;
  resize: vertical;
  border-radius: 10px;
  border: 1px solid rgba(255,255,255,0.15);
  background: rgba(0,0,0,.25);
  color: #eee;
  padding: 10px;
  font-family: inherit;
}
.plantilla__actions {
  display: flex;
  gap: 10px;
  margin-top: 10px;
  flex-wrap: wrap;
}
.plantilla__hint {
  margin: 8px 0 0;
  color: #d9d9d9;
  font-size: .92rem;
}

/* Alternativas */
.alternativas { margin-top: $pad-lg; }
.alt__grid {
  display: grid;
  gap: 12px;
  grid-template-columns: 1fr;
}
@media (min-width: 820px) {
  .alt__grid { grid-template-columns: repeat(2, 1fr); }
}
.alt {
  background: rgba(255,255,255,0.06);
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: $radius;
  padding: 14px;
  box-shadow: 0 6px 20px rgba(0,0,0,.22);
}
.alt h4 { margin: 0 0 6px; color: #fff; }
.alt p { margin: 0; color: #ddd; line-height: 1.5; }

/* FAQ */
.faq { margin-top: $pad-lg; }
.faq__list { list-style: none; padding: 0; margin: 0; display: grid; gap: 10px; }
.faq__item {
  background: rgba(255,255,255,0.06);
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: $radius;
}
.faq__btn {
  width: 100%;
  background: transparent;
  border: 0;
  color: #fff;
  padding: 12px 14px;
  text-align: left;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 10px;
  cursor: pointer;
}
.faq__answer { padding: 0 14px 12px; color: #ddd; margin: 0; }
.chev { transition: transform .2s ease; }
.faq__btn[aria-expanded="true"] .chev { transform: rotate(180deg); }

/* Botones / links */
.btn {
  display: inline-block;
  padding: 10px 16px;
  border-radius: 999px;
  background: $accent;
  color: #1b1b1b;
  font-weight: 700;
  text-decoration: none;
  border: none;
  cursor: pointer;
}
.btn--light {
  background: #fff;
  color: #1b1b1b;
}
.btn--wide { width: 100%; text-align: center; }
.link {
  color: #ffb074;
  text-decoration: none;
}
.link:hover { text-decoration: underline; }

/* Footer CTA */
.foot-cta { margin-top: $pad-lg; }
  
/* Collapse transition */
.collapse-enter-active,
.collapse-leave-active { transition: max-height .25s ease, opacity .2s ease; }
.collapse-enter-from,
.collapse-leave-to { max-height: 0; opacity: 0; }
.collapse-enter-to,
.collapse-leave-from { max-height: 500px; opacity: 1; }
</style>
