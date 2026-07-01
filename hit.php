<?php
/* ============================================================
   Variedades Dianery - Contador de visitas (privado, sin cookies/PII).

   La tienda hace POST aquí UNA vez por sesión del navegador. Se cuenta un
   "hit" por día en la tabla `visits`. El dashboard del admin agrega por mes.
   No se guarda IP, user-agent ni nada personal: solo un total por día.
   ============================================================ */
require_once __DIR__ . '/db.php';

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store, no-cache, must-revalidate');

// Solo cuenta peticiones POST (evita prefetch/caché por GET de los navegadores).
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(204);
    exit;
}

$pdo = db_conn();
if (!$pdo) { http_response_code(204); exit; } // sin DB → no cuenta

try {
    db_visits_init($pdo);
    $pdo->exec("INSERT INTO visits (day, hits) VALUES (CURDATE(), 1)
                ON DUPLICATE KEY UPDATE hits = hits + 1");
} catch (Throwable $e) {
    // No romper la tienda por un fallo de conteo.
}

http_response_code(204);
