#!/usr/bin/env bash

pear config-set auto_discover 1
pear install PHP_CodeSniffer
git clone git://github.com/WordPress-Coding-Standards/WordPress-Coding-Standards.git $(pear config-get php_dir)/PHP/CodeSniffer/Standards/WordPress
phpenv rehash
phpcs --config-set installed_paths $(pear config-get php_dir)/PHP/CodeSniffer/Standards/WordPress
phpcs -i
