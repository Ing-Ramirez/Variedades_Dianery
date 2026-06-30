# Seguridad operativa

## Token del admin

`api.php` exige un token para leer o escribir datos privados desde el admin.

Configurar una de estas opciones en produccion:

1. Variable de entorno `DIANERY_ADMIN_TOKEN`.
2. Archivo local no versionado `.dianery-admin-token.php`:

```php
<?php
return 'token-largo-privado';
```

No subir `.dianery-admin-token.php` al repositorio ni al deploy automatizado.

## GitHub Actions SSH

El workflow de deploy requiere el secret `SSH_KNOWN_HOSTS`. Debe contener la clave publica del host SSH de Hostinger ya verificada por un canal confiable.

No usar `StrictHostKeyChecking=no` ni confiar en `ssh-keyscan` durante el deploy.

## Datos generados

`data.json` y `data.json.tmp` son datos del servidor. No se versionan y no se despliegan desde Git.
