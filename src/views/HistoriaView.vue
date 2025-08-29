<script setup lang="ts">
import { ref } from 'vue'

type Hito = {
  id: number
  fecha: string
  titulo: string
  texto: string
  imagen?: string | null
}

const historia = ref<Hito[]>([
  {
    id: 1,
    fecha: '2021',
    titulo: 'Primer contacto',
    texto: 'En 2021 tuve mi primer contacto con una protectora, Bigotes Callejeros. Durante varios años hasta la actualidad he formado parte de este magnífico grupo de personas que me ha ayudado a crecer como persona.'
  },
  {
    id: 2,
    fecha: '2024',
    titulo: 'Identificar el problema',
    texto: 'Por mucho tiempo muchos de los miembros de las protectoras me decían que era muy agotador trabajar ahí ya que, no solo es un acto de caridad sino que hay distintos eventos como por ejemplo mercadillos, visitas al veterinario.... Lo que complicaba sacar tiempo para gestionar las adopciones. Eso me dio que pensar y se me ocurrió la idea de crear una plataforma que centralizara todas las protectoras y sus gatos en un solo sitio web.'
  },
  {
    id: 3,
    fecha: ' Febrero - 2025',
    titulo: 'Toma de contacto con más protectoras',
    texto: 'En febrero me puse en contacto con varias protectoras de Aragón, proponíendoles la idea sobre una plataforma que condesase todos los gatos en adopción de la comunidad autonoma. A la gran mayoría les encantó la idea y muy generosamente me cedieron información de todos los gatos que tenían en su momento listos para adoptar.'
  },
  {
    id: 4,
    fecha: 'Agosto - 2025',
    titulo: 'Versión actual',
    texto: 'Tras un lavado de cara, muchas nuevas funcionalidades y muchas noches en vela finalmente saqué la última versión a día de hoy que incluía diversas formas de controlar información de la web para las protectoras como la gestión y organización de adopciones o eventos. Una versión finalmente usable y que puede salir al mundo sin problema y poder utilizarse en condiciones.'
  },
  {
    id: 5,
    fecha: 'Proximamente',
    titulo: 'Planes a futuro',
    texto: 'Una vez ue todo esté bajo control y se hayan hecho las suficientes pruebas me gustaría ceder este proyecto a una entidad que si pueda hacerse cargo como sería el gobierno de aragón o un grupo de protectoras capaces de mantener y regular el sitio web.'
  }
])

const onImgError = (e: Event) => {
  (e.target as HTMLImageElement).src = '/placeholder-cover.png'
}
</script>

<template>
  <div class="historia-page">
    <header class="hero">
      <h1 class="hero__title">Historia del proyecto</h1>
      <h2 class="hero__subtitle">
        Cómo pasamos de una idea pequeña a un lugar común para proteger y adoptar con responsabilidad.
      </h2>
    </header>

    <section class="intro">
      <div class="intro__card">
        <p>
          Este proyecto nació con la sola intención de unificar todas las protectoras en un solo sitio web, de está forma todos los gatos se encontrarían en un solo lugar y facilitaría ya no solo la búsqueda del gato ideal sino también aceleraría el proceso de adopcion y facilitaría la tarea a las protectoras.
        </p>
      </div>
    </section>

    <section class="timeline">
      <h3 class="section__title">Línea de tiempo</h3>
      <ol class="timeline__list">
        <li v-for="h in historia" :key="h.id" class="item">
          <div class="item__card">
            <div class="item__header">
              <span class="item__fecha">{{ h.fecha }}</span>
              <h4 class="item__titulo">{{ h.titulo }}</h4>
            </div>
            <div class="item__media" v-if="h.imagen">
              <img :src="h.imagen" :alt="h.titulo" @error="onImgError">
            </div>
            <p class="item__texto">{{ h.texto }}</p>
          </div>
        </li>
      </ol>
    </section>
  </div>
</template>

<style scoped lang="scss">
$accent: if(global-variable-exists(color-principal), $color-principal, #ff6a2b);
$pad-sm: if(global-variable-exists(espacio-pequeno), $espacio-pequeno, 10px);
$pad-md: if(global-variable-exists(espacio-mediano), $espacio-mediano, 20px);
$pad-lg: if(global-variable-exists(espacio-grande), $espacio-grande, 30px);
$radius: 16px;

.historia-page {
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

.section__title {
  margin: 0 0 12px;
  color: #eee;
  font-weight: 700;
  font-size: 1.15rem;
}

/* Intro */
.intro {
  margin-bottom: $pad-lg;
}
.intro__card {
  background: rgba(255,255,255,0.06);
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: $radius;
  padding: clamp(14px, 2.5vw, 22px);
  color: #eee;
  line-height: 1.55;
}

/* Timeline */
.timeline {
  margin-top: $pad-md;
}
.timeline__list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: grid;
  gap: clamp(12px, 2vw, 30px);
}
.item {
  position: relative;
  display: grid;
  grid-template-columns: 1fr;
  align-items: start;
}
.item__card {
  background: rgba(255,255,255,0.06);
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: $radius;
  padding: clamp(12px, 2vw, 18px);
  box-shadow: 0 6px 22px rgba(0,0,0,.25);
}
.item__header {
  display: flex;
  gap: 10px;
  align-items: baseline;
  margin-bottom: 8px;
}
.item__fecha {
  color: #ffd7c5;
  background: rgba($accent,.15);
  border: 1px solid rgba($accent,.35);
  padding: 2px 8px;
  border-radius: 999px;
  font-size: .82rem;
  white-space: nowrap;
}
.item__titulo {
  margin: 0;
  color: #fff;
  font-weight: 700;
  font-size: 1.05rem;
}
.item__media {
  margin: 8px 0 10px;
  border-radius: 10px;
  overflow: hidden;
  background: rgba(0,0,0,.25);
}
.item__media img {
  width: 100%;
  height: 220px;
  object-fit: cover;
  display: block;
}
.item__texto {
  margin: 0;
  color: #eaeaea;
  line-height: 1.5;
  font-size: .98rem;
}
</style>
