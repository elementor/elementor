<?php

namespace Elementor\Modules\Interactions;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Presets {
	const DEFAULT_DURATION = 600;
	const DEFAULT_DELAY = 0;
	const DEFAULT_SLIDE_DISTANCE = 100;
	const DEFAULT_SCALE_START = 0;

	const BASE_TRIGGERS = [ 'load', 'scrollIn' ];
	const ADDITIONAL_TRIGGERS = [ 'scrollOut', 'scrollOn', 'hover', 'click' ];

	const DEFAULT_EASING = 'easeIn';
	const BASE_EFFECTS = [ 'fade', 'slide', 'scale' ];
	const ADDITIONAL_EFFECTS = [ 'custom' ];

	const TYPES = [ 'in', 'out' ];
	const DIRECTIONS = [ 'left', 'right', 'top', 'bottom', '' ];

	const BASE_EASING = [ 'easeIn' ];
	const ADDITIONAL_EASING = [ 'easeOut', 'easeInOut', 'backIn', 'backInOut', 'backOut', 'linear' ];

	public static function easing_options() {
		return array_merge( self::BASE_EASING, self::ADDITIONAL_EASING );
	}

	public static function effects_options() {
		return array_merge( self::BASE_EFFECTS, self::ADDITIONAL_EFFECTS );
	}

	public static function triggers_options() {
		return array_merge( self::BASE_TRIGGERS, self::ADDITIONAL_TRIGGERS );
	}

	public function list() {
		return $this->generate_animation_options();
	}

	public function defaults() {
		return [
			'defaultDuration' => self::DEFAULT_DURATION,
			'defaultDelay' => self::DEFAULT_DELAY,
			'slideDistance' => self::DEFAULT_SLIDE_DISTANCE,
			'scaleStart' => self::DEFAULT_SCALE_START,
			'defaultEasing' => self::DEFAULT_EASING,
		];
	}

	private function get_label( $key, $value ) {
		$special_labels = [
			'trigger' => [
				'load' => __( 'On page load', 'elementor' ),
				'scrollIn' => __( 'Scroll into view', 'elementor' ),
				'scrollOut' => __( 'Scroll out of view', 'elementor' ),
				'scrollOn' => __( 'While scrolling', 'elementor' ),
				'hover' => __( 'Hover', 'elementor' ),
				'click' => __( 'Click', 'elementor' ),
			],
		];

		if ( isset( $special_labels[ $key ][ $value ] ) ) {
			return $special_labels[ $key ][ $value ];
		}

		$label = ucwords( str_replace( '-', ' ', $value ) );

		return esc_html( $label );
	}

	private function generate_animation_options() {
		$options = [];

		foreach ( self::triggers_options() as $trigger ) {
			foreach ( self::effects_options() as $effect ) {
				foreach ( self::TYPES as $type ) {
					foreach ( self::DIRECTIONS as $direction ) {
						$value = "{$trigger}-{$effect}-{$type}-{$direction}";
						$label = sprintf(
							'%s: %s %s',
							$this->get_label( 'trigger', $trigger ),
							$this->get_label( 'effect', $effect ),
							$this->get_label( 'type', $type ),
						);
						$options[] = [
							'value' => $value,
							'label' => $label,
						];
					}
				}
			}
		}

		return $options;
	}
}
