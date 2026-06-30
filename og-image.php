<?php
/* ============================================================
   Variedades Dianery - Imagen para OpenGraph

   Sirve imagenes almacenadas como data URL en data.json para crawlers.
   Solo se permiten JPEG, PNG y WEBP para evitar servir contenido activo.
   ============================================================ */

header('X-Content-Type-Options: nosniff');

$dataPath = __DIR__ . '/data.json';
$sku = isset($_GET['p']) ? trim((string)$_GET['p']) : '';
$dataUrl = '';
$allowed = [
    'image/jpeg' => true,
    'image/png' => true,
    'image/webp' => true,
];

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

if (preg_match('#^data:(image/(?:jpeg|jpg|png|webp));base64,([A-Za-z0-9+/=\r\n]+)$#', $dataUrl, $m)) {
    $declared = strtolower($m[1]);
    if ($declared === 'image/jpg') $declared = 'image/jpeg';

    $bin = base64_decode($m[2], true);
    if ($bin !== false && strlen($bin) <= 3 * 1024 * 1024 && isset($allowed[$declared])) {
        $detected = $declared;
        if (function_exists('finfo_open')) {
            $finfo = finfo_open(FILEINFO_MIME_TYPE);
            if ($finfo) {
                $detected = finfo_buffer($finfo, $bin) ?: '';
                finfo_close($finfo);
            }
        }

        if ($detected === $declared) {
            header('Content-Type: ' . $declared);
            header('Cache-Control: public, max-age=300');
            echo $bin;
            exit;
        }
    }
}

header('Location: /favicon.svg');
