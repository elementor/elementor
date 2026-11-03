<?php

namespace Elementor\Modules\Mcp\Abilities\Appliers\V3;

use Elementor\Modules\Mcp\Abilities\Appliers\V3\Maps\Compiled_V3_Map;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\Maps\Style_Target;
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

		$registry = V3_Widget_Map_Registry::instance();
		$controls = $registry->get_registered_controls( $widget_type );
		$map = $registry->get_map( $widget_type );
		$labels = null === $map ? [] : self::style_labels( $map );

		foreach ( self::collect( $written_keys, $settings, $controls, $is_visible, $labels ) as $message ) {
			$warnings->add( self::WARNING_CODE, $message, $config_id );
		}
	}

	/**
	 * @param string[]              $written_keys
	 * @param array<string, mixed>  $settings     Final node settings.
	 * @param array<string, mixed>  $controls     Registered controls of the widget.
	 * @param callable              $is_visible   `( array $control, array $values, array $controls ): bool`.
	 * @param array<string, string> $labels       Setting key => CSS the setting stores, for map-bound style settings.
	 * @return string[]
	 */
	public static function collect( array $written_keys, array $settings, array $controls, callable $is_visible, array $labels = [] ): array {
		$values = V3_Control_Visibility::values_with_defaults( $controls, $settings );
		$hidden_by_condition = [];

		foreach ( $written_keys as $key ) {
			$control = $controls[ $key ] ?? null;

			if ( ! self::is_conditional( $control ) || $is_visible( $control, $values, $controls ) ) {
				continue;
			}

			$condition = self::describe( self::unmet_condition( $control, $values, $controls, $is_visible ), $controls );
			$hidden_by_condition[ $condition ][] = $labels[ $key ] ?? $key;
		}

		$messages = [];

		foreach ( $hidden_by_condition as $condition => $names ) {
			$messages[] = self::message( array_values( array_unique( $names ) ), (string) $condition );
		}

		return $messages;
	}

	/**
	 * @param string[] $names
	 * @param string   $condition
	 */
	private static function message( array $names, string $condition ): string {
		if ( 1 === count( $names ) ) {
			return sprintf(
				/* translators: 1: Setting key, 2: Human readable control condition */
				__( 'Setting %1$s was saved but only takes effect when %2$s.', 'elementor' ),
				$names[0],
				$condition
			);
		}

		return sprintf(
			/* translators: 1: Comma-separated setting keys, 2: Human readable control condition */
			__( 'Settings %1$s were saved but only take effect when %2$s.', 'elementor' ),
			implode( ', ', $names ),
			$condition
		);
	}

	/**
	 * Terms that already hold, like a typography toggle the same write turned on, only add noise.
	 *
	 * @param array<string, mixed> $control
	 * @param array<string, mixed> $values
	 * @param array<string, mixed> $controls
	 * @param callable             $is_visible
	 * @return array<string, mixed>
	 */
	private static function unmet_condition( array $control, array $values, array $controls, callable $is_visible ): array {
		$condition = is_array( $control['condition'] ?? null ) ? $control['condition'] : [];
		$unmet = [];

		foreach ( $condition as $term => $expected ) {
			$single_term_control = array_merge( $control, [ 'condition' => [ $term => $expected ] ] );
			unset( $single_term_control['conditions'] );

			if ( ! $is_visible( $single_term_control, $values, $controls ) ) {
				$unmet[ $term ] = $expected;
			}
		}

		return array_merge( $control, [ 'condition' => empty( $unmet ) ? $condition : $unmet ] );
	}

	/**
	 * @return array<string, string>
	 */
	private static function style_labels( Compiled_V3_Map $map ): array {
		$labels = [];

		foreach ( $map->get_targets() as $alias => $target ) {
			foreach ( $target->get_bindings() as $binding ) {
				$state = Style_Target::DEFAULT_STATE === $binding->get_state() ? '' : ':' . $binding->get_state();
				$labels[ $binding->get_setting() ] = $labels[ $binding->get_setting() ] ?? sprintf( '%s on %s%s', $binding->get_prop(), $alias, $state );
			}
		}

		return $labels;
	}

	/**
	 * @param mixed $control
	 */
	private static function is_conditional( $control ): bool {
		return is_array( $control ) && ( ! empty( $control['condition'] ) || ! empty( $control['conditions'] ) );
	}

	/**
	 * @param array<string, mixed> $control
	 * @param array<string, mixed> $controls
	 */
	private static function describe( array $control, array $controls ): string {
		$description = is_array( $control['condition'] ?? null ) ? V3_Control_Condition::describe( $control['condition'], $controls ) : '';

		return '' === $description ? self::UNWORDED_CONDITION : $description;
	}
}
