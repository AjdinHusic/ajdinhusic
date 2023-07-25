FROM nginx:latest

COPY . /var/www

CMD ["nginx"]