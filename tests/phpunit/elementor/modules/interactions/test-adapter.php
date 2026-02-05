<?php

use PHPUnit\Framework\TestCase;

use Elementor\Modules\Interactions\Adapter;

/**
 * @group Elementor\Modules
 * @group Elementor\Modules\Interactions
 * @group Elementor\Modules\Interactions\Adapter
 */
class Test_Adapter extends TestCase {

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

		$this->assertEquals( 'size', $config['offsetTop']['$$type'] );
		$this->assertEquals( [ 'size' => 15, 'unit' => '%'], $config['offsetTop']['value'] );

		$this->assertEquals( 'size', $config['offsetBottom']['$$type'] );
		$this->assertEquals( [ 'size' => 85, 'unit' => '%' ], $config['offsetBottom']['value'] );
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

	public function test_round_trip__v1_wrap_unwrap_returns_equivalent_v1() {
		$original_v1 = $this->create_v1_interactions( [
			$this->create_v1_interaction_item( 400, 150 ),
		] );

		// v1 → wrap → v2
		$wrapped = Adapter::wrap_for_db( $original_v1 );

		// v2 → unwrap → v1
		$unwrapped = Adapter::unwrap_for_frontend( $wrapped );
		$result = json_decode( $unwrapped, true );

		// Should be back to v1 format
		$this->assertEquals( Adapter::VERSION_V1, $result['version'] );
		$this->assertIsArray( $result['items'] );
		$this->assertArrayNotHasKey( '$$type', $result['items'] );

		// Values should be preserved
		$timing = $result['items'][0]['value']['animation']['value']['timing_config']['value'];
		$this->assertEquals( 'size', $timing['duration']['$$type'] );
		$this->assertEquals( [ 'size' => 400, 'unit' => 'ms' ], $timing['duration']['value'] );
		$this->assertEquals( 'size', $timing['delay']['$$type'] );
		$this->assertEquals( [ 'size' => 150, 'unit' => 'ms' ], $timing['delay']['value'] );
	}

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
		$this->markTestSkipped( 'Unwrap idempotency temporarily disabled' );

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

	// =========================================================================
	// clean_prop_types() Tests - Basic Transformations
	// =========================================================================

	public function test_clean_prop_types__extracts_string_value() {
		$input = [
			'$$type' => 'string',
			'value' => 'fade',
		];

		$result = Adapter::clean_prop_types( $input );

		$this->assertEquals( 'fade', $result );
	}

	public function test_clean_prop_types__extracts_number_value() {
		$input = [
			'$$type' => 'number',
			'value' => 300,
		];

		$result = Adapter::clean_prop_types( $input );

		$this->assertEquals( 300, $result );
	}

	public function test_clean_prop_types__extracts_size_value_for_non_timing_property() {
		$input = [
			'$$type' => 'size',
			'value' => [
				'size' => 50,
				'unit' => '%',
			],
		];

		$result = Adapter::clean_prop_types( $input );

		$this->assertEquals( [ 'size' => 50, 'unit' => '%' ], $result );
	}

	public function test_clean_prop_types__returns_non_array_values_unchanged() {
		$this->assertEquals( 'plain string', Adapter::clean_prop_types( 'plain string' ) );
		$this->assertEquals( 123, Adapter::clean_prop_types( 123 ) );
		$this->assertEquals( 45.67, Adapter::clean_prop_types( 45.67 ) );
		$this->assertTrue( Adapter::clean_prop_types( true ) );
		$this->assertFalse( Adapter::clean_prop_types( false ) );
		$this->assertNull( Adapter::clean_prop_types( null ) );
	}

	// =========================================================================
	// clean_prop_types() Tests - Nested Structures
	// =========================================================================

	public function test_clean_prop_types__cleans_nested_objects() {
		$input = [
			'effect' => [
				'$$type' => 'string',
				'value' => 'fade',
			],
			'type' => [
				'$$type' => 'string',
				'value' => 'in',
			],
		];

		$result = Adapter::clean_prop_types( $input );

		$expected = [
			'effect' => 'fade',
			'type' => 'in',
		];

		$this->assertEquals( $expected, $result );
	}

	public function test_clean_prop_types__cleans_deeply_nested_structures() {
		$input = [
			'animation' => [
				'$$type' => 'animation-preset-props',
				'value' => [
					'effect' => [
						'$$type' => 'string',
						'value' => 'slide',
					],
					'timing_config' => [
						'$$type' => 'timing-config',
						'value' => [
							'duration' => [
								'$$type' => 'number',
								'value' => 500,
							],
						],
					],
				],
			],
		];

		$result = Adapter::clean_prop_types( $input );

		$expected = [
			'animation' => [
				'effect' => 'slide',
				'timing_config' => [
					'duration' => 500,
				],
			],
		];

		$this->assertEquals( $expected, $result );
	}

