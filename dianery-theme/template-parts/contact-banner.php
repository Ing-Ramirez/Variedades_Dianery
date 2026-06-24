<section class="contact-banner">
  <div class="contact-banner__inner container">
    <p><?php esc_html_e('¿Quieres que una asesora se contacte contigo?', 'variedades-dianery'); ?></p>
    <?php $phone = get_theme_mod('vd_whatsapp_phone', ''); if ($phone) : ?>
      <a class="button-primary" href="<?php echo esc_url(vd_get_whatsapp_url($phone, __('Hola, quiero recibir asesoría personalizada.', 'variedades-dianery'))); ?>" target="_blank" rel="noopener"><?php esc_html_e('Hablar por WhatsApp', 'variedades-dianery'); ?></a>
    <?php endif; ?>
  </div>
</section>
