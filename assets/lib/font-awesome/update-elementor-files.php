<?php
// 1. Copy js and json folders(created by elementor) from old font-awesome to new font-awesome
// 2. run this script
// Elementor files should be updated with the new icons

// Metadata - All icons data
$metadata = file_get_contents( 'metadata/icons.json' );
$metadata_array = json_decode( $metadata, true );

$icons_groups = [ 'brands', 'regular', 'solid' ];

foreach ( $icons_groups as $icon_group ) {
	// Get group icons from current version
	$group = file_get_contents( "js/{$icon_group}.js" );
	$group_array = json_decode( $group, true );

	// Get group svg from current version
	$group_svg = file_get_contents( "json/{$icon_group}.json" );
	$group_svg_array = json_decode( $group_svg, true );

	// Get new group icons from latest version
	$new_group = array_filter( $metadata_array, function( $icon, $icon_name ) use ( $group_array, $icon_group ) {
		if ( in_array( $icon_group, $icon['styles'], true ) ) {
			return ! in_array( (string) $icon_name, $group_array['icons'], true );
		}
	}, ARRAY_FILTER_USE_BOTH );

	$pattern = '/(?<=\<path d\=\").*(?=\"\/><\/svg>)/';
	$match_svg_path = [];
	foreach ( $new_group as $icon_name => $icon ) {
		// Add $new_group svg to $group_svg_array icons
		preg_match( $pattern, $icon['svg'][ $icon_group ]['raw'], $match_svg_path );

		$group_svg_array['icons'][ $icon_name ] = [
			$icon['svg'][ $icon_group ]['width'],
			$icon['svg'][ $icon_group ]['height'],
			[],
			$icon['unicode'],
			$match_svg_path[0],
		];
		// Add $new_group to $group_array
		$group_array['icons'][] = (string) $icon_name;
	}

	// Arrange $group_array and $group_svg_array by alphabetical order
	sort( $group_array['icons'] );
	ksort( $group_svg_array['icons'] );

	// Write $group_array and $group_svg_array to files
	file_put_contents( "js/{$icon_group}.js", json_encode( $group_array, JSON_PRETTY_PRINT ) );
	file_put_contents( "json/{$icon_group}.json", json_encode( $group_svg_array, JSON_PRETTY_PRINT ) );
}
