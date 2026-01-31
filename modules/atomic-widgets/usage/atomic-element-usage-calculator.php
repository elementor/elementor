<?php

namespace Elementor\Modules\AtomicWidgets\Usage;

use Elementor\Modules\AtomicWidgets\Controls\Base\Atomic_Control_Base;
use Elementor\Modules\AtomicWidgets\Controls\Section;
use Elementor\Modules\AtomicWidgets\Styles\Style_Schema;
use Elementor\Modules\AtomicWidgets\Utils\Utils as Atomic_Utils;
use Elementor\Modules\Usage\Contracts\Element_Usage_Calculator;
use Elementor\Plugin;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Atomic_Element_Usage_Calculator implements Element_Usage_Calculator {

	const TAB_GENERAL = 'General';
	const TAB_STYLE = 'Style';

	private array $style_sections;

	public function __construct() {
		$this->style_sections = $this->get_style_section_by_control( Style_Schema::get_style_schema_with_sections() );
	}

	public function can_calculate( array $element, $element_instance ): bool {
		if ( null === $element_instance ) {
			return false;
		}

		return Atomic_Utils::is_atomic( $element_instance );
	}

	public function calculate( array $element, $element_instance, array $existing_usage ): array {
		$type = $element['widgetType'] ?? $element['elType'];

		if ( ! isset( $existing_usage[ $type ] ) ) {
			$existing_usage[ $type ] = [
				'count' => 0,
				'control_percent' => 0,
				'controls' => [],
			];
		}

		$existing_usage[ $type ]['count']++;

		if ( ! $element_instance ) {
			return $existing_usage;
		}

		$element_ref = &$existing_usage[ $type ];

		$instance = Plugin::$instance->elements_manager->create_element_instance( $element );

		if ( ! $instance ) {
			return $existing_usage;
		}

		$control_sections = $this->get_general_section_by_control( $instance->get_atomic_controls() );
		$settings = $element['settings'] ?? [];
		$styles = $element['styles'] ?? [];

		$changed_props_count = $this->calculate_props_usage( $settings, $control_sections, $element_ref );
		$changed_styles_count = $this->calculate_styles_usage( $styles, $element_ref );

		$props_schema = $instance::get_props_schema();
		$total_props_count = count( $props_schema );
		$style_props = Style_Schema::get();
		$total_style_count = count( $style_props );

		$total_count = $total_props_count + $total_style_count;
		$changed_count = $changed_props_count + $changed_styles_count;

		$percent = $total_count > 0 ? ( $changed_count / $total_count ) * 100 : 0;

		$element_ref['control_percent'] = (int) round( $percent );

		return $existing_usage;
	}

	private function get_general_section_by_control( array $atomic_controls ): array {
		return array_reduce( $atomic_controls, function ( $control_sections, $section ) {
			if ( ! ( $section instanceof Section ) ) {
				return $control_sections;
			}

			return array_merge( $control_sections, $this->extract_section_by_control( $section ) );
		}, [] );
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

		foreach ( $style_schema as $section_name => $props ) {
			foreach ( $props as $prop_name => $prop_type ) {
				$style_sections[ $prop_name ] = [
					'section' => $section_name,
					'prop_type' => $prop_type,
				];
			}
		}

		return $style_sections;
	}

	private function calculate_props_usage( array $settings, array $control_sections, array &$element_ref ): int {
		$changed_count = 0;

		foreach ( $settings as $prop_name => $value ) {
			if ( '_cssid' === $prop_name ) {
				continue;
			}

			if ( 'classes' === $prop_name ) {
				$this->increase_controls_count( $element_ref, self::TAB_STYLE, 'classes', $prop_name, 1 );
				$changed_count++;
				continue;
			}

			$section = $control_sections[ $prop_name ] ?? 'unknown';
			$this->increase_controls_count( $element_ref, self::TAB_GENERAL, $section, $prop_name, 1 );
			$changed_count++;
		}

		return $changed_count;
	}

	private function calculate_styles_usage( array $styles, array &$element_ref ): int {
		$changed_count = 0;
		$style_props = [];
		$has_custom_css = false;

		foreach ( $styles as $style_data ) {
			if ( empty( $style_data['variants'] ) ) {
				continue;
			}

			foreach ( $style_data['variants'] as $variant ) {
				if ( ! empty( $variant['props'] ) ) {
					$style_props = array_merge( $style_props, $variant['props'] );
				}

				if ( ! empty( $variant['custom_css'] ) ) {
					$has_custom_css = true;
				}
			}
		}

		if ( $has_custom_css ) {
			$this->increase_controls_count( $element_ref, self::TAB_STYLE, 'Custom CSS', 'custom_css', 1 );
			$changed_count++;
		}

		foreach ( $style_props as $prop_name => $value ) {
			$section = $this->style_sections[ $prop_name ]['section'] ?? 'unknown';
			$this->increase_controls_count( $element_ref, self::TAB_STYLE, $section, $prop_name, 1 );
			$changed_count++;
		}

		return $changed_count;
	}

	private function increase_controls_count( array &$element_ref, string $tab, string $section, string $control, int $count ): void {
		if ( ! isset( $element_ref['controls'][ $tab ] ) ) {
			$element_ref['controls'][ $tab ] = [];
		}

		if ( ! isset( $element_ref['controls'][ $tab ][ $section ] ) ) {
			$element_ref['controls'][ $tab ][ $section ] = [];
		}

		if ( ! isset( $element_ref['controls'][ $tab ][ $section ][ $control ] ) ) {
			$element_ref['controls'][ $tab ][ $section ][ $control ] = 0;
		}

		$element_ref['controls'][ $tab ][ $section ][ $control ] += $count;
	}
}
