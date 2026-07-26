<?php

namespace Elementor\Modules\Mcp\Abilities\Build_Composition;

use Elementor\Modules\AtomicWidgets\Module as Atomic_Widgets_Module;
use Elementor\Modules\AtomicWidgets\PlainResolvers\Plain_Values_Resolver;
use Elementor\Modules\AtomicWidgets\Styles\Size_Constants;
use Elementor\Modules\Interactions\Presets;
use Elementor\Modules\Interactions\Props\Interaction_Item_Prop_Type;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Interaction_Converter {

	private bool $is_pro_active;
	private Plain_Values_Resolver $plain_values_resolver;

	public function __construct( ?bool $is_pro_active = null, ?Plain_Values_Resolver $plain_values_resolver = null ) {
		$this->is_pro_active = $is_pro_active ?? defined( 'ELEMENTOR_PRO_VERSION' );
		$this->plain_values_resolver = $plain_values_resolver ?? Atomic_Widgets_Module::instance()->get_settings_plain_values_resolver();
	}

	/**
	 * @return array{item: array|null, warnings: string[], rejected: string[]}
	 */
	public function convert( array $plain ): array {
		$warnings = [];
		$rejected = [];

		$this->reject_unknown_pro_fields( $plain, $rejected );
		if ( ! empty( $rejected ) ) {
			return [ 'item' => null, 'warnings' => $warnings, 'rejected' => $rejected ];
		}

		$on = $plain['on'] ?? null;
		if ( ! is_string( $on ) || '' === $on ) {
			$rejected[] = 'on: required.';
		} elseif ( ! $this->is_allowed_trigger( $on ) ) {
			$rejected[] = sprintf( 'on: invalid value "%s".', $on );
		}

		$effect = $plain['effect'] ?? null;
		if ( ! is_string( $effect ) || '' === $effect ) {
			$rejected[] = 'effect: required.';
		} elseif ( ! $this->is_allowed_effect( $effect ) ) {
			$rejected[] = sprintf( 'effect: invalid value "%s".', $effect );
		}

		$type = $plain['type'] ?? null;
		if ( ! is_string( $type ) || '' === $type ) {
			$rejected[] = 'type: required.';
		} elseif ( ! in_array( $type, Presets::TYPES, true ) ) {
			$rejected[] = sprintf( 'type: invalid value "%s".', $type );
		}

		$direction = array_key_exists( 'direction', $plain ) ? (string) $plain['direction'] : '';
		if ( ! in_array( $direction, Presets::DIRECTIONS, true ) ) {
			$rejected[] = sprintf( 'direction: invalid value "%s".', $direction );
		}

		if ( isset( $plain['ease'] ) && ( ! is_string( $plain['ease'] ) || ! $this->is_allowed_easing( $plain['ease'] ) ) ) {
			$rejected[] = sprintf( 'ease: invalid value "%s".', is_scalar( $plain['ease'] ) ? (string) $plain['ease'] : gettype( $plain['ease'] ) );
		}

		if ( isset( $plain['repeat'] ) && ! $this->is_valid_repeat_input( $plain['repeat'] ) ) {
			$rejected[] = sprintf( 'repeat: invalid value "%s".', is_scalar( $plain['repeat'] ) ? (string) $plain['repeat'] : gettype( $plain['repeat'] ) );
		}

		if ( isset( $plain['keyframes'] ) && 'custom' !== ( $plain['effect'] ?? '' ) ) {
			$rejected[] = 'keyframes: only allowed when effect is "custom".';
		}

		if ( 'custom' === ( $plain['effect'] ?? '' ) ) {
			$this->validate_custom_effect_keyframes( $plain, $rejected );
		}

		if ( ! empty( $rejected ) ) {
			return [ 'item' => null, 'warnings' => $warnings, 'rejected' => $rejected ];
		}

		$nested_plain = $this->normalize( $plain, $on, $effect, $type, $direction );
		$item = $this->plain_values_resolver->resolve( $nested_plain, Interaction_Item_Prop_Type::make() );

		if ( null === $item ) {
			$rejected[] = 'interaction: failed to resolve plain values.';
			return [ 'item' => null, 'warnings' => $warnings, 'rejected' => $rejected ];
		}

		if ( ! Interaction_Item_Prop_Type::make()->validate( $item ) ) {
			$rejected[] = 'interaction: failed PropType validation after conversion.';
			return [ 'item' => null, 'warnings' => $warnings, 'rejected' => $rejected ];
		}

		return [ 'item' => $item, 'warnings' => $warnings, 'rejected' => $rejected ];
	}

	private function validate_custom_effect_keyframes( array $plain, array &$rejected ): void {
		if ( ! isset( $plain['keyframes'] ) ) {
			$rejected[] = 'keyframes: required when effect is "custom".';
			return;
		}

		$keyframes = $plain['keyframes'];

		if ( ! is_array( $keyframes ) ) {
			$rejected[] = 'keyframes: must be a keyframes array or transformable keyframes object.';
			return;
		}

		if ( isset( $keyframes['$$type'] ) && 'keyframes' !== $keyframes['$$type'] ) {
			$rejected[] = 'keyframes: must be a transformable keyframes object ($$type "keyframes").';
		}
	}

	private function normalize( array $plain, string $on, string $effect, string $type, string $direction ): array {
		$animation = [
			'effect' => $effect,
			'type' => $type,
			'direction' => $direction,
			'timing_config' => [
				'duration' => $this->time_size_plain(
					array_key_exists( 'for', $plain ) ? $plain['for'] : Presets::DEFAULT_DURATION
				),
				'delay' => $this->time_size_plain(
					array_key_exists( 'after', $plain ) ? $plain['after'] : Presets::DEFAULT_DELAY
				),
			],
			'config' => $this->normalize_animation_config( $plain ),
		];

		if ( 'custom' === $effect && isset( $plain['keyframes'] ) ) {
			$animation['custom_effect'] = [
				'keyframes' => $this->normalize_keyframes( $plain['keyframes'] ),
			];
		}

		$excluded = $plain['except'] ?? [];
		if ( ! is_array( $excluded ) ) {
			$excluded = [];
		}

		return [
			'trigger' => $on,
			'animation' => $animation,
			'breakpoints' => [
				'excluded' => array_map( 'strval', $excluded ),
			],
		];
	}

	private function normalize_animation_config( array $plain ): array {
		$config = [
			'easing' => array_key_exists( 'ease', $plain ) ? (string) $plain['ease'] : Presets::DEFAULT_EASING,
		];

		if ( isset( $plain['replay'] ) ) {
			$config['replay'] = (bool) $plain['replay'];
		}

		if ( isset( $plain['relativeTo'] ) && is_string( $plain['relativeTo'] ) ) {
			$config['relativeTo'] = $plain['relativeTo'];
		}

		if ( isset( $plain['repeat'] ) ) {
			if ( is_numeric( $plain['repeat'] ) ) {
				$config['repeat'] = 'times';
				$config['times'] = +$plain['repeat'];
			} elseif ( is_string( $plain['repeat'] ) ) {
				$config['repeat'] = $plain['repeat'];
			}
		}

		if ( isset( $plain['start'] ) && is_numeric( $plain['start'] ) ) {
			$config['start'] = $this->percent_size_plain( $plain['start'] );
		}

		if ( isset( $plain['end'] ) && is_numeric( $plain['end'] ) ) {
			$config['end'] = $this->percent_size_plain( $plain['end'] );
		}

		return $config;
	}

	/**
	 * @param mixed $keyframes
	 *
	 * @return array
	 */
	private function normalize_keyframes( $keyframes ): array {
		if ( is_array( $keyframes ) && isset( $keyframes['$$type'] ) ) {
			$keyframes = $keyframes['value'] ?? [];
		}

		if ( ! is_array( $keyframes ) ) {
			return [];
		}

		$normalized = [];

		foreach ( $keyframes as $stop ) {
			$plain_stop = $this->normalize_keyframe_stop( $stop );

			if ( null !== $plain_stop ) {
				$normalized[] = $plain_stop;
			}
		}

		return $normalized;
	}

	/**
	 * @param mixed $stop
	 *
	 * @return array|null
	 */
	private function normalize_keyframe_stop( $stop ): ?array {
		if ( is_array( $stop ) && isset( $stop['$$type'] ) && 'keyframe-stop' === $stop['$$type'] ) {
			$stop = $stop['value'] ?? [];
		}

		if ( ! is_array( $stop ) ) {
			return null;
		}

		$result = [];

		if ( isset( $stop['stop'] ) ) {
			$result['stop'] = $this->normalize_size_plain( $stop['stop'] );
		}

		if ( ! isset( $stop['settings'] ) ) {
			return $result;
		}

		$settings = $stop['settings'];

		if ( is_array( $settings ) && isset( $settings['$$type'] ) ) {
			$settings = $settings['value'] ?? [];
		}

		$result['settings'] = $this->normalize_keyframe_settings_plain( $settings );

		return $result;
	}

	/**
	 * @param mixed $settings
	 *
	 * @return array
	 */
	private function normalize_keyframe_settings_plain( $settings ): array {
		if ( ! is_array( $settings ) ) {
			return [];
		}

		$normalized = [];

		foreach ( $settings as $key => $value ) {
			if ( is_array( $value ) && ( isset( $value['$$type'] ) || isset( $value['size'] ) ) ) {
				$normalized[ $key ] = $this->normalize_size_plain( $value );
				continue;
			}

			$normalized[ $key ] = $value;
		}

		return $normalized;
	}

	/**
	 * @param mixed $size
	 *
	 * @return array
	 */
	private function normalize_size_plain( $size ): array {
		if ( is_array( $size ) && isset( $size['$$type'] ) && 'size' === $size['$$type'] ) {
			$size = $size['value'] ?? [];
		}

		if ( ! is_array( $size ) || ! array_key_exists( 'size', $size ) || ! array_key_exists( 'unit', $size ) ) {
			return is_array( $size ) ? $size : [];
		}

		return [
			'size' => is_numeric( $size['size'] ) ? +$size['size'] : $size['size'],
			'unit' => (string) $size['unit'],
		];
	}

	private function time_size_plain( $value ): array {
		return [
			'size' => is_numeric( $value ) ? +$value : $value,
			'unit' => Size_Constants::UNIT_MILLI_SECOND,
		];
	}

	private function percent_size_plain( $size ): array {
		return [
			'size' => is_numeric( $size ) ? +$size : $size,
			'unit' => Size_Constants::UNIT_PERCENT,
		];
	}

	private function reject_unknown_pro_fields( array $plain, array &$rejected ): void {
		$pro_only_keys = [ 'replay', 'relativeTo', 'start', 'end', 'keyframes' ];

		foreach ( $pro_only_keys as $key ) {
			if ( ! array_key_exists( $key, $plain ) || $this->is_pro_active ) {
				continue;
			}

			$rejected[] = sprintf( '%s: requires Elementor Pro.', $key );
		}

		if ( ! $this->is_pro_active ) {
			$on = $plain['on'] ?? '';
			if ( is_string( $on ) && in_array( $on, Presets::ADDITIONAL_TRIGGERS, true ) ) {
				$rejected[] = sprintf( 'on: "%s" requires Elementor Pro.', $on );
			}

			$effect = $plain['effect'] ?? '';
			if ( is_string( $effect ) && in_array( $effect, Presets::ADDITIONAL_EFFECTS, true ) ) {
				$rejected[] = sprintf( 'effect: "%s" requires Elementor Pro.', $effect );
			}

			$ease = $plain['ease'] ?? '';
			if ( is_string( $ease ) && in_array( $ease, Presets::ADDITIONAL_EASING, true ) ) {
				$rejected[] = sprintf( 'ease: "%s" requires Elementor Pro.', $ease );
			}

			if ( isset( $plain['repeat'] ) && $this->is_pro_repeat_value( $plain['repeat'] ) ) {
				$rejected[] = 'repeat: non-empty repeat requires Elementor Pro.';
			}
		}
	}

	private function is_pro_repeat_value( $repeat ): bool {
		if ( is_numeric( $repeat ) ) {
			return true;
		}

		return is_string( $repeat ) && in_array( $repeat, [ 'loop', 'times' ], true );
	}

	private function is_allowed_trigger( string $trigger ): bool {
		$allowed = $this->is_pro_active ? Presets::triggers_options() : Presets::BASE_TRIGGERS;

		return in_array( $trigger, $allowed, true );
	}

	private function is_allowed_effect( string $effect ): bool {
		$allowed = $this->is_pro_active ? Presets::effects_options() : Presets::BASE_EFFECTS;

		return in_array( $effect, $allowed, true );
	}

	private function is_allowed_easing( string $easing ): bool {
		$allowed = $this->is_pro_active ? Presets::easing_options() : Presets::BASE_EASING;

		return in_array( $easing, $allowed, true );
	}

	private function is_valid_repeat_input( $repeat ): bool {
		if ( is_numeric( $repeat ) ) {
			return (float) $repeat >= 1;
		}

		if ( ! is_string( $repeat ) ) {
			return false;
		}

		return in_array( $repeat, Presets::REPEAT_OPTIONS, true );
	}
}
