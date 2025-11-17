<?php

use PHPUnit\Framework\TestCase;

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
							'unknown-interaction-id1',
							'unknown-interaction-id2',
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
									'unknown-interaction-id3',
									'unknown-interaction-id4',
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
							'load-fade-in--100-0',
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
									'load-fade-in-top-200-0',
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
							'load-fade-in--100-0',
							'unknown-interaction-id1',
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
									'load-fade-in-top-200-0',
									'unknown-interaction-id2',
								],
								'version' => 1,
							] ),
						],
					],
				],
			],
		];
	}
}
