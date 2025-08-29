<script setup lang="ts">
import { onMounted, ref } from 'vue'

type Miembro = {
  id: number
  nombre: string
  rol: string
  bio: string
  foto?: string | null
  skills?: string[]
  contacto?: {
    email?: string
    web?: string
  }
}

const equipo = ref<Miembro[]>([
  {
    id: 1,
    nombre: 'Roberto Gómez',
    rol: 'Frontend developer',
    bio: 'Desarrollador único y principal del frontend de la página. Muchas noches en vela para que los formularios se vean bien.',
    foto: '../../Images/Equipo/Roberto.png'
  },
  {
    id: 2,
    nombre: 'Roberto Gómez',
    rol: 'Backend developer',
    bio: 'Desarrollador único y principal del backend de la página al igual que el despliegue en nube.',
    foto: '../../Images/Equipo/Roberto.png'
  },
  {
    id: 3,
    nombre: 'Hansel Gómez',
    rol: 'Motivador personal',
    bio: 'Entidad que mantenía al resto del equipo con motivación y ganas de seguir adelante.',
    foto: '../../Images/Equipo/Hansel.jpg',
  },
  {
    id: 4,
    nombre: 'Roberto Gómez',
    rol: 'Coordinador con las protectoras',
    bio: 'Encargado de mantener el contacto con las protectoras y delegar el uso de cada cuenta correspondiente.',
    foto: '../../Images/Equipo/Roberto.png',
  }
])

const avatarFallback = (e: Event) => {
  (e.target as HTMLImageElement).src = '/placeholder-avatar.png'
}

onMounted(() => {
})
</script>

<template>
  <div class="equipo-page">
    <header class="hero">
      <h1 class="hero__title">Concoce al equipo</h1>
      <h2 class="hero__subtitle">
        Conoce a las personas que están detrás de este proyecto y lo han hecho posible.
      </h2>
    </header>

    <section class="section">
      <div class="team-grid">
        <article v-for="m in equipo" :key="m.id" class="card">
          <div class="card__media">
            <img :src="m.foto || '/placeholder-avatar.png'" :alt="`Foto de ${m.nombre}`" @error="avatarFallback">
          </div>
          <div class="card__body">
            <div class="card__header">
              <h4 class="card__name">{{ m.nombre }}</h4>
              <span class="card__role">{{ m.rol }}</span>
            </div>

            <p class="card__bio">{{ m.bio }}</p>
          </div>
        </article>
      </div>
    </section>
  </div>
</template>

<style scoped lang="scss">
$accent: if(global-variable-exists(color-principal), $color-principal, #ff6a2b);
$pad-lg: if(global-variable-exists(espacio-grande), $espacio-grande, 30px);
$radius: 16px;

.equipo-page {
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

.section {
  margin-top: clamp(18px, 3vw, 28px);
}
.section__title {
  margin: 0 0 12px;
  color: #eee;
  font-weight: 700;
  font-size: 1.15rem;
}

.team-grid {
  display: grid;
  gap: clamp(16px, 2vw, 35px);
  grid-template-columns: 1fr;
  justify-content: center;
}
@media (min-width: 680px) {
  .team-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
@media (min-width: 1024px) {
  .team-grid {
    grid-template-columns: repeat(2, 1fr);
    max-width: 880px;
    margin: 0 auto;
  }
}

.card {
  display: grid;
  grid-template-rows: auto 1fr;
  background: rgba(255,255,255,0.06);
  border-radius: $radius;
  overflow: hidden;
  box-shadow: 0 6px 22px rgba(0,0,0,0.28);
  border: 1px solid rgba(255,255,255,0.06);
  transition: transform .18s ease, box-shadow .18s ease, border-color .18s ease;
}
.card:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 30px rgba(0,0,0,0.36);
  border-color: rgba(255,255,255,0.12);
}
.card__media {
  aspect-ratio: 16 / 10;
  background: rgba(0,0,0,.2);
}
.card__media img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}
.card__body {
  padding: 12px;
}
.card__header {
  display: grid;
  grid-template-columns: 1fr auto;
  align-items: baseline;
  gap: 6px;
  margin-bottom: 6px;
}
.card__name {
  margin: 0;
  color: #fff;
  font-size: 1rem;
  font-weight: 700;
}
.card__role {
  color: $accent;
  background: rgba($accent, .15);
  border: 1px solid rgba($accent, .35);
  padding: 2px 6px;
  border-radius: 999px;
  font-size: .75rem;
  white-space: nowrap;
}
.card__bio {
  color: #e9e9e9;
  margin: 0;
  line-height: 1.35;
  font-size: .9rem;
}

.chips {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  padding: 0;
  margin: 0 0 8px;
  list-style: none;
}
.chip {
  padding: 6px 10px;
  border-radius: 999px;
  background: rgba(255,255,255,0.08);
  border: 1px solid rgba(255,255,255,0.12);
  color: #dcdcdc;
  font-size: .82rem;
}

.contact {
  display: flex;
  gap: 10px;
}
.contact__link {
  color: #ffb074;
  text-decoration: none;
  font-weight: 600;
  font-size: .92rem;
}
.contact__link:hover {
  text-decoration: underline;
}

.steps {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  gap: 14px;
}
.step {
  display: grid;
  grid-template-columns: 22px 1fr;
  align-items: start;
  gap: 12px;
}
.step__dot {
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: $accent;
  box-shadow: 0 0 0 4px rgba($accent, .25);
}
.step__content h4 {
  margin: 0 0 4px;
  color: #fff;
  font-size: 1rem;
}
.step__content p {
  margin: 0;
  color: #d9d9d9;
  line-height: 1.45;
}

.cta {
  margin-top: $pad-lg;
  display: grid;
}
.cta__inner {
  background: linear-gradient(180deg, rgba(255,106,43,.18), rgba(255,106,43,.08));
  border: 1px solid rgba($accent,.35);
  padding: clamp(16px, 3vw, 28px);
  border-radius: $radius;
  text-align: center;
  box-shadow: 0 8px 30px rgba(0,0,0,0.25);
}
.cta__inner h3 {
  margin: 0 0 8px;
  color: #fff;
  font-size: 1.2rem;
}
.cta__inner p {
  margin: 0 0 14px;
  color: #f1edea;
}
.btn {
  display: inline-block;
  padding: 12px 16px;
  border-radius: 999px;
  background: $accent;
  color: #1b1b1b;
  font-weight: 700;
  text-decoration: none;
  transition: transform .15s ease, filter .15s ease;
}
.btn:hover { transform: translateY(-1px); filter: brightness(1.05); }
</style>
