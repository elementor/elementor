<?php

use PHPUnit\Framework\TestCase;

use Elementor\Modules\Interactions\Adapter;

/**
 * @group Elementor\Modules
 * @group Elementor\Modules\Interactions
 * @group Elementor\Modules\Interactions\Adapter
 */
class Test_Adapter55 extends TestCase {

	/**
	 * Create a v1 format interaction item with 'number' type timing values.
	 */
	private function create_v1_interaction_item( $duration = 300, $delay = 0, $offset_top = null, $offset_bottom = null ) {
		$animation_value = [
			'effect' => [
				'$$type' => 'string',
				'value' => 'fade',
			],
			'type' => [
				'$$type' => 'string',
				'value' => 'in',
			],
			'direction' => [
				'$$type' => 'string',
				'value' => '',
			],
			'timing_config' => [
				'$$type' => 'timing-config',
				'value' => [
					'duration' => [
						'$$type' => 'number',
						'value' => $duration,
					],
					'delay' => [
						'$$type' => 'number',
						'value' => $delay,
					],
				],
			],
		];

		if ( null !== $offset_top || null !== $offset_bottom ) {
			$config_value = [];
			if ( null !== $offset_top ) {
				$config_value['offsetTop'] = [
					'$$type' => 'number',
					'value' => $offset_top,
				];
			}
			if ( null !== $offset_bottom ) {
				$config_value['offsetBottom'] = [
					'$$type' => 'number',
					'value' => $offset_bottom,
				];
			}
			$animation_value['config'] = [
				'$$type' => 'config',
				'value' => $config_value,
			];
		}

		return [
			'$$type' => 'interaction-item',
			'value' => [
				'interaction_id' => [
					'$$type' => 'string',
					'value' => 'test-interaction-id',
				],
				'trigger' => [
					'$$type' => 'string',
					'value' => 'load',
				],
				'animation' => [
					'$$type' => 'animation-preset-props',
					'value' => $animation_value,
				],
			],
		];
	}

	/**
	 * Create a v2 format interaction item with 'size' type timing values.
	 */
	private function create_v2_interaction_item( $duration = 300, $delay = 0, $offset_top = null, $offset_bottom = null ) {
		$animation_value = [
			'effect' => [
				'$$type' => 'string',
				'value' => 'fade',
			],
			'type' => [
				'$$type' => 'string',
				'value' => 'in',
			],
			'direction' => [
				'$$type' => 'string',
				'value' => '',
			],
			'timing_config' => [
				'$$type' => 'timing-config',
				'value' => [
					'duration' => [
						'$$type' => 'size',
						'value' => [
							'size' => $duration,
							'unit' => 'ms',
						],
					],
					'delay' => [
						'$$type' => 'size',
						'value' => [
							'size' => $delay,
							'unit' => 'ms',
						],
					],
				],
			],
		];

		if ( null !== $offset_top || null !== $offset_bottom ) {
			$config_value = [];
			if ( null !== $offset_top ) {
				$config_value['offsetTop'] = [
					'$$type' => 'size',
					'value' => [
						'size' => $offset_top,
						'unit' => '%',
					],
				];
			}
			if ( null !== $offset_bottom ) {
				$config_value['offsetBottom'] = [
					'$$type' => 'size',
					'value' => [
						'size' => $offset_bottom,
						'unit' => '%',
					],
				];
			}
			$animation_value['config'] = [
				'$$type' => 'config',
				'value' => $config_value,
			];
		}

		return [
			'$$type' => 'interaction-item',
			'value' => [
				'interaction_id' => [
					'$$type' => 'string',
					'value' => 'test-interaction-id',
				],
				'trigger' => [
					'$$type' => 'string',
					'value' => 'load',
				],
				'animation' => [
					'$$type' => 'animation-preset-props',
					'value' => $animation_value,
				],
			],
		];
	}

	/**
	 * Create v1 format interactions data (items as direct array).
	 */
	private function create_v1_interactions( $items = null ) {
		if ( $items === null ) {
			$items = [ $this->create_v1_interaction_item() ];
		}

		return [
			'items' => $items,
			'version' => Adapter::VERSION_V1,
		];
	}

