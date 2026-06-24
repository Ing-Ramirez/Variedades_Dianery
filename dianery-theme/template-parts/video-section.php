<section class="section video-section container">
  <div class="section__header"><h2 class="section__title"><?php esc_html_e('Video destacado', 'variedades-dianery'); ?></h2></div>
  <?php get_template_part('template-parts/faux', 'video', ['youtube_id' => '', 'title' => __('Contenido destacado', 'variedades-dianery'), 'thumbnail' => vd_get_placeholder_image_url()]); ?>
</section>
