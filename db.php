<?php
/* ============================================================
   Variedades Dianery - Conexión a base de datos (MySQL/MariaDB).

   El "store" completo (config, categorías, productos, pedidos, clientes,
   métricas) se guarda como un único JSON en la tabla `store_kv` (clave
   'store'). Es el mismo formato que data.json, pero persistido en la base
   de datos de Hostinger → robusto entre sesiones y fácil de respaldar.

   Credenciales (NO se versionan). Se leen en este orden:
   1. Variables de entorno  DIANERY_DB_HOST/NAME/USER/PASS  (dev/Docker).
   2. Archivo local  .dianery-db.php  que retorna un array (producción).
   Si no hay credenciales o falla la conexión, db_conn() devuelve null y
   api.php cae automáticamente a data.json (compatibilidad hacia atrás).
   ============================================================ */

function db_config() {
    static $cached = false; // false = aún no resuelto
    if ($cached !== false) return $cached;
    $cached = db_config_resolve();
    return $cached;
}

/* True si hay credenciales de DB (entorno o archivo). Cuando es true, la DB
   es la ÚNICA fuente de verdad: api.php NO cae a data.json (evita servir o
   escribir datos viejos si la DB está momentáneamente caída). */
function db_is_configured() {
    return db_config() !== null;
}

function db_config_resolve() {
    // 1) Variables de entorno (las usa el Docker de desarrollo).
    $envName = getenv('DIANERY_DB_NAME');
    $envUser = getenv('DIANERY_DB_USER');
    if (is_string($envName) && $envName !== '' && is_string($envUser) && $envUser !== '') {
        $envHost = getenv('DIANERY_DB_HOST');
        $envPass = getenv('DIANERY_DB_PASS');
        return [
            'host' => ($envHost !== false && $envHost !== '') ? $envHost : 'localhost',
            'name' => $envName,
            'user' => $envUser,
            'pass' => ($envPass !== false) ? $envPass : '',
            'charset' => 'utf8mb4',
        ];
    }

    // 2) Archivo local de producción (.dianery-db.php).
    $local = __DIR__ . '/.dianery-db.php';
    if (is_file($local)) {
        $cfg = include $local;
        if (is_array($cfg) && !empty($cfg['name']) && !empty($cfg['user'])) {
            return array_merge(
                ['host' => 'localhost', 'pass' => '', 'charset' => 'utf8mb4'],
                $cfg
            );
        }
    }
    return null;
}

/* Devuelve una instancia PDO conectada, o null si no hay credenciales o
   la conexión falla (en cuyo caso api.php usa data.json). Cachea el resultado. */
function db_conn() {
    static $pdo = false; // false = aún no intentado
    if ($pdo !== false) return $pdo;

    $cfg = db_config();
    if (!$cfg) { $pdo = null; return null; }

    $dsn = "mysql:host={$cfg['host']};dbname={$cfg['name']};charset={$cfg['charset']}";
    try {
        $pdo = new PDO($dsn, $cfg['user'], $cfg['pass'], [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES => false,
        ]);
    } catch (Throwable $e) {
        $pdo = null; // sin DB → el caller cae a data.json
    }
    return $pdo;
}

/* Crea la tabla si no existe. Idempotente. */
function db_init($pdo) {
    $pdo->exec(
        "CREATE TABLE IF NOT EXISTS store_kv (
            k VARCHAR(64) NOT NULL PRIMARY KEY,
            v LONGTEXT NOT NULL,
            updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4"
    );
}

/* Lee el store (array asociativo) o null si no hay registro / falla. */
function db_load_store($pdo) {
    try {
        $st = $pdo->query("SELECT v FROM store_kv WHERE k = 'store' LIMIT 1");
        $row = $st ? $st->fetch() : null;
        if (!$row || !isset($row['v'])) return null;
        $data = json_decode($row['v'], true);
        return is_array($data) ? $data : null;
    } catch (Throwable $e) {
        return null;
    }
}

/* Crea la tabla de visitas si no existe. Idempotente. */
function db_visits_init($pdo) {
    $pdo->exec(
        "CREATE TABLE IF NOT EXISTS visits (
            day DATE NOT NULL PRIMARY KEY,
            hits INT UNSIGNED NOT NULL DEFAULT 0
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4"
    );
}

/* Resumen de visitas para el dashboard: total del mes actual, del mes anterior
   y global. Devuelve ceros si la tabla no existe o falla. */
function db_visit_stats($pdo) {
    $zero = ['month' => 0, 'prev' => 0, 'total' => 0];
    try {
        db_visits_init($pdo);
        $sql = "SELECT
            COALESCE(SUM(CASE WHEN day >= DATE_FORMAT(CURDATE(), '%Y-%m-01') THEN hits END), 0) AS m,
            COALESCE(SUM(CASE WHEN day >= DATE_FORMAT(CURDATE() - INTERVAL 1 MONTH, '%Y-%m-01')
                              AND day <  DATE_FORMAT(CURDATE(), '%Y-%m-01') THEN hits END), 0) AS p,
            COALESCE(SUM(hits), 0) AS t
            FROM visits";
        $st = $pdo->query($sql);
        $r = $st ? $st->fetch() : null;
        if (!$r) return $zero;
        return ['month' => (int)$r['m'], 'prev' => (int)$r['p'], 'total' => (int)$r['t']];
    } catch (Throwable $e) {
        return $zero;
    }
}

/* Lectura conveniente para index.php / og-image.php / sitemap.php:
   devuelve el store desde la DB si está configurada y tiene datos; si no,
   desde data.json. Solo lectura (no crea tabla ni siembra). */
function load_store_any($file) {
    $pdo = db_conn();
    if ($pdo) {
        $data = db_load_store($pdo);
        if ($data !== null) return $data;
    }
    if (is_file($file)) {
        $d = json_decode((string)@file_get_contents($file), true);
        if (is_array($d)) return $d;
    }
    return null;
}

/* Guarda el store (array) como JSON. Devuelve true/false. */
function db_save_store($pdo, $data) {
    $json = json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    if ($json === false) return false;
    try {
        $st = $pdo->prepare(
            "INSERT INTO store_kv (k, v) VALUES ('store', :v)
             ON DUPLICATE KEY UPDATE v = :v2"
        );
        $st->execute([':v' => $json, ':v2' => $json]);
        return true;
    } catch (Throwable $e) {
        return false;
    }
}
