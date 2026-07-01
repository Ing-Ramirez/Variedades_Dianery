<?php
/* ============================================================
   Variedades Dianery - Subida de imágenes de producto/banner.

   POST con { "image": "data:image/...;base64,..." } y el header
   X-Dianery-Admin-Token. Guarda el archivo en /uploads y responde
   { ok:true, url:"uploads/xxx.jpg" }. El store guarda solo la URL.
   ============================================================ */
require_once __DIR__ . '/img.php';
require_once __DIR__ . '/admin-auth.php';

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store, no-cache, must-revalidate');
header('X-Content-Type-Options: nosniff');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    respond_json(405, ['ok' => false, 'error' => 'Método no permitido.']);
}

require_admin();

$raw = file_get_contents('php://input');
if (strlen($raw) > 6 * 1024 * 1024) {
    respond_json(413, ['ok' => false, 'error' => 'Imagen demasiado grande.']);
}
$data = json_decode($raw, true);
$dataUrl = is_array($data) ? ($data['image'] ?? '') : '';

$url = dianery_save_image($dataUrl, __DIR__);
if ($url === '') {
    respond_json(400, ['ok' => false, 'error' => 'Imagen no válida. Usa JPG, PNG o WEBP (máx 3 MB).']);
}

respond_json(200, ['ok' => true, 'url' => $url]);