	/**
	 * Create v2 format interactions data (items wrapped with $$type).
	 */
	private function create_v2_interactions( $items = null ) {
		if ( $items === null ) {
			$items = [ $this->create_v2_interaction_item() ];
		}

		return [
			'items' => [
				'$$type' => Adapter::ITEMS_TYPE,
				'value' => $items,
			],
			'version' => Adapter::VERSION_V2,
		];
	}

	// =========================================================================
	// wrap_for_db() Tests
	// =========================================================================

	public function test_wrap_for_db__converts_v1_to_v2_format() {
		$v1_input = $this->create_v1_interactions();

		$result = Adapter::wrap_for_db( $v1_input );
		$decoded = json_decode( $result, true );

		$this->assertIsString( $result );
		$this->assertEquals( Adapter::VERSION_V2, $decoded['version'] );
		$this->assertEquals( Adapter::ITEMS_TYPE, $decoded['items']['$$type'] );
		$this->assertIsArray( $decoded['items']['value'] );
	}

	public function test_wrap_for_db__converts_v1_json_string_to_v2_format() {
		$v1_input = json_encode( $this->create_v1_interactions() );

		$result = Adapter::wrap_for_db( $v1_input );
		$decoded = json_decode( $result, true );

		$this->assertEquals( Adapter::VERSION_V2, $decoded['version'] );
		$this->assertEquals( Adapter::ITEMS_TYPE, $decoded['items']['$$type'] );
	}

	public function test_wrap_for_db__transforms_timing_number_to_size() {
		$v1_input = $this->create_v1_interactions( [ $this->create_v1_interaction_item( 500, 100 ) ] );

		$result = Adapter::wrap_for_db( $v1_input );
		$decoded = json_decode( $result, true );

		$timing = $decoded['items']['value'][0]['value']['animation']['value']['timing_config']['value'];

		$this->assertEquals( 'size', $timing['duration']['$$type'] );
		$this->assertEquals( 500, $timing['duration']['value']['size'] );
		$this->assertEquals( 'ms', $timing['duration']['value']['unit'] );

		$this->assertEquals( 'size', $timing['delay']['$$type'] );
		$this->assertEquals( 100, $timing['delay']['value']['size'] );
		$this->assertEquals( 'ms', $timing['delay']['value']['unit'] );
	}

	public function test_wrap_for_db__preserves_already_v2_format() {
		$v2_input = $this->create_v2_interactions( [ $this->create_v2_interaction_item( 600, 200 ) ] );

		$result = Adapter::wrap_for_db( $v2_input );
		$decoded = json_decode( $result, true );

		$this->assertEquals( Adapter::VERSION_V2, $decoded['version'] );
		$this->assertEquals( Adapter::ITEMS_TYPE, $decoded['items']['$$type'] );

		// Timing should remain as 'size' type
		$timing = $decoded['items']['value'][0]['value']['animation']['value']['timing_config']['value'];
		$this->assertEquals( 'size', $timing['duration']['$$type'] );
		$this->assertEquals( 600, $timing['duration']['value']['size'] );
	}

	public function test_wrap_for_db__handles_multiple_interaction_items() {
		$items = [
			$this->create_v1_interaction_item( 100, 0 ),
			$this->create_v1_interaction_item( 200, 50 ),
			$this->create_v1_interaction_item( 300, 100 ),
		];
		$v1_input = $this->create_v1_interactions( $items );

		$result = Adapter::wrap_for_db( $v1_input );
		$decoded = json_decode( $result, true );

		$this->assertCount( 3, $decoded['items']['value'] );

		// Verify each item was transformed
		$this->assertEquals( 100, $decoded['items']['value'][0]['value']['animation']['value']['timing_config']['value']['duration']['value']['size'] );
		$this->assertEquals( 200, $decoded['items']['value'][1]['value']['animation']['value']['timing_config']['value']['duration']['value']['size'] );
		$this->assertEquals( 300, $decoded['items']['value'][2]['value']['animation']['value']['timing_config']['value']['duration']['value']['size'] );
	}

