<?php

namespace Elementor\Modules\DesignSystemSync\Classes;

use Elementor\Controls_Manager;
use Elementor\Core\Breakpoints\Manager as Breakpoints_Manager;
use Elementor\Core\Kits\Documents\Tabs\Global_Typography;
use Elementor\Modules\AtomicWidgets\PropsResolver\Render_Props_Resolver;
use Elementor\Modules\AtomicWidgets\Styles\Style_Schema;
use Elementor\Modules\DesignSystemSync\Controls\V4_Typography_List;
use Elementor\Plugin;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Global_Typography_Extension {
	public function register_hooks() {
		add_action( 'elementor/kit/global-typography/register_controls', [ $this, 'add_v4_classes_section' ] );
		add_filter( 'elementor/globals/typography/items', [ $this, 'add_v4_classes_to_typography_selector' ] );
	}

	public function add_v4_classes_section( Global_Typography $tab ) {
		if ( ! Plugin::$instance->editor->is_edit_mode() ) {
			return;
		}

		$v4_typography_classes = Classes_Provider::get_typography_classes();

		if ( empty( $v4_typography_classes ) ) {
			return;
		}

		$tab->add_control(
			'heading_v4_typography_classes',
			[
				'type' => Controls_Manager::HEADING,
				'label' => esc_html__( 'Atomic Classes', 'elementor' ),
				'separator' => 'before',
			]
		);

		$tab->add_control(
			'heading_v4_typography_classes_description',
			[
				'type' => Controls_Manager::RAW_HTML,
				'raw' => esc_html__( 'V4 classes can only be edited when applied on an atom.', 'elementor' ),
				'content_classes' => 'elementor-descriptor',
			]
		);

		$items = [];

		foreach ( $v4_typography_classes as $class ) {
			$label = sanitize_text_field( $class['label'] ?? '' );

			if ( empty( $label ) ) {
				continue;
			}

			$items[] = [ 'title' => $label ];
		}

		$tab->add_control(
			'v4_typography_classes_display',
			[
				'type' => V4_Typography_List::TYPE,
				'items' => $items,
			]
		);
	}

	public function add_v4_classes_to_typography_selector( array $items ): array {
		$v4_classes = Classes_Provider::get_typography_classes();

		if ( empty( $v4_classes ) ) {
			return $items;
		}

		$schema = Style_Schema::get();
		$props_resolver = Render_Props_Resolver::for_styles();

		$v4_items = [];

		foreach ( $v4_classes as $class ) {
			$label = sanitize_text_field( $class['label'] ?? '' );

			if ( empty( $label ) ) {
				continue;
			}

			$id = 'v4-' . $label;
			$props = $class['props'] ?? [];

			if ( empty( $props ) ) {
				continue;
			}

			$resolved_props = $props_resolver->resolve( $schema, $props );
			$value = $this->convert_v4_props_to_v3_format( $resolved_props );

			$variants_props = $class['variants_props'] ?? [];

			foreach ( $variants_props as $breakpoint => $bp_props ) {
				if ( Breakpoints_Manager::BREAKPOINT_KEY_DESKTOP === $breakpoint ) {
					continue;
				}

				if ( empty( $bp_props ) ) {
					continue;
				}

				$resolved_bp_props = $props_resolver->resolve( $schema, $bp_props );
				$bp_values = $this->convert_v4_props_to_v3_format( $resolved_bp_props );

				foreach ( $bp_values as $key => $val ) {
					if ( $this->is_responsive_prop( $key ) ) {
						$value[ $key . '_' . $breakpoint ] = $val;
					}
				}
			}

			$v4_items[ $id ] = [
				'id' => $id,
				'title' => $label,
				'value' => $value,
				'group' => 'v4',
			];
		}

		return array_merge( $v4_items, $items );
	}

	private function is_responsive_prop( string $v3_key ): bool {
		return in_array( $v3_key, [
			'typography_font_size',
			'typography_line_height',
			'typography_letter_spacing',
			'typography_word_spacing',
		], true );
	}

	private function convert_v4_props_to_v3_format( array $v4_props ): array {
		$v3_format = [];

		$prop_map = [
			'font-family' => 'typography_font_family',
			'font-size' => 'typography_font_size',
			'font-weight' => 'typography_font_weight',
			'font-style' => 'typography_font_style',
			'text-decoration' => 'typography_text_decoration',
			'line-height' => 'typography_line_height',
			'letter-spacing' => 'typography_letter_spacing',
			'word-spacing' => 'typography_word_spacing',
			'text-transform' => 'typography_text_transform',
		];

		foreach ( $prop_map as $v4_prop => $v3_prop ) {
			if ( ! isset( $v4_props[ $v4_prop ] ) || empty( $v4_props[ $v4_prop ] ) ) {
				continue;
			}

			if ( $this->is_responsive_prop( $v3_prop ) ) {
				$v3_format[ $v3_prop ] = $this->parse_css_size_value( $v4_props[ $v4_prop ] );
			} else {
				$v3_format[ $v3_prop ] = $v4_props[ $v4_prop ];
			}
		}

		if ( ! empty( $v3_format ) ) {
			$v3_format['typography_typography'] = 'custom';
		}

		return $v3_format;
	}

	private function parse_css_size_value( string $css_value ): array {
		if ( preg_match( '/^(-?[\d.]+)\s*([a-z%]+)$/i', $css_value, $matches ) ) {
			return [
				'size' => (float) $matches[1],
				'unit' => $matches[2],
			];
		}

		return [
			'size' => (float) $css_value,
			'unit' => 'px',
		];
	}
}
