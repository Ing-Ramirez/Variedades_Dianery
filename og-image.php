<?php
/* ============================================================
   Variedades Dianery — Imagen para OpenGraph
   Las imágenes de productos viven como data URL (base64) dentro de data.json.
   Los crawlers (WhatsApp/Facebook) no pueden usar data URLs como og:image, así
   que este script decodifica el base64 y lo sirve como imagen real.
   - /og-image.php?p=<sku>  → imagen principal del producto
   - /og-image.php          → imagen del banner (home) si existe
   ============================================================ */

$dataPath = __DIR__ . '/data.json';
$sku = isset($_GET['p']) ? trim((string)$_GET['p']) : '';
$dataUrl = '';

if (is_file($dataPath)) {
    $data = json_decode((string)file_get_contents($dataPath), true);
    if (is_array($data)) {
        if ($sku !== '' && !empty($data['products'])) {
            foreach ($data['products'] as $p) {
                if (isset($p['sku']) && (string)$p['sku'] === $sku && !empty($p['active'])) {
                    if (!empty($p['images'][0])) $dataUrl = $p['images'][0];
                    break;
                }
            }
        }
        if ($dataUrl === '' && !empty($data['config']['bannerImage'])) {
            $dataUrl = $data['config']['bannerImage'];
        }
    }
}

if (preg_match('#^data:(image/[a-zA-Z0-9.+-]+);base64,(.+)$#s', $dataUrl, $m)) {
    $bin = base64_decode($m[2]);
    if ($bin !== false) {
        header('Content-Type: ' . $m[1]);
        header('Cache-Control: public, max-age=300');
        echo $bin;
        exit;
    }
}

// Sin imagen → cae al favicon (fallback).
header('Location: /favicon.svg');
