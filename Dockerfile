FROM node:20.19-bookworm AS builder

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

RUN npm run prepare-environment:ci && npm run composer:no-dev

RUN npm run build

FROM scratch AS output
COPY --from=builder /app/build /elementor
