<?php
$product_id = isset($args['id']) ? absint($args['id']) : 0;
$title = $args['title'] ?? '';
$description = $args['description'] ?? '';
$price = $args['price'] ?? '';
$raw_price = $args['raw_price'] ?? '';
$badge = $args['badge'] ?? '';
$image_url = $args['image_url'] ?? vd_get_placeholder_image_url();
$image_alt = $args['image_alt'] ?? $title;
$attribute_type = $args['attribute_type'] ?? 'ninguno';
$variants = $args['variants'] ?? [];
$phone = $args['whatsapp_phone'] ?? '';
$base_text = $args['whatsapp_text'] ?? sprintf(__('Hola, me interesa el producto: %s', 'variedades-dianery'), $title);
$initial_url = $phone ? vd_get_whatsapp_url($phone, $base_text) : '#';
?>
<article class="product-card" data-product-id="<?php echo esc_attr($product_id); ?>" data-base-price="<?php echo esc_attr($raw_price); ?>">
  <div class="product-card__media">
    <?php if ($badge) : ?><span class="product-card__badge"><?php echo esc_html($badge); ?></span><?php endif; ?>
    <img class="product-card__image js-product-img" src="<?php echo esc_url($image_url); ?>" alt="<?php echo esc_attr($image_alt); ?>" loading="lazy" decoding="async" width="800" height="800">
  </div>
  <div class="product-card__body">
    <h3 class="product-card__title"><?php echo esc_html($title); ?></h3>
    <?php if ($description) : ?><p class="product-card__description"><?php echo esc_html($description); ?></p><?php endif; ?>
    <?php if ($price) : ?><p class="product-card__price">$<span class="js-product-price-display"><?php echo esc_html($price); ?></span> COP</p><?php endif; ?>
    <?php if ($attribute_type !== 'ninguno' && !empty($variants)) : ?>
      <div class="product-card__variants" data-tipo="<?php echo esc_attr($attribute_type); ?>">
        <p class="product-card__variant-label"><?php echo esc_html(vd_get_variant_label($attribute_type)); ?></p>
        <div class="product-card__variant-options">
          <?php foreach ($variants as $index => $variant) : if (empty($variant['stock'])) { continue; }
            $variant_name = $variant['name'] ?? '';
            $variant_price = $variant['price'] ?: $raw_price;
            $variant_img = $variant['image_url'] ?? '';
            $variant_color = $variant['color'] ?? '';
          ?>
            <button type="button" class="variant-btn <?php echo $index === 0 ? 'is-active' : ''; ?>" data-name="<?php echo esc_attr($variant_name); ?>" data-price="<?php echo esc_attr($variant_price); ?>" data-img="<?php echo esc_url($variant_img); ?>" <?php if ($attribute_type === 'tono' && $variant_color) : ?>style="--variant-color: <?php echo esc_attr($variant_color); ?>;"<?php endif; ?> aria-label="<?php echo esc_attr($variant_name); ?>" aria-pressed="<?php echo $index === 0 ? 'true' : 'false'; ?>">
              <?php if ($attribute_type !== 'tono') : echo esc_html($variant_name); endif; ?>
            </button>
          <?php endforeach; ?>
        </div>
      </div>
    <?php endif; ?>
    <a class="button-primary product-card__button js-whatsapp-btn" href="<?php echo esc_url($initial_url); ?>" target="_blank" rel="noopener" data-base-text="<?php echo esc_attr($base_text); ?>" data-phone="<?php echo esc_attr($phone); ?>"><?php esc_html_e('Comprar por WhatsApp', 'variedades-dianery'); ?></a>
  </div>
</article>
