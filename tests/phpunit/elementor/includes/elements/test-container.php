<?php
namespace Elementor\Tests\Phpunit\Includes\Elements;

use Elementor\Includes\Elements\Container;
use ElementorEditorTesting\Elementor_Test_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Test_Container extends Elementor_Test_Base {
	public function test_print_element() {
		// Arrange.
		$container = new Container( [
			'id' => 'test-container',
			'elements' => [],
		] );

		ob_start();

		// Act.
		$container->print_element();

		$output = ob_get_clean();

		// Assert.
		$this->assertContains( 'class="elementor-element elementor-element-test-container e-container--column e-container"', $output );
		$this->assertContains( 'id="test-container', $output );
	}
}
