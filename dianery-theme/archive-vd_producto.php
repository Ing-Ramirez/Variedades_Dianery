<?php
defined('ABSPATH') || exit;
get_header(); ?>
<section class="section container">
  <h1><?php esc_html_e('Productos', 'variedades-dianery'); ?></h1>
  <div class="product-grid">
    <?php while (have_posts()) : the_post(); get_template_part('template-parts/product', 'card', vd_map_product_to_card_data(get_the_ID())); endwhile; ?>
  </div>
</section>
<?php get_footer();
