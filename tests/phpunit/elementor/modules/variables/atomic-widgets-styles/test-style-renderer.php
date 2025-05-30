<?php

namespace Elementor\Modules\Variables;

use Elementor\Modules\AtomicWidgets\Styles\Styles_Renderer;
use ElementorEditorTesting\Elementor_Test_Base;
use Spatie\Snapshots\MatchesSnapshots;

/**
 * @gorup Elementor\Modules
 * @group Elementor\Modules\Variables
 */
class Test_Style_Renderer extends Elementor_Test_Base {
	use MatchesSnapshots;

	public function test_render__style_with_color_variable() {
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
										'value' => 'e-gc-a01',
									],
								],
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
		// Arrange.
		$styles = [
			[
				'id' => 'test-font-variable',
				'type' => 'class',
				'variants' => [
					[
						'props' => [
							'font-family' => [
								'$$type' => 'global-font-variable',
								'value' => 'e-gf-009',
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
