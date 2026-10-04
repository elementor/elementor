<?php

namespace Elementor\Modules\Mcp\Abilities\Appliers\V3;

use Elementor\Modules\Mcp\Abilities\Appliers\V3\Maps\V3_Widget_Map_Registry;
use Elementor\Modules\Mcp\Abilities\Utils\Warnings_Bag;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Lists the written V3 settings whose control `condition` does not hold for the node's final
 * settings. Such values are still persisted, but Elementor ignores them until the condition holds.
 */
class V3_Inactive_Condition_Warnings {

	const WARNING_CODE = 'inactive_condition';

	const RESPONSIVE_SUFFIX_PATTERN = '/_(?:widescreen|laptop|tablet_extra|tablet|mobile_extra|mobile)$/';

	/**
	 * @param Warnings_Bag         $warnings
	 * @param string               $config_id
	 * @param string               $widget_type
	 * @param string[]             $written_keys
	 * @param array<string, mixed> $settings     Final node settings.
	 */
	public static function report( Warnings_Bag $warnings, string $config_id, string $widget_type, array $written_keys, array $settings ): void {
		$controls = V3_Widget_Map_Registry::instance()->get_registered_controls( $widget_type );

		foreach ( self::collect( $written_keys, $settings, $controls ) as $message ) {
			$warnings->add( self::WARNING_CODE, $message, $config_id );
		}
	}

	/**
	 * @param string[]             $written_keys
	 * @param array<string, mixed> $settings     Final node settings.
	 * @param array<string, mixed> $controls     Registered controls of the widget.
	 * @return string[]
	 */
	public static function collect( array $written_keys, array $settings, array $controls ): array {
		$messages = [];

		foreach ( $written_keys as $key ) {
			$condition = self::find_condition( (string) $key, $controls );

			if ( empty( $condition ) || V3_Control_Condition::is_met( $condition, self::settings_at_device_of( (string) $key, $settings ), $controls ) ) {
				continue;
			}

			$messages[] = sprintf(
				/* translators: 1: Setting key, 2: Human readable control condition */
				__( 'Setting %1$s was saved but only takes effect when %2$s.', 'elementor' ),
				$key,
				V3_Control_Condition::describe( $condition )
			);
		}

		return $messages;
	}

	/**
	 * A device variant (e.g. `_element_custom_width_mobile`) is gated by the same device's
	 * values (`_element_width_mobile`), falling back to the base values.
	 *
	 * @param string               $key
	 * @param array<string, mixed> $settings
	 * @return array<string, mixed>
	 */
	private static function settings_at_device_of( string $key, array $settings ): array {
		if ( 1 !== preg_match( self::RESPONSIVE_SUFFIX_PATTERN, $key, $matches ) ) {
			return $settings;
		}

		$suffix = $matches[0];

		foreach ( $settings as $setting_key => $value ) {
			if ( str_ends_with( (string) $setting_key, $suffix ) ) {
				$settings[ substr( (string) $setting_key, 0, -strlen( $suffix ) ) ] = $value;
			}
		}

		return $settings;
	}

	/**
	 * @return array<string, mixed>
	 */
	private static function find_condition( string $key, array $controls ): array {
		$control = $controls[ $key ] ?? $controls[ preg_replace( self::RESPONSIVE_SUFFIX_PATTERN, '', $key ) ] ?? null;
		$condition = is_array( $control ) ? ( $control['condition'] ?? null ) : null;

		return is_array( $condition ) ? $condition : [];
	}
}
