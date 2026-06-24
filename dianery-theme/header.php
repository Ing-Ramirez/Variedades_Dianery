<?php
/** Header del tema. */
defined('ABSPATH') || exit;
?><!doctype html>
<html <?php language_attributes(); ?>>
<head>
  <meta charset="<?php bloginfo('charset'); ?>">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <?php wp_head(); ?>
</head>
<body <?php body_class(); ?>>
<?php wp_body_open(); ?>
<header class="site-header">
  <div class="site-header__inner container">
    <a class="site-header__brand" href="<?php echo esc_url(home_url('/')); ?>" aria-label="<?php echo esc_attr(get_bloginfo('name')); ?>">
      <?php if (has_custom_logo()) { the_custom_logo(); } else { echo esc_html(get_bloginfo('name')); } ?>
    </a>
    <button class="site-header__toggle js-menu-toggle" type="button" aria-expanded="false" aria-controls="primary-menu">
      <span><?php esc_html_e('Menú', 'variedades-dianery'); ?></span>
    </button>
    <nav class="site-header__nav js-primary-nav" id="primary-menu" aria-label="<?php esc_attr_e('Menú principal', 'variedades-dianery'); ?>">
      <?php wp_nav_menu(['theme_location' => 'primary', 'container' => false, 'fallback_cb' => false]); ?>
    </nav>
  </div>
</header>
<main id="content" class="site-main">
