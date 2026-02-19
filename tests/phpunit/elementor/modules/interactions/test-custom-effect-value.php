<?php

use Elementor\Modules\AtomicWidgets\Styles\Size_Constants;
use Elementor\Modules\Interactions\Validators\Custom_Effect_Value;
use PHPUnit\Framework\TestCase;

/**
 * @group Elementor\Modules
 * @group Elementor\Modules\Interactions
 * @group Elementor\Modules\Interactions\Validators
 */
class Test_Custom_Effect_Value extends TestCase {

	private function animation_value_with_effect( string $effect, $custom_effect = null ): array {
		$value = [
			'effect' => [
				'$$type' => 'string',
				'value' => $effect,
			],
			'type' => [ '$$type' => 'string', 'value' => 'in' ],
			'direction' => [ '$$type' => 'string', 'value' => '' ],
			'timing_config' => [
				'$$type' => 'timing-config',
				'value' => [
					'duration' => [ '$$type' => 'number', 'value' => 300 ],
					'delay' => [ '$$type' => 'number', 'value' => 0 ],
				],
			],
		];

		if ( null !== $custom_effect ) {
			$value['custom_effect'] = $custom_effect;
		}

		return $value;
	}

	// No any keyframe test
	public function test_is_valid__returns_true_when_effect_is_not_custom() {
		// Arrange
		$animation_value = $this->animation_value_with_effect( 'fade' );

		// Act
		$result = Custom_Effect_Value::is_valid( $animation_value );

		// Assert
		$this->assertTrue( $result );
	}

	public function test_is_valid__returns_false_when_effect_is_custom_but_custom_effect_missing() {
		// Arrange
		$animation_value = $this->animation_value_with_effect( 'custom' );

		// Act
		$result = Custom_Effect_Value::is_valid( $animation_value );

		// Assert
		$this->assertFalse( $result );
	}

	public function test_is_valid__returns_false_when_effect_is_custom_and_custom_effect_invalid() {
		// Arrange
		$animation_value = $this->animation_value_with_effect( 'custom', [ 'invalid' => 'structure' ] );

		// Act
		$result = Custom_Effect_Value::is_valid( $animation_value );

		// Assert
		$this->assertFalse( $result );
	}

	public function test_is_valid__returns_true_when_effect_is_custom_and_custom_effect_valid() {
		// Arrange
		$custom_effect = $this->minimal_valid_custom_effect( 0, 90 );
		$animation_value = $this->animation_value_with_effect( 'custom', $custom_effect );

		// Act
		$result = Custom_Effect_Value::is_valid( $animation_value );

		// Assert
		$this->assertTrue( $result );
	}

	public function test_is_valid__returns_true_when_effect_key_missing() {
		// Arrange: no 'effect' key -> effect value is null, so not 'custom'
		$animation_value = [
			'type' => [ '$$type' => 'string', 'value' => 'in' ],
			'timing_config' => [
				'$$type' => 'timing-config',
				'value' => [ 'duration' => [ '$$type' => 'number', 'value' => 300 ], 'delay' => [ '$$type' => 'number', 'value' => 0 ] ],
			],
		];

		// Act
		$result = Custom_Effect_Value::is_valid( $animation_value );

		// Assert
		$this->assertTrue( $result );
	}

	public function test_is_valid__returns_true_when_effect_value_is_empty_string() {
		// Arrange: only literal 'custom' triggers custom_effect validation
		$animation_value = $this->animation_value_with_effect( '' );

		// Act
		$result = Custom_Effect_Value::is_valid( $animation_value );

		// Assert
		$this->assertTrue( $result );
	}

	public function test_is_valid__returns_false_when_custom_effect_has_wrong_type_key() {
		// Arrange
		$custom_effect = [
			'$$type' => 'string',
			'value' => [ 'keyframes' => [ '$$type' => 'keyframes', 'value' => [ [] ] ] ],
		];
		$animation_value = $this->animation_value_with_effect( 'custom', $custom_effect );

		// Act
		$result = Custom_Effect_Value::is_valid( $animation_value );

		// Assert
		$this->assertFalse( $result );
	}

