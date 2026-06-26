<?php
/* ============================================================
   Variedades Dianery — Backend mínimo de datos compartidos
   GET  /api.php  → devuelve data.json (los datos de la tienda)
   POST /api.php  → guarda el cuerpo JSON en data.json
   Sin autenticación (decisión del dueño). Mismo origen, sin CORS.
   ============================================================ */

header('Content-Type: application/json; charset=utf-8');
// Nunca cachear: los datos cambian seguido.
header('Cache-Control: no-store, no-cache, must-revalidate');
header('Pragma: no-cache');

$file = __DIR__ . '/data.json';
$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    if (is_file($file)) {
        readfile($file);
    } else {
        // Todavía no hay datos guardados: el cliente usará su semilla local.
        http_response_code(204);
    }
    exit;
}

if ($method === 'POST') {
    $raw = file_get_contents('php://input');

    // Tope de tamaño (imágenes van como data URLs dentro del JSON).
    if (strlen($raw) > 25 * 1024 * 1024) {
        http_response_code(413);
        echo json_encode(['ok' => false, 'error' => 'Datos demasiado grandes (máx 25MB).']);
        exit;
    }

    $data = json_decode($raw, true);
    if (!is_array($data)) {
        http_response_code(400);
        echo json_encode(['ok' => false, 'error' => 'JSON inválido.']);
        exit;
    }

    // Escritura atómica: escribir a temporal y renombrar.
    $tmp = $file . '.tmp';
    if (file_put_contents($tmp, $raw, LOCK_EX) === false || !rename($tmp, $file)) {
        http_response_code(500);
        echo json_encode(['ok' => false, 'error' => 'No se pudo guardar en el servidor.']);
        exit;
    }

    echo json_encode(['ok' => true]);
    exit;
}

http_response_code(405);
echo json_encode(['ok' => false, 'error' => 'Método no permitido.']);
