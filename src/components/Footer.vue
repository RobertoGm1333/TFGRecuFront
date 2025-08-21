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

    <div class="footer__credits">
      <p>{{ t('desarrollado_por') }} Roberto Gómez y Daniel Santamaría</p>
      <p>© {{ new Date().getFullYear() }} Adopciones Zaragoza - {{ t('derechos_reservados') }}</p>
    </div>
  </footer>
</template>

<style scoped lang="scss">
.footer {
  width: 100%;
  padding: $espacio-mediano 0; /* Se reduce la altura */
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

  /* Estilos para pantallas más grandes */
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

    .footer__credits {
      text-align: center;
    }
  }
}

</style>
