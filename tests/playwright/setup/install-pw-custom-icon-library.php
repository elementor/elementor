<?php

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

$library = '-1';
$uploads = wp_upload_dir();
$pack_dir = trailingslashit( $uploads['basedir'] ) . 'elementor/custom-icons/' . $library;
$font_dir = $pack_dir . '/font';
$source = ELEMENTOR_PATH . 'tests/phpunit/elementor/modules/atomic-widgets/props-resolver/custom-icon-svg/fixtures/fontello';

wp_mkdir_p( $font_dir );
copy( $source . '/config.json', $pack_dir . '/config.json' );
copy( $source . '/font/fontello.svg', $font_dir . '/fontello.svg' );

$mu_dir = trailingslashit( WPMU_PLUGIN_DIR );
wp_mkdir_p( $mu_dir );

$fetch_json = trailingslashit( $uploads['baseurl'] ) . 'elementor/custom-icons/' . $library . '/config.json';

$mu_plugin = <<<PHP
<?php
add_filter( 'elementor/icons_manager/additional_tabs', static function ( \$tabs ) {
	\$uploads = wp_upload_dir();
	\$tabs['-1'] = [
		'name' => '-1',
		'label' => 'PW Fontello',
		'prefix' => 'icon-',
		'displayPrefix' => '',
		'native' => false,
		'custom_icon_type' => 'fontello',
		'icons' => [ 'emo-surprised' ],
		'fetchJson' => trailingslashit( \$uploads['baseurl'] ) . 'elementor/custom-icons/-1/config.json',
	];
	return \$tabs;
} );
PHP;

file_put_contents( $mu_dir . 'elementor-pw-custom-icons.php', $mu_plugin );
