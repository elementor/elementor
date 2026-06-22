<?php

namespace Elementor\Modules\Promotions;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Site_Builder_Promotion_Widgets {

	public static function get_supplemental_widgets(): array {
		return [
			[ 'name' => 'nested-carousel', 'title' => 'Carousel', 'icon' => 'eicon-media-carousel', 'categories' => '["pro-elements"]' ],
			[ 'name' => 'mega-menu', 'title' => 'Menu', 'icon' => 'eicon-menu-bar', 'categories' => '["pro-elements"]' ],
			[ 'name' => 'loop-grid', 'title' => 'Loop Grid', 'icon' => 'eicon-loop-builder', 'categories' => '["pro-elements"]' ],
			[ 'name' => 'loop-carousel', 'title' => 'Loop Carousel', 'icon' => 'eicon-media-carousel', 'categories' => '["pro-elements"]' ],
			[ 'name' => 'taxonomy-filter', 'title' => 'Taxonomy Filter', 'icon' => 'eicon-filter', 'categories' => '["pro-elements"]' ],
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
