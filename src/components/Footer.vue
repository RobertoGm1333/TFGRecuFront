<script setup lang="ts">
import { useI18n } from '@/stores/useI18n';

const { t } = useI18n();
</script>

<template>
  <footer class="footer">
    <div class="footer__container">
      <!-- Contacto -->
      <div class="footer__section">
        <b>📞 {{ t('telefono') }}: 123456789</b>
        <b style="width: 230px;">✉️ <a href="mailto:a25959@svalero.com" class="footer-link">a25959@svalero.com</a></b>
      </div>

      <!-- Información General -->
      <div class="footer__section">
        <p>{{ t('footer_info') }}</p>
      </div>

      <!-- Enlaces -->
      <div class="footer__section">
        <v-btn to="/faq" variant="text">❓ <b>{{ t('preguntas_frecuentes') }}</b></v-btn>
      </div>
    </div>

    <!-- 💡 Mega-footer simplificado -->
    <div class="footer__mega">
      <!-- Columna 1 -->
      <section class="mega__col" aria-label="Conócenos">
        <h3 class="mega__title">Conócenos</h3>
        <ul class="mega__links">
          <li><RouterLink to="/equipo" class="mega__link">Equipo y voluntarios</RouterLink></li>
          <li><RouterLink to="/historia" class="mega__link">Historia del proyecto</RouterLink></li>
        </ul>
      </section>

      <!-- Columna 2 -->
      <section class="mega__col" aria-label="Colabora">
        <h3 class="mega__title">Colabora</h3>
        <ul class="mega__links">
          <li><RouterLink to="/hazte-voluntario" class="mega__link">Hazte voluntario</RouterLink></li>
          <li><RouterLink to="/donaciones" class="mega__link">Donaciones</RouterLink></li>
        </ul>
      </section>

      <!-- Columna 3 -->
      <section class="mega__col" aria-label="Recursos">
        <h3 class="mega__title">Recursos</h3>
        <ul class="mega__links">
          <li><RouterLink to="/consejos-expertos" class="mega__link">Consejos de expertos</RouterLink></li>
          <li><RouterLink to="/" class="mega__link">Página principal</RouterLink></li>
        </ul>
      </section>
    </div>

    <div class="footer__credits">
      <p>{{ t('desarrollado_por') }} Roberto Gómez </p>
      <p>© {{ new Date().getFullYear() }} Adopciones Zaragoza - {{ t('derechos_reservados') }}</p>
    </div>
  </footer>
</template>

<style scoped lang="scss">
.footer {
  width: 100%;
  padding: $espacio-mediano 0;
  text-align: center;

  .footer__container {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    width: 100%;
    padding: $espacio-pequeno;

    .footer__section {
      width: 100%;
      padding: $espacio-pequeno 0;
      display: flex;
      flex-direction: column;
      align-items: center;
    }

    .footer__credits {
      font-size: 12px;
      opacity: 0.8;
      margin-top: $espacio-pequeno;
    }
  }

  .footer-link {
    text-decoration: none;
    color: #f7a277;
    font-weight: bold;

    &:hover {
      color: #fb7c3c;
    }
  }

  /* Mega-footer */
  .footer__mega {
    width: 100%;
    max-width: 860px;
    margin: 0 auto;
    padding: $espacio-mediano $espacio-pequeno;
    display: grid;
    gap: 18px;
    grid-template-columns: 1fr; /* móvil: 1 sola columna */
    text-align: center; /* centrado en móvil */
  }

  .mega__title {
    margin: 0 0 8px;
    font-size: 1rem;
    color: #ffffff;
    font-weight: 800;
  }

  .mega__links {
    margin: 0;
    padding: 0;
    list-style: none;
  }

  .mega__link {
    display: inline-block;
    padding: 6px 0;
    text-decoration: none;
    color: #cfd8e3;
    border-radius: 6px;
    transition: color .15s ease;

    &:hover {
      color: #ffffff;
      text-decoration: underline;
    }
  }

  /* Responsive */
  @media (min-width: 768px) {
    .footer__container {
      flex-direction: row;
      justify-content: space-between;
      max-width: 1200px;
      margin: 0 auto;
    }

    .footer__section {
      width: auto;
      text-align: left;
      padding: 0 15px;
    }

    .footer__mega {
      grid-template-columns: repeat(3, 1fr); /* en tablet y PC: 3 columnas */
      gap: 24px;
      padding-top: calc($espacio-mediano + 6px);
      text-align: left; /* en desktop vuelve a izquierda */
    }
  }
}
</style>
 