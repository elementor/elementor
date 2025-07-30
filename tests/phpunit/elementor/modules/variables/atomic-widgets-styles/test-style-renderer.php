<?php

namespace Elementor\Modules\Variables;

use Elementor\Modules\AtomicWidgets\Styles\Styles_Renderer;
use ElementorEditorTesting\Elementor_Test_Base;
use Spatie\Snapshots\MatchesSnapshots;
use Elementor\Modules\Variables\Classes\Variables;
use Elementor\Modules\Variables\Storage\Repository as Variables_Repository;
use Elementor\Modules\Variables\PropTypes\Color_Variable_Prop_Type;
use Elementor\Modules\Variables\PropTypes\Font_Variable_Prop_Type;

/**
 * @gorup Elementor\Modules
 * @group Elementor\Modules\Variables
 */
class Test_Style_Renderer extends Elementor_Test_Base {
	use MatchesSnapshots;

	/**
	 * @var Variables_Repository
	 */
	private $repository;

	public function setUp(): void {
		parent::setUp();

		$this->repository = $this->createMock( Variables_Repository::class );

		$this->repository->method( 'variables' )
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

		Variables::init( $this->repository );
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
		Variables::init( $this->repository );

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
}
