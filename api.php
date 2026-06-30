<?php
/* ============================================================
   Variedades Dianery - API de datos compartidos

   GET  /api.php  -> datos publicos para la tienda.
   GET  /api.php con X-Dianery-Admin-Token -> store completo para Admin.
   POST /api.php con X-Dianery-Admin-Token -> guarda el store completo.

   El token NO se versiona. Configurarlo con:
   - variable de entorno DIANERY_ADMIN_TOKEN, o
   - archivo local .dianery-admin-token.php que retorne el token.
   ============================================================ */

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store, no-cache, must-revalidate');
header('Pragma: no-cache');
header('X-Content-Type-Options: nosniff');

require_once __DIR__ . '/db.php';

$file = __DIR__ . '/data.json';
$method = $_SERVER['REQUEST_METHOD'];
$maxPayloadBytes = 25 * 1024 * 1024;

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

function str_value($v, $max = 500) {
    $s = trim((string)($v ?? ''));
    if (function_exists('mb_substr')) return mb_substr($s, 0, $max, 'UTF-8');
    return substr($s, 0, $max);
}

function bool_value($v) {
    return is_bool($v) ? $v : filter_var($v, FILTER_VALIDATE_BOOLEAN, FILTER_NULL_ON_FAILURE) === true;
}

function num_value($v, $min = 0) {
    $n = is_numeric($v) ? (float)$v : $min;
    return max($min, $n);
}

function int_value($v, $min = 0) {
    return (int)round(num_value($v, $min));
}

function safe_url($v, $allowHash = true) {
    $url = str_value($v, 2048);
    if ($allowHash && ($url === '' || $url === '#')) return '#';
    $parts = parse_url($url);
    if (!$parts || empty($parts['scheme'])) return '#';
    $scheme = strtolower($parts['scheme']);
    return in_array($scheme, ['https', 'http', 'mailto', 'tel'], true) ? $url : '#';
}

function safe_image_data_url($v) {
    $s = str_value($v, 25 * 1024 * 1024);
    if ($s === '') return '';
    if (!preg_match('#^data:(image/(?:jpeg|jpg|png|webp));base64,([A-Za-z0-9+/=\r\n]+)$#', $s, $m)) {
        return '';
    }
    $bin = base64_decode($m[2], true);
    if ($bin === false || strlen($bin) > 3 * 1024 * 1024) return '';
    return $s;
}

function sanitize_config($config) {
    $config = is_array($config) ? $config : [];
    $contact = is_array($config['contact'] ?? null) ? $config['contact'] : [];
    $closing = is_array($config['closing'] ?? null) ? $config['closing'] : [];
    $chat = is_array($config['chat'] ?? null) ? $config['chat'] : [];
    $social = is_array($config['socialLinks'] ?? null) ? $config['socialLinks'] : [];

    $socialLinks = [];
    foreach (array_slice($social, 0, 10) as $item) {
        if (!is_array($item)) continue;
        $socialLinks[] = [
            'name' => str_value($item['name'] ?? '', 80),
            'href' => safe_url($item['href'] ?? '#'),
            'icon' => str_value($item['icon'] ?? 'instagram', 40),
        ];
    }

    return [
        'brandName' => str_value($config['brandName'] ?? 'Variedades Dianery', 120),
        'tagline' => str_value($config['tagline'] ?? 'Tienda de variedades', 160),
        'bannerKicker' => str_value($config['bannerKicker'] ?? '', 160),
        'bannerTitle' => str_value($config['bannerTitle'] ?? '', 240),
        'bannerImage' => safe_image_data_url($config['bannerImage'] ?? ''),
        'closing' => [
            'enabled' => bool_value($closing['enabled'] ?? true),
            'kicker' => str_value($closing['kicker'] ?? '', 160),
            'title' => str_value($closing['title'] ?? '', 240),
            'highlightedText' => str_value($closing['highlightedText'] ?? '', 160),
        ],
        'contact' => [
            'title' => str_value($contact['title'] ?? '', 160),
            'phone' => str_value($contact['phone'] ?? '', 80),
            'whatsapp' => str_value($contact['whatsapp'] ?? '', 80),
            'email' => str_value($contact['email'] ?? '', 160),
            'schedule' => str_value($contact['schedule'] ?? '', 160),
        ],
        'socialLinks' => $socialLinks,
        'chat' => [
            'enabled' => bool_value($chat['enabled'] ?? true),
            'provider' => str_value($chat['provider'] ?? 'whatsapp', 40),
            'label' => str_value($chat['label'] ?? 'Habla con nosotros', 120),
            'href' => safe_url($chat['href'] ?? '#'),
        ],
    ];
}

