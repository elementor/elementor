<?php

namespace Elementor\Testing\Modules\Mcp\Abilities\Appliers\V3\Maps\Settings;

use Elementor\Modules\AtomicWidgets\Parsers\Props_Parser;
use Elementor\Modules\AtomicWidgets\PropTypes\Primitives\Boolean_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Primitives\String_Prop_Type;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\Maps\Settings\Enum_From_Control_Setting_Adapter;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\Maps\Settings\Icons_Setting_Adapter;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\Maps\Settings\Link_Setting_Adapter;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\Maps\Settings\Gallery_Setting_Adapter;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\Maps\Settings\Multi_Enum_From_Control_Setting_Adapter;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\Maps\Settings\Number_Setting_Adapter;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\Maps\Settings\Size_Setting_Adapter;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\Maps\Settings\String_Setting_Adapter;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\Maps\Settings\Switcher_Setting_Adapter;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\Maps\Settings\V3_Icons_Prop_Type;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\Maps\Settings\V3_Link_Prop_Type;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\Maps\Settings\Repeater_Setting_Adapter;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\Maps\Settings\V3_Gallery_Prop_Type;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\Maps\Settings\V3_Number_Prop_Type;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\Maps\Settings\V3_Repeater_Prop_Type;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\Maps\Settings\V3_Size_Prop_Type;
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

	public function test_enum_from_control_adapter__names_an_empty_option_after_its_label() {
		// Arrange.
		$adapter = new Enum_From_Control_Setting_Adapter();
		$control = [
			'type' => 'select',
			'options' => [
				'none' => 'None',
				'' => 'Attachment Caption',
			],
		];

		// Act.
		$enum = $adapter->prop_type( $control )->get_enum();
		$stored = $adapter->to_control_value( String_Prop_Type::generate( 'attachment-caption' ), $control );
		$read = $adapter->from_control_value( '', $control );

		// Assert.
		$this->assertSame( [ 'none', 'attachment-caption' ], $enum );
		$this->assertSame( '', $stored );
		$this->assertSame( 'attachment-caption', $read );
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

	public function test_number_adapter__keeps_decimals_and_stores_whole_numbers_as_integers() {
		// Arrange.
		$adapter = new Number_Setting_Adapter();
		$prop_type = $adapter->prop_type( [ 'type' => 'number' ] );

		// Act.
		$stored_decimal = $adapter->to_control_value( $prop_type->sanitize( V3_Number_Prop_Type::generate( 4.5 ) ), [] );
		$stored_whole = $adapter->to_control_value( $prop_type->sanitize( V3_Number_Prop_Type::generate( 250 ) ), [] );

		// Assert.
		$this->assertSame( 4.5, $stored_decimal );
		$this->assertSame( 250, $stored_whole );
	}

	public function test_number_adapter__reads_numeric_storage_and_rejects_the_rest() {
		// Arrange.
		$adapter = new Number_Setting_Adapter();

		// Act.
		$read_string = $adapter->from_control_value( '100', [] );
		$read_float = $adapter->from_control_value( 1.5, [] );
		$read_text = $adapter->from_control_value( 'lots', [] );

		// Assert.
		$this->assertSame( 100, $read_string );
		$this->assertSame( 1.5, $read_float );
		$this->assertNull( $read_text );
	}

	public function test_number_adapter__supports_only_number_controls() {
		// Arrange.
		$adapter = new Number_Setting_Adapter();

		// Act.
		$supports_number = $adapter->supports( [ 'type' => 'number' ] );
		$supports_text = $adapter->supports( [ 'type' => 'text' ] );

		// Assert.
		$this->assertTrue( $supports_number );
		$this->assertFalse( $supports_text );
	}

	public function test_size_adapter__accepts_only_the_control_units() {
		// Arrange.
		$prop_type = ( new Size_Setting_Adapter() )->prop_type( [
			'type' => 'slider',
			'size_units' => [ '%' ],
		] );

		// Act.
		$accepts_percent = $prop_type->validate( V3_Size_Prop_Type::generate( [ 'size' => 75, 'unit' => '%' ] ) );
		$accepts_px = $prop_type->validate( V3_Size_Prop_Type::generate( [ 'size' => 75, 'unit' => 'px' ] ) );

		// Assert.
		$this->assertTrue( $accepts_percent );
		$this->assertFalse( $accepts_px );
		$this->assertSame( [ '%' ], $prop_type->get_shape_field( 'unit' )->get_enum() );
	}

	public function test_size_adapter__falls_back_to_the_default_unit_when_control_has_no_size_units() {
		// Arrange.
		$prop_type = ( new Size_Setting_Adapter() )->prop_type( [
			'type' => 'slider',
			'default' => [ 'size' => 50, 'unit' => '%' ],
		] );

		// Act.
		$units = $prop_type->get_settings()['available_units'];

		// Assert.
		$this->assertSame( [ '%' ], $units );
	}

	public function test_size_adapter__round_trips_the_slider_storage_shape() {
		// Arrange.
		$adapter = new Size_Setting_Adapter();
		$value = V3_Size_Prop_Type::generate( [ 'size' => 75, 'unit' => '%' ] );

		// Act.
		$stored = $adapter->to_control_value( $value, [] );
		$read = $adapter->from_control_value( $stored, [] );

		// Assert.
		$this->assertSame( [ 'unit' => '%', 'size' => 75, 'sizes' => [] ], $stored );
		$this->assertSame( [ 'size' => 75, 'unit' => '%' ], $read );
	}

	public function test_size_adapter__reads_an_empty_slider_as_null() {
		// Arrange.
		$adapter = new Size_Setting_Adapter();

		// Act.
		$read = $adapter->from_control_value( [ 'unit' => '%', 'size' => '' ], [] );

		// Assert.
		$this->assertNull( $read );
	}

	public function test_multi_enum_adapter__supports_only_multiple_select2_with_options() {
		// Arrange.
		$adapter = new Multi_Enum_From_Control_Setting_Adapter();

		// Act & Assert.
		$this->assertTrue( $adapter->supports( [ 'type' => 'select2', 'multiple' => true, 'options' => [ 'a' => 'A' ] ] ) );
		$this->assertFalse( $adapter->supports( [ 'type' => 'select2', 'options' => [ 'a' => 'A' ] ] ) );
		$this->assertFalse( $adapter->supports( [ 'type' => 'select', 'multiple' => true, 'options' => [ 'a' => 'A' ] ] ) );
	}

	public function test_multi_enum_adapter__round_trips_a_list_of_option_keys() {
		// Arrange.
		$control = [ 'type' => 'select2', 'multiple' => true, 'options' => [ 'message' => 'Message', 'redirect' => 'Redirect', 'hide' => 'Hide' ] ];
		$adapter = new Multi_Enum_From_Control_Setting_Adapter();
		$prop_type = $adapter->prop_type( $control );

		// Act.
		$resolved = $this->plain_resolver()->resolve( [ 'message', 'redirect' ], $prop_type );
		$stored = $adapter->to_control_value( $resolved, $control );
		$read = $adapter->from_control_value( $stored, $control );

		// Assert.
		$this->assertSame( [ 'message', 'redirect' ], $stored );
		$this->assertSame( [ 'message', 'redirect' ], $read );
	}

	public function test_gallery_adapter__round_trips_attachments_as_id_and_url() {
		// Arrange: a sanitized gallery prop value, with each row field wrapped as the resolver leaves it.
		$adapter = new Gallery_Setting_Adapter();
		$value = [
			'$$type' => 'v3-gallery',
			'value' => [
				[ '$$type' => 'v3-gallery-item', 'value' => [ 'id' => [ '$$type' => 'number', 'value' => 12 ], 'url' => [ '$$type' => 'string', 'value' => 'https://example.com/a.jpg' ] ] ],
				[ '$$type' => 'v3-gallery-item', 'value' => [ 'id' => [ '$$type' => 'number', 'value' => 34 ], 'url' => [ '$$type' => 'string', 'value' => 'https://example.com/b.jpg' ] ] ],
			],
		];

		// Act.
		$stored = $adapter->to_control_value( $value, [] );
		$read = $adapter->from_control_value( $stored, [] );

		// Assert.
		$this->assertSame( [
			[ 'id' => 12, 'url' => 'https://example.com/a.jpg' ],
			[ 'id' => 34, 'url' => 'https://example.com/b.jpg' ],
		], $stored );
		$this->assertSame( $stored, $read );
	}

	public function test_gallery_adapter__skips_items_without_an_id() {
		// Arrange.
		$adapter = new Gallery_Setting_Adapter();

		// Act.
		$read = $adapter->from_control_value( [ [ 'id' => 7, 'url' => 'x' ], [ 'url' => 'no-id' ] ], [] );

		// Assert.
		$this->assertSame( [ [ 'id' => 7, 'url' => 'x' ] ], $read );
	}

	public function test_repeater_adapter__derives_row_fields_from_the_control() {
		// Arrange: the row shape comes from the control's own fields; _id and unmapped
		// controls (e.g. color) are skipped.
		$control = [
			'type' => 'repeater',
			'fields' => [
				'_id' => [ 'type' => 'hidden' ],
				'item_text' => [ 'type' => 'text' ],
				'item_on' => [ 'type' => 'switcher', 'return_value' => 'yes' ],
				'item_color' => [ 'type' => 'color' ],
			],
		];
		$adapter = new Repeater_Setting_Adapter();
		$prop_type = $adapter->prop_type( $control );

		// Act.
		$resolved = $this->plain_resolver()->resolve( [
			[ 'item_text' => 'First', 'item_on' => true ],
			[ 'item_text' => 'Second', 'item_on' => false ],
		], $prop_type );
		$stored = $adapter->to_control_value( $resolved, $control );
		$read = $adapter->from_control_value( $stored, $control );

		// Assert.
		$this->assertSame( [ 'item_text', 'item_on' ], array_keys( $prop_type->get_item_type()->get_shape() ) );
		$this->assertCount( 2, $stored );
		$this->assertArrayHasKey( '_id', $stored[0] );
		$this->assertSame( 'First', $stored[0]['item_text'] );
		$this->assertSame( 'yes', $stored[0]['item_on'] );
		$this->assertSame( '', $stored[1]['item_on'] );
		$this->assertSame( [
			[ 'item_text' => 'First', 'item_on' => true ],
			[ 'item_text' => 'Second', 'item_on' => false ],
		], $read );
	}

	public function test_repeater_adapter__is_unsupported_when_no_field_maps_to_an_adapter() {
		// Arrange.
		$adapter = new Repeater_Setting_Adapter();

		// Act & Assert.
		$this->assertFalse( $adapter->supports( [ 'type' => 'repeater', 'fields' => [] ] ) );
		$this->assertFalse( $adapter->supports( [ 'type' => 'repeater', 'fields' => [ '_id' => [ 'type' => 'hidden' ], 'c' => [ 'type' => 'color' ] ] ] ) );
		$this->assertTrue( $adapter->supports( [ 'type' => 'repeater', 'fields' => [ 'item_text' => [ 'type' => 'text' ] ] ] ) );
	}

	public function gallery_url_provider(): array {
		return [
			'absolute url' => [ 'https://example.com/uploads/a.jpg', true ],
			'url with query string' => [ 'https://example.com/a.jpg?size=large&v=2', true ],
			'relative url' => [ '/wp-content/uploads/a.jpg', false ],
			'not a url' => [ 'not a url', false ],
		];
	}

	/**
	 * @dataProvider gallery_url_provider
	 */
	public function test_gallery_adapter__validates_the_item_url_as_a_url( string $url, bool $is_valid ) {
		// Arrange.
		$prop_type = ( new Gallery_Setting_Adapter() )->prop_type( [] );
		$resolved = $this->plain_resolver()->resolve( [ [ 'id' => 12, 'url' => $url ] ], $prop_type );

		// Act.
		$result = Props_Parser::make( [ 'value' => $prop_type ] )->validate( [ 'value' => $resolved ] );

		// Assert.
		$this->assertSame( $is_valid, $result->is_valid() );
	}

	public function test_gallery_adapter__accepts_an_item_without_a_url() {
		// Arrange.
		$prop_type = ( new Gallery_Setting_Adapter() )->prop_type( [] );
		$resolved = $this->plain_resolver()->resolve( [ [ 'id' => 12 ] ], $prop_type );

		// Act.
		$result = Props_Parser::make( [ 'value' => $prop_type ] )->validate( [ 'value' => $resolved ] );

		// Assert.
		$this->assertTrue( $result->is_valid() );
	}

	public function test_repeater_prop_type__takes_the_row_shape_through_set_item_shape() {
		// Arrange.
		$shape = [
			'title' => String_Prop_Type::make(),
			'enabled' => Boolean_Prop_Type::make(),
		];

		// Act.
		$prop_type = V3_Repeater_Prop_Type::make()->set_item_shape( $shape );

		// Assert.
		$this->assertSame( [ 'title', 'enabled' ], array_keys( $prop_type->get_item_type()->get_shape() ) );
	}

	public function test_repeater_prop_type__keeps_row_shapes_independent_between_instances() {
		// Arrange.
		$first = V3_Repeater_Prop_Type::make()->set_item_shape( [ 'title' => String_Prop_Type::make() ] );

		// Act.
		$second = V3_Repeater_Prop_Type::make()->set_item_shape( [ 'enabled' => Boolean_Prop_Type::make() ] );

		// Assert.
		$this->assertSame( [ 'title' ], array_keys( $first->get_item_type()->get_shape() ) );
		$this->assertSame( [ 'enabled' ], array_keys( $second->get_item_type()->get_shape() ) );
	}

	private function plain_resolver(): \Elementor\Modules\AtomicWidgets\PlainResolvers\Plain_Values_Resolver {
		return \Elementor\Modules\AtomicWidgets\Module::instance()->get_settings_plain_values_resolver();
	}
}
