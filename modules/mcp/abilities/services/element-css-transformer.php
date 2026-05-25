<?php

namespace Elementor\Modules\Mcp\Abilities\Services;

use Elementor\Modules\AtomicWidgets\Utils\Utils;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

trait Element_Css_Transformer {

	use Css_Shorthand_Parser;
	use Base_Styles_Reset;

	private array $element_css_gaps = [];

	protected function reset_element_css_transform_state(): void {
		$this->element_css_gaps = [];
	}

	protected function transform_elements_with_css( array $elements ): array {
		$transformed = [];

		foreach ( $elements as $element ) {
			if ( ! is_array( $element ) ) {
				continue;
			}
			$transformed[] = $this->transform_element_with_css( $element );
		}

		return $transformed;
	}

	protected function get_element_css_gaps(): array {
		return $this->element_css_gaps;
	}

	private function transform_element_with_css( array $element ): array {
		if ( isset( $element['elements'] ) && is_array( $element['elements'] ) ) {
			$child_elements = [];
			foreach ( $element['elements'] as $child ) {
				if ( is_array( $child ) ) {
					$child_elements[] = $this->transform_element_with_css( $child );
				}
			}
			$element['elements'] = $child_elements;
		}

		$css = isset( $element['css'] ) && is_string( $element['css'] ) ? trim( $element['css'] ) : '';

		unset( $element['css'] );

		if ( '' === $css ) {
			return $element;
		}

		$id = isset( $element['id'] ) && is_string( $element['id'] ) && '' !== $element['id']
			? $element['id']
			: Utils::generate_id();

		$element['id'] = $id;

		$el_type = $this->resolve_element_type_for_css( $element );

		$css_data         = $this->css_to_props_for_element( $css );
		$user_props       = $css_data['props'];
		$css_gaps         = $css_data['gaps'];
		$custom_css_decls = $css_data['custom_css_decls'];
		$merged_props     = $this->merge_base_style_resets( $user_props, $el_type );

		if ( empty( $merged_props ) && empty( $custom_css_decls ) ) {
			return $element;
		}

		$style_id = 'e-' . $id . '-s';
		$variant  = [
			'meta'  => [
				'breakpoint' => 'desktop',
				'state'      => null,
			],
			'props' => $merged_props,
		];

		if ( ! empty( $custom_css_decls ) ) {
			// phpcs:ignore WordPress.PHP.DiscouragedPHPFunctions.obfuscation_base64_encode
			$variant['custom_css'] = [ 'raw' => base64_encode( implode( "\n", $custom_css_decls ) ) ];
		}

		if ( ! empty( $css_gaps ) ) {
			$this->element_css_gaps[] = [
				'element_id' => $id,
				'css_gaps'   => $css_gaps,
			];
		}

		$existing_styles = isset( $element['styles'] ) && is_array( $element['styles'] ) ? $element['styles'] : [];

		$existing_styles[ $style_id ] = [
			'id'       => $style_id,
			'type'     => 'class',
			'label'    => 'local',
			'variants' => [ $variant ],
		];

		$element['styles'] = $existing_styles;

		$classes = $this->extract_element_classes( $element );
		array_unshift( $classes, $style_id );
		$classes = array_values( array_unique( $classes ) );

		if ( ! isset( $element['settings'] ) || ! is_array( $element['settings'] ) ) {
			$element['settings'] = [];
		}

		$element['settings']['classes'] = [
			'$$type' => 'classes',
			'value'  => $classes,
		];

		return $element;
	}

	private function resolve_element_type_for_css( array $element ): string {
		$el_type = isset( $element['elType'] ) && is_string( $element['elType'] ) ? $element['elType'] : '';

		if ( 'widget' === $el_type && isset( $element['widgetType'] ) && is_string( $element['widgetType'] ) ) {
			return $element['widgetType'];
		}

		return '' !== $el_type ? $el_type : 'e-paragraph';
	}

	private function extract_element_classes( array $element ): array {
		if (
			! isset( $element['settings']['classes']['value'] ) ||
			! is_array( $element['settings']['classes']['value'] )
		) {
			return [];
		}

		return array_values( array_filter( $element['settings']['classes']['value'], 'is_string' ) );
	}

	private function css_to_props_for_element( string $css ): array {
		$valid_decls      = [];
		$gap_entries      = [];
		$custom_css_decls = [];

		foreach ( array_filter( array_map( 'trim', explode( ';', $css ) ) ) as $decl ) {
			$colon = strpos( $decl, ':' );
			if ( false === $colon ) {
				continue;
			}
			$prop  = strtolower( trim( substr( $decl, 0, $colon ) ) );
			$value = trim( substr( $decl, $colon + 1 ) );
			if ( '' === $prop || '' === $value ) {
				continue;
			}

			if ( 'text-gradient' === $prop ) {
				$custom_css_decls[] = "background: $value;";
				$custom_css_decls[] = '-webkit-background-clip: text;';
				$custom_css_decls[] = '-webkit-text-fill-color: transparent;';
				$custom_css_decls[] = 'background-clip: text;';
				$gap_entries[]      = [
					'declaration' => "text-gradient: $value;",
					'hint'        => 'Shorthand for gradient-text effect. Expanded to 4 CSS declarations in custom_css.',
				];
				continue;
			}

			if ( 'border' === $prop ) {
				$parsed = $this->parse_border_shorthand( $value );
				if ( null !== $parsed ) {
					array_push( $valid_decls, ...$parsed );
				} else {
					$custom_css_decls[] = "$prop: $value;";
					$gap_entries[]      = [
						'declaration' => "$prop: $value;",
						'hint'        => 'border shorthand could not be fully parsed. Use border-width, border-style, and border-color separately.',
					];
				}
				continue;
			}

			if ( $this->is_v4_gap( $prop, $value ) ) {
				$custom_css_decls[] = "$prop: $value;";
				$entry              = [
					'declaration' => "$prop: $value;",
				];
				$hint               = $this->get_v4_gap_hint( $prop, $value );
				if ( null !== $hint ) {
					$entry['hint'] = $hint;
				}
				$gap_entries[] = $entry;
			} else {
				$valid_decls[] = $decl;
			}
		}

		$props = ! empty( $valid_decls ) ? $this->css_to_props( implode( '; ', $valid_decls ) ) : [];

		return [
			'props'            => $props,
			'gaps'             => $gap_entries,
			'custom_css_decls' => $custom_css_decls,
		];
	}
}
