<?php

namespace Elementor\Modules\AtomicWidgets\Usage;

use Elementor\Modules\AtomicWidgets\Controls\Base\Atomic_Control_Base;
use Elementor\Modules\AtomicWidgets\Controls\Section;
use Elementor\Modules\AtomicWidgets\Styles\Style_Schema;
use Elementor\Modules\AtomicWidgets\Utils\Utils as Atomic_Utils;
use Elementor\Modules\Usage\Contracts\Element_Usage_Calculator;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Atomic_Element_Usage_Calculator implements Element_Usage_Calculator {

	const TAB_GENERAL = 'General';
	const TAB_STYLE = 'Style';
	const DEFAULT_SECTION = 'Styles';

	private array $style_props_schema;

	public function __construct() {
		$this->style_props_schema = Style_Schema::get_style_schema() ?? [];
	}

	public function can_calculate( array $element, $element_instance ): bool {
		if ( null === $element_instance ) {
			return false;
		}

		return Atomic_Utils::is_atomic( $element_instance );
	}

	public function calculate( array $element, $element_instance, array $usage ): array {
		$type = $this->get_element_type( $element );
		$usage = $this->ensure_usage_entry( $usage, $type );
		$usage[ $type ]['count']++;

		if ( ! $element_instance ) {
			return $usage;
		}

		$settings = $element['settings'] ?? [];
		$styles = $element['styles'] ?? [];

		$control_sections = $this->build_control_section_map( $element_instance->get_atomic_controls() );
		$changed_props = $this->count_props_usage( $settings, $control_sections, $usage, $type );
		$changed_styles = $this->count_styles_usage( $styles, $usage, $type );

		$usage[ $type ]['control_percent'] = $this->calculate_control_percent(
			$changed_props + $changed_styles,
			$element_instance
		);

		return $usage;
	}

	private function get_element_type( array $element ): string {
		return $element['widgetType'] ?? $element['elType'];
	}

	private function ensure_usage_entry( array $usage, string $type ): array {
		if ( ! isset( $usage[ $type ] ) ) {
			$usage[ $type ] = [
				'count' => 0,
				'control_percent' => 0,
				'controls' => [],
			];
		}

		return $usage;
	}

	private function build_control_section_map( array $atomic_controls ): array {
		$map = [];

		foreach ( $atomic_controls as $item ) {
			if ( ! ( $item instanceof Section ) ) {
				continue;
			}

			foreach ( $item->get_items() as $control ) {
				if ( $control instanceof Atomic_Control_Base ) {
					$map[ $control->get_bind() ] = $item->get_label();
				}
			}
		}

		return $map;
	}

	private function count_props_usage( array $settings, array $control_sections, array &$usage, string $type ): int {
		$count = 0;

		foreach ( $settings as $prop_name => $value ) {
			if ( '_cssid' === $prop_name ) {
				continue;
			}

			if ( 'classes' === $prop_name ) {
				$this->increment_control( $usage, $type, self::TAB_STYLE, $prop_name );
				$count++;
				continue;
			}

			$section = $control_sections[ $prop_name ] ?? 'unknown';
			$this->increment_control( $usage, $type, self::TAB_GENERAL, $prop_name, $section );
			$count++;
		}

		return $count;
	}

	private function count_styles_usage( array $styles, array &$usage, string $type ): int {
		$count = 0;
		$style_props = $this->collect_style_props( $styles );
		$has_custom_css = $this->has_custom_css( $styles );

		if ( $has_custom_css ) {
			$this->increment_control( $usage, $type, self::TAB_STYLE, 'custom_css' );
			$count++;
		}

		foreach ( $style_props as $prop_name => $value ) {
			$prop_type = $this->style_props_schema[ $prop_name ] ?? null;
			$count++;

			if ( $prop_type ) {
				$decomposed = $this->decompose_style_props( $prop_name, $value, $prop_type );
				foreach ( $decomposed as $control_name ) {
					$this->increment_control( $usage, $type, self::TAB_STYLE, $control_name );
				}
			} else {
				$this->increment_control( $usage, $type, self::TAB_STYLE, $prop_name );
			}
		}

		return $count;
	}

	private function collect_style_props( array $styles ): array {
		$props = [];

		foreach ( $styles as $style_data ) {
			if ( empty( $style_data['variants'] ) ) {
				continue;
			}

			foreach ( $style_data['variants'] as $variant ) {
				if ( ! empty( $variant['props'] ) ) {
					$props = array_merge( $props, $variant['props'] );
				}
			}
		}

		return $props;
	}

	private function has_custom_css( array $styles ): bool {
		foreach ( $styles as $style_data ) {
			if ( empty( $style_data['variants'] ) ) {
				continue;
			}

			foreach ( $style_data['variants'] as $variant ) {
				if ( ! empty( $variant['custom_css'] ) ) {
					return true;
				}
			}
		}

		return false;
	}

	private function calculate_control_percent( int $changed_count, $instance ): int {
		$props_schema = $instance::get_props_schema();
		$style_props = Style_Schema::get();

		$total = count( $props_schema ) + count( $style_props );

		if ( 0 === $total ) {
			return 0;
		}

		return (int) round( ( $changed_count / $total ) * 100 );
	}

	private function increment_control( array &$usage, string $type, string $tab, string $control, string $section = self::DEFAULT_SECTION ): void {
		if ( ! isset( $usage[ $type ]['controls'][ $tab ] ) ) {
			$usage[ $type ]['controls'][ $tab ] = [];
		}

		if ( ! isset( $usage[ $type ]['controls'][ $tab ][ $section ] ) ) {
			$usage[ $type ]['controls'][ $tab ][ $section ] = [];
		}

		if ( ! isset( $usage[ $type ]['controls'][ $tab ][ $section ][ $control ] ) ) {
			$usage[ $type ]['controls'][ $tab ][ $section ][ $control ] = 0;
		}

		$usage[ $type ]['controls'][ $tab ][ $section ][ $control ]++;
	}

	private function decompose_style_props( string $prop_name, $value, $prop_type, string $prefix = '' ): array {
		$control_names = [];
		$control_name = $prefix ? "{$prefix}-{$prop_name}" : $prop_name;
		// phpcs:ignore
		$kind = $prop_type::$KIND;

		if ( ! $value ) {
			return $control_names;
		}

		switch ( $kind ) {
			case 'object':
				$prop_shape = $prop_type->get_shape();
				if ( isset( $value['value'] ) && is_array( $value['value'] ) ) {
					foreach ( $value['value'] as $key => $nested_value ) {
						if ( isset( $prop_shape[ $key ] ) ) {
							$nested = $this->decompose_style_props( $key, $nested_value, $prop_shape[ $key ], $control_name );
							$control_names = array_merge( $control_names, $nested );
						}
					}
				}
				break;

			case 'array':
				$item_type = $prop_type->get_item_type();
				if ( isset( $value['value'] ) && is_array( $value['value'] ) ) {
					foreach ( $value['value'] as $item ) {
						$item_name = $item['$$type'] ?? 'item';
						// phpcs:ignore
						$item_prop_type = 'union' === $item_type::$KIND ? $item_type->get_prop_type( $item_name ) : $item_type;

						if ( $item_prop_type ) {
							$nested = $this->decompose_style_props( $item_name, $item, $item_prop_type, $control_name );
							$control_names = array_merge( $control_names, $nested );
						}
					}
				}
				break;

			case 'union':
				$union_prop_type = $prop_type->get_prop_type_from_value( $value );
				if ( $union_prop_type ) {
					$nested = $this->decompose_style_props( $prop_name, $value, $union_prop_type, $prefix );
					$control_names = array_merge( $control_names, $nested );
				}
				break;

			default:
				$control_names[] = $control_name;
				break;
		}

		return $control_names;
	}
}