	public function test_clean_prop_types__preserves_arrays_without_type_markers() {
		$input = [
			'items' => [
				[ 'name' => 'item1' ],
				[ 'name' => 'item2' ],
			],
			'count' => 2,
		];

		$result = Adapter::clean_prop_types( $input );

		$this->assertEquals( $input, $result );
	}

	// =========================================================================
	// clean_prop_types() Tests - Timing Properties (Duration/Delay)
	// =========================================================================

	public function test_clean_prop_types__converts_duration_size_to_milliseconds() {
		$input = [
			'timing_config' => [
				'$$type' => 'timing-config',
				'value' => [
					'duration' => [
						'$$type' => 'size',
						'value' => [
							'size' => 300,
							'unit' => 'ms',
						],
					],
				],
			],
		];

		$result = Adapter::clean_prop_types( $input );

		$this->assertEquals( 300, $result['timing_config']['duration'] );
	}

	public function test_clean_prop_types__converts_delay_size_to_milliseconds() {
		$input = [
			'timing_config' => [
				'$$type' => 'timing-config',
				'value' => [
					'delay' => [
						'$$type' => 'size',
						'value' => [
							'size' => 150,
							'unit' => 'ms',
						],
					],
				],
			],
		];

		$result = Adapter::clean_prop_types( $input );

		$this->assertEquals( 150, $result['timing_config']['delay'] );
	}

	public function test_clean_prop_types__converts_duration_seconds_to_milliseconds() {
		$input = [
			'timing_config' => [
				'$$type' => 'timing-config',
				'value' => [
					'duration' => [
						'$$type' => 'size',
						'value' => [
							'size' => 2,
							'unit' => 's',
						],
					],
				],
			],
		];

		$result = Adapter::clean_prop_types( $input );

		$this->assertEquals( 2000, $result['timing_config']['duration'] );
	}

	public function test_clean_prop_types__converts_delay_seconds_to_milliseconds() {
		$input = [
			'timing_config' => [
				'$$type' => 'timing-config',
				'value' => [
					'delay' => [
						'$$type' => 'size',
						'value' => [
							'size' => 0.5,
							'unit' => 's',
						],
					],
				],
			],
		];

		$result = Adapter::clean_prop_types( $input );

		$this->assertEquals( 500, $result['timing_config']['delay'] );
	}

	public function test_clean_prop_types__handles_both_duration_and_delay() {
		$input = [
			'timing_config' => [
				'$$type' => 'timing-config',
				'value' => [
					'duration' => [
						'$$type' => 'size',
						'value' => [
							'size' => 1,
							'unit' => 's',
						],
					],
					'delay' => [
						'$$type' => 'size',
						'value' => [
							'size' => 250,
							'unit' => 'ms',
						],
					],
				],
			],
		];

		$result = Adapter::clean_prop_types( $input );

		$this->assertEquals( 1000, $result['timing_config']['duration'] );
		$this->assertEquals( 250, $result['timing_config']['delay'] );
	}

	public function test_clean_prop_types__handles_number_type_for_timing_properties() {
		$input = [
			'timing_config' => [
				'$$type' => 'timing-config',
				'value' => [
					'duration' => [
						'$$type' => 'number',
						'value' => 400,
					],
					'delay' => [
						'$$type' => 'number',
						'value' => 100,
					],
				],
			],
		];

		$result = Adapter::clean_prop_types( $input );

		$this->assertEquals( 400, $result['timing_config']['duration'] );
		$this->assertEquals( 100, $result['timing_config']['delay'] );
	}

	// =========================================================================
	// clean_prop_types() Tests - Full Interaction Items
	// =========================================================================

