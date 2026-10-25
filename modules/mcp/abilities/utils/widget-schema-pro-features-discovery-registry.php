<?php

namespace Elementor\Modules\Mcp\Abilities\Utils;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Widget_Schema_Pro_Features_Discovery_Registry {

	/**
	 * @var class-string<Widget_Schema_Pro_Features_Discovery>[]
	 */
	const DISCOVERIES = [
		Forms_Pro_Features_Discovery::class,
		Site_Parts_Pro_Features_Discovery::class,
	];

	public static function for_widget_schema( string $widget_type ): \WP_Error {
		foreach ( self::DISCOVERIES as $discovery ) {
			if ( $discovery::supports_widget( $widget_type ) ) {
				return $discovery::for_widget_schema();
			}
		}

		return Widgets_Pro_Features_Discovery::for_widget( $widget_type );
	}
}
