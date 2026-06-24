<?php
$banners = $args['banners'] ?? [];
$banner = $banners[0] ?? [];
if (!$banner) {
    return;
}
?>
<section class="hero" aria-label="<?php esc_attr_e('Campaña principal', 'variedades-dianery'); ?>">
  <div class="hero__inner container">
    <div class="hero__content">
      <?php if (!empty($banner['eyebrow'])) : ?><p class="hero__eyebrow"><?php echo esc_html($banner['eyebrow']); ?></p><?php endif; ?>
      <h1 class="hero__title"><?php echo esc_html($banner['title']); ?></h1>
      <?php if (!empty($banner['subtitle'])) : ?><p class="hero__subtitle"><?php echo esc_html($banner['subtitle']); ?></p><?php endif; ?>
      <?php if (!empty($banner['button_text']) && !empty($banner['button_url'])) : ?>
        <a class="button-primary" href="<?php echo esc_url($banner['button_url']); ?>"><?php echo esc_html($banner['button_text']); ?></a>
      <?php endif; ?>
    </div>
    <?php if (!empty($banner['desktop_image'])) : ?>
      <picture class="hero__picture">
        <?php if (!empty($banner['mobile_image'])) : ?><source media="(max-width: 767px)" srcset="<?php echo esc_url($banner['mobile_image']); ?>"><?php endif; ?>
        <img src="<?php echo esc_url($banner['desktop_image']); ?>" alt="<?php echo esc_attr($banner['alt'] ?? $banner['title']); ?>" width="1920" height="700" fetchpriority="high" decoding="async">
      </picture>
    <?php endif; ?>
  </div>
</section>
