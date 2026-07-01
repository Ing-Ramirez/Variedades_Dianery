<?php
/* ============================================================
   Variedades Dianery - Subida de imágenes de producto/banner.

   POST con { "image": "data:image/...;base64,..." } y el header
   X-Dianery-Admin-Token. Guarda el archivo en /uploads y responde
   { ok:true, url:"uploads/xxx.jpg" }. El store guarda solo la URL.
   ============================================================ */
require_once __DIR__ . '/img.php';

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store, no-cache, must-revalidate');
header('X-Content-Type-Options: nosniff');

function upl_admin_secret() {
    $env = getenv('DIANERY_ADMIN_TOKEN');
    if (is_string($env) && trim($env) !== '') return trim($env);
    $local = __DIR__ . '/.dianery-admin-token.php';
    if (is_file($local)) {
        $v = include $local;
        if (is_string($v) && trim($v) !== '') return trim($v);
    }
    return '';
}
function upl_header($name) {
    $k = 'HTTP_' . strtoupper(str_replace('-', '_', $name));
    return isset($_SERVER[$k]) ? trim((string)$_SERVER[$k]) : '';
}
function upl_json($status, $payload) {
    http_response_code($status);
    echo json_encode($payload, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    upl_json(405, ['ok' => false, 'error' => 'Método no permitido.']);
}

$secret = upl_admin_secret();
$provided = upl_header('X-Dianery-Admin-Token');
if ($secret === '' || $provided === '' || !hash_equals($secret, $provided)) {
    upl_json(401, ['ok' => false, 'error' => 'No autorizado.']);
}

$raw = file_get_contents('php://input');
if (strlen($raw) > 6 * 1024 * 1024) {
    upl_json(413, ['ok' => false, 'error' => 'Imagen demasiado grande.']);
}
$data = json_decode($raw, true);
$dataUrl = is_array($data) ? ($data['image'] ?? '') : '';

$url = dianery_save_image($dataUrl, __DIR__);
if ($url === '') {
    upl_json(400, ['ok' => false, 'error' => 'Imagen no válida. Usa JPG, PNG o WEBP (máx 3 MB).']);
}

upl_json(200, ['ok' => true, 'url' => $url]);
