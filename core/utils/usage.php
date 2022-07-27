<?php
namespace Elementor\Core\Utils;

use Elementor\Core\DynamicTags\Manager;
use Elementor\Settings;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly
}

class Usage {

	/**
	 * Increase controls amount.
	 *
	 * Increase controls amount, for each element.
	 *
	 * @param array &$element_ref
	 * @param string $tab
	 * @param string $section
	 * @param string $control
	 * @param int $amount
	 */
	public static function increase_controls_amount( &$element_ref, $tab, $section, $control, $amount ) {
		if ( ! isset( $element_ref['controls'][ $tab ] ) ) {
			$element_ref['controls'][ $tab ] = [];
		}

		if ( ! isset( $element_ref['controls'][ $tab ][ $section ] ) ) {
			$element_ref['controls'][ $tab ][ $section ] = [];
		}

		if ( ! isset( $element_ref['controls'][ $tab ][ $section ][ $control ] ) ) {
			$element_ref['controls'][ $tab ][ $section ][ $control ] = 0;
		}

		$element_ref['controls'][ $tab ][ $section ][ $control ] += $amount;
	}

	/**
	 * Add Controls
	 *
	 * Add controls to this element_ref, returns changed controls count.
	 *
	 * @param array $settings_controls
	 * @param array $element_controls
	 * @param array &$element_ref
	 *
	 * @return int ($changed_controls_count).
	 */
	public static function add_controls( $settings_controls, $element_controls, &$element_ref ) {
		$changed_controls_count = 0;

		// Loop over all element settings.
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

			// If setting value is not the control default.
			if ( $value !== $control_config['default'] ) {
				self::increase_controls_amount( $element_ref, $tab, $section, $control, 1 );

				$changed_controls_count++;
			}
		}

		return $changed_controls_count;
	}

	/**
	 * Add general controls.
	 *
	 * Extract general controls to element ref, return clean `$settings_control`.
	 *
	 * @param array $settings_controls
	 * @param array &$element_ref
	 *
	 * @return array ($settings_controls).
	 */
	public static function add_general_controls( $settings_controls, &$element_ref ) {
		if ( ! empty( $settings_controls[ Manager::DYNAMIC_SETTING_KEY ] ) ) {
			$settings_controls = array_merge( $settings_controls, $settings_controls[ Manager::DYNAMIC_SETTING_KEY ] );

			// Add dynamic count to controls under `general` tab.
			self::increase_controls_amount(
				$element_ref,
				Settings::TAB_GENERAL,
				Manager::DYNAMIC_SETTING_KEY,
				'count',
				count( $settings_controls[ Manager::DYNAMIC_SETTING_KEY ] )
			);
		}

		return $settings_controls;
	}
}
