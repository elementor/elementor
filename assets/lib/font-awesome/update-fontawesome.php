<?php
// How to update a version for Font Awesome:
// FYI: "js" and "json" folders belongs to elementor and not fontawesome.

// 1. Download the new version of Font Awesome.
// 2. Replace the fontawesome folder excluding this file and migration folder.
// 3. run this script.
// 4. Files in js and json folders should be updated with the new icons.
// 5. Delete redundant files in order to keep Elementor plugin size small.

$metadata_path = __DIR__ . '/metadata/icons.json';

if ( ! file_exists( $metadata_path ) ) {
	die( 'metadata/icons.json file not exist.' );
}

// Load all Font Awesome icons metadata.
$metadata = file_get_contents( $metadata_path );
$metadata_array = json_decode( $metadata, true );

// SVG pattern to extract svg path.
$pattern = '/(?<=\<path d\=\").*(?=\"\/><\/svg>)/';

// Create $icons and $svg_icons arrays by icons groups.
foreach ( $metadata_array as $icon_name => $icon ) {
	foreach ( $icon['styles'] as $group ) {
		// js folder
		$icons[ $group ]['icons'][] = (string) $icon_name;

		// json folder
		preg_match( $pattern, $icon['svg'][ $group ]['raw'], $match_svg_path );

		$svg_icons[ $group ]['icons'][ $icon_name ] = [
			$icon['svg'][ $group ]['width'],
			$icon['svg'][ $group ]['height'],
			[],
			$icon['unicode'],
			$match_svg_path[0],
		];
	}
}

// Create js and json folders if not exist.
if ( ! is_dir( 'js' ) ) {
	mkdir( 'js' );
}
if ( ! is_dir( 'json' ) ) {
	mkdir( 'json' );
}

// Write icons to files.
foreach ( $icons as $group_name => $group ) {
	sort( $icons[ $group_name ]['icons'] );
	file_put_contents( "js/{$group_name}.js", json_encode( $icons[ $group_name ], JSON_PRETTY_PRINT ) );

	ksort( $svg_icons[ $group_name ]['icons'] );
	file_put_contents( "json/{$group_name}.json", json_encode( $svg_icons[ $group_name ], JSON_PRETTY_PRINT ) );
}
