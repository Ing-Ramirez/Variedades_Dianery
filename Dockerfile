# Dev = espejo de producción (Hostinger): PHP + Apache + .htaccess.
# Hostinger corre LiteSpeed+PHP (compatible con Apache/.htaccess); usamos
# php:apache para que api.php y el .htaccess funcionen IGUAL que en producción.
FROM php:8.2-apache

# Módulos que usa el sitio: headers (cabeceras no-cache del .htaccess) y rewrite.
RUN a2enmod headers rewrite

# Extensión MySQL para api.php (Hostinger ya la trae; aquí la instalamos para paridad).
RUN docker-php-ext-install pdo_mysql

# Permitir .htaccess en el web root, como en Hostinger.
RUN sed -ri 's!AllowOverride None!AllowOverride All!g' /etc/apache2/apache2.conf

# DocumentRoot por defecto = /var/www/html (ahí se monta el proyecto).
# index.html es el índice por defecto de Apache → "/" sirve la tienda, igual que en prod.
EXPOSE 80
