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

	public function test_validate__accepts_a_custom_icon_pack_library() {
		// Arrange — custom packs and a future Font Awesome Pro tier must keep validating.
		$prop_type = Icon_Prop_Type::make();

		// Act.
		$result = $prop_type->validate(
			Icon_Prop_Type::generate( [
				'value' => String_Prop_Type::generate( 'my-pack my-pack-logo' ),
				'library' => String_Prop_Type::generate( 'my-pack' ),
			] )
		);

		// Assert.
		$this->assertTrue( $result );
	}

	public function test_to_json_schema__points_agents_at_the_find_icons_tool() {
		// Arrange.
		$prop_type = Icon_Prop_Type::make();

		// Act.
		$properties = $prop_type->to_json_schema()['properties']['value']['properties'];

		// Assert.
		$this->assertStringContainsString( 'elementor/find-icons', $properties['value']['description'] );
		$this->assertStringContainsString( 'fa-solid fa-cart-shopping', $properties['value']['description'] );
		$this->assertStringContainsString( 'elementor/find-icons', $properties['library']['description'] );
	}
}
