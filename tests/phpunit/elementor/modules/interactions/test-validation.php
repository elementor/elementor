<?php

use PHPUnit\Framework\TestCase;

use Elementor\Modules\Interactions\Validation;

/**
 *
 * @group Elementor\Modules
 * @group Elementor\Modules\Interactions
 * @group Elementor\Modules\Interactions\Validations
 *
 */
class Test_Validation extends TestCase {

	private function validation() {
		return new Validation();
	}

	private function create_prop_type_interaction( $trigger = 'load', $effect = 'fade', $type = 'in', $direction = '', $duration = 300, $delay = 0, $interaction_id = null ) {
		$value = [
			'trigger' => [
				'$$type' => 'string',
				'value' => $trigger,
			],
			'animation' => [
				'$$type' => 'animation-preset-props',
				'value' => [
					'effect' => [
						'$$type' => 'string',
						'value' => $effect,
					],
					'type' => [
						'$$type' => 'string',
						'value' => $type,
					],
					'direction' => [
						'$$type' => 'string',
						'value' => $direction,
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
				],
			],
		];

		if ( $interaction_id !== null ) {
			$value['interaction_id'] = [
				'$$type' => 'string',
				'value' => $interaction_id,
			];
		}

		return [
			'$$type' => 'interaction-item',
			'value' => $value,
		];
	}

	private function mock_document_data() {
		return [
			'elements' => [
				[
					'id' => '1',
					'elType' => 'e-flexbox',
					'settings' => [],
					'elements' => [
						[
							'id' => '2',
							'elType' => 'widget',
							'widgetType' => 'e-heading',
						],
					],
				],
			],
		];
	}

	public function test_sanitize__will_not_affect_document_without_interactions() {
		$result = $this->validation()->sanitize( $this->mock_document_data() );

		$this->assertEquals( $result, [
			'elements' => [
				[
					'id' => '1',
					'elType' => 'e-flexbox',
					'settings' => [],
					'elements' => [
						[
							'id' => '2',
							'elType' => 'widget',
							'widgetType' => 'e-heading',
						],
					],
				],
			],
		] );
	}

	public function test_sanitize__will_strip_interactions_with_invalid_trigger() {
		$document = [
			'elements' => [
				[
					'id' => '1',
					'elType' => 'e-flexbox',
					'settings' => [],
					'interactions' => json_encode( [
						'items' => [
							$this->create_prop_type_interaction( 'invalid-trigger', 'fade', 'in' ),
						],
						'version' => 1,
					] ),
				],
			],
		];

		$result = $this->validation()->sanitize( $document );

		$this->assertEquals( [], $result['elements'][0]['interactions'] );
	}

	public function test_sanitize__will_accept_valid_prop_type_interactions() {
		$interaction1 = $this->create_prop_type_interaction( 'load', 'fade', 'in', '', 100, 0 );
		$interaction2 = $this->create_prop_type_interaction( 'scrollIn', 'slide', 'in', 'top', 200, 50 );

		$document = [
			'elements' => [
				[
					'id' => '1',
					'elType' => 'e-flexbox',
					'settings' => [],
					'interactions' => json_encode( [
						'items' => [ $interaction1 ],
						'version' => 1,
					] ),
					'elements' => [
						[
							'id' => '2',
							'elType' => 'widget',
							'widgetType' => 'e-heading',
							'interactions' => json_encode( [
								'items' => [ $interaction2 ],
								'version' => 1,
							] ),
						],
					],
				],
			],
		];

		$result = $this->validation()->sanitize( $document );

		$expected = [
			'elements' => [
				[
					'id' => '1',
					'elType' => 'e-flexbox',
					'settings' => [],
					'interactions' => json_encode( [
						'items' => [ $interaction1 ],
						'version' => 1,
					] ),
					'elements' => [
						[
							'id' => '2',
							'elType' => 'widget',
							'widgetType' => 'e-heading',
							'interactions' => json_encode( [
								'items' => [ $interaction2 ],
								'version' => 1,
							] ),
						],
					],
				],
			],
		];

		$this->assertEquals( $expected, $result );
	}

	public function test_sanitize__will_throw_if_number_of_interactions_per_element_exceeds_the_limit() {
		$interactions = [];
		for ( $i = 0; $i < 6; $i++ ) {
			$interactions[] = $this->create_prop_type_interaction( 'load', 'fade', 'in', '', 100, 0 );
		}

		$document = [
			'elements' => [
				[
					'id' => '1',
					'elType' => 'e-flexbox',
					'settings' => [],
					'interactions' => json_encode( [
						'items' => $interactions,
						'version' => 1,
					] ),
				],
			],
		];

		$this->expectException( \Exception::class );

		$validation = $this->validation();
		$validation->sanitize( $document );
		$validation->validate();
	}

	public function test_validate__will_not_throw_if_number_of_interactions_per_element_within_the_limit() {
		$interactions = [];
		for ( $i = 0; $i < 5; $i++ ) {
			$interactions[] = $this->create_prop_type_interaction( 'load', 'fade', 'in', '', 100, 0 );
		}

		$document = [
			'elements' => [
				[
					'id' => '1',
					'elType' => 'e-flexbox',
					'settings' => [],
					'interactions' => json_encode( [
						'items' => $interactions,
						'version' => 1,
					] ),
				],
			],
		];

		$validation = $this->validation();
		$validation->sanitize( $document );
		$validation->validate();

		$this->assertTrue( true, 'No exception was thrown' );
	}
}