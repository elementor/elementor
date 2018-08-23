<?php

namespace Elementor\Testing\Modules\history;


use Elementor\Modules\History\Module;
use Elementor\Testing\Elementor_Test_Base;

class Elementor_Test_Manager extends Elementor_Test_Base {

	public function test_should_test_name() {
		$Module = new Module();

		$this->assertEquals( $Module->get_name(), 'history' );
	}
}