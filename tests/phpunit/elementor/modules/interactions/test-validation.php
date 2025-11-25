<?php

use PHPUnit\Framework\TestCase;

use \Exception;

use Elementor\Modules\Interactions\Presets;
use Elementor\Modules\Interactions\Validation;

/**
 *
 * @group Elementor\Modules
 * @group Elementor\Modules\Interactions
 * @group Elementor\Modules\Interactions\Validations
 *
 */
class Test_Validation extends TestCase {
	/**
	 * @return Presets
	 */
	private function stub_presets( $list_of_animations = [] ) {
		$presets = $this->createMock( Presets::class );

		$presets->method( 'list' )
			->willReturn( $list_of_animations );

		return $presets;
	}

	private function validation( $overrides = [] ) {
		return new Validation( $this->stub_presets( $overrides ) );
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

	public function test_sanitize__will_stip_interactions_that_are_missing_from_presets() {
		$result = $this->validation()->sanitize( $this->mock_document_data__with_unknown_interactions() );

		$expected = [
			'elements' => [
				[
					'id' => '1',
					'elType' => 'e-flexbox',
					'settings' => [],
					'interactions' => [],
					'elements' => [
						[
							'id' => '2',
							'elType' => 'widget',
							'widgetType' => 'e-heading',
							'interactions' => [],
						],
					],
				],
			],
		];

		$this->assertEquals( $expected, $result );
	}

	private function mock_document_data__with_unknown_interactions() {
		return [
			'elements' => [
				[
					'id' => '1',
					'elType' => 'e-flexbox',
					'settings' => [],
					'interactions' => json_encode([
						'items' => [
							[
								'animation' => [
									'animation_type' => 'full-preset',
									'animation_id' => 'unknown-interaction-id1',
								],
							],
							[
								'animation' => [
									'animation_type' => 'full-preset',
									'animation_id' => 'unknown-interaction-id2',
								],
							],
						],
						'version' => 1,
					]),
					'elements' => [
						[
							'id' => '2',
							'elType' => 'widget',
							'widgetType' => 'e-heading',
							'interactions' => json_encode([
								'items' => [
									[
										'animation' => [
											'animation_type' => 'full-preset',
											'animation_id' => 'unknown-interaction-id3',
										],
									],
									[
										'animation' => [
											'animation_type' => 'full-preset',
											'animation_id' => 'unknown-interaction-id4',
										],
									],
								],
								'version' => 1,
							]),
						],
					],
				],
			],
		];
	}

	public function test_sanitize__will_accept_interactions_present_in_presets() {
		$result = $this->validation( [
			[
				'value' => 'load-fade-in--100-0',
				'label' => 'Page load: Fade In (100ms/0ms)',
			],
			[
				'value' => 'load-fade-in-top-200-0',
				'label' => 'Page load: Fade In From top (200ms/0ms)',
			],
		] )->sanitize( $this->mock_document_data__with_interactions() );

		$expected = [
			'elements' => [
				[
					'id' => '1',
					'elType' => 'e-flexbox',
					'settings' => [],
					'interactions' => json_encode([
						'items' => [
							[
								'animation' => [
									'animation_type' => 'full-preset',
									'animation_id' => 'load-fade-in--100-0',
								],
							],
						],
						'version' => 1,
					]),
					'elements' => [
						[
							'id' => '2',
							'elType' => 'widget',
							'widgetType' => 'e-heading',
							'interactions' => json_encode([
								'items' => [
									[
										'animation' => [
											'animation_type' => 'full-preset',
											'animation_id' => 'load-fade-in-top-200-0',
										],
									]
								],
								'version' => 1,
							]),
						],
					],
				],
			],
		];

		$this->assertEquals( $expected, $result );
	}

	private function mock_document_data__with_interactions() {
		return [
			'elements' => [
				[
					'id' => '1',
					'elType' => 'e-flexbox',
					'settings' => [],
					'interactions' => json_encode( [
						'items' => [
							[
								'animation' => [
									'animation_type' => 'full-preset',
									'animation_id' => 'load-fade-in--100-0',
								],
							],
							[
								'animation' => [
									'animation_type' => 'full-preset',
									'animation_id' => 'unknown-interaction-id1',
								],
							],
						],
						'version' => 1,
					] ),
					'elements' => [
						[
							'id' => '2',
							'elType' => 'widget',
							'widgetType' => 'e-heading',
							'interactions' => json_encode( [
								'items' => [
									[
										'animation' => [
											'animation_type' => 'full-preset',
											'animation_id' => 'load-fade-in-top-200-0',
										],
									],
									[
										'animation' => [
											'animation_type' => 'full-preset',
											'animation_id' => 'unknown-interaction-id2',
										],
									],
								],
								'version' => 1,
							] ),
						],
					],
				],
			],
		];
	}

	public function test_sanitize__will_throw_if_number_of_interactions_per_element_exceeds_the_limit() {
		$document = $this->mock_document_data__with_interactions_overflow( 6 );

		$this->expectException( Exception::class );

		$validation = $this->validation( [
			[
				'value' => 'load-fade-in--100-0',
				'label' => 'Page load: Fade In (100ms/0ms)',
			],
		] );

		$validation->sanitize( $document );
		$validation->validate();
	}

	public function test_validate__will_not_throw_if_number_of_interactions_per_element_within_the_limit() {
		$document = $this->mock_document_data__with_interactions_overflow( 5 );

		$validation = $this->validation( [
			[
				'value' => 'load-fade-in--100-0',
				'label' => 'Page load: Fade In (100ms/0ms)',
			],
		] );

		$validation->sanitize( $document );
		$validation->validate();

		$this->assertTrue( true, 'No exception was thrown' );
	}

	private function mock_document_data__with_interactions_overflow( $number_of_interactions ) {
		$interactions = [];
		while ( 0 < $number_of_interactions ) {
			$interactions[] = [
				'animation' => [
					'animation_type' => 'full-preset',
					'animation_id' => 'load-fade-in--100-0',
				],
			];
			--$number_of_interactions;
		}

		return [
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
	}
}
