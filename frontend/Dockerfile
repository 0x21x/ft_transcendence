FROM nginx:1.21.3-alpine

ADD nginx.conf /etc/nginx/nginx.conf.template
ADD app /usr/share/nginx/html
ADD certs /etc/nginx/ssl
ADD media /var/www/avatars

CMD ["/bin/sh" , "-c" , "envsubst '${API_PORT}' < /etc/nginx/nginx.conf.template > /etc/nginx/conf.d/default.conf && exec nginx -g 'daemon off;'"]