<?php

namespace Elementor\Modules\Mcp\Abilities\Utils;

use Elementor\Modules\AtomicWidgets\PropTypes\Contracts\Prop_Type;
use Elementor\Modules\DefaultStyles\Default_Styles_Repository;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Resolves the rendered HTML wrapper tag for a V4 atomic element.
 *
 * Atomic elements render with `e-default-<tag>` classes (see modules/atomic-widgets/elements/base/_macros.html.twig).
 * `<tag>` comes from `settings.tag` when the user set it, or from the widget schema's default otherwise.
 * Only tags that the default-styles module considers valid are returned so callers can safely look them
 * up in Default_Styles_Repository.
 */
class Element_Tag_Resolver {

	public static function resolve( array $resolved_settings, array $props_schema ): ?string {
		$candidate = self::extract_settings_tag( $resolved_settings );

		if ( null === $candidate ) {
			$candidate = self::extract_schema_default_tag( $props_schema );
		}

		if ( null === $candidate ) {
			return null;
		}

		return self::is_supported_tag( $candidate ) ? $candidate : null;
	}

	private static function extract_settings_tag( array $settings ): ?string {
		$tag = $settings['tag'] ?? null;

		if ( is_array( $tag ) && isset( $tag['value'] ) && is_string( $tag['value'] ) ) {
			$tag = $tag['value'];
		}

		return ( is_string( $tag ) && '' !== $tag ) ? $tag : null;
	}

	private static function extract_schema_default_tag( array $props_schema ): ?string {
		$prop_type = $props_schema['tag'] ?? null;

		if ( ! $prop_type instanceof Prop_Type || ! method_exists( $prop_type, 'get_default' ) ) {
			return null;
		}

		$default = $prop_type->get_default();

		if ( is_array( $default ) && isset( $default['value'] ) && is_string( $default['value'] ) && '' !== $default['value'] ) {
			return $default['value'];
		}

		return null;
	}

	private static function is_supported_tag( string $tag ): bool {
		if ( ! class_exists( Default_Styles_Repository::class ) ) {
			return false;
		}

		return Default_Styles_Repository::is_allowed_tag( $tag );
	}
}
