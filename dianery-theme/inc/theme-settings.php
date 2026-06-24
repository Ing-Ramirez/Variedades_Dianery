<?php
/**
 * Opciones básicas administrables desde el personalizador.
 */

defined('ABSPATH') || exit;

function vd_customize_register(WP_Customize_Manager $wp_customize): void {
    $wp_customize->add_section('vd_brand_settings', [
        'title' => __('Ajustes de marca y contacto', 'variedades-dianery'),
        'priority' => 30,
    ]);

    $wp_customize->add_setting('vd_primary_color', [
        'default' => '#D95F3D',
        'sanitize_callback' => 'sanitize_hex_color',
    ]);
    $wp_customize->add_control(new WP_Customize_Color_Control($wp_customize, 'vd_primary_color', [
        'label' => __('Color principal', 'variedades-dianery'),
        'section' => 'vd_brand_settings',
    ]));

    $wp_customize->add_setting('vd_whatsapp_phone', [
        'default' => '',
        'sanitize_callback' => 'vd_sanitize_phone',
    ]);
    $wp_customize->add_control('vd_whatsapp_phone', [
        'label' => __('Número de WhatsApp internacional', 'variedades-dianery'),
        'section' => 'vd_brand_settings',
        'type' => 'text',
    ]);
}
add_action('customize_register', 'vd_customize_register');
