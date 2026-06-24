<?php
/** Footer del tema. */
defined('ABSPATH') || exit;
?>
</main>
<?php get_template_part('template-parts/floating', 'chat'); ?>
<footer class="site-footer">
  <div class="site-footer__inner container">
    <div>
      <h2 class="site-footer__brand"><?php echo esc_html(get_bloginfo('name')); ?></h2>
      <p><?php esc_html_e('Catálogo de belleza, moda y lifestyle con asesoría personalizada.', 'variedades-dianery'); ?></p>
    </div>
    <nav aria-label="<?php esc_attr_e('Enlaces del footer', 'variedades-dianery'); ?>">
      <?php wp_nav_menu(['theme_location' => 'footer', 'container' => false, 'fallback_cb' => false]); ?>
    </nav>
  </div>
  <div class="site-footer__legal container">© <?php echo esc_html(date('Y')); ?> <?php echo esc_html(get_bloginfo('name')); ?></div>
</footer>
<?php wp_footer(); ?>
</body>
</html>