	public function test_wrap_for_db__transforms_offset_number_to_size() {
		$v1_input = $this->create_v1_interactions( [ $this->create_v1_interaction_item( 300, 0, 15, 85 ) ] );

		$result = Adapter::wrap_for_db( $v1_input );
		$decoded = json_decode( $result, true );

		$config = $decoded['items']['value'][0]['value']['animation']['value']['config']['value'];

		$this->assertEquals( 'size', $config['offsetTop']['$$type'] );
		$this->assertEquals( 15, $config['offsetTop']['value']['size'] );
		$this->assertEquals( '%', $config['offsetTop']['value']['unit'] );

		$this->assertEquals( 'size', $config['offsetBottom']['$$type'] );
		$this->assertEquals( 85, $config['offsetBottom']['value']['size'] );
		$this->assertEquals( '%', $config['offsetBottom']['value']['unit'] );
	}

	// =========================================================================
	// unwrap_for_frontend() Tests
	// =========================================================================

	public function test_unwrap_for_frontend__converts_v2_to_v1_format() {
		$v2_input = $this->create_v2_interactions();

		$result = Adapter::unwrap_for_frontend( $v2_input );
		$decoded = json_decode( $result, true );

		$this->assertIsString( $result );
		$this->assertEquals( Adapter::VERSION_V1, $decoded['version'] );
		$this->assertIsArray( $decoded['items'] );
		$this->assertArrayNotHasKey( '$$type', $decoded['items'] );
	}

	public function test_unwrap_for_frontend__converts_v2_json_string_to_v1_format() {
		$v2_input = json_encode( $this->create_v2_interactions() );

		$result = Adapter::unwrap_for_frontend( $v2_input );
		$decoded = json_decode( $result, true );

		$this->assertEquals( Adapter::VERSION_V1, $decoded['version'] );
		$this->assertIsArray( $decoded['items'] );
	}

	public function test_unwrap_for_frontend__transforms_timing_size_to_number() {
		$v2_input = $this->create_v2_interactions( [ $this->create_v2_interaction_item( 500, 100 ) ] );

		$result = Adapter::unwrap_for_frontend( $v2_input );
		$decoded = json_decode( $result, true );

		$timing = $decoded['items'][0]['value']['animation']['value']['timing_config']['value'];

		$this->assertEquals( 'size', $timing['duration']['$$type'] );
		$this->assertEquals( [ 'size' => 500, 'unit' => 'ms' ], $timing['duration']['value'] );

		$this->assertEquals( 'size', $timing['delay']['$$type'] );
		$this->assertEquals( [ 'size' => 100, 'unit' => 'ms' ], $timing['delay']['value'] );
	}

	public function test_unwrap_for_frontend__preserves_already_v1_format() {
		$v1_input = $this->create_v1_interactions( [ $this->create_v1_interaction_item( 600, 200 ) ] );

		$result = Adapter::unwrap_for_frontend( $v1_input );
		$decoded = json_decode( $result, true );

		$this->assertEquals( Adapter::VERSION_V1, $decoded['version'] );
		$this->assertIsArray( $decoded['items'] );

		// Timing should remain as 'number' type
		$timing = $decoded['items'][0]['value']['animation']['value']['timing_config']['value'];
		$this->assertEquals( 'number', $timing['duration']['$$type'] );
		$this->assertEquals( 600, $timing['duration']['value'] );
	}

	public function test_unwrap_for_frontend__handles_multiple_interaction_items() {
		$items = [
			$this->create_v2_interaction_item( 100, 0 ),
			$this->create_v2_interaction_item( 200, 50 ),
			$this->create_v2_interaction_item( 300, 100 ),
		];
		$v2_input = $this->create_v2_interactions( $items );

		$result = Adapter::unwrap_for_frontend( $v2_input );
		$decoded = json_decode( $result, true );

		$this->assertCount( 3, $decoded['items'] );

		// Verify each item was transformed
		$this->assertEquals( [ 'size' => 100, 'unit' => 'ms' ], $decoded['items'][0]['value']['animation']['value']['timing_config']['value']['duration']['value'] );
		$this->assertEquals( [ 'size' => 200, 'unit' => 'ms' ], $decoded['items'][1]['value']['animation']['value']['timing_config']['value']['duration']['value'] );
		$this->assertEquals( [ 'size' => 300, 'unit' => 'ms' ], $decoded['items'][2]['value']['animation']['value']['timing_config']['value']['duration']['value'] );
	}

