<?php $products = $args['products'] ?? []; if (!$products) { return; } ?>
<section class="section featured-products container">
  <div class="section__header">
    <p class="section__eyebrow"><?php esc_html_e('Selección especial', 'variedades-dianery'); ?></p>
    <h2 class="section__title"><?php esc_html_e('Productos destacados', 'variedades-dianery'); ?></h2>
  </div>
  <div class="product-grid">
    <?php foreach ($products as $product) { get_template_part('template-parts/product', 'card', $product); } ?>
  </div>
</section>
