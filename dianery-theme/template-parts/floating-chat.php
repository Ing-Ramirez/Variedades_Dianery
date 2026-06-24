<?php $phone = get_theme_mod('vd_whatsapp_phone', ''); if (!$phone) { return; } ?>
<div class="floating-chat">
  <a class="floating-chat__button" href="<?php echo esc_url(vd_get_whatsapp_url($phone, __('Hola, quiero más información.', 'variedades-dianery'))); ?>" target="_blank" rel="noopener" aria-label="<?php esc_attr_e('Hablar por WhatsApp', 'variedades-dianery'); ?>">WA</a>
</div>
