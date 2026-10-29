<?php

namespace Elementor\Modules\Mcp\Abilities\Utils;

use Elementor\Modules\GlobalClasses\Utils\Atomic_Elements_Utils;
use Elementor\Modules\Promotions\Widgets\Pro_Widget_Promotion;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Pro_Features_Discovery_Registry {

	/**
	 * @var class-string<Widget_Pro_Features_Discovery>[]
	 */
	const DISCOVERIES = [
		Forms_Pro_Features_Discovery::class,
		Components_Pro_Features_Discovery::class,
		Site_Parts_Pro_Features_Discovery::class,
	];

	public static function requires_pro( string $widget_type ): bool {
		return null !== self::find_discovery( $widget_type ) || self::is_pro_promotion( $widget_type );
	}

	public static function for_widget( string $widget_type ): \WP_Error {
		$discovery = self::find_discovery( $widget_type );

		return $discovery ? $discovery::for_widget() : Generic_Widget_Pro_Features_Discovery::for_widget( $widget_type );
	}

	private static function find_discovery( string $widget_type ): ?string {
		foreach ( self::DISCOVERIES as $discovery ) {
			if ( $discovery::supports_widget( $widget_type ) ) {
				return $discovery;
			}
		}

		return null;
	}

	private static function is_pro_promotion( string $widget_type ): bool {
		$element = Atomic_Elements_Utils::get_element_instance( $widget_type );

		return $element instanceof Pro_Widget_Promotion
			|| ( $element && method_exists( $element, 'get_meta_item' ) && $element->get_meta_item( 'is_pro_promotion' ) );
	}
}