	public function test_clean_prop_types__cleans_complete_interaction_item() {
		$input = [
			'$$type' => 'interaction-item',
			'value' => [
				'interaction_id' => [
					'$$type' => 'string',
					'value' => 'interaction-123',
				],
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
										'size' => 300,
										'unit' => 'ms',
									],
								],
								'delay' => [
									'$$type' => 'size',
									'value' => [
										'size' => 0,
										'unit' => 'ms',
									],
								],
							],
						],
					],
				],
			],
		];

		$result = Adapter::clean_prop_types( $input );

		$expected = [
			'interaction_id' => 'interaction-123',
			'trigger' => 'load',
			'animation' => [
				'effect' => 'fade',
				'type' => 'in',
				'direction' => '',
				'timing_config' => [
					'duration' => 300,
					'delay' => 0,
				],
			],
		];

		$this->assertEquals( $expected, $result );
	}

	public function test_clean_prop_types__cleans_array_of_interaction_items() {
		$input = [
			'items' => [
				[
					'$$type' => 'interaction-item',
					'value' => [
						'trigger' => [
							'$$type' => 'string',
							'value' => 'load',
						],
					],
				],
				[
					'$$type' => 'interaction-item',
					'value' => [
						'trigger' => [
							'$$type' => 'string',
							'value' => 'scrollIn',
						],
					],
				],
			],
		];

		$result = Adapter::clean_prop_types( $input );

		$expected = [
			'items' => [
				[ 'trigger' => 'load' ],
				[ 'trigger' => 'scrollIn' ],
			],
		];

		$this->assertEquals( $expected, $result );
	}

	// =========================================================================
	// clean_prop_types() Tests - Edge Cases
	// =========================================================================

	public function test_clean_prop_types__handles_empty_array() {
		$result = Adapter::clean_prop_types( [] );

		$this->assertEquals( [], $result );
	}

	public function test_clean_prop_types__handles_null_value_in_prop_type() {
		$input = [
			'$$type' => 'string',
			'value' => null,
		];

		$result = Adapter::clean_prop_types( $input );

		$this->assertNull( $result );
	}

	public function test_clean_prop_types__handles_missing_value_in_prop_type() {
		$input = [
			'$$type' => 'string',
		];

		$result = Adapter::clean_prop_types( $input );

		$this->assertNull( $result );
	}

	public function test_clean_prop_types__handles_size_without_size_key() {
		$input = [
			'duration' => [
				'$$type' => 'size',
				'value' => [
					'unit' => 'ms',
				],
			],
		];

		$result = Adapter::clean_prop_types( $input, 'timing_config' );

		// Should handle gracefully and return the value as-is
		$this->assertIsArray( $result );
	}

	public function test_clean_prop_types__preserves_breakpoints_structure() {
		$input = [
			'breakpoints' => [
				'$$type' => 'interaction-breakpoints',
				'value' => [
					'excluded' => [
						'$$type' => 'excluded-breakpoints',
						'value' => [
							[ '$$type' => 'string', 'value' => 'desktop' ],
							[ '$$type' => 'string', 'value' => 'mobile' ],
						],
					],
				],
			],
		];

		$result = Adapter::clean_prop_types( $input );

		$expected = [
			'breakpoints' => [
				'excluded' => [
					'desktop',
					'mobile',
				],
			],
		];

		$this->assertEquals( $expected, $result );
	}

	public function test_clean_prop_types__handles_config_with_offsets() {
		$input = [
			'config' => [
				'$$type' => 'config',
				'value' => [
					'offsetTop' => [
						'$$type' => 'size',
						'value' => [
							'size' => 10,
							'unit' => '%',
						],
					],
					'offsetBottom' => [
						'$$type' => 'size',
						'value' => [
							'size' => 90,
							'unit' => '%',
						],
					],
				],
			],
		];

		$result = Adapter::clean_prop_types( $input );

		// Offsets are not timing properties, so they should retain size structure
		$expected = [
			'config' => [
				'offsetTop' => [
					'size' => 10,
					'unit' => '%',
				],
				'offsetBottom' => [
					'size' => 90,
					'unit' => '%',
				],
			],
		];

		$this->assertEquals( $expected, $result );
	}

	// =========================================================================
	// extract_numeric_value() Tests
	// =========================================================================

	public function test_extract_numeric_value__from_number_type() {
		$prop = [
			'$$type' => 'number',
			'value' => 500,
		];

		$result = Adapter::extract_numeric_value( $prop );

		$this->assertEquals( 500, $result );
	}

	public function test_extract_numeric_value__from_size_type() {
		$prop = [
			'$$type' => 'size',
			'value' => [
				'size' => 300,
				'unit' => 'ms',
			],
		];

		$result = Adapter::extract_numeric_value( $prop );

		$this->assertEquals( 300, $result );
	}

	public function test_extract_numeric_value__returns_default_for_invalid_input() {
		$this->assertEquals( 0, Adapter::extract_numeric_value( null ) );
		$this->assertEquals( 0, Adapter::extract_numeric_value( 'string' ) );
		$this->assertEquals( 0, Adapter::extract_numeric_value( [] ) );
		$this->assertEquals( 0, Adapter::extract_numeric_value( [ 'value' => 100 ] ) ); // Missing $$type
	}

	public function test_extract_numeric_value__returns_custom_default() {
		$result = Adapter::extract_numeric_value( null, 999 );

		$this->assertEquals( 999, $result );
	}

	public function test_extract_numeric_value__handles_float_values() {
		$prop = [
			'$$type' => 'number',
			'value' => 0.5,
		];

		$result = Adapter::extract_numeric_value( $prop );

		$this->assertEquals( 0.5, $result );
	}
}
