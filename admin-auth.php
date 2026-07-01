<?php
/* ============================================================
   Variedades Dianery - Autenticación de administrador (compartida).

   Helpers usados por api.php, upload.php y ai.php. El token NO se
   versiona: variable de entorno DIANERY_ADMIN_TOKEN o archivo local
   .dianery-admin-token.php que retorna el token (solo en el servidor).
   ============================================================ */

function respond_json($status, $payload) {
    http_response_code($status);
    echo json_encode($payload, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

function admin_secret() {
    $env = getenv('DIANERY_ADMIN_TOKEN');
    if (is_string($env) && trim($env) !== '') return trim($env);

    $local = __DIR__ . '/.dianery-admin-token.php';
    if (is_file($local)) {
        $value = include $local;
        if (is_string($value) && trim($value) !== '') return trim($value);
    }
    return '';
}

function request_header($name) {
    $key = 'HTTP_' . strtoupper(str_replace('-', '_', $name));
    return isset($_SERVER[$key]) ? trim((string)$_SERVER[$key]) : '';
}

function require_admin() {
    $secret = admin_secret();
    if ($secret === '') {
        respond_json(503, [
            'ok' => false,
            'error' => 'Token de administracion no configurado en el servidor.'
        ]);
    }

    $provided = request_header('X-Dianery-Admin-Token');
    if ($provided === '' || !hash_equals($secret, $provided)) {
        respond_json(401, ['ok' => false, 'error' => 'No autorizado.']);
    }
}
