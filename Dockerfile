FROM debian:bookworm AS builder

ARG NVM_VERSION=0.40.8
ENV NVM_DIR=/root/.nvm

RUN apt-get update && apt-get install -y \
    curl \
    ca-certificates \
    git \
    gnupg \
    lsb-release apt-transport-https software-properties-common \
    && curl -fsSL https://packages.sury.org/php/apt.gpg | gpg --dearmor -o /usr/share/keyrings/sury-php.gpg \
    && echo "deb [signed-by=/usr/share/keyrings/sury-php.gpg] https://packages.sury.org/php/ $(lsb_release -sc) main" > /etc/apt/sources.list.d/sury-php.list \
    && apt-get update && apt-get install -y \
    php7.4-cli \
    php7.4-mbstring \
    php7.4-xml \
    php7.4-curl \
    php7.4-bcmath \
    unzip \
    xz-utils \
    && rm -rf /var/lib/apt/lists/* \
    && curl -fsSL "https://raw.githubusercontent.com/nvm-sh/nvm/v${NVM_VERSION}/install.sh" | bash

COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

SHELL ["/bin/bash", "-c"]

WORKDIR /app
COPY .nvmrc ./
RUN . "$NVM_DIR/nvm.sh" --no-use \
    && nvm install \
    && node_bin="$(dirname "$(nvm which current)")" \
    && ln -sfn "$node_bin"/* /usr/local/bin/

COPY . .

RUN npm run install:ci && npm run composer:no-dev

RUN npm run build

FROM scratch AS output
COPY --from=builder /app/build /elementor
