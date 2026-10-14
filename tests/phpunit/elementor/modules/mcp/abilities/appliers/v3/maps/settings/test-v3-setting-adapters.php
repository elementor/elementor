<?php

namespace Elementor\Testing\Modules\Mcp\Abilities\Appliers\V3\Maps\Settings;

use Elementor\Modules\AtomicWidgets\PropTypes\Primitives\Boolean_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Primitives\String_Prop_Type;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\Maps\Settings\Enum_From_Control_Setting_Adapter;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\Maps\Settings\Icons_Setting_Adapter;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\Maps\Settings\Link_Setting_Adapter;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\Maps\Settings\String_Setting_Adapter;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\Maps\Settings\Switcher_Setting_Adapter;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\Maps\Settings\V3_Icons_Prop_Type;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\Maps\Settings\V3_Link_Prop_Type;
use PHPUnit\Framework\TestCase;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Test_V3_Setting_Adapters extends TestCase {

	public function test_string_adapter__round_trips_a_string() {
		// Arrange.
		$adapter = new String_Setting_Adapter();

		// Act.
		$stored = $adapter->to_control_value( String_Prop_Type::generate( 'Hello' ), [] );
		$read = $adapter->from_control_value( 'Hello', [] );

		// Assert.
		$this->assertSame( 'Hello', $stored );
		$this->assertSame( 'Hello', $read );
	}

	public function test_string_adapter__reads_non_scalar_storage_as_null() {
		// Arrange.
		$adapter = new String_Setting_Adapter();

		// Act.
		$read = $adapter->from_control_value( [ 'unexpected' ], [] );

		// Assert.
		$this->assertNull( $read );
	}

	public function test_string_adapter__restricts_values_to_declared_enum() {
		// Arrange.
		$prop_type = ( new String_Setting_Adapter( [ 'left', 'right' ] ) )->prop_type( [] );

		// Act.
		$accepts_left = $prop_type->validate( String_Prop_Type::generate( 'left' ) );
		$accepts_center = $prop_type->validate( String_Prop_Type::generate( 'center' ) );

		// Assert.
		$this->assertTrue( $accepts_left );
		$this->assertFalse( $accepts_center );
	}

	public function test_enum_from_control_adapter__uses_control_option_keys_as_enum() {
		// Arrange.
		$control = [
			'type' => 'select',
			'options' => [
				'horizontal' => 'Horizontal',
				'vertical' => 'Vertical',
			],
		];

		// Act.
		$prop_type = ( new Enum_From_Control_Setting_Adapter() )->prop_type( $control );

		// Assert.
		$this->assertInstanceOf( String_Prop_Type::class, $prop_type );
		$this->assertSame( [ 'horizontal', 'vertical' ], $prop_type->get_enum() );
	}

	public function test_enum_from_control_adapter__supports_only_choice_controls_with_options() {
		// Arrange.
		$adapter = new Enum_From_Control_Setting_Adapter();

		// Act.
		$supports_choose = $adapter->supports( [
			'type' => 'choose',
			'options' => [ 'left' => [] ],
		] );
		$supports_empty_select = $adapter->supports( [
			'type' => 'select',
			'options' => [],
		] );
		$supports_text = $adapter->supports( [ 'type' => 'text' ] );

		// Assert.
		$this->assertTrue( $supports_choose );
		$this->assertFalse( $supports_empty_select );
		$this->assertFalse( $supports_text );
	}

	public function test_switcher_adapter__writes_control_return_value_for_true() {
		// Arrange.
		$adapter = new Switcher_Setting_Adapter();
		$control = [
			'type' => 'switcher',
			'return_value' => 'on',
		];

		// Act.
		$stored_on = $adapter->to_control_value( Boolean_Prop_Type::generate( true ), $control );
		$stored_off = $adapter->to_control_value( Boolean_Prop_Type::generate( false ), $control );

		// Assert.
		$this->assertSame( 'on', $stored_on );
		$this->assertSame( '', $stored_off );
	}

	public function test_switcher_adapter__defaults_return_value_to_yes() {
		// Arrange.
		$adapter = new Switcher_Setting_Adapter();
		$control = [ 'type' => 'switcher' ];

		// Act.
		$stored = $adapter->to_control_value( Boolean_Prop_Type::generate( true ), $control );
		$read_on = $adapter->from_control_value( 'yes', $control );
		$read_off = $adapter->from_control_value( '', $control );

		// Assert.
		$this->assertSame( 'yes', $stored );
		$this->assertTrue( $read_on );
		$this->assertFalse( $read_off );
	}

	public function test_link_adapter__stores_flags_as_switcher_values() {
		// Arrange.
		$adapter = new Link_Setting_Adapter();
		$value = V3_Link_Prop_Type::generate( [
			'url' => String_Prop_Type::generate( 'https://example.com' ),
			'is_external' => Boolean_Prop_Type::generate( true ),
			'nofollow' => Boolean_Prop_Type::generate( false ),
		] );

		// Act.
		$stored = $adapter->to_control_value( $value, [ 'type' => 'url' ] );

		// Assert.
		$this->assertSame( [
			'url' => 'https://example.com',
			'is_external' => 'on',
			'nofollow' => '',
		], $stored );
	}

	public function test_link_adapter__reads_flags_as_booleans() {
		// Arrange.
		$adapter = new Link_Setting_Adapter();
		$stored = [
			'url' => 'https://example.com',
			'is_external' => 'on',
			'nofollow' => '',
			'custom_attributes' => '',
		];

		// Act.
		$read = $adapter->from_control_value( $stored, [ 'type' => 'url' ] );

		// Assert.
		$this->assertSame( [
			'url' => 'https://example.com',
			'is_external' => true,
			'nofollow' => false,
		], $read );
	}

	public function test_icons_adapter__round_trips_value_and_library() {
		// Arrange.
		$adapter = new Icons_Setting_Adapter();
		$value = V3_Icons_Prop_Type::generate( [
			'value' => String_Prop_Type::generate( 'fas fa-star' ),
			'library' => String_Prop_Type::generate( 'fa-solid' ),
		] );

		// Act.
		$stored = $adapter->to_control_value( $value, [ 'type' => 'icons' ] );
		$read = $adapter->from_control_value( $stored, [ 'type' => 'icons' ] );

		// Assert.
		$expected = [
			'value' => 'fas fa-star',
			'library' => 'fa-solid',
		];
		$this->assertSame( $expected, $stored );
		$this->assertSame( $expected, $read );
	}

	public function test_icons_adapter__supports_only_icons_controls() {
		// Arrange.
		$adapter = new Icons_Setting_Adapter();

		// Act.
		$supports_icons = $adapter->supports( [ 'type' => 'icons' ] );
		$supports_text = $adapter->supports( [ 'type' => 'text' ] );

		// Assert.
		$this->assertTrue( $supports_icons );
		$this->assertFalse( $supports_text );
	}
}
