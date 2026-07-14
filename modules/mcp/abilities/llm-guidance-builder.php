<?php

namespace Elementor\Modules\Mcp\Abilities;

use Elementor\Modules\AtomicWidgets\PropsResolver\Render_Props_Resolver;
use Elementor\Modules\AtomicWidgets\Styles\Style_Schema;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Llm_Guidance_Builder {

	const DEFAULT_STYLES_INSTRUCTION = 'These are the default styles applied to the widget. Override only when necessary.';

	const DEFAULT_SETTINGS_INSTRUCTION = 'These are the default settings applied to the widget. Omit them from elementConfig unless the user explicitly asks to change them.';

	public static function build( array $config, string $widget_type, array $parents_index ): array {
		$guidance = [
			'can_have_children' => ! empty( $config['meta']['is_container'] ),
		];

		$default_styles = self::collect_default_styles( $config['base_styles'] ?? [] );
		$default_settings = $config['base_settings'] ?? [];

		$instructions = array_filter( [
			! empty( $default_styles ) ? self::DEFAULT_STYLES_INSTRUCTION : null,
			! empty( $default_settings ) ? self::DEFAULT_SETTINGS_INSTRUCTION : null,
		] );

		if ( $instructions ) {
			$guidance['instructions'] = implode( ' ', $instructions );
		}

		if ( ! empty( $default_styles ) ) {
			$guidance['default_styles'] = $default_styles;
		}

		if ( ! empty( $default_settings ) ) {
			$guidance['default_settings'] = $default_settings;
		}

		$nesting = self::build_nesting( $config, $widget_type, $parents_index );

		if ( ! empty( $nesting ) ) {
			$guidance['nesting'] = $nesting;
		}

		$required_children = self::get_required_default_child_types( $config );

		if ( ! empty( $required_children ) ) {
			$guidance['required_direct_children'] = $required_children;
		}

		return $guidance;
	}

	private static function collect_default_styles( array $base_styles ): array {
		$default_styles = [];

		foreach ( $base_styles as $style ) {
			foreach ( $style['variants'] ?? [] as $variant ) {
				$default_styles = array_merge( $default_styles, $variant['props'] ?? [] );
			}
		}

		return self::convert_prop_values_to_css( $default_styles );
	}

	private static function convert_prop_values_to_css( array $props ): array {
		if ( empty( $props ) ) {
			return [];
		}

		$schema = Style_Schema::get();
		$resolved = Render_Props_Resolver::for_styles()->resolve( $schema, $props );

		return array_filter( $resolved, fn( $value ) => null !== $value && '' !== $value );
	}

	private static function build_nesting( array $config, string $widget_type, array $parents_index ): array {
		$allowed_child_types = $config['allowed_child_types'] ?? [];
		$allowed_parents = $parents_index[ $widget_type ] ?? [];

		return array_filter(
			[
				'allowed_child_types' => empty( $allowed_child_types ) ? null : $allowed_child_types,
				'allowed_parents' => empty( $allowed_parents ) ? null : $allowed_parents,
			],
			fn( $value ) => null !== $value
		);
	}

	private static function get_required_default_child_types( array $config ): array {
		$default_children = $config['default_children'] ?? null;

		if ( ! is_array( $default_children ) ) {
			return [];
		}

		$types = [];

		foreach ( $default_children as $child ) {
			if ( empty( $child['meta']['required'] ) ) {
				continue;
			}

			$type = $child['widgetType'] ?? $child['elType'] ?? null;

			if ( $type ) {
				$types[] = $type;
			}
		}

		return $types;
	}
}
