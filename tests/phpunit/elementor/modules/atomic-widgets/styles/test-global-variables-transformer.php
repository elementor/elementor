<?php

namespace Elementor\Testing\Modules\AtomicWidgets\Styles;

use Elementor\Modules\AtomicWidgets\Styles\Styles_Renderer;
use ElementorEditorTesting\Elementor_Test_Base;
use Spatie\Snapshots\MatchesSnapshots;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

/**
 * @group Global_Variables
 */
class Test_Global_Variables_Transformer extends Elementor_Test_Base {
	use MatchesSnapshots;

	public function test_render__basic_style() {
		// Arrange.
		$styles = [
			[
				'id' => 'test-style',
				'type' => 'class',
				'variants' => [
					[
						'props' => [
							'color' => 'red',
							'background' => [
								'$$type' => 'background',
								'value' => [
									'color' => [
										'$$type' => 'color',
										'value' => 'red',
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
		$this->assertNotEmpty( $css, 'Styles should not be empty' );
		// print_r( [ 'style' => $css, ] );

		// Assert.
		$this->assertMatchesSnapshot( $css );
	}

	public function test_render__global_variable_style() {
		// Arrange.
		$styles = [
			[
				'id' => 'test-style',
				'type' => 'class',
				'variants' => [
					[
						'props' => [
							'background' => [
								'$$type' => 'background',
								'value' => [
									'color' => [
										'$$type' => 'global-var',
										'value' => 'e-gc-primary',
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
		$this->assertNotEmpty( $css, 'Styles should not be empty' );
		// print_r( [ 'style' => $css, ] );

		// Assert.
		$this->assertMatchesSnapshot( $css );
	}
}


