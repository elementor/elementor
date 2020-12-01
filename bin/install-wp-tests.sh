#!/usr/bin/env bash

if [ $# -lt 3 ]; then
	echo "usage: $0 <db-name> <db-user> <db-pass> [db-host] [wp-version]"
	exit 1
fi

db_name=$1
db_user=$2
db_pass=$3
db_host=${4-localhost}
db_version=${5-latest}

wp_tests_dir=${wp_tests_dir-/tmp/wordpress-tests-lib}
wp_core_dir=${wp_core_dir-/tmp/wordpress/}

download() {
    if [ `which curl` ]; then
        curl -s "$1" > "$2";
    elif [ `which wget` ]; then
        wget -nv -O "$2" "$1"
    fi
}

if [[ $db_version =~ [0-9]+\.[0-9]+(\.[0-9]+)? ]]; then
	WP_TESTS_TAG="tags/$db_version"
else
	# http serves a single offer, whereas https serves multiple. we only want one
	download http://api.wordpress.org/core/version-check/1.7/ /tmp/wp-latest.json
	grep '[0-9]+\.[0-9]+(\.[0-9]+)?' /tmp/wp-latest.json
	LATEST_VERSION=$(grep -o '"version":"[^"]*' /tmp/wp-latest.json | sed 's/"version":"//')
	if [[ -z "$LATEST_VERSION" ]]; then
		echo "Latest WordPress version could not be found"
		exit 1
	fi
	WP_TESTS_TAG="tags/$LATEST_VERSION"
fi

set -ex

install_wp() {
	if [ -d $wp_core_dir ]; then
		return;
	fi

	mkdir -p $wp_core_dir

	if [ $db_version == 'latest' ]; then
		local ARCHIVE_NAME='latest'
	else
		local ARCHIVE_NAME="wordpress-$db_version"
	fi

	download https://wordpress.org/${ARCHIVE_NAME}.tar.gz  /tmp/wordpress.tar.gz
	tar --strip-components=1 -zxmf /tmp/wordpress.tar.gz -C $wp_core_dir

	download https://raw.github.com/markoheijnen/wp-mysqli/master/db.php $wp_core_dir/wp-content/db.php
}

install_test_suite() {
	# portable in-place argument for both GNU sed and Mac OSX sed
	if [[ $(uname -s) == 'Darwin' ]]; then
		local ioption='-i .bak'
	else
		local ioption='-i'
	fi

	# set up testing suite if it doesn't yet exist
	if [ ! -d $wp_tests_dir ]; then
		# set up testing suite
		mkdir -p $wp_tests_dir
		svn co --quiet https://develop.svn.wordpress.org/${WP_TESTS_TAG}/tests/phpunit/includes/ $wp_tests_dir/includes
	fi

	cd $wp_tests_dir

	if [ ! -f wp-tests-config.php ]; then
		download https://develop.svn.wordpress.org/${WP_TESTS_TAG}/wp-tests-config-sample.php "$wp_tests_dir"/wp-tests-config.php
		sed $ioption "s:dirname( __FILE__ ) . '/src/':'$wp_core_dir':" "$wp_tests_dir"/wp-tests-config.php
		sed $ioption "s/youremptytestdbnamehere/$db_name/" "$wp_tests_dir"/wp-tests-config.php
		sed $ioption "s/yourusernamehere/$db_user/" "$wp_tests_dir"/wp-tests-config.php
		sed $ioption "s/yourpasswordhere/$db_pass/" "$wp_tests_dir"/wp-tests-config.php
		sed $ioption "s|localhost|${db_host}|" "$wp_tests_dir"/wp-tests-config.php
	fi
}

install_db() {
	# parse db_host for port or socket references
	local PARTS=(${db_host//\:/ })
	local db_hostNAME=${PARTS[0]};
	local DB_SOCK_OR_PORT=${PARTS[1]};
	local EXTRA=""

	if ! [ -z $db_hostNAME ] ; then
		if [ $(echo $DB_SOCK_OR_PORT | grep -e '^[0-9]\{1,\}$') ]; then
			EXTRA=" --host=$db_hostNAME --port=$DB_SOCK_OR_PORT --protocol=tcp"
		elif ! [ -z $DB_SOCK_OR_PORT ] ; then
			EXTRA=" --socket=$DB_SOCK_OR_PORT"
		elif ! [ -z $db_hostNAME ] ; then
			EXTRA=" --host=$db_hostNAME --protocol=tcp"
		fi
	fi

	# create database
	mysqladmin create $db_name --user="$db_user" --password="$db_pass"$EXTRA
}

# Install JSCS: JavaScript Code Style checker
# @link http://jscs.info/
install_jscs() {
	npm install -g jscs@3.0.4
}

# Install JSHint, a JavaScript Code Quality Tool
# @link http://jshint.com/docs/
install_jshint() {
	npm install -g jshint
}

install_wp
install_test_suite
install_db
#install_jscs
#install_jshint
