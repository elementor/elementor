<?php

namespace Elementor\Modules\AtomicWidgets\Usage;

use Elementor\Modules\AtomicWidgets\Base\Atomic_Control_Base;
use Elementor\Modules\AtomicWidgets\Controls\Section;
use Elementor\Modules\AtomicWidgets\Elements\Atomic_Element_Base;
use Elementor\Modules\AtomicWidgets\Elements\Atomic_Widget_Base;
use Elementor\Modules\AtomicWidgets\Styles\Style_Schema;
use Elementor\Plugin;

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

/**
 * Usage Counter for Atomic Widgets.
 *
 * This class counts which atomic widget controls have been changed
 * from their default values.
 *
 * Usage Example:
 *
 *   $counter = new Usage_Counter();
 *   $result = $counter->count( $element_data );
 *
 *   // Result structure:
 *   // [
 *   //   'total' => 50,        // Total available controls
 *   //   'changed' => 5,       // Number of changed controls
 *   //   'controls' => [
 *   //     'general' => [
 *   //       'content' => ['title' => 'My Title', 'tag' => 'h3']
 *   //     ],
 *   //     'style' => [
 *   //       'typography' => ['color' => '#ff0000', 'font-size' => {...}]
 *   //     ]
 *   //   ]
 *   // ]
 */
class Usage_Counter {
    const TAB_GENERAL = 'general';
    const TAB_STYLE = 'style';

    public function count( array $element ): ?array {
        /**
         * @var Atomic_Widget_Base | Atomic_Element_Base $instance
         */
        $instance = Plugin::$instance->elements_manager->create_element_instance( $element );

        if ( ! $instance ) {
            return null;
        }

//		var_dump($element);

//        $controls_by_tab = $this->extract_controls_by_tab( $instance );
        $changed_controls = $this->get_changed_controls( $instance );
        $total_count = $this->get_total_controls_count( $instance );
//        $changed_count = array_sum( array_map( 'count', $changed_controls ) );

        return [
            'total' => $total_count,
//            'changed' => $changed_count,
//            'controls' => $changed_controls,
        ];
    }

	private function get_general_section_by_control( array $atomic_controls ): array {
		return array_reduce( $atomic_controls, function( $control_sections, $section ) {
			if ( ! ( $section instanceof Section ) ) {
				return $control_sections;
			}

			foreach ( $section->get_items() as $control ) {
				if ( $control instanceof Atomic_Control_Base ) {
					$control_sections[ $control->get_bind() ] = $section->get_label();
				}
			}

			return $control_sections;
		}, []);
	}

	private function get_changed_controls( $instance ): array {
		$changed_controls = [];

		// ['tab' => self::TAB_GENERAL, 'section' => 'content', 'control' => 'title']

		$control_sections = $this->get_general_section_by_control( $instance->get_atomic_controls() );
		$data = $instance->get_data_for_save();

		// Check general controls
		foreach ( $data['settings'] as $control_name => $prop_type ) {
			$changed_controls[] = [
				'tab' => self::TAB_GENERAL,
				'section' => $control_sections[ $control_name ] ?? 'unknown',
				'control' => $control_name
			];
		}

		var_dump($changed_controls);die();

		// Check style controls
		$all_style_props = Style_Schema::get();
		foreach ( $all_style_props as $style_prop_name => $style_prop_type ) {
			if ( ! array_key_exists( 'styles', $props ) || ! array_key_exists( $style_prop_name, $props['styles'] ) ) {
				continue;
			}

			$current_value = $props['styles'][ $style_prop_name ];
			$default_value = $style_prop_type->get_default();

			if ( $current_value !== $default_value ) {
				$changed_controls[self::TAB_STYLE][ $style_prop_name ] = $current_value;
			}
		}

		return $changed_controls;
	}

    private function get_total_controls_count( $instance ): int {
        $props_schema = $instance->get_props_schema();
        $total_count = count( $props_schema );

        $all_style_props = Style_Schema::get();
        $total_count += count( $all_style_props );

        return $total_count;
    }
}
