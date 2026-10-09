<?php

namespace Elementor\Modules\Mcp\Abilities\Appliers\V3;

use Elementor\Modules\Mcp\Abilities\Appliers\V3\Maps\V3_Widget_Map_Registry;
use Elementor\Modules\Mcp\Abilities\Utils\Warnings_Bag;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Lists written V3 settings that Elementor ignores because their control is hidden by the
 * node's final settings. The values are still persisted.
 */
class V3_Inactive_Condition_Warnings {

	const WARNING_CODE = 'inactive_condition';

	const UNWORDED_CONDITION = 'other settings allow it';

	/**
	 * @param Warnings_Bag         $warnings
	 * @param string               $config_id
	 * @param string               $widget_type
	 * @param string[]             $written_keys Control keys written by this request.
	 * @param array<string, mixed> $settings     Final node settings.
	 */
	public static function report( Warnings_Bag $warnings, string $config_id, string $widget_type, array $written_keys, array $settings ): void {
		$is_visible = V3_Control_Visibility::for_widget( $widget_type );

		if ( null === $is_visible ) {
			return;
		}

		$controls = V3_Widget_Map_Registry::instance()->get_registered_controls( $widget_type );

		foreach ( self::collect( $written_keys, $settings, $controls, $is_visible ) as $message ) {
			$warnings->add( self::WARNING_CODE, $message, $config_id );
		}
	}

	/**
	 * @param string[]             $written_keys
	 * @param array<string, mixed> $settings     Final node settings.
	 * @param array<string, mixed> $controls     Registered controls of the widget.
	 * @param callable             $is_visible   `( array $control, array $values, array $controls ): bool`.
	 * @return string[]
	 */
	public static function collect( array $written_keys, array $settings, array $controls, callable $is_visible ): array {
		$values = V3_Control_Visibility::values_with_defaults( $controls, $settings );
		$messages = [];

		foreach ( $written_keys as $key ) {
			$control = $controls[ $key ] ?? null;

			if ( ! self::is_conditional( $control ) || $is_visible( $control, $values, $controls ) ) {
				continue;
			}

			$messages[] = sprintf(
				/* translators: 1: Setting key, 2: Human readable control condition */
				__( 'Setting %1$s was saved but only takes effect when %2$s.', 'elementor' ),
				$key,
				self::describe( $control )
			);
		}

		return $messages;
	}

	/**
	 * @param mixed $control
	 */
	private static function is_conditional( $control ): bool {
		return is_array( $control ) && ( ! empty( $control['condition'] ) || ! empty( $control['conditions'] ) );
	}

	/**
	 * @param array<string, mixed> $control
	 */
	private static function describe( array $control ): string {
		$description = is_array( $control['condition'] ?? null ) ? V3_Control_Condition::describe( $control['condition'] ) : '';

		return '' === $description ? self::UNWORDED_CONDITION : $description;
	}
}
