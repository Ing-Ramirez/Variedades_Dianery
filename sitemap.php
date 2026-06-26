<?php
/* Sitemap dinámico: home + cada producto activo (?p=<sku>). */
header('Content-Type: application/xml; charset=utf-8');
header('Cache-Control: public, max-age=3600');

$DOMAIN = 'https://variedadesdianery.com';
$dataPath = __DIR__ . '/data.json';

echo '<?xml version="1.0" encoding="UTF-8"?>' . "\n";
echo '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">' . "\n";
echo "  <url><loc>$DOMAIN/</loc><changefreq>daily</changefreq><priority>1.0</priority></url>\n";

if (is_file($dataPath)) {
    $data = json_decode((string)file_get_contents($dataPath), true);
    if (is_array($data) && !empty($data['products'])) {
        foreach ($data['products'] as $p) {
            if (!empty($p['active']) && !empty($p['sku'])) {
                $loc = $DOMAIN . '/?p=' . rawurlencode((string)$p['sku']);
                echo "  <url><loc>" . htmlspecialchars($loc, ENT_QUOTES) . "</loc><changefreq>weekly</changefreq><priority>0.8</priority></url>\n";
            }
        }
    }
}
echo '</urlset>' . "\n";
