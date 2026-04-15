FROM php:8.2-fpm-alpine

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

WORKDIR /var/www/html

COPY backend/ .

RUN composer install --no-dev --optimize-autoloader --no-interaction \
    && chown -R www-data:www-data /var/www/html/var