	public function test_unwrap_for_frontend__transforms_offset_size_to_number() {
		$v2_input = $this->create_v2_interactions( [ $this->create_v2_interaction_item( 300, 0, 15, 85 ) ] );

		$result = Adapter::unwrap_for_frontend( $v2_input );
		$decoded = json_decode( $result, true );

		$config = $decoded['items'][0]['value']['animation']['value']['config']['value'];

		$this->assertEquals( 'number', $config['offsetTop']['$$type'] );
		$this->assertEquals( 15, $config['offsetTop']['value'] );

		$this->assertEquals( 'number', $config['offsetBottom']['$$type'] );
		$this->assertEquals( 85, $config['offsetBottom']['value'] );
	}

	// =========================================================================
	// Malformed/Empty/Null Input Tests
	// =========================================================================

	public function test_wrap_for_db__returns_input_for_null() {
		$result = Adapter::wrap_for_db( null );

		$this->assertNull( $result );
	}

	public function test_wrap_for_db__returns_input_for_empty_array() {
		$result = Adapter::wrap_for_db( [] );

		$this->assertEquals( [], $result );
	}

	public function test_wrap_for_db__returns_input_for_empty_string() {
		$result = Adapter::wrap_for_db( '' );

		$this->assertEquals( '', $result );
	}

	public function test_wrap_for_db__returns_input_for_invalid_json() {
		$result = Adapter::wrap_for_db( 'not valid json' );

		$this->assertEquals( 'not valid json', $result );
	}

	public function test_wrap_for_db__returns_input_when_items_missing() {
		$input = [ 'version' => 1 ];

		$result = Adapter::wrap_for_db( $input );

		$this->assertEquals( $input, $result );
	}

	public function test_wrap_for_db__handles_empty_items_array() {
		$input = [
			'items' => [],
			'version' => 1,
		];

		$result = Adapter::wrap_for_db( $input );
		$decoded = json_decode( $result, true );

		$this->assertEquals( Adapter::VERSION_V2, $decoded['version'] );
		$this->assertEquals( [], $decoded['items']['value'] );
	}

	public function test_unwrap_for_frontend__returns_input_for_null() {
		$result = Adapter::unwrap_for_frontend( null );

		$this->assertNull( $result );
	}

	public function test_unwrap_for_frontend__returns_input_for_empty_array() {
		$result = Adapter::unwrap_for_frontend( [] );

		$this->assertEquals( [], $result );
	}

	public function test_unwrap_for_frontend__returns_input_for_empty_string() {
		$result = Adapter::unwrap_for_frontend( '' );

		$this->assertEquals( '', $result );
	}

	public function test_unwrap_for_frontend__returns_input_for_invalid_json() {
		$result = Adapter::unwrap_for_frontend( 'not valid json' );

		$this->assertEquals( 'not valid json', $result );
	}

	public function test_unwrap_for_frontend__returns_input_when_items_missing() {
		$input = [ 'version' => 2 ];

		$result = Adapter::unwrap_for_frontend( $input );

		$this->assertEquals( $input, $result );
	}

	public function test_unwrap_for_frontend__handles_empty_items_in_v2_format() {
		$input = [
			'items' => [
				'$$type' => Adapter::ITEMS_TYPE,
				'value' => [],
			],
			'version' => 2,
		];

		$result = Adapter::unwrap_for_frontend( $input );
		$decoded = json_decode( $result, true );

		$this->assertEquals( Adapter::VERSION_V1, $decoded['version'] );
		$this->assertEquals( [], $decoded['items'] );
	}

	// =========================================================================
	// Round-trip / Idempotency Tests
	// =========================================================================

