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

class Usage_Counter {
    const TAB_GENERAL = 'General';
    const TAB_STYLE = 'Style';

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

			foreach ( $section->get_items() as $control ) {
				if ( $control instanceof Atomic_Control_Base ) {
					$control_sections[ $control->get_bind() ] = $section->get_label();
				}
			}

			return $control_sections;
		}, []);
	}

	private function get_style_section_by_control( array $style_schema ): array {
		$style_sections = [];

		foreach ( $style_schema as $section_name => $prop ) {
			foreach ( $prop as $prop_name => $prop_type ) {
				$style_sections[ $prop_name ] = [
					'section' => $section_name,
					'prop_type' => $prop_type
				];
			}
		}

		return $style_sections;
	}

	private function get_changed_controls( $instance ): array {
		$changed_controls = [];

		// ['tab' => self::TAB_GENERAL, 'section' => 'content', 'control' => 'title']

		$control_sections = $this->get_general_section_by_control( $instance->get_atomic_controls() );
		$data = $instance->get_data_for_save();

		foreach ( $data['settings'] as $control_name => $prop_type ) {
			if ( 'classes' === $control_name ) {
				$changed_controls[] = [
					'tab' => self::TAB_STYLE,
					'section' => 'classes',
					'control' => $control_name
				];

				continue;
			}

			$changed_controls[] = [
				'tab' => self::TAB_GENERAL,
				'section' => $control_sections[ $control_name ] ?? 'unknown',
				'control' => $control_name
			];
		}

		return $changed_controls;
	}

    private function get_total_controls_count( $instance ): int {
        $props_schema = $instance->get_props_schema();
        $total_count = count( $props_schema );

        $style_props = Style_Schema::get();
        $total_count += count( $style_props );

        return $total_count;
    }
}
