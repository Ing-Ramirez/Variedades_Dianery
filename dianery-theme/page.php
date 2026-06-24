<?php
defined('ABSPATH') || exit;
get_header();
while (have_posts()) : the_post(); ?>
  <article class="page-content container">
    <h1><?php the_title(); ?></h1>
    <div><?php the_content(); ?></div>
  </article>
<?php endwhile;
get_footer();
