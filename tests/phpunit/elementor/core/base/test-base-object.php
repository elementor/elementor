<?php

namespace Elementor\Testing\Core\Base;

use Elementor\Core\Base\Base_Object;
use Elementor\Testing\Elementor_Test_Base;

class Test_Base_Object extends Elementor_Test_Base {

	public function test_has_own_method() {
		$child_class = new Has_Own_Method_Child_Test_Class();

		$this->assertTrue( $child_class->has_own_method( 'uninherited_method' ) );
		$this->assertFalse( $child_class->has_own_method( 'inherited_method' ) );
	}
}

class Has_Own_Method_Parent_Test_Class extends Base_Object {
	public function inherited_method() {}

	public function uninherited_method() {}
}

class Has_Own_Method_Child_Test_Class extends Has_Own_Method_Parent_Test_Class {
	public function uninherited_method() {}
}