	public function test_round_trip__preserves_all_interaction_data() {
		$original_v1 = $this->create_v1_interactions( [
			$this->create_v1_interaction_item( 250, 75 ),
			$this->create_v1_interaction_item( 500, 0 ),
		] );

		// Full round trip
		$wrapped = Adapter::wrap_for_db( $original_v1 );
		$unwrapped = Adapter::unwrap_for_frontend( $wrapped );
		$result = json_decode( $unwrapped, true );

		// Verify item count preserved
		$this->assertCount( 2, $result['items'] );

		// Verify first item
		$item1_timing = $result['items'][0]['value']['animation']['value']['timing_config']['value'];
		$this->assertEquals( [ 'size' => 250, 'unit' => 'ms' ], $item1_timing['duration']['value'] );
		$this->assertEquals( [ 'size' => 75, 'unit' => 'ms' ], $item1_timing['delay']['value'] );

		// Verify second item
		$item2_timing = $result['items'][1]['value']['animation']['value']['timing_config']['value'];
		$this->assertEquals( [ 'size' => 500, 'unit' => 'ms' ], $item2_timing['duration']['value'] );
		$this->assertEquals( [ 'size' => 0, 'unit' => 'ms' ], $item2_timing['delay']['value'] );

		// Verify other fields preserved
		$this->assertEquals( 'load', $result['items'][0]['value']['trigger']['value'] );
		$this->assertEquals( 'fade', $result['items'][0]['value']['animation']['value']['effect']['value'] );
	}

	public function test_wrap_is_idempotent__wrapping_twice_same_result() {
		$v1_input = $this->create_v1_interactions();

		$first_wrap = Adapter::wrap_for_db( $v1_input );
		$second_wrap = Adapter::wrap_for_db( $first_wrap );

		$first_decoded = json_decode( $first_wrap, true );
		$second_decoded = json_decode( $second_wrap, true );

		$this->assertEquals( $first_decoded['version'], $second_decoded['version'] );
		$this->assertEquals( $first_decoded['items'], $second_decoded['items'] );
	}

	public function test_unwrap_is_idempotent__unwrapping_twice_same_result() {
		$v2_input = $this->create_v2_interactions();

		$first_unwrap = Adapter::unwrap_for_frontend( $v2_input );
		$second_unwrap = Adapter::unwrap_for_frontend( $first_unwrap );

		$first_decoded = json_decode( $first_unwrap, true );
		$second_decoded = json_decode( $second_unwrap, true );

		$this->assertEquals( $first_decoded['version'], $second_decoded['version'] );
		$this->assertEquals( $first_decoded['items'], $second_decoded['items'] );
	}

	// =========================================================================
	// Edge Cases
	// =========================================================================

	public function test_wrap_for_db__handles_items_without_timing_config() {
		$item_without_timing = [
			'$$type' => 'interaction-item',
			'value' => [
				'trigger' => [
					'$$type' => 'string',
					'value' => 'load',
				],
				'animation' => [
					'$$type' => 'animation-preset-props',
					'value' => [
						'effect' => [
							'$$type' => 'string',
							'value' => 'fade',
						],
					],
				],
			],
		];

		$input = [
			'items' => [ $item_without_timing ],
			'version' => 1,
		];

		$result = Adapter::wrap_for_db( $input );
		$decoded = json_decode( $result, true );

		// Should not throw and should preserve the item
		$this->assertCount( 1, $decoded['items']['value'] );
	}

	public function test_wrap_for_db__skips_non_interaction_items() {
		$non_interaction_item = [
			'$$type' => 'some-other-type',
			'value' => 'test',
		];

		$input = [
			'items' => [ $non_interaction_item ],
			'version' => 1,
		];

		$result = Adapter::wrap_for_db( $input );
		$decoded = json_decode( $result, true );

		// Item should be preserved but not transformed
		$this->assertEquals( 'some-other-type', $decoded['items']['value'][0]['$$type'] );
	}

	public function test_constants__have_expected_values() {
		$this->assertEquals( 1, Adapter::VERSION_V1 );
		$this->assertEquals( 2, Adapter::VERSION_V2 );
		$this->assertEquals( 'interactions-array', Adapter::ITEMS_TYPE );
	}
}