	public function test_is_valid__returns_false_when_custom_effect_missing_value_key() {
		// Arrange
		$custom_effect = [
			'$$type' => 'custom-effect',
		];
		$animation_value = $this->animation_value_with_effect( 'custom', $custom_effect );

		// Act
		$result = Custom_Effect_Value::is_valid( $animation_value );

		// Assert
		$this->assertFalse( $result );
	}

	public function test_is_valid__returns_false_when_custom_effect_empty_array() {
		// Arrange
		$animation_value = $this->animation_value_with_effect( 'custom', [] );

		// Act
		$result = Custom_Effect_Value::is_valid( $animation_value );

		// Assert
		$this->assertFalse( $result );
	}

	public function test_is_valid__returns_false_when_custom_effect_value_empty() {
		// Arrange: partial structure - $$type and value but value is empty (no keyframes)
		$custom_effect = [
			'$$type' => 'custom-effect',
			'value' => [],
		];
		$animation_value = $this->animation_value_with_effect( 'custom', $custom_effect );

		// Act
		$result = Custom_Effect_Value::is_valid( $animation_value );

		// Assert
		$this->assertFalse( $result );
	}

	public function test_is_valid__returns_false_when_custom_effect_value_missing_keyframes() {
		// Arrange
		$custom_effect = [
			'$$type' => 'custom-effect',
			'value' => [
				'other_key' => 'ignored',
			],
		];
		$animation_value = $this->animation_value_with_effect( 'custom', $custom_effect );

		// Act
		$result = Custom_Effect_Value::is_valid( $animation_value );

		// Assert
		$this->assertFalse( $result );
	}

	public function test_is_valid__returns_false_when_keyframes_empty() {
		// Arrange
		$custom_effect = [
			'$$type' => 'custom-effect',
			'value' => [
				'keyframes' => [
					'$$type' => 'keyframes',
					'value' => [],
				],
			],
		];
		$animation_value = $this->animation_value_with_effect( 'custom', $custom_effect );

		// Act
		$result = Custom_Effect_Value::is_valid( $animation_value );

		// Assert
		$this->assertFalse( $result );
	}

	public function test_is_valid__returns_false_when_keyframes_not_array() {
		// Arrange
		$custom_effect = [
			'$$type' => 'custom-effect',
			'value' => [
				'keyframes' => [
					'$$type' => 'keyframes',
					'value' => 'not_an_array',
				],
			],
		];
		$animation_value = $this->animation_value_with_effect( 'custom', $custom_effect );

		// Act
		$result = Custom_Effect_Value::is_valid( $animation_value );

		// Assert
		$this->assertFalse( $result );
	}

	public function test_is_valid__returns_false_when_keyframe_stop_invalid() {
		// Arrange: keyframe stop with wrong $$type
		$custom_effect = [
			'$$type' => 'custom-effect',
			'value' => [
				'keyframes' => [
					'$$type' => 'keyframes',
					'value' => [
						[
							'$$type' => 'string',
							'value' => [],
						],
					],
				],
			],
		];
		$animation_value = $this->animation_value_with_effect( 'custom', $custom_effect );

		// Act
		$result = Custom_Effect_Value::is_valid( $animation_value );

		// Assert
		$this->assertFalse( $result );
	}

	public function test_is_valid__returns_false_when_keyframe_stop_value_empty() {
		// Arrange: keyframe-stop with value => [] (missing stop and settings)
		$custom_effect = [
			'$$type' => 'custom-effect',
			'value' => [
				'keyframes' => [
					'$$type' => 'keyframes',
					'value' => [
						[
							'$$type' => 'keyframe-stop',
							'value' => [],
						],
					],
				],
			],
		];
		$animation_value = $this->animation_value_with_effect( 'custom', $custom_effect );

		// Act
		$result = Custom_Effect_Value::is_valid( $animation_value );

		// Assert
		$this->assertFalse( $result );
	}

