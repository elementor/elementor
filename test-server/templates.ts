import { Config } from './config.js';
import path from 'path';

export const generateDockerComposeYmlTemplate = ( config: Config, basePath: string, port: string, configPath: string ) => {
	const mappingsStringArray = Object.keys( config.mappings ).map( ( key ) => {
		const value = config.mappings[ key ];
		return `      - >-
        ${ path.resolve( basePath, value ) }:/var/www/html/${ key }\n`;
	} );
	const pluginsStringArray = Object.keys( config.plugins ).map( ( key ) => {
		const value = config.plugins[ key ];
		return `      - >-
        ${ path.resolve( basePath, value ) }:/var/www/html/wp-content/plugins/${ key }\n`;
	} );
	const themesStringArray = Object.keys( config.themes ).map( ( key ) => {
		const value = config.themes[ key ];
		return `      - >-
        ${ path.resolve( basePath, value ) }:/var/www/html/wp-content/themes/${ key }\n`;
	} );
	const wpContent = `      - >-
        wpcontent:/var/www/html\n`;
	const wpConfig = `      - >-
        ${ configPath }:/var/www/html/wp-config\n`;
	const volumes = mappingsStringArray.concat( pluginsStringArray ).concat( themesStringArray ).concat( [ wpContent, wpConfig ] ).join( '' );
	return `services:
  mysql:
    image: 'mariadb:lts'
    ports:
      - '\${WP_ENV_MYSQL_PORT:-}:3306'
    environment:
      MYSQL_ROOT_HOST: '%'
      MYSQL_ROOT_PASSWORD: password
      MYSQL_DATABASE: wordpress
    volumes:
      - 'mysql:/var/lib/mysql'
  wordpress:
    depends_on:
      - mysql
    build:
      context: .
      dockerfile: WordPress.Dockerfile
      args: &ref_0
        HOST_USERNAME: yotams
        HOST_UID: '502'
        HOST_GID: '20'
    ports:
      - '\${WP_ENV_PORT:-${ port }}:80'
    environment:
      WORDPRESS_DB_USER: root
      WORDPRESS_DB_PASSWORD: password
      WORDPRESS_DB_NAME: wordpress
    volumes: &ref_1
${ volumes }
    extra_hosts:
      - 'host.docker.internal:host-gateway'
  cli:
    depends_on:
      - wordpress
    build:
      context: .
      dockerfile: wordpress:cli-php${ config.phpVersion }
      args: *ref_0
    volumes: *ref_1
    user: '33'
    environment:
      WORDPRESS_DB_USER: root
      WORDPRESS_DB_PASSWORD: password
      WORDPRESS_DB_NAME: wordpress
    extra_hosts:
      - 'host.docker.internal:host-gateway'
    command: >
      /bin/sh -c '
      chown -R www-data:www-data /var/www/html
      chmod --recursive 777 /var/www/html
      '
volumes:
  mysql: {}
  wpcontent: {}
`;
};

