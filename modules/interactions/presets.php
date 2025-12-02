<?php

namespace Elementor\Modules\Interactions;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Presets {
	const DEFAULT_DURATION = 300;
	const DEFAULT_DELAY = 0;
	const DEFAULT_SLIDE_DISTANCE = 100;
	const DEFAULT_SCALE_START = 0;
	const DEFAULT_EASING = 'linear';

	const TRIGGERS = [ 'load', 'scrollIn' ]; // 'scrollOut' is not supported yet.
	const EFFECTS = [ 'fade', 'slide', 'scale' ];
	const TYPES = [ 'in', 'out' ];
	const DIRECTIONS = [ 'left', 'right', 'top', 'bottom' ];
	const DURATIONS = [ 0, 100, 200, 300, 400, 500, 750, 1000, 1250, 1500 ];
	const DELAYS = [ 0, 100, 200, 300, 400, 500, 750, 1000, 1250, 1500 ];

	public function list() {
		return $this->generate_animation_options();
	}

	public function defaults() {
		return [
			'defaultDuration' => self::DEFAULT_DURATION,
			'defaultDelay' => self::DEFAULT_DELAY,
			'slideDistance' => self::DEFAULT_SLIDE_DISTANCE,
			'scaleStart' => self::DEFAULT_SCALE_START,
			'easing' => self::DEFAULT_EASING,
		];
	}

	private function get_label( $key, $value ) {
		$special_labels = [
			'trigger' => [
				'load' => __( 'On page load', 'elementor' ),
				'scrollIn' => __( 'Scroll into view', 'elementor' ),
				'scrollOut' => __( 'Scroll out of view', 'elementor' ),
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

		foreach ( self::TRIGGERS as $trigger ) {
			foreach ( self::EFFECTS as $effect ) {
				foreach ( self::TYPES as $type ) {
					foreach ( self::DIRECTIONS as $direction ) {
						foreach ( self::DURATIONS as $duration ) {
							foreach ( self::DELAYS as $delay ) {
								$value = "{$trigger}-{$effect}-{$type}-{$direction}-{$duration}-{$delay}";
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

					foreach ( self::DURATIONS as $duration ) {
						foreach ( self::DELAYS as $delay ) {
							$value = "{$trigger}-{$effect}-{$type}--{$duration}-{$delay}";
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
		}

		return $options;
	}
}
