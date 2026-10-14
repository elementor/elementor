<?php

namespace Elementor\Modules\AtomicWidgets\Styles;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Grid_Track_Renderer {
	public const GRID_TRACK_PROPERTIES = [ 'grid-template-columns', 'grid-template-rows' ];

	public static function is_grid_track_property( ?string $css_property ): bool {
		return in_array( $css_property, self::GRID_TRACK_PROPERTIES, true );
	}

	public static function format_repeat( int $count ): ?string {
		if ( $count < 1 ) {
			return null;
		}

		return "repeat({$count}, 1fr)";
	}
}
