<?php

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

$library = '-1';
$uploads = wp_upload_dir();
$pack_dir = trailingslashit( $uploads['basedir'] ) . 'elementor/custom-icons/' . $library;
$font_dir = $pack_dir . '/font';

wp_mkdir_p( $font_dir );

file_put_contents(
	$pack_dir . '/config.json',
	wp_json_encode(
		[
			'name' => 'fontello',
			'css_prefix_text' => 'icon-',
			'glyphs' => [
				[
					'uid' => 'test-emo-surprised',
					'css' => 'emo-surprised',
					'code' => 59392,
					'src' => 'fontelico',
				],
			],
		]
	)
);

file_put_contents(
	$font_dir . '/fontello.svg',
	'<?xml version="1.0" standalone="no"?>
<!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd" >
<svg xmlns="http://www.w3.org/2000/svg">
	<defs>
		<font id="fontello" horiz-adv-x="1000">
			<font-face font-family="fontello" units-per-em="1000" ascent="850" descent="-150"/>
			<glyph glyph-name="emo-surprised" unicode="&#xe800;" d="M0 0H100V100H0Z" horiz-adv-x="1000"/>
		</font>
	</defs>
</svg>
'
);

$mu_dir = trailingslashit( WPMU_PLUGIN_DIR );
wp_mkdir_p( $mu_dir );

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
add_filter( 'elementor/atomic-widgets/custom-icon-libraries/enabled', '__return_true' );
PHP;

file_put_contents( $mu_dir . 'elementor-pw-custom-icons.php', $mu_plugin );