export const generateWordPressDockerfileTemplate = ( config: Config ) => {
	return `FROM wordpress:${ config.core }-php${ config.phpVersion }

# Update apt sources for archived versions of Debian.

# stretch (https://lists.debian.org/debian-devel-announce/2023/03/msg00006.html)
RUN touch /etc/apt/sources.list
RUN sed -i 's|deb.debian.org/debian stretch|archive.debian.org/debian stretch|g' /etc/apt/sources.list
RUN sed -i 's|security.debian.org/debian-security stretch|archive.debian.org/debian-security stretch|g' /etc/apt/sources.list
RUN sed -i '/stretch-updates/d' /etc/apt/sources.list

# Create the host's user so that we can match ownership in the container.
ARG HOST_USERNAME
ARG HOST_UID
ARG HOST_GID
# When the IDs are already in use we can still safely move on.
RUN groupadd -o -g $HOST_GID $HOST_USERNAME || true
RUN useradd -mlo -u $HOST_UID -g $HOST_GID $HOST_USERNAME || true

# Install any dependencies we need in the container.

# Make sure we're working with the latest packages.
RUN apt-get -qy update

# Install some basic PHP dependencies.
RUN apt-get -qy install $PHPIZE_DEPS && touch /usr/local/etc/php/php.ini

# Install git
RUN apt-get -qy install git

# Set up sudo so they can have root access.
RUN apt-get -qy install sudo
RUN echo "#$HOST_UID ALL=(ALL) NOPASSWD:ALL" >> /etc/sudoers
RUN echo 'upload_max_filesize = 1G' >> /usr/local/etc/php/php.ini
RUN echo 'post_max_size = 1G' >> /usr/local/etc/php/php.ini
RUN curl -sS https://getcomposer.org/installer -o /tmp/composer-setup.php
RUN export COMPOSER_HASH=\`curl -sS https://composer.github.io/installer.sig\` && php -r "if (hash_file('SHA384', '/tmp/composer-setup.php') === '$COMPOSER_HASH') { echo 'Installer verified'; } else { echo 'Installer corrupt'; unlink('/tmp/composer-setup.php'); } echo PHP_EOL;"
RUN php /tmp/composer-setup.php --install-dir=/usr/local/bin --filename=composer
RUN rm /tmp/composer-setup.php
USER $HOST_UID:$HOST_GID
ENV PATH="\${PATH}:/home/$HOST_USERNAME/.composer/vendor/bin"
RUN composer global require --dev phpunit/phpunit:"^5.7.21 || ^6.0 || ^7.0 || ^8.0 || ^9.0 || ^10.0"
USER root
`;
};

export const generateCliDockerfileTemplate = ( config: Config ) => {
	return `FROM wordpress:cli-php${ config.phpVersion }

# Switch to root so we can create users.
USER root

# Create the host's user so that we can match ownership in the container.
ARG HOST_USERNAME
ARG HOST_UID
ARG HOST_GID
# When the IDs are already in use we can still safely move on.
RUN addgroup -g $HOST_GID $HOST_USERNAME || true
RUN adduser -h /home/$HOST_USERNAME -G $( getent group $HOST_GID | cut -d: -f1 ) -u $HOST_UID $HOST_USERNAME || true

# Install any dependencies we need in the container.

# Make sure we're working with the latest packages.
RUN apk update

# Install some basic PHP dependencies.
RUN apk --no-cache add $PHPIZE_DEPS && touch /usr/local/etc/php/php.ini

# Set up sudo so they can have root access.
RUN apk --no-cache add sudo linux-headers
RUN echo "#$HOST_UID ALL=(ALL) NOPASSWD:ALL" >> /etc/sudoers
RUN echo 'upload_max_filesize = 1G' >> /usr/local/etc/php/php.ini
RUN echo 'post_max_size = 1G' >> /usr/local/etc/php/php.ini
RUN curl -sS https://getcomposer.org/installer -o /tmp/composer-setup.php
RUN export COMPOSER_HASH=\`curl -sS https://composer.github.io/installer.sig\` && php -r "if (hash_file('SHA384', '/tmp/composer-setup.php') === '$COMPOSER_HASH') { echo 'Installer verified'; } else { echo 'Installer corrupt'; unlink('/tmp/composer-setup.php'); } echo PHP_EOL;"
RUN php /tmp/composer-setup.php --install-dir=/usr/local/bin --filename=composer
RUN rm /tmp/composer-setup.php
USER $HOST_UID:$HOST_GID
ENV PATH="\${PATH}:/home/$HOST_USERNAME/.composer/vendor/bin"
RUN composer global require --dev phpunit/phpunit:"^5.7.21 || ^6.0 || ^7.0 || ^8.0 || ^9.0 || ^10.0"
USER root

# Switch back to the original user now that we're done.
USER www-data

# Have the container sleep infinitely to keep it alive for us to run commands on it.
CMD [ "/bin/sh", "-c", "while true; do sleep 2073600; done" ]
`;
};

export const generateConfiguration = ( config: Config, port: string ) => {
	const header = `#!/bin/bash
set -eox pipefail
`;
	const configStringArray = Object.keys( config.config ).map( ( key ) => {
		const value = config.config[ key ];
		return `wp config set ${ key } ${ value } --raw\n`;
	} );
	const wpCoreInstall = `wp core install --url="http://localhost:${ port }" --title="test" --admin_user=admin --admin_password=password --admin_email=wordpress@example.com --skip-email`;

	return [ header, wpCoreInstall ].concat( configStringArray ).join( '\n' );
};
