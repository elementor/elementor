<?php

namespace Elementor\Testing\Modules\History;

use Elementor\Modules\History\Module;
use ElementorEditorTesting\Elementor_Test_Base;

class Elementor_Test_Manager extends Elementor_Test_Base {

	public function test_should_get_name() {
		$Module = new Module();

		$this->assertEquals( $Module->get_name(), 'history' );
	}
}
