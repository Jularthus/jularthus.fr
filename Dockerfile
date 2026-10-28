# jularthus.fr: the static site, served by an unprivileged nginx (uid 101, port 8080).
FROM nginxinc/nginx-unprivileged:1.27-alpine
ENV TZ=Europe/Paris
COPY ops/nginx/site.conf /etc/nginx/conf.d/default.conf
COPY public /usr/share/nginx/html
USER nginx
EXPOSE 8080
