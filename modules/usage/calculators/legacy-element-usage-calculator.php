<?php

namespace Elementor\Modules\Usage\Calculators;

use Elementor\Core\DynamicTags\Manager;
use Elementor\Modules\Usage\Contracts\Element_Usage_Calculator;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Legacy_Element_Usage_Calculator implements Element_Usage_Calculator {

	const GENERAL_TAB = 'general';

	public function can_calculate( array $element, $element_instance ): bool {
		return true;
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

		$element_controls = $element_instance->get_controls();

		if ( isset( $element['settings'] ) ) {
			$settings_controls = $element['settings'];
			$element_ref = &$existing_usage[ $type ];

			$settings_controls = $this->add_general_controls( $settings_controls, $element_ref );

			$changed_controls_count = $this->add_controls( $settings_controls, $element_controls, $element_ref );

			$percent = ! empty( $element_controls ) ? $changed_controls_count / ( count( $element_controls ) / 100 ) : 0;

			$existing_usage[ $type ]['control_percent'] = (int) round( $percent );
		}

		return $existing_usage;
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

	private function add_controls( array $settings_controls, array $element_controls, array &$element_ref ): int {
		$changed_controls_count = 0;

		foreach ( $settings_controls as $control => $value ) {
			if ( empty( $element_controls[ $control ] ) ) {
				continue;
			}

			$control_config = $element_controls[ $control ];

			if ( ! isset( $control_config['section'], $control_config['default'] ) ) {
				continue;
			}

			$tab = $control_config['tab'];
			$section = $control_config['section'];

			if ( $value !== $control_config['default'] ) {
				$this->increase_controls_count( $element_ref, $tab, $section, $control, 1 );

				++$changed_controls_count;
			}
		}

		return $changed_controls_count;
	}

	private function add_general_controls( array $settings_controls, array &$element_ref ): array {
		if ( ! empty( $settings_controls[ Manager::DYNAMIC_SETTING_KEY ] ) ) {
			$settings_controls = array_merge( $settings_controls, $settings_controls[ Manager::DYNAMIC_SETTING_KEY ] );

			$this->increase_controls_count(
				$element_ref,
				self::GENERAL_TAB,
				Manager::DYNAMIC_SETTING_KEY,
				'count',
				count( $settings_controls[ Manager::DYNAMIC_SETTING_KEY ] )
			);
		}

		return $settings_controls;
	}
}
