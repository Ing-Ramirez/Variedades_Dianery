<?php
defined('ABSPATH') || exit;
get_header();
while (have_posts()) : the_post(); ?>
  <section class="section container">
    <?php get_template_part('template-parts/product', 'card', vd_map_product_to_card_data(get_the_ID())); ?>
    <div class="product-detail__content"><?php the_content(); ?></div>
  </section>
<?php endwhile;
get_footer();
