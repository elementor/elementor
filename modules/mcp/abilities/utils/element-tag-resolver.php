<?php

namespace Elementor\Modules\Mcp\Abilities\Utils;

use Elementor\Modules\AtomicWidgets\PropTypes\Contracts\Prop_Type;
use Elementor\Modules\DefaultStyles\Default_Styles_Repository;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Resolves the rendered HTML wrapper tag for a V4 atomic element so callers can
 * look it up in Default_Styles_Repository. Delegates to the element's
 * Has_Html_Tag trait when an instance is available; otherwise falls back to the
 * schema's default value.
 */
class Element_Tag_Resolver {

	public static function resolve( array $resolved_settings, array $props_schema, $element_instance = null ): ?string {
		$tag = self::compute_tag( $resolved_settings, $props_schema, $element_instance );

		return ( null !== $tag && self::is_allowed_tag( $tag ) ) ? $tag : null;
	}

	private static function compute_tag( array $settings, array $schema, $instance ): ?string {
		if ( is_object( $instance ) && method_exists( $instance, 'get_computed_html_tag' ) ) {
			$tag = $instance::get_computed_html_tag( $settings );

			return ( is_string( $tag ) && '' !== $tag ) ? $tag : null;
		}

		return self::schema_default_tag( $schema );
	}

	private static function schema_default_tag( array $schema ): ?string {
		$prop_type = $schema['tag'] ?? null;
		$default = $prop_type instanceof Prop_Type ? $prop_type->get_default() : null;
		$value = is_array( $default ) ? ( $default['value'] ?? null ) : null;

		return ( is_string( $value ) && '' !== $value ) ? $value : null;
	}

	private static function is_allowed_tag( string $tag ): bool {
		return class_exists( Default_Styles_Repository::class ) && Default_Styles_Repository::is_allowed_tag( $tag );
	}
}
