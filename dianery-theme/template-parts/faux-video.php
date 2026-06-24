<?php
$youtube_id = $args['youtube_id'] ?? '';
$title = $args['title'] ?? __('Video destacado', 'variedades-dianery');
$thumbnail = $args['thumbnail'] ?? vd_get_placeholder_image_url();
?>
<div class="video-card js-video" data-video-id="<?php echo esc_attr($youtube_id); ?>">
  <button class="video-card__button" type="button" aria-label="<?php echo esc_attr(sprintf(__('Reproducir video: %s', 'variedades-dianery'), $title)); ?>">
    <img class="video-card__thumbnail" src="<?php echo esc_url($thumbnail); ?>" alt="<?php echo esc_attr($title); ?>" loading="lazy" decoding="async" width="1280" height="720">
    <span class="video-card__play" aria-hidden="true"></span>
  </button>
</div>