function sanitize_products($products) {
    $out = [];
    if (!is_array($products)) return $out;
    foreach (array_slice($products, 0, 500) as $p) {
        if (!is_array($p)) continue;
        $images = [];
        foreach (array_slice(($p['images'] ?? []), 0, 5) as $img) {
            $safe = safe_image_data_url($img);
            if ($safe !== '') $images[] = $safe;
        }
        $out[] = [
            'id' => str_value($p['id'] ?? ('p' . time()), 80),
            'name' => str_value($p['name'] ?? '', 160),
            'tag' => str_value($p['tag'] ?? '', 80),
            'desc' => str_value($p['desc'] ?? '', 1000),
            'price' => num_value($p['price'] ?? 0),
            'stock' => int_value($p['stock'] ?? 0),
            'sku' => str_value($p['sku'] ?? '', 120),
            'active' => bool_value($p['active'] ?? false),
            'images' => $images,
        ];
    }
    return $out;
}

function sanitize_categories($categories, $products) {
    $items = is_array($categories) ? $categories : [];
    foreach ($products as $p) {
        if (!empty($p['tag'])) $items[] = $p['tag'];
    }
    $clean = [];
    foreach ($items as $item) {
        $name = str_value($item, 80);
        if ($name !== '' && !in_array($name, $clean, true)) $clean[] = $name;
    }
    sort($clean, SORT_NATURAL | SORT_FLAG_CASE);
    return $clean;
}

function sanitize_orders($orders) {
    $out = [];
    if (!is_array($orders)) return $out;
    $allowed = ['Nuevo', 'Preparando', 'Enviado', 'Entregado', 'Cancelado'];
    foreach (array_slice($orders, 0, 1000) as $o) {
        if (!is_array($o)) continue;
        $status = str_value($o['status'] ?? 'Nuevo', 40);
        if (!in_array($status, $allowed, true)) $status = 'Nuevo';
        $out[] = [
            'id' => str_value($o['id'] ?? '', 80),
            'customer' => str_value($o['customer'] ?? '', 160),
            'city' => str_value($o['city'] ?? '', 120),
            'date' => str_value($o['date'] ?? '', 40),
            'items' => int_value($o['items'] ?? 0),
            'total' => num_value($o['total'] ?? 0),
            'status' => $status,
        ];
    }
    return $out;
}

function sanitize_customers($customers) {
    $out = [];
    if (!is_array($customers)) return $out;
    foreach (array_slice($customers, 0, 1000) as $c) {
        if (!is_array($c)) continue;
        $email = str_value($c['email'] ?? '', 160);
        if ($email !== '' && !filter_var($email, FILTER_VALIDATE_EMAIL)) $email = '';
        $out[] = [
            'id' => str_value($c['id'] ?? '', 80),
            'name' => str_value($c['name'] ?? '', 160),
            'email' => $email,
            'city' => str_value($c['city'] ?? '', 120),
            'orders' => int_value($c['orders'] ?? 0),
            'spent' => num_value($c['spent'] ?? 0),
            'since' => str_value($c['since'] ?? '', 40),
        ];
    }
    return $out;
}

function sanitize_metrics($metrics) {
    $metrics = is_array($metrics) ? $metrics : [];
    $sales = [];
    foreach (array_slice(($metrics['salesByMonth'] ?? []), 0, 24) as $row) {
        if (!is_array($row)) continue;
        $sales[] = ['m' => str_value($row['m'] ?? '', 20), 'v' => num_value($row['v'] ?? 0)];
    }
    return [
        'visitsMonth' => int_value($metrics['visitsMonth'] ?? 0),
        'visitsDelta' => num_value($metrics['visitsDelta'] ?? 0, -1000000),
        'salesByMonth' => $sales,
    ];
}

