<?php

namespace Elementor\Modules\DesignSystemSync\Classes;

use Elementor\Core\Breakpoints\Manager as Breakpoints_Manager;
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

		$kit_selector = '.elementor-kit-' . $post_css->get_post_id();

		$grouped_entries = [];

		$synced_variables = Variables_Provider::get_synced_color_variables();

		if ( ! empty( $synced_variables ) ) {
			$grouped_entries[ Breakpoints_Manager::BREAKPOINT_KEY_DESKTOP ] = $this->get_variables_css_entries( $synced_variables );
		}

		$classes_css_entries = $this->get_classes_css_entries( Classes_Provider::get_synced_classes() );

		foreach ( $classes_css_entries as $device => $entries ) {
			$grouped_entries[ $device ] = array_merge( $grouped_entries[ $device ] ?? [], $entries );
		}

		foreach ( $grouped_entries as $device => $entries ) {
			if ( empty( $entries ) ) {
				continue;
			}

			$css = $kit_selector . ' { ' . implode( ' ', $entries ) . ' }';

			if ( Breakpoints_Manager::BREAKPOINT_KEY_DESKTOP === $device ) {
				$post_css->get_stylesheet()->add_raw_css( $css );
			} else {
				$post_css->get_stylesheet()->add_raw_css( $css, $device );
			}
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
		$grouped_entries = [];

		$schema = Style_Schema::get();
		$props_resolver = Render_Props_Resolver::for_styles();

		foreach ( $synced_classes as $id => $class ) {
			$label = sanitize_text_field( $class['label'] ?? '' );

			if ( empty( $label ) ) {
				continue;
			}

			$variants = $class['variants'] ?? [];
			$all_variant_props = Classes_Provider::get_all_normal_state_variant_props( $variants );

			if ( empty( $all_variant_props ) ) {
				continue;
			}

			$desktop_props = $all_variant_props[ Breakpoints_Manager::BREAKPOINT_KEY_DESKTOP ] ?? [];

			if ( ! Classes_Provider::has_typography_props( $desktop_props ) ) {
				continue;
			}

			foreach ( $all_variant_props as $device => $props ) {
				if ( empty( $props ) ) {
					continue;
				}

				$resolved_props = $props_resolver->resolve( $schema, $props );

				if ( ! isset( $grouped_entries[ $device ] ) ) {
					$grouped_entries[ $device ] = [];
				}

				$this->add_typography_css_entries( $label, $resolved_props, $grouped_entries[ $device ] );
			}
		}

		return $grouped_entries;
	}

	private function add_typography_css_entries( string $label, array $resolved_props, array &$css_entries ): void {
		foreach ( Classes_Provider::TYPOGRAPHY_PROPS as $prop_name ) {
			if ( ! isset( $resolved_props[ $prop_name ] ) || empty( $resolved_props[ $prop_name ] ) ) {
				continue;
			}

			$css_value = $resolved_props[ $prop_name ];
			$v3_id = 'v4-' . $label;

			$css_entries[] = "--e-global-typography-{$v3_id}-{$prop_name}:{$css_value};";
		}
	}
}
