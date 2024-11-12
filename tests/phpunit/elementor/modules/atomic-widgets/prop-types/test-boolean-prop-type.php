<?php

namespace Elementor\Testing\Modules\AtomicWidgets\PropTypes;

use Elementor\Modules\AtomicWidgets\PropTypes\Primitives\Boolean_Prop_Type;
use ElementorEditorTesting\Elementor_Test_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Test_Boolean_Prop_Type extends Elementor_Test_Base {
	public function test_validate() {
		// Arrange.
		$prop_type = Boolean_Prop_Type::make();

		// Act.
		$this->assertTrue( $prop_type->validate( true ) );
		$this->assertTrue( $prop_type->validate( false ) );

	}

	public function test_validate__fail_when_passing_non_boolean() {
		// Arrange.
		$prop_type = Boolean_Prop_Type::make();

		// Act.
		$this->assertFalse( $prop_type->validate( 'string' ) );
	}
}
