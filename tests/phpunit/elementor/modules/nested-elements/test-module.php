<?php

namespace Elementor\Tests\Phpunit\Elementor\Modules\NestedElementModule;

use Elementor\Modules\NestedElements\Module as NestedElementModule;
use ElementorEditorTesting\Elementor_Test_Base;

class Elementor_Test_Module extends Elementor_Test_Base {

	public function test_experiment_is_hidden() {
		// Act
		$experimental_data = NestedElementModule::get_experimental_data();

		// Assert
		$this->assertTrue( isset( $experimental_data['hidden'] ) );
	}
}