function sanitize_store($data) {
    if (!is_array($data)) return null;
    $products = sanitize_products($data['products'] ?? []);
    return [
        'config' => sanitize_config($data['config'] ?? []),
        'categories' => sanitize_categories($data['categories'] ?? [], $products),
        'products' => $products,
        'orders' => sanitize_orders($data['orders'] ?? []),
        'customers' => sanitize_customers($data['customers'] ?? []),
        'metrics' => sanitize_metrics($data['metrics'] ?? []),
    ];
}

function public_store($data) {
    $data = sanitize_store($data);
    if (!$data) return null;
    return [
        'config' => $data['config'],
        'categories' => $data['categories'],
        'products' => array_values(array_filter($data['products'], function ($p) {
            return !empty($p['active']);
        })),
    ];
}

/* Lee data.json (almacenamiento de respaldo / semilla de migración). */
function load_store_file($file) {
    if (!is_file($file)) return null;
    $raw = file_get_contents($file);
    if ($raw === false) return null;
    $data = json_decode((string)$raw, true);
    return is_array($data) ? $data : null;
}

/* Lee el store de la fuente de verdad: la base de datos si está configurada,
   o data.json si no. La PRIMERA vez que la DB está vacía, la siembra con
   data.json (migración automática, sin perder datos). Si la DB está
   configurada pero caída, $dberr = true (api.php responde 503, no sirve
   datos viejos del archivo). */
function read_store($file, &$dberr) {
    $dberr = false;
    if (db_is_configured()) {
        $pdo = db_conn();
        if (!$pdo) { $dberr = true; return null; }
        db_init($pdo);
        $data = db_load_store($pdo);
        if ($data !== null) return $data;
        // DB vacía: migra desde data.json si existe (una sola vez).
        $seed = load_store_file($file);
        if ($seed !== null) {
            db_save_store($pdo, sanitize_store($seed));
            return $seed;
        }
        return null; // DB ok pero sin datos
    }
    return load_store_file($file);
}

/* Guarda el store en la DB si está configurada; si no, en data.json (atómico).
   Si la DB está configurada pero caída, NO escribe el archivo: devuelve error. */
function write_store($file, $clean, &$error) {
    if (db_is_configured()) {
        $pdo = db_conn();
        if (!$pdo) { $error = 'Base de datos no disponible.'; return false; }
        db_init($pdo);
        if (db_save_store($pdo, $clean)) return true;
        $error = 'No se pudo guardar en la base de datos.';
        return false;
    }
    $encoded = json_encode($clean, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    if ($encoded === false) { $error = 'No se pudo codificar el JSON.'; return false; }
    $tmp = $file . '.tmp';
    if (file_put_contents($tmp, $encoded, LOCK_EX) === false || !rename($tmp, $file)) {
        $error = 'No se pudo guardar en el servidor.';
        return false;
    }
    return true;
}

if ($method === 'GET') {
    $dberr = false;
    $data = read_store($file, $dberr);
    if ($dberr) {
        respond_json(503, ['ok' => false, 'error' => 'Base de datos no disponible. Intenta de nuevo.']);
    }
    if (!$data) {
        http_response_code(204);
        exit;
    }

    if (request_header('X-Dianery-Admin-Token') !== '') {
        require_admin();
        respond_json(200, sanitize_store($data));
    }

    respond_json(200, public_store($data));
}

if ($method === 'POST') {
    require_admin();
    $raw = file_get_contents('php://input');
    if (strlen($raw) > $maxPayloadBytes) {
        respond_json(413, ['ok' => false, 'error' => 'Datos demasiado grandes (max 25MB).']);
    }

    $data = json_decode($raw, true);
    $clean = sanitize_store($data);
    if (!$clean || !isset($clean['config'], $clean['products'])) {
        respond_json(400, ['ok' => false, 'error' => 'JSON invalido o estructura no permitida.']);
    }

    $error = '';
    if (!write_store($file, $clean, $error)) {
        respond_json(500, ['ok' => false, 'error' => $error ?: 'No se pudo guardar.']);
    }

    respond_json(200, ['ok' => true]);
}

respond_json(405, ['ok' => false, 'error' => 'Metodo no permitido.']);
