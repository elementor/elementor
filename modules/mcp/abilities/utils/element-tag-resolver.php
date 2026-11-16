<?php

namespace Elementor\Modules\Mcp\Abilities\Utils;

use Elementor\Modules\DefaultStyles\Default_Styles_Repository;
use Elementor\Plugin;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Resolves the rendered HTML wrapper tag for a V4 atomic element so callers can
 * look it up in Default_Styles_Repository. Delegates to the element class's
 * static get_computed_html_tag() contract.
 */
class Element_Tag_Resolver {

	public static function resolve( array $resolved_settings, string $type ): ?string {
		return self::resolve_for_class( $resolved_settings, self::class_for_type( $type ) );
	}

	public static function resolve_for_class( array $resolved_settings, ?string $class ): ?string {
		if ( null === $class ) {
			return null;
		}

		$tag = $class::get_computed_html_tag( $resolved_settings );

		return ( is_string( $tag ) && '' !== $tag && self::is_allowed_tag( $tag ) ) ? $tag : null;
	}

	private static function class_for_type( string $type ): ?string {
		$registered = Plugin::instance()->widgets_manager->get_widget_types( $type )
			?? Plugin::instance()->elements_manager->get_element_types( $type );

		return $registered ? get_class( $registered ) : null;
	}

	private static function is_allowed_tag( string $tag ): bool {
		return class_exists( Default_Styles_Repository::class ) && Default_Styles_Repository::is_allowed_tag( $tag );
	}
}
