import { Config } from './config.js'; // eslint-disable-line import/no-unresolved
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
      APACHE_RUN_USER: '#502'
      APACHE_RUN_GROUP: '#20'
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
      dockerfile: CLI.Dockerfile
      args: *ref_0
    volumes: *ref_1
    user: '502:20'
    environment:
      WORDPRESS_DB_USER: root
      WORDPRESS_DB_PASSWORD: password
      WORDPRESS_DB_NAME: wordpress
    extra_hosts:
      - 'host.docker.internal:host-gateway'
volumes:
  mysql: {}
  wpcontent: {}
`;
};

export const generateWordPressDockerfileTemplate = ( config: Config ) => {
	return `FROM wordpress:${ config.core }-php${ config.phpVersion }
ARG HOST_USERNAME
ARG HOST_UID
ARG HOST_GID
# When the IDs are already in use we can still safely move on.
RUN groupadd -o -g $HOST_GID $HOST_USERNAME || true
RUN useradd -mlo -u $HOST_UID -g $HOST_GID $HOST_USERNAME || true
`;
};

export const generateCliDockerfileTemplate = ( config: Config ) => {
	return `FROM wordpress:cli-php${ config.phpVersion }
ARG HOST_USERNAME
ARG HOST_UID
ARG HOST_GID
# When the IDs are already in use we can still safely move on.
RUN addgroup -g $HOST_GID $HOST_USERNAME || true
RUN useradd -mlo -u $HOST_UID -g $HOST_GID $HOST_USERNAME || true
# RUN adduser -h /home/$HOST_USERNAME -G $( getent group $HOST_GID | cut -d: -f1 ) -u $HOST_UID $HOST_USERNAME || true

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
		return `wp config set ${ key } ${ value } --raw`;
	} );
	const wpCoreInstall = `wp core install --url="http://localhost:${ port }" --title="test" --admin_user=admin --admin_password=password --admin_email=wordpress@example.com --skip-email`;

	return [ header, wpCoreInstall ].concat( configStringArray ).join( '\n' );
};
