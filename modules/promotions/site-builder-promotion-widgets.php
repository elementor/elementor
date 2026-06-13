<?php

namespace Elementor\Modules\Promotions;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Site_Builder_Promotion_Widgets {

	public static function get_supplemental_widgets(): array {
		return [
			[ 'name' => 'nested-carousel', 'title' => 'Carousel' ],
			[ 'name' => 'mega-menu', 'title' => 'Menu' ],
			[ 'name' => 'loop-grid', 'title' => 'Loop Grid' ],
			[ 'name' => 'loop-carousel', 'title' => 'Loop Carousel' ],
			[ 'name' => 'taxonomy-filter', 'title' => 'Taxonomy Filter' ],
		];
	}

	public static function merge_with_api_widgets( array $api_widgets ): array {
		$widgets_by_name = [];

		foreach ( array_merge( $api_widgets, self::get_supplemental_widgets() ) as $widget_data ) {
			if ( empty( $widget_data['name'] ) ) {
				continue;
			}

			$widgets_by_name[ $widget_data['name'] ] = $widget_data;
		}

		return array_values( $widgets_by_name );
	}
}
