# Variedades Dianery — sitio estático (tienda + admin) servido con nginx.
# Se sirve por HTTP porque los .jsx se cargan por red (file:// no funciona).
FROM nginx:alpine

# Config: raíz → Tienda, /admin → panel
COPY default.conf /etc/nginx/conf.d/default.conf

# Archivos del sitio
COPY . /usr/share/nginx/html

EXPOSE 80
