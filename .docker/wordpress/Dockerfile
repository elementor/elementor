FROM wordpress:latest

# xdebug
RUN pecl install xdebug \
	&& docker-php-ext-enable xdebug\
	&& XDEBUG=$(find /usr/local/lib/php -name 'xdebug.so' | head -n 1 | tail -n 1) \
    && ln -s $XDEBUG /usr/local/lib/php/extensions/xdebug.so \
    && echo -e "xdebug.remote_enable=on\n xdebug.remote_autostart=off\n xdebug.remote_port=9000\n xdebug.remote_host=localhost\n">> /usr/local/etc/php/conf.d/docker-php-ext-xdebug.ini

USER ${USER}
