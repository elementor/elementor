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

			if ( empty( $condition ) || V3_Control_Condition::is_met( $condition, $settings, $controls ) ) {
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
	 * @return array<string, mixed>
	 */
	private static function find_condition( string $key, array $controls ): array {
		$control = $controls[ $key ] ?? $controls[ preg_replace( self::RESPONSIVE_SUFFIX_PATTERN, '', $key ) ] ?? null;
		$condition = is_array( $control ) ? ( $control['condition'] ?? null ) : null;

		return is_array( $condition ) ? $condition : [];
	}
}
