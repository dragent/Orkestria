FROM php:8.4-fpm-alpine

RUN apk add --no-cache \
    git \
    zip \
    unzip \
    curl \
    libpq-dev \
    icu-dev \
    oniguruma-dev \
    libzip-dev

RUN docker-php-ext-install \
    pdo \
    pdo_pgsql \
    intl \
    zip \
    opcache \
    mbstring

COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

COPY docker/php/php.ini /usr/local/etc/php/conf.d/app.ini

ENV APP_ENV=dev

WORKDIR /var/www/html

COPY backend/ .

RUN git config --global --add safe.directory /var/www/html \
    && composer install  --optimize-autoloader --no-interaction \
    && chown -R www-data:www-data /var/www/html/var
