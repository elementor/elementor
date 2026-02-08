# Build stage
FROM node:20.19-bookworm AS builder

# Install PHP 7.4 and Composer (matching CI setup)
RUN apt-get update && apt-get install -y \
    lsb-release apt-transport-https ca-certificates software-properties-common \
    && curl -fsSL https://packages.sury.org/php/apt.gpg | gpg --dearmor -o /usr/share/keyrings/sury-php.gpg \
    && echo "deb [signed-by=/usr/share/keyrings/sury-php.gpg] https://packages.sury.org/php/ $(lsb_release -sc) main" > /etc/apt/sources.list.d/sury-php.list \
    && apt-get update && apt-get install -y \
    php7.4-cli \
    php7.4-mbstring \
    php7.4-xml \
    php7.4-curl \
    php7.4-bcmath \
    unzip \
    && rm -rf /var/lib/apt/lists/*

COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

WORKDIR /app
COPY . .

# Install dependencies (matching CI: prepare-environment:ci + composer:no-dev)
RUN npm ci && \
    cd packages && npm ci && cd .. && \
    composer install --optimize-autoloader --prefer-dist && \
    composer install --no-scripts --no-dev && \
    composer dump-autoload

# Build (run turbo with concurrency=1 to avoid race conditions in DTS generation)
RUN cd packages && npx turbo build --concurrency=1 && cd .. && npx grunt build --force

# Output stage - only the build folder
FROM scratch AS output
COPY --from=builder /app/build /build
