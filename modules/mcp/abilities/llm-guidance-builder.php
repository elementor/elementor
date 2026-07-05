<?php

namespace Elementor\Modules\Mcp\Abilities;

use Elementor\Modules\AtomicWidgets\PropsResolver\Render_Props_Resolver;
use Elementor\Modules\AtomicWidgets\Styles\Style_Schema;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Llm_Guidance_Builder {
	public static function build( array $widget_config ): array {
		$guidance = [
			'can_have_children' => (bool) ( $widget_config['meta']['is_container'] ?? false ),
		];

		$default_styles = self::extract_default_styles( $widget_config['base_styles'] ?? [] );

		if ( ! empty( $default_styles ) ) {
			$guidance['default_styles'] = $default_styles;
		}

		$required_direct_children = self::extract_required_direct_children( $widget_config['default_children'] ?? [] );

		if ( ! empty( $required_direct_children ) ) {
			$guidance['required_direct_children'] = $required_direct_children;
		}

		return $guidance;
	}

	private static function extract_default_styles( array $base_styles ): string {
		$schema = Style_Schema::get();
		$resolver = Render_Props_Resolver::for_styles();
		$declarations = [];

		foreach ( $base_styles as $style_def ) {
			foreach ( $style_def['variants'] ?? [] as $variant ) {
				foreach ( array_filter( $resolver->resolve( $schema, $variant['props'] ?? [] ) ) as $prop => $value ) {
					$declarations[] = $prop . ': ' . $value;
				}
			}
		}

		return implode( '; ', $declarations );
	}

	private static function extract_required_direct_children( array $default_children ): array {
		$required = [];

		foreach ( $default_children as $child ) {
			if ( ! ( $child['meta']['required'] ?? false ) ) {
				continue;
			}

			$type = $child['widgetType'] ?? $child['elType'] ?? '';

			if ( $type ) {
				$required[] = $type;
			}
		}

		return $required;
	}
}
