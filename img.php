<?php
/* ============================================================
   Variedades Dianery - Utilidades de imagen (archivos en /uploads).

   Las imágenes de productos/banner se guardan como ARCHIVOS en /uploads y en
   los datos solo va la RUTA (p. ej. "uploads/ab12cd.jpg"), no el base64. Así el
   store JSON queda pequeño (no desborda el localStorage del navegador ni los
   POST al servidor).

   - dianery_safe_image_ref(): SOLO valida (no escribe). Acepta una data URL de
     imagen o una ruta relativa de /uploads y la devuelve normalizada, o "".
     Se usa al leer/guardar el store (no debe crear archivos en cada lectura).
   - dianery_save_image(): ESCRIBE. Decodifica una data URL y la guarda como
     archivo en /uploads, devolviendo la ruta relativa. Lo usan upload.php y la
     migración (nunca el camino de lectura).
   ============================================================ */

/* Valida una referencia de imagen sin escribir nada. */
function dianery_safe_image_ref($v) {
    $s = trim((string)$v);
    if ($s === '') return '';
    // Ruta de archivo ya subido. Se normaliza a root-absoluta "/uploads/xxx"
    // para que funcione igual desde la tienda ("/") y el admin ("/admin/").
    if (preg_match('#^/?uploads/[A-Za-z0-9._-]+\.(?:jpe?g|png|webp)$#i', $s)) {
        return '/' . ltrim($s, '/');
    }
    // Data URL de imagen (compatibilidad: productos viejos aún en base64).
    if (preg_match('#^data:image/(?:jpeg|jpg|png|webp);base64,[A-Za-z0-9+/=\r\n]+$#i', $s)) {
        // Límite de tamaño defensivo (~3MB decodificado).
        $b64 = substr($s, strpos($s, ',') + 1);
        $bin = base64_decode($b64, true);
        if ($bin === false || strlen($bin) > 3 * 1024 * 1024) return '';
        return $s;
    }
    return '';
}

/* Guarda una data URL como archivo en $baseDir/uploads y devuelve la ruta
   relativa ("uploads/xxx.ext") o "" si no es válida. */
function dianery_save_image($dataUrl, $baseDir) {
    if (!preg_match('#^data:(image/(?:jpeg|jpg|png|webp));base64,([A-Za-z0-9+/=\r\n]+)$#i', (string)$dataUrl, $m)) {
        return '';
    }
    $mime = strtolower($m[1]);
    $ext = ($mime === 'image/png') ? 'png' : (($mime === 'image/webp') ? 'webp' : 'jpg');
    $bin = base64_decode($m[2], true);
    if ($bin === false || strlen($bin) < 10 || strlen($bin) > 3 * 1024 * 1024) return '';

    // Verificación real del contenido (evita servir contenido activo disfrazado).
    if (function_exists('finfo_open')) {
        $finfo = finfo_open(FILEINFO_MIME_TYPE);
        if ($finfo) {
            $detected = finfo_buffer($finfo, $bin) ?: '';
            finfo_close($finfo);
            $ok = ['image/jpeg', 'image/png', 'image/webp'];
            if ($detected !== '' && !in_array($detected, $ok, true)) return '';
        }
    }

    $dir = rtrim($baseDir, "/\\") . '/uploads';
    if (!is_dir($dir) && !@mkdir($dir, 0755, true) && !is_dir($dir)) return '';

    try { $name = bin2hex(random_bytes(8)) . '.' . $ext; }
    catch (Throwable $e) { $name = uniqid('img_', true) . '.' . $ext; }

    if (@file_put_contents($dir . '/' . $name, $bin) === false) return '';
    return '/uploads/' . $name;
}
