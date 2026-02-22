<?php

namespace Elementor\Modules\DesignSystemSync\Classes;

use Elementor\Modules\AtomicWidgets\PropsResolver\Render_Props_Resolver;
use Elementor\Modules\AtomicWidgets\Styles\Style_Schema;
use Elementor\Plugin;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Kit_Stylesheet_Extended {
	const TYPOGRAPHY_PROPS = [
		'font-family',
		'font-size',
		'font-weight',
		'font-style',
		'text-decoration',
		'line-height',
		'letter-spacing',
		'word-spacing',
		'text-transform',
	];

	public function register_hooks() {
		add_action( 'elementor/css-file/post/parse', [ $this, 'add_v3_mapping_css' ] );
	}

	public function add_v3_mapping_css( $post_css ) {
		if ( ! Plugin::$instance->kits_manager->is_kit( $post_css->get_post_id() ) ) {
			return;
		}

		$css_entries = [];

		$synced_variables = Variables_Provider::get_synced_color_variables();

		if ( ! empty( $synced_variables ) ) {
			$css_entries = array_merge( $css_entries, $this->get_variables_css_entries( $synced_variables ) );
		}

		$synced_classes = Classes_Provider::get_synced_classes();

		if ( ! empty( $synced_classes ) ) {
			$css_entries = array_merge( $css_entries, $this->get_classes_css_entries( $synced_classes ) );
		}

		if ( ! empty( $css_entries ) ) {
			$post_css->get_stylesheet()->add_raw_css(
				':root { ' . implode( ' ', $css_entries ) . ' }'
			);
		}
	}

	private function get_v3_global_type( string $type ): string {
		$type_map = [
			'global-color-variable' => 'color',
			'global-font-variable' => 'typography',
		];

		return $type_map[ $type ] ?? 'color';
	}

	private function get_variables_css_entries( array $synced_variables ): array {
		$css_entries = [];

		foreach ( $synced_variables as $id => $variable ) {
			$label = sanitize_text_field( $variable['label'] ?? '' );

			if ( empty( $label ) ) {
				continue;
			}

			$v3_id = Variables_Provider::get_v4_variable_id( $label );
			$type = $variable['type'];
			$global_type = $this->get_v3_global_type( $type ?? '' );

			$css_entries[] = "--e-global-{$global_type}-{$v3_id}:var(--{$label});";
		}

		return $css_entries;
	}

	private function get_classes_css_entries( array $synced_classes ): array {
		$css_entries = [];

		$schema = Style_Schema::get();
		$props_resolver = Render_Props_Resolver::for_styles();

		foreach ( $synced_classes as $id => $class ) {
			$label = sanitize_text_field( $class['label'] ?? '' );

			if ( empty( $label ) ) {
				continue;
			}

			$variants = $class['variants'] ?? [];

			$props = Classes_Provider::get_default_breakpoint_props( $variants );

			if ( empty( $props ) ) {
				continue;
			}

			$resolved_props = $props_resolver->resolve( $schema, $props );

			$this->add_typography_css_entries( $label, $resolved_props, $css_entries );
		}

		return $css_entries;
	}

	private function add_typography_css_entries( string $label, array $resolved_props, array &$css_entries ): void {
		foreach ( self::TYPOGRAPHY_PROPS as $prop_name ) {
			if ( ! isset( $resolved_props[ $prop_name ] ) || empty( $resolved_props[ $prop_name ] ) ) {
				continue;
			}

			$css_value = $resolved_props[ $prop_name ];
			$v3_id = 'v4-' . $label;

			$css_entries[] = "--e-global-typography-{$v3_id}-{$prop_name}:{$css_value};";
		}
	}
}
