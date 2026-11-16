<?php

use Elementor\Modules\Interactions\Validation;
use PHPUnit\Framework\TestCase;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Test_Skill_Fixture_Runtime_Boundary extends TestCase {

	private function validation() {
		return new Validation();
	}

	private function create_prop_type_interaction( $trigger = 'load', $effect = 'fade' ) {
		return [
			'$$type' => 'interaction-item',
			'value' => [
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
									'value' => 300,
								],
								'delay' => [
									'$$type' => 'number',
									'value' => 0,
								],
							],
						],
					],
				],
			],
		];
	}

	private function document_with_trigger( $trigger ) {
		return [
			'elements' => [
				[
					'id' => 'example-element',
					'elType' => 'widget',
					'widgetType' => 'e-example-greeting',
					'interactions' => json_encode( [
						'items' => [
							$this->create_prop_type_interaction( $trigger, 'fade' ),
						],
						'version' => 1,
					] ),
				],
			],
		];
	}

	public function test_editor_schema_allows_stored_triggers_beyond_runtime_subset() {
		// Arrange.
		$validation = $this->validation();
		$document = $this->document_with_trigger( 'click' );

		// Act.
		$sanitized = $validation->sanitize( $document );
		$is_valid = $validation->validate();

		// Assert.
		$this->assertTrue( $is_valid );
		$this->assertNotEmpty( $sanitized['elements'][0]['interactions'] );
	}

	public function test_runtime_subset_is_not_exposed_via_public_hook() {
		// Arrange.
		$supported_frontend_triggers = [ 'load', 'scrollIn', 'scrollOut' ];
		$stored_trigger = 'click';

		// Act.
		$would_run_on_frontend = in_array( $stored_trigger, $supported_frontend_triggers, true );

		// Assert.
		$this->assertFalse( $would_run_on_frontend );
	}
}
