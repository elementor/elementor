<?php

namespace Elementor\Modules\Variables;

use Elementor\Modules\AtomicWidgets\Styles\Styles_Renderer;
use Elementor\Modules\AtomicWidgets\Styles\Style_States;
use Elementor\Modules\Variables\Services\Variables_Service;
use ElementorEditorTesting\Elementor_Test_Base;
use Spatie\Snapshots\MatchesSnapshots;
use Elementor\Modules\Variables\Classes\Variables;
use Elementor\Modules\Variables\PropTypes\Color_Variable_Prop_Type;
use Elementor\Modules\Variables\PropTypes\Font_Variable_Prop_Type;
use \PHPUnit\Framework\TestCase;

/**
 * @gorup Elementor\Modules
 * @group Elementor\Modules\Variables
 */
class Test_Style_Renderer extends TestCase {
	use MatchesSnapshots;

	/**
	 * @var Variables_Repository
	 */
	private $service;

	public function setUp(): void {
		parent::setUp();

		$this->service = $this->createMock( Variables_Service::class );

		$this->service->method( 'get_variables_list' )
			->willReturn( [
				'e-gv-01' => [
					'label' => 'primary-color',
					'value' => '#000',
					'type' => Color_Variable_Prop_Type::get_key(),
				],

				'e-gv-02' => [
					'label' => 'primary-font',
					'value' => 'Montserrat',
					'type' => Font_Variable_Prop_Type::get_key(),
				],

				'e-gv-03' => [
					'label' => 'primary-font',
					'value' => 'Montserrat',
					'type' => Font_Variable_Prop_Type::get_key(),
					'deleted' => true,
					'deleted_at' => '2025-01-01 00:00:00',
				],

				'e-gv-04' => [
					'type' => Color_Variable_Prop_Type::get_key(),
					'value' => '#000',
					'label' => 'primary-color',
					'deleted' => true,
					'deleted_at' => '2025-01-01 00:00:00',
				],
			] );

		Variables::init( $this->service );
	}

	public function test_render__style_with_color_variable() {
		$this->markTestSkipped( 'Needs to be fixed as part of the variables' );

		return;

		// Arrange.
		$styles = [
			[
				'id' => 'test-color-variable',
				'type' => 'class',
				'variants' => [
					[
						'props' => [
							'background' => [
								'$$type' => 'background',
								'value' => [
									'color' => [
										'$$type' => 'global-color-variable',
										'value' => 'e-gv-01',
									],
								],
							],
							'color' => [
								'$$type' => 'global-color-variable',
								'value' => 'e-gv-04',
							],
						],

						'meta' => [],
					],
				],
			],
		];

		$stylesRenderer = Styles_Renderer::make( [], '' );

		// Act.
		$css = $stylesRenderer->render( $styles );

		// Assert.
		$this->assertNotEmpty( $css, 'CSS should not be empty' );
		$this->assertMatchesSnapshot( $css );
	}

	public function test_render__style_with_font_variable() {
		$this->markTestSkipped( 'Needs to be fixed as part of the variables' );

		return;

		// Arrange.
		Variables::init( $this->service );

		$styles = [
			[
				'id' => 'test-font-variable',
				'type' => 'class',
				'variants' => [
					[
						'props' => [
							'font-family' => [
								'$$type' => 'global-font-variable',
								'value' => 'e-gv-02',
							],
						],

						'meta' => [],
					],
				],
			],
			[
				'id' => 'test-font-variable-primary',
				'type' => 'class',
				'variants' => [
					[
						'props' => [
							'font-family' => [
								'$$type' => 'global-font-variable',
								'value' => 'e-gv-03',
							],
						],

						'meta' => [],
					],
				],
			],
		];

		$stylesRenderer = Styles_Renderer::make( [], '' );

		// Act.
		$css = $stylesRenderer->render( $styles );

		// Assert.
		$this->assertNotEmpty( $css, 'CSS should not be empty' );
		$this->assertMatchesSnapshot( $css );
	}

	public function test_render__applies_pseudo_and_class_states() {
		// Arrange.
		$styles = [
			[
				'id' => 'state-test',
				'type' => 'class',
				'variants' => [
					[
					'props' => [ 'color' => '#111' ],
						'meta' => [ 'state' => Style_States::HOVER ],
					],
					[
					'props' => [ 'color' => '#222' ],
						'meta' => [ 'state' => Style_States::SELECTED ],
					],
				],
			],
		];

		$renderer = Styles_Renderer::make( [], '' );

		// Act.
		$css = $renderer->render( $styles );

		// Assert.
		$this->assertStringContainsString( '.state-test:hover{color:#111;}', $css );
		$this->assertStringContainsString( '.state-test.e--selected{color:#222;}', $css );
	}

}
