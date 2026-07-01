<?php
/* ============================================================
   Variedades Dianery - Migración de imágenes base64 → archivos.

   Convierte las imágenes que aún están como data URL (productos y banner)
   dentro del store a ARCHIVOS en /uploads, dejando solo la ruta. Así el
   store queda pequeño (no desborda el localStorage ni los POST).

   SOLO por línea de comandos (no accesible por web). Idempotente.
   Uso:  php migrate-images.php
   ============================================================ */
if (PHP_SAPI !== 'cli') { http_response_code(403); exit("Solo por CLI.\n"); }

require_once __DIR__ . '/db.php';
require_once __DIR__ . '/img.php';

$pdo = db_conn();
if (!$pdo) { fwrite(STDERR, "Sin conexión a la base de datos.\n"); exit(1); }

$store = db_load_store($pdo);
if (!is_array($store)) { echo "Store vacío, nada que migrar.\n"; exit(0); }

$converted = 0; $kept = 0;

if (!empty($store['products']) && is_array($store['products'])) {
    foreach ($store['products'] as &$p) {
        if (empty($p['images']) || !is_array($p['images'])) continue;
        foreach ($p['images'] as &$img) {
            if (is_string($img) && strpos($img, 'data:image/') === 0) {
                $url = dianery_save_image($img, __DIR__);
                if ($url !== '') { $img = $url; $converted++; }
            } else { $kept++; }
        }
        unset($img);
    }
    unset($p);
}

if (!empty($store['config']['bannerImage']) && strpos($store['config']['bannerImage'], 'data:image/') === 0) {
    $url = dianery_save_image($store['config']['bannerImage'], __DIR__);
    if ($url !== '') { $store['config']['bannerImage'] = $url; $converted++; }
}

if ($converted > 0) {
    db_save_store($pdo, $store);
}
echo "Imágenes convertidas a archivos: $converted (ya eran archivo: $kept)\n";
