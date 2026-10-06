<?php

namespace Elementor\Testing\Modules\AtomicWidgets\PropTypes;

use Elementor\Modules\AtomicWidgets\PropTypes\Icon_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Primitives\String_Prop_Type;
use ElementorEditorTesting\Elementor_Test_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Test_Icon_Prop_Type extends Elementor_Test_Base {
	public function test_validate__accepts_icon_value() {
		// Arrange.
		$prop_type = Icon_Prop_Type::make();

		// Act.
		$result = $prop_type->validate(
			Icon_Prop_Type::generate( [
				'value' => String_Prop_Type::generate( 'fas fa-star' ),
				'library' => String_Prop_Type::generate( 'fa-solid' ),
			] )
		);

		// Assert.
		$this->assertTrue( $result );
	}

	public function test_validate__rejects_missing_library() {
		// Arrange.
		$prop_type = Icon_Prop_Type::make();

		// Act.
		$result = $prop_type->validate(
			Icon_Prop_Type::generate( [
				'value' => String_Prop_Type::generate( 'fas fa-star' ),
				'library' => String_Prop_Type::generate( '' ),
			] )
		);

		// Assert.
		$this->assertFalse( $result );
	}
}
