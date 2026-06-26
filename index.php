<?php
/* ============================================================
   Variedades Dianery — Router SEO/OpenGraph
   Entrega la SPA (index.html) inyectando metadatos dinámicos:
   - /            → metadatos por defecto (tienda) + JSON-LD Store
   - /?p=<sku>    → título, descripción, OpenGraph e imagen del producto
                    + JSON-LD Product (para previews de WhatsApp/Facebook y SEO)
   La imagen OG la sirve og-image.php (decodifica el data URL del producto).
   ============================================================ */

header('Cache-Control: no-cache, no-store, must-revalidate');
header('Content-Type: text/html; charset=utf-8');

$DOMAIN   = 'https://variedadesdianery.com';
$htmlPath = __DIR__ . '/index.html';
$dataPath = __DIR__ . '/data.json';

$html = @file_get_contents($htmlPath);
if ($html === false) { http_response_code(500); echo 'index.html no encontrado'; exit; }

function esc($s) { return htmlspecialchars((string)$s, ENT_QUOTES, 'UTF-8'); }
function fmtCOP($n) { return '$' . number_format((float)$n, 0, ',', '.'); }

$sku = isset($_GET['p']) ? trim((string)$_GET['p']) : '';
$config = null; $product = null;

if (is_file($dataPath)) {
    $data = json_decode((string)file_get_contents($dataPath), true);
    if (is_array($data)) {
        $config = $data['config'] ?? null;
        if ($sku !== '' && !empty($data['products'])) {
            foreach ($data['products'] as $p) {
                if (isset($p['sku']) && (string)$p['sku'] === $sku && !empty($p['active'])) { $product = $p; break; }
            }
        }
    }
}

$brand = ($config && !empty($config['brandName'])) ? $config['brandName'] : 'Variedades Dianery';

if ($product) {
    $title = esc($product['name']) . ' — ' . esc($brand);
    $descRaw = trim((string)($product['desc'] ?? ''));
    if ($descRaw === '') $descRaw = $product['name'] . ' · ' . fmtCOP($product['price']);
    $desc  = esc($descRaw);
    $url   = $DOMAIN . '/?p=' . rawurlencode($sku);
    $img   = $DOMAIN . '/og-image.php?p=' . rawurlencode($sku);
    $inStock = (!empty($product['stock']) && (float)$product['stock'] > 0);

    $jsonld = json_encode([
        '@context' => 'https://schema.org', '@type' => 'Product',
        'name' => $product['name'], 'description' => $descRaw,
        'sku' => (string)$product['sku'], 'category' => $product['tag'] ?? '',
        'image' => $img,
        'offers' => [
            '@type' => 'Offer', 'price' => (float)($product['price'] ?? 0),
            'priceCurrency' => 'COP', 'url' => $url,
            'availability' => $inStock ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
        ],
    ], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);

    $seo = "<title>$title</title>\n"
         . "<meta name=\"description\" content=\"$desc\" />\n"
         . "<link rel=\"canonical\" href=\"$url\" />\n"
         . "<meta property=\"og:type\" content=\"product\" />\n"
         . "<meta property=\"og:site_name\" content=\"" . esc($brand) . "\" />\n"
         . "<meta property=\"og:title\" content=\"$title\" />\n"
         . "<meta property=\"og:description\" content=\"$desc\" />\n"
         . "<meta property=\"og:url\" content=\"$url\" />\n"
         . "<meta property=\"og:image\" content=\"$img\" />\n"
         . "<meta name=\"twitter:card\" content=\"summary_large_image\" />\n"
         . "<script type=\"application/ld+json\">$jsonld</script>";

    // Reemplaza el bloque SEO por defecto por el del producto.
    $html = preg_replace('/<!--SEO-START-->.*?<!--SEO-END-->/s', $seo, $html, 1);
} else {
    // Home: agrega JSON-LD de la tienda antes de </head> (los meta por defecto ya están).
    $jsonld = json_encode([
        '@context' => 'https://schema.org', '@type' => 'Store',
        'name' => $brand, 'url' => $DOMAIN . '/', 'image' => $DOMAIN . '/og-image.php',
    ], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    $html = str_replace('</head>', "<script type=\"application/ld+json\">$jsonld</script>\n</head>", $html);
}

echo $html;
