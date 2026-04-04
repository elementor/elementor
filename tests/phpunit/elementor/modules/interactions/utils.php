<?php

trait Interactions_Utils {
	public function create_animation( array $details = [] ) {
		return [
			'$$type' => 'animation-preset-props',
			'value' => [
				'effect' => [
					'$$type' => 'string',
					'value' => $details['effect'] ?? 'fade',
				],

				'type' => [
					'$$type' => 'string',
					'value' => $details['type'] ?? 'in',
				],

				'direction' => [
					'$$type' => 'string',
					'value' => $details['direction'] ?? '',
				],

				'timing_config' => [
					'$$type' => 'timing-config',
					'value' => [
						'duration' => [
							'$$type' => 'number',
							'value' => $details['duration'] ?? 600,
						],
					],
					'delay' => [
						'$$type' => 'number',
						'value' => $details['delay'] ?? 0,
					],
				],

				'config' => [
					'$$type' => 'config',
					'value' => $details['config'] ?? [],
				],
			],
		];
	}

	public function create_breakpoints( array $excluded_breakpoints = [] ) {
		$excluded = array_map( function( $breakpoint ) {
			return [
				'$$type' => 'string',
				'value' => $breakpoint,
			];
		}, $excluded_breakpoints );

		return [
			'$$type' => 'interaction-breakpoints',
			'value' => [
				'excluded' => $excluded,
			],
		];
	}

	public function create_trigger( string $trigger = 'load' ) {
		return [
			'$$type' => 'string',
			'value' => $trigger,
		];
	}

	public function create_interaction_item( string $interaction_id, array $details ) {
		$prop_value = [];

		if ( isset( $details['trigger'] ) ) {
			$prop_value['trigger'] = $details['trigger'];
		}

		if ( isset( $details['animation'] ) ) {
			$prop_value['animation'] = $details['animation'];
		}

		if ( isset( $details['breakpoints'] ) ) {
			$prop_value['breakpoints'] = $details['breakpoints'];
		}

		$prop_value['interaction_id'] = [
			'$$type' => 'string',
			'value' => $interaction_id,
		];

		return [
			'$$type' => 'interaction-item',
			'value' => $prop_value,
		];
	}

	public function create_interactions_list( array $interactions ) {
		return json_encode( [
			'items' => $interactions,
			'version' => 1,
		] );
	}
}
