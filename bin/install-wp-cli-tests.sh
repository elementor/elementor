#!/bin/bash -e

if [ $# -lt 3 ]; then
	echo "usage: $0 <db-name> <db-user> <db-pass> [db-host] [wp-version]"
	exit 1
fi

DB_NAME=$1
DB_USER=$2
DB_PASS=$3
DB_HOST=${4-localhost}
WP_VERSION=${5-latest}

WP_CLI_DIR=${WP_CLI_DIR-/tmp/wp-cli}
WP_CORE_DIR=${WP_CORE_DIR-/tmp/wordpress/}
WP_TESTS_DIR=${WP_TESTS_DIR-/tmp/wordpress-tests-lib}

local=(he_IL en_AU en_CA en_NZ en_ZA en_GB en_US)
wpuser="test"
sitname="test"
allpages=()
version=()
theme="https://github.com/Automattic/_s/archive/master.zip"
plugins=("https://github.com/ltconsulting/lt-tables/archive/master.zip")
delPlugins=(akismet hello)

install_wp_cli() {
	if [ -d $WP_CORE_DIR ]; then
		return;
	fi

	mkdir -p $WP_CLI_DIR

	cd $WP_CLI_DIR

	curl -O https://raw.githubusercontent.com/wp-cli/builds/gh-pages/phar/wp-cli.phar
	chmod +x wp-cli.phar
	sudo mv wp-cli.phar
}

download(){
	# download the WordPress core files [--skip-content - Download WP without the default themes and plugins.]
	wp core download --locale=$locale --version=$version --skip-content
}

config(){
	# create the wp-config file
	wp core config --dbname=$DB_NAME --dbuser=$DB_USER --dbpass=$DB_PASS
	#--extra-php <<PHP
	#define( 'WP_DEBUG', true );
	#define( 'DISALLOW_FILE_EDIT', true );
	#PHP
}


install(){
	# create database, and install WordPress
	wp db create
	wp core install --url="http://localhost/$currentdirectory" --title="$sitename" --admin_user="$wpuser" --admin_password="$password" --admin_email="user@example.org"

	# discourage search engines
	wp option update blog_public 0

	# show only 6 posts on an archive page
	wp option update posts_per_page 6

	# delete sample page, and create homepage
	wp post delete $(wp post list --post_type=page --posts_per_page=1 --post_status=publish --pagename="test-page" --field=ID --format=ids)
	wp post create --post_type=page --post_title=Home --post_status=publish --post_author=$(wp user get $wpuser --field=ID --format=ids)

	# set homepage as front page
	wp option update show_on_front 'page'

	# set homepage to be the new page
	wp option update page_on_front $(wp post list --post_type=page --post_status=publish --posts_per_page=1 --pagename=home --field=ID --format=ids)

	# create all of the pages
	export IFS=","
	for page in $allpages; do
		wp post create --post_type=page --post_status=publish --post_author=$(wp user get $wpuser --field=ID --format=ids) --post_title="$(echo $page | sed -e 's/^ *//' -e 's/ *$//')"
	done

	# set pretty urls
	wp rewrite structure '/%postname%/' --hard
	wp rewrite flush --hard
}

createUsers()
{
    wp user create manager manager@test.com --role=administrator --user_pass=1234
    wp user create developer developer@test.com --role=administrator --user_pass=1234
}

uninstallUsualPlugins(){
	# delete plugins
	for p in $delplugins; do
		wp plugin delete p;
	done
}

installUsualPlugins(){
	# install plugins
	for p in $plugins; do
		wp plugin install p --activate;
	done
}

installTheme(){
	# install the _s theme
	wp theme install $theme --activate
}

install_wp_cli
download
config
install
createUsers
uninstallUsualPlugins
installUsualPlugins
installTheme

#clear

#echo "================================================================="
#echo "installation is complete. your username/password is listed below."
#echo ""
#echo "username: $wpuser"
#echo "password: $password"
#echo ""
#echo "================================================================="
