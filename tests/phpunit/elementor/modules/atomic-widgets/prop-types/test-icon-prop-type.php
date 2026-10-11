<?php

namespace Elementor\Testing\Modules\AtomicWidgets\PropTypes;

use Elementor\Core\Experiments\Manager as Experiments_Manager;
use Elementor\Modules\AtomicWidgets\Module as Atomic_Widgets_Module;
use Elementor\Modules\AtomicWidgets\PropTypes\Icon_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Primitives\String_Prop_Type;
use Elementor\Plugin;
use ElementorEditorTesting\Elementor_Test_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Test_Icon_Prop_Type extends Elementor_Test_Base {
	private string $original_svg_library_state;

	public function setUp(): void {
		parent::setUp();

		$this->original_svg_library_state = Plugin::$instance->experiments->get_features( Atomic_Widgets_Module::EXPERIMENT_ICON_LIBRARY )['default'];
	}

	public function tearDown(): void {
		Plugin::$instance->experiments->set_feature_default_state( Atomic_Widgets_Module::EXPERIMENT_ICON_LIBRARY, $this->original_svg_library_state );

		parent::tearDown();
	}

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
		Plugin::$instance->experiments->set_feature_default_state( Atomic_Widgets_Module::EXPERIMENT_ICON_LIBRARY, Experiments_Manager::STATE_ACTIVE );
		$prop_type = Icon_Prop_Type::make();

		// Act.
		$properties = $prop_type->to_json_schema()['properties']['value']['properties'];

		// Assert.
		$this->assertStringContainsString( 'elementor/find-icons', $properties['value']['description'] );
		$this->assertStringContainsString( 'fa-solid fa-cart-shopping', $properties['value']['description'] );
		$this->assertStringContainsString( 'elementor/find-icons', $properties['library']['description'] );
	}

	public function test_to_json_schema__omits_find_icons_guidance_when_svg_library_inactive() {
		// Arrange.
		Plugin::$instance->experiments->set_feature_default_state( Atomic_Widgets_Module::EXPERIMENT_ICON_LIBRARY, Experiments_Manager::STATE_INACTIVE );
		$prop_type = Icon_Prop_Type::make();

		// Act.
		$properties = $prop_type->to_json_schema()['properties']['value']['properties'];

		// Assert.
		$this->assertArrayNotHasKey( 'description', $properties['value'] );
		$this->assertArrayNotHasKey( 'description', $properties['library'] );
	}
}
