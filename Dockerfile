FROM nginx:alpine

WORKDIR /usr/share/nginx/html

COPY index.html .
COPY css/ css/
COPY js/ js/
COPY img/ img/
COPY sound/ sound/

EXPOSE 80
