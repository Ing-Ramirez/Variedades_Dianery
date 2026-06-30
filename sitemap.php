<?php
/* Sitemap dinámico: home + cada producto activo (?p=<sku>). */
require_once __DIR__ . '/db.php';

header('Content-Type: application/xml; charset=utf-8');
header('Cache-Control: public, max-age=3600');

$DOMAIN = 'https://variedadesdianery.com';
$dataPath = __DIR__ . '/data.json';

echo '<?xml version="1.0" encoding="UTF-8"?>' . "\n";
echo '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">' . "\n";
echo "  <url><loc>$DOMAIN/</loc><changefreq>daily</changefreq><priority>1.0</priority></url>\n";

$data = load_store_any($dataPath); // DB si está configurada; si no, data.json
if (is_array($data) && !empty($data['products'])) {
    foreach ($data['products'] as $p) {
        if (!empty($p['active']) && !empty($p['sku'])) {
            $loc = $DOMAIN . '/?p=' . rawurlencode((string)$p['sku']);
            echo "  <url><loc>" . htmlspecialchars($loc, ENT_QUOTES) . "</loc><changefreq>weekly</changefreq><priority>0.8</priority></url>\n";
        }
    }
}
echo '</urlset>' . "\n";
