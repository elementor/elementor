<?php

namespace Elementor\Modules\AtomicWidgets\Usage;

use Elementor\Modules\AtomicWidgets\Base\Atomic_Control_Base;
use Elementor\Modules\AtomicWidgets\Controls\Section;
use Elementor\Modules\AtomicWidgets\Elements\Atomic_Element_Base;
use Elementor\Modules\AtomicWidgets\Elements\Atomic_Widget_Base;
use Elementor\Modules\AtomicWidgets\PropTypes\Base\Array_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Base\Object_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Contracts\Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Union_Prop_Type;
use Elementor\Modules\AtomicWidgets\Styles\Style_Schema;
use Elementor\Plugin;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Usage_Counter {
	const TAB_GENERAL = 'General';
	const TAB_STYLE = 'Style';
	private array $style_sections;

	public function __construct() {
		$this->style_sections = $this->get_style_section_by_control( Style_Schema::get_style_schema_with_sections() );
	}

	public function count( array $element ): Usage_Counter_Result {
		/**
		 * @var Atomic_Widget_Base | Atomic_Element_Base $instance
		 */
		$instance = Plugin::$instance->elements_manager->create_element_instance( $element );
		$counter_result = new Usage_Counter_Result();

		if ( ! $instance ) {
			return $counter_result;
		}

		$total = $this->get_total_controls_count( $instance );
		$changed = $this->get_changed_controls( $instance );

		$counter_result->set_total( $total );
		$counter_result->set_changed( $changed );

		return $counter_result;
	}

	private function get_general_section_by_control( array $atomic_controls ): array {
		return array_reduce( $atomic_controls, function( $control_sections, $section ) {
			if ( ! ( $section instanceof Section ) ) {
				return $control_sections;
			}

			return array_merge( $control_sections, $this->extract_section_by_control( $section ) );
		}, []);
	}

	private function extract_section_by_control( Section $section ): array {
		$control_sections = [];

		foreach ( $section->get_items() as $control ) {
			if ( $control instanceof Atomic_Control_Base ) {
				$control_sections[ $control->get_bind() ] = $section->get_label();
			}
		}

		return $control_sections;
	}

	private function get_style_section_by_control( array $style_schema ): array {
		$style_sections = [];

		foreach ( $style_schema as $section_name => $prop ) {
			$style_sections = array_merge( $style_sections, $this->extract_section_by_style_control( $section_name, $prop ) );
		}

		return $style_sections;
	}

	private function extract_section_by_style_control( string $section_name, array $style_props ): array {
		return array_map( function ( $prop_type ) use ( $section_name ) {
			return [
				'section' => $section_name,
				'prop_type' => $prop_type,
			];
		}, $style_props);
	}

	private function get_changed_controls( $instance ): array {
		$changed_controls = [];

		$control_sections = $this->get_general_section_by_control( $instance->get_atomic_controls() );
		$data = $instance->get_data_for_save();

		foreach ( $data['settings'] as $control_name => $prop_type ) {
			if ( 'classes' === $control_name ) {
				$changed_controls[] = [
					'tab' => self::TAB_STYLE,
					'section' => 'classes',
					'control' => $control_name,
				];

				continue;
			}

			$changed_controls[] = [
				'tab' => self::TAB_GENERAL,
				'section' => $control_sections[ $control_name ] ?? 'unknown',
				'control' => $control_name,
			];
		}

		$style_props = $this->extract_props( $data['styles'] ?? [] );

		if ( ! empty( $style_props['custom_css_props'] ) ) {
			$changed_controls[] = [
				'tab' => self::TAB_STYLE,
				'section' => 'Custom CSS',
				'control' => 'custom_css',
			];
		}

		if ( empty( $style_props['style_props'] ) ) {
			return $changed_controls;
		}

		foreach ( $style_props['style_props'] as $style_prop_name => $style_prop_value ) {
			$section = $this->style_sections[ $style_prop_name ]['section'] ?? 'unknown';
			$prop_type = $this->style_sections[ $style_prop_name ]['prop_type'];

			$decomposed_props = $this->decompose_style_props( $style_prop_name, $style_prop_value, $prop_type, $section );
			$changed_controls = array_merge( $changed_controls, $decomposed_props );
		}

		return $changed_controls;
	}

	private function decompose_style_props( string $prop_name, $style_prop, Prop_Type $prop_type, string $section, string $prefix = '' ): array {
		$changed = [];
		$control_name = $prefix ? "{$prefix}-{$prop_name}" : $prop_name;
		$kind = $prop_type::KIND;

		if ( ! $style_prop ) {
			return $changed;
		}

		switch ( $kind ) {
			case 'plain':
				$changed[] = [
					'tab' => self::TAB_STYLE,
					'section' => $section,
					'control' => $control_name,
				];

				break;
			case 'object':
				/** @var Object_Prop_Type $prop_type */
				$prop_shape = $prop_type->get_shape();
				$object_styles = array_map( function( string $name, $value ) use ( $prop_shape, $section, $control_name ) {
					return $this->decompose_style_props( $name, $value, $prop_shape[ $name ], $section, $control_name );
				}, array_keys( $style_prop['value'] ), $style_prop['value'] );

				$changed = array_merge( $changed, ...$object_styles );

				break;
			case 'array':
				/** @var Array_Prop_Type $prop_type */
				$array_styles = array_map( function( array $value ) use ( $prop_type, $section, $control_name ) {
					$name = $value['$$type'];
					$prop_shape = $prop_type->get_item_type()->get_prop_type( $name );

					return $this->decompose_style_props( $name, $value, $prop_shape, $section, $control_name );
				}, $style_prop['value'] );

				$changed = array_merge( $changed, ...$array_styles );

				break;
			case 'union':
				/** @var Union_Prop_Type $prop_type */
				$union_prop_type = $prop_type->get_prop_type_from_value( $style_prop );
				$union_styles = $this->decompose_style_props( $prop_name, $style_prop, $union_prop_type, $section, $control_name );

				$changed = array_merge( $changed, $union_styles );

				break;
		}

		return $changed;
	}

	private function extract_props( array $styles ): array {
		$style_props = [];
		$custom_css_props = [];

		foreach ( $styles as $style ) {
			foreach ( $style['variants'] as $variant ) {
				$style_props[] = $variant['props'];
				$custom_css_props = $variant['custom_css'];
			}
		}

		return [
			'style_props' => array_merge( ...$style_props ),
			'custom_css_props' => $custom_css_props,
		];
	}

	private function get_total_controls_count( $instance ): int {
		$props_schema = $instance->get_props_schema();
		$total_count = count( $props_schema );

		$style_props = Style_Schema::get();
		$total_count += count( $style_props );

		return $total_count;
	}
}