	public function test_is_valid__returns_false_when_keyframe_stop_missing_stop() {
		// Arrange: only settings, stop is missing
		$custom_effect = [
			'$$type' => 'custom-effect',
			'value' => [
				'keyframes' => [
					'$$type' => 'keyframes',
					'value' => [
						[
							'$$type' => 'keyframe-stop',
							'value' => [
								'settings' => [
									'$$type' => 'keyframe-stop-settings',
									'value' => [],
								],
							],
						],
					],
				],
			],
		];
		$animation_value = $this->animation_value_with_effect( 'custom', $custom_effect );

		// Act
		$result = Custom_Effect_Value::is_valid( $animation_value );

		// Assert
		$this->assertFalse( $result );
	}

	public function test_is_valid__returns_false_when_keyframe_stop_settings_has_unknown_key() {
		// Arrange: settings must only have opacity, move, rotate, scale, skew; unknown key should fail
		$custom_effect = [
			'$$type' => 'custom-effect',
			'value' => [
				'keyframes' => [
					'$$type' => 'keyframes',
					'value' => [
						[
							'$$type' => 'keyframe-stop',
							'value' => [
								'stop' => [
									'$$type' => 'size',
									'value' => [
										'size' => 0,
										'unit' => Size_Constants::UNIT_PERCENT,
									],
								],
								'settings' => [
									'$$type' => 'keyframe-stop-settings',
									'value' => [
										'opacity' => [
											'$$type' => 'size',
											'value' => [ 'size' => 90, 'unit' => '%' ],
										],
										'invalid_setting' => [
											'$$type' => 'size',
											'value' => [ 'size' => 1, 'unit' => '' ],
										],
									],
								],
							],
						],
					],
				],
			],
		];
		$animation_value = $this->animation_value_with_effect( 'custom', $custom_effect );

		// Act
		$result = Custom_Effect_Value::is_valid( $animation_value );

		// Assert
		$this->assertFalse( $result );
	}

	public function test_is_valid__returns_true_when_custom_effect_has_multiple_keyframes() {
		// Arrange
		$custom_effect = [
			'$$type' => 'custom-effect',
			'value' => [
				'keyframes' => [
					'$$type' => 'keyframes',
					'value' => [
						$this->keyframe_stop( 0, 90 ),
						$this->keyframe_stop( 100, 100 ),
					],
				],
			],
		];
		$animation_value = $this->animation_value_with_effect( 'custom', $custom_effect );

		// Act
		$result = Custom_Effect_Value::is_valid( $animation_value );

		// Assert
		$this->assertTrue( $result );
	}

	/**
	 * Builds a minimal valid custom_effect with one keyframe.
	 *
	 * @param int  $stop_percent Keyframe stop (0-100).
	 * @param int  $opacity_percent Opacity at this stop.
	 * @return array
	 */
	private function minimal_valid_custom_effect( int $stop_percent, int $opacity_percent ): array {
		return [
			'$$type' => 'custom-effect',
			'value' => [
				'keyframes' => [
					'$$type' => 'keyframes',
					'value' => [
						$this->keyframe_stop( $stop_percent, $opacity_percent ),
					],
				],
			],
		];
	}

	/**
	 * Builds a single keyframe stop entry.
	 *
	 * @param int $stop_percent
	 * @param int $opacity_percent
	 * @return array
	 */
	private function keyframe_stop( int $stop_percent, int $opacity_percent ): array {
		return [
			'$$type' => 'keyframe-stop',
			'value' => [
				'stop' => [
					'$$type' => 'size',
					'value' => [
						'size' => $stop_percent,
						'unit' => Size_Constants::UNIT_PERCENT,
					],
				],
				'settings' => [
					'$$type' => 'keyframe-stop-settings',
					'value' => [
						'opacity' => [
							'$$type' => 'size',
							'value' => [
								'size' => $opacity_percent,
								'unit' => '%',
							],
						],
					],
				],
			],
		];
	}
}
