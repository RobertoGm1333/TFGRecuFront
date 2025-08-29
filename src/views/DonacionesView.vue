<script setup lang="ts">
</script>

<template>
  <div class="donaciones-page">
    <header class="hero">
      <h1 class="hero__title">Donaciones</h1>
      <h2 class="hero__subtitle">
        Cómo puedes ayudar económicamente a las protectoras.
      </h2>
    </header>

    <section class="intro">
      <div class="intro__card">
        <p>
          Este proyecto no gestiona donaciones de manera directa.  
          Si deseas aportar tu granito de arena, te animamos a ponerte en contacto con la protectora en la que quieras colaborar.  
          Cada aportación, ya sea puntual o recurrente, es vital para mejorar la vida de los animales.
        </p>
      </div>
    </section>

    <section class="opciones">
      <h3 class="section__title">Formas de colaborar</h3>
      <ul class="opciones__list">
        <li class="opcion">
          <h4 class="opcion__titulo">Donaciones puntuales</h4>
          <p>
            Puedes hacer aportaciones económicas únicas directamente a la protectora de tu elección.  
            Normalmente aceptan transferencias, Bizum o donaciones en mano durante eventos.
          </p>
        </li>
        <li class="opcion">
          <h4 class="opcion__titulo">Donaciones recurrentes</h4>
          <p>
            Muchas protectoras permiten convertirse en socio y aportar una pequeña cantidad cada mes.  
            Esto asegura un ingreso estable que ayuda a cubrir gastos veterinarios, comida y cuidados.
          </p>
        </li>
        <li class="opcion">
          <h4 class="opcion__titulo">Material y suministros</h4>
          <p>
            Además del apoyo económico, las protectoras agradecen donaciones de pienso, arena, mantas o
            transportines. Pregunta siempre antes qué necesitan con más urgencia.
          </p>
        </li>
      </ul>
    </section>

    <section class="cta">
      <div class="cta__inner">
        <h3>¿Quieres donar?</h3>
        <p>
          Contacta con tu protectora de confianza para conocer las formas de donación disponibles.  
          Ellos te guiarán sobre cómo ayudar de la mejor manera posible.
        </p>
        <RouterLink to="/protectoras" class="btn">Ver protectoras</RouterLink>
      </div>
    </section>
  </div>
</template>

<style scoped lang="scss">
$accent: if(global-variable-exists(color-principal), $color-principal, #ff6a2b);
$pad-lg: if(global-variable-exists(espacio-grande), $espacio-grande, 30px);
$radius: 16px;

.donaciones-page {
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

/* Opciones */
.opciones {
  margin-bottom: $pad-lg;
}
.opciones__list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: grid;
  gap: clamp(14px, 2vw, 20px);
}
.opcion {
  background: rgba(255,255,255,0.06);
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: $radius;
  padding: 16px;
  box-shadow: 0 6px 20px rgba(0,0,0,.25);
}
.opcion__titulo {
  margin: 0 0 8px;
  color: $accent;
  font-size: 1.05rem;
  font-weight: 700;
}
.opcion p {
  margin: 0;
  color: #ddd;
  line-height: 1.45;
}

/* CTA */
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
