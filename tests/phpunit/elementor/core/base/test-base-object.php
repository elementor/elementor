<?php

namespace Elementor\Testing\Core\Base;

use Elementor\Core\Base\Base_Object;
use Elementor\Testing\Elementor_Test_Base;

class Test_Base_Object extends Elementor_Test_Base {

	public function test_has_own_method() {
		$child_class = new Has_Own_Method_Child_Test_Class();

		// Tests with only 1 parameter (method name) passed to has_own_method().
		$this->assertTrue( $child_class->has_own_method( 'uninherited_method' ) );
		$this->assertFalse( $child_class->has_own_method( 'inherited_method' ) );

		// Tests with both parameters (method name and base class name) passed to has_own_method().
		$this->assertTrue( $child_class->has_own_method( 'inherited_from_grandparent_method', Has_Own_Method_Parent_Test_Class::class ) );
		// If the passed method was declared in the passed class, has_own_method() will return false.
		$this->assertFalse( $child_class->has_own_method( 'inherited_from_grandparent_method', Has_Own_Method_GrandParent_Test_Class::class ) );
	}
}

// For testing has_own_method() with a provided class name (second parameter)
class Has_Own_Method_GrandParent_Test_Class extends Base_Object {
	public function inherited_from_grandparent_method() {}
}

class Has_Own_Method_Parent_Test_Class extends Has_Own_Method_GrandParent_Test_Class {
	public function inherited_method() {}

	public function uninherited_method() {}
}

class Has_Own_Method_Child_Test_Class extends Has_Own_Method_Parent_Test_Class {
	public function uninherited_method() {}
}
