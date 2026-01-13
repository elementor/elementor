<?php

use PHPUnit\Framework\TestCase;

use Elementor\Modules\Interactions\Parser;

/**
 * Due to the fact that original implementation is utilizing the static method call
 * of the Utils::generate_id, we need to override the original implementation to
 * use in tests
 */
class Parser_Ex extends Parser {
	private $__increment = 0;

	protected function get_next_interaction_id( $prefix ) {
		++$this->__increment;
		return implode( '-', [ $this->post_id, $prefix, $this->__increment ] );
	}
}

/**
 *
 * @group Elementor\Modules
 * @group Elementor\Modules\Interactions
 * @group Elementor\Modules\Interactions\Parser
 *
 */
class Test_Parser extends TestCase {
	const DOCUMENT_ID = 1;

	private function parser() {
		return new Parser_Ex( self::DOCUMENT_ID );
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

	private function given_document_without_interactions() {
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

	public function test_assign_interaction_ids__will_ignore_elements_without_interactions() {
		$document = $this->given_document_without_interactions();

		$result = $this->parser()->assign_interaction_ids( $document );

		$this->assertEquals( [
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
		], $result );
	}

	public function test_assign_interactions_ids__will_augment_elements_with_interactions() {
		$interaction_without_id = $this->create_prop_type_interaction( 'load', 'fade', 'in', '', 100, 0 );

		$given_document = [
			'elements' => [
				[
					'id' => '1',
					'elType' => 'e-flexbox',
					'settings' => [],
					'interactions' => json_encode( [
						'items' => [ $interaction_without_id ],
						'version' => 1,
					] ),
				],
			],
		];

		$result = $this->parser()->assign_interaction_ids( $given_document );

		$expected_interaction = $this->create_prop_type_interaction( 'load', 'fade', 'in', '', 100, 0, '1-1-1' );

		$this->assertEquals( [
			'elements' => [
				[
					'id' => '1',
					'elType' => 'e-flexbox',
					'settings' => [],
					'interactions' => json_encode( [
						'items' => [ $expected_interaction ],
						'version' => 1,
					] ),
				],
			],
		], $result );
	}

	public function test_assign_interactions_ids__will_not_override_existing_interaction_ids() {
		$interaction_with_existing_id = $this->create_prop_type_interaction( 'load', 'fade', 'in', '', 100, 0, 'existing-interaction-id' );
		$interaction_without_id = $this->create_prop_type_interaction( 'load', 'fade', 'in', '', 200, 0 );

		$given_document = [
			'elements' => [
				[
					'id' => '1',
					'elType' => 'e-flexbox',
					'settings' => [],
					'interactions' => json_encode( [
						'items' => [
							$interaction_with_existing_id,
							$interaction_without_id,
						],
						'version' => 1,
					] ),
				],
			],
		];

		$result = $this->parser()->assign_interaction_ids( $given_document );

		$expected_interaction_1 = $this->create_prop_type_interaction( 'load', 'fade', 'in', '', 100, 0, 'existing-interaction-id' );
		$expected_interaction_2 = $this->create_prop_type_interaction( 'load', 'fade', 'in', '', 200, 0, '1-1-1' );

		$this->assertEquals( [
			'elements' => [
				[
					'id' => '1',
					'elType' => 'e-flexbox',
					'settings' => [],
					'interactions' => json_encode( [
						'items' => [
							$expected_interaction_1,
							$expected_interaction_2,
						],
						'version' => 1,
					] ),
				],
			],
		], $result );
	}
}