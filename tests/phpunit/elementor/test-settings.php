<?php
namespace Elementor\Testing;

use ElementorEditorTesting\Elementor_Test_Base;

class Elementor_Test_Settings extends Elementor_Test_Base {

	public function test_validationsCheckboxList() {
		$this->assertEquals( [], \Elementor\Settings_Validations::checkbox_list( null ) );
		$this->assertEquals( [ 'a', 'b' ], \Elementor\Settings_Validations::checkbox_list( [ 'a', 'b' ] ) );
	}
}
