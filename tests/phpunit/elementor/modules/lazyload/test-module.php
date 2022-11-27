<?php
namespace Elementor\Testing\Modules\LazyLoad;

use ElementorEditorTesting\Elementor_Test_Base;
use Elementor\Modules\LazyLoad\Module as LazyLoad;

class Elementor_Test_LazyLoad extends Elementor_Test_Base {

	public function test_remove_background_image() {

		//Arrange
		$reflection = new \ReflectionClass( LazyLoad::class );
		$method = $reflection->getMethod( 'append_lazyload_selector' );
		$method->setAccessible( true );
		$lazyload = new LazyLoad();
		
		$control = [
			'selectors' => [
				'{{WRAPPER}}' => 'background-image: url("{{URL}}");',
			],
			'background_lazyload' => [
				'active' => true,
			],
		];

		$values = [
			'url' => "test.jpg",
			'id' => 747,
		];

		//Act
		$control = $method->invokeArgs( $lazyload, [ $control, $values ] );

		//Assert
		$this->assertEquals( $control['selectors']['{{WRAPPER}}'], 'background-image: var(--e-bg-lazyload-loaded);--e-bg-lazyload: url("test.jpg");' );
	}
}
