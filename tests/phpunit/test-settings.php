<?php

class Elementor_Test_Settings extends WP_UnitTestCase {

	public function test_validationsCheckboxList() {
		$this->assertEquals( [], \Elementor\Settings_Validations::checkbox_list( null ) );
		$this->assertEquals( [ 'a', 'b' ], \Elementor\Settings_Validations::checkbox_list( [ 'a', 'b' ] ) );
	}
}
