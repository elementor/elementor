<?php

namespace Elementor\Modules\DesignSystemSync\Classes;

use Elementor\Modules\AtomicWidgets\PropsResolver\Render_Props_Resolver;
use Elementor\Modules\AtomicWidgets\Styles\Style_Schema;
use Elementor\Plugin;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Kit_Stylesheet_Extended {
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

			$v3_id = 'v4-' . $label;
			$type = $variable['type'];
			$global_type = $this->get_v3_global_type( $type ?? '' );

			$css_entries[] = "--e-global-{$global_type}-{$v3_id}:var(--{$label});";
		}

		return $css_entries;
	}

	private function get_classes_css_entries( array $synced_classes ): array {
		$css_entries = [];
		$typography_props = [
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

		$schema = Style_Schema::get();
		$props_resolver = Render_Props_Resolver::for_styles();

		foreach ( $synced_classes as $id => $class ) {
			$label = sanitize_text_field( $class['label'] ?? '' );

			if ( empty( $label ) ) {
				continue;
			}

			$variants = $class['variants'] ?? [];

			foreach ( $variants as $variant ) {
				$breakpoint = $variant['meta']['breakpoint'] ?? null;
				$state = $variant['meta']['state'] ?? null;

				if ( ! in_array( $breakpoint, [ null, 'desktop' ], true ) ) {
					continue;
				}

				if ( ! in_array( $state, [ null, 'normal' ], true ) ) {
					continue;
				}

				$props = $variant['props'] ?? [];

				$resolved_props = $props_resolver->resolve( $schema, $props );

				foreach ( $typography_props as $prop_name ) {
					if ( ! isset( $resolved_props[ $prop_name ] ) || empty( $resolved_props[ $prop_name ] ) ) {
						continue;
					}

					$css_value = $resolved_props[ $prop_name ];
					$v3_id = 'v4-' . $label;

					$css_entries[] = "--e-global-typography-{$v3_id}-{$prop_name}:{$css_value};";
				}

				break;
			}
		}

		return $css_entries;
	}
}
