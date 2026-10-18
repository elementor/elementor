<?php

namespace Elementor\Testing\Modules\Mcp\Abilities\Appliers\V3\Adapters;

use Elementor\Modules\AtomicWidgets\PropTypes\Border_Width_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Box_Shadow_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Color_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Font_Family_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Primitives\Number_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Primitives\String_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Shadow_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Size_Prop_Type;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\Adapters\Box_Shadow_Adapter;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\Adapters\Font_Family_Adapter;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\Adapters\Number_Adapter;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\Adapters\Object_Size_Box_Adapter;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\Adapters\V3_Control_Adapter_Registry;
use PHPUnit\Framework\TestCase;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Test_V3_Group_Adapters extends TestCase {

	private function px( $size ): array {
		return Size_Prop_Type::generate( [
			'size' => $size,
			'unit' => 'px',
		] );
	}

	private function shadow( string $position = null ): array {
		$shadow = [
			'hOffset' => $this->px( 1 ),
			'vOffset' => $this->px( 2 ),
			'blur' => $this->px( 3 ),
			'spread' => $this->px( 0 ),
			'color' => Color_Prop_Type::generate( 'rgba(0,0,0,0.5)' ),
		];

		if ( null !== $position ) {
			$shadow['position'] = String_Prop_Type::generate( $position );
		}

		return Box_Shadow_Prop_Type::generate( [ Shadow_Prop_Type::generate( $shadow ) ] );
	}

	public function test_registry__routes_group_controls_to_their_adapters() {
		// Arrange.
		$registry = V3_Control_Adapter_Registry::create_default();

		// Act.
		$box_shadow = $registry->find( Box_Shadow_Prop_Type::get_key(), 'box_shadow', false );
		$font = $registry->find( Font_Family_Prop_Type::get_key(), 'font', false );
		$number = $registry->find( Number_Prop_Type::get_key(), 'number', false );
		$border_width = $registry->find( Border_Width_Prop_Type::get_key(), 'dimensions', false );

		// Assert.
		$this->assertInstanceOf( Box_Shadow_Adapter::class, $box_shadow );
		$this->assertInstanceOf( Font_Family_Adapter::class, $font );
		$this->assertInstanceOf( Number_Adapter::class, $number );
		$this->assertInstanceOf( Object_Size_Box_Adapter::class, $border_width );
	}

	public function test_box_shadow_adapter__round_trips_one_pixel_shadow() {
		// Arrange.
		$adapter = new Box_Shadow_Adapter();

		// Act.
		$stored = $adapter->to_control_value( $this->shadow( 'inset' ), null, [] );
		$read = $adapter->from_control_value( $stored, null );

		// Assert.
		$this->assertSame( [
			'horizontal' => 1,
			'vertical' => 2,
			'blur' => 3,
			'spread' => 0,
			'color' => 'rgba(0,0,0,0.5)',
			'position' => 'inset',
		], $stored );
		$this->assertSame( $this->shadow( 'inset' ), $read );
	}

	public function test_box_shadow_adapter__rejects_non_pixel_lengths() {
		// Arrange.
		$adapter = new Box_Shadow_Adapter();
		$shadow = $this->shadow();
		$shadow['value'][0]['value']['blur'] = Size_Prop_Type::generate( [
			'size' => 1,
			'unit' => 'em',
		] );

		// Act.
		$stored = $adapter->to_control_value( $shadow, null, [] );

		// Assert.
		$this->assertNull( $stored );
	}

	public function test_font_family_adapter__round_trips_family_name() {
		// Arrange.
		$adapter = new Font_Family_Adapter();

		// Act.
		$stored = $adapter->to_control_value( Font_Family_Prop_Type::generate( 'Roboto' ), null, [] );
		$read = $adapter->from_control_value( 'Roboto', null );

		// Assert.
		$this->assertSame( 'Roboto', $stored );
		$this->assertSame( Font_Family_Prop_Type::generate( 'Roboto' ), $read );
	}

	public function test_number_adapter__round_trips_numbers_and_rejects_text() {
		// Arrange.
		$adapter = new Number_Adapter();

		// Act.
		$stored = $adapter->to_control_value( Number_Prop_Type::generate( 3 ), null, [] );
		$rejected = $adapter->to_control_value( Number_Prop_Type::generate( 'three' ), null, [] );
		$read = $adapter->from_control_value( '3', null );

		// Assert.
		$this->assertSame( 3, $stored );
		$this->assertNull( $rejected );
		$this->assertSame( Number_Prop_Type::generate( 3 ), $read );
	}

	public function test_object_size_box_adapter__maps_logical_border_width_to_physical_sides() {
		// Arrange.
		$adapter = new Object_Size_Box_Adapter( Border_Width_Prop_Type::get_key(), Object_Size_Box_Adapter::BORDER_WIDTH_SIDES );
		$value = Border_Width_Prop_Type::generate( [
			'block-start' => $this->px( 1 ),
			'inline-end' => $this->px( 2 ),
			'block-end' => $this->px( 1 ),
			'inline-start' => $this->px( 2 ),
		] );

		// Act.
		$stored = $adapter->to_control_value( $value, null, [ 'size_units' => [ 'px' ] ] );
		$read = $adapter->from_control_value( $stored, null );

		// Assert.
		$this->assertSame( [
			'top' => '1',
			'right' => '2',
			'bottom' => '1',
			'left' => '2',
			'unit' => 'px',
			'isLinked' => false,
		], $stored );
		$this->assertSame( Border_Width_Prop_Type::get_key(), $read['$$type'] );
		$this->assertSame( [ 'block-start', 'inline-end', 'block-end', 'inline-start' ], array_keys( $read['value'] ) );
	}

	public function test_object_size_box_adapter__rejects_mixed_units() {
		// Arrange.
		$adapter = new Object_Size_Box_Adapter( Border_Width_Prop_Type::get_key(), Object_Size_Box_Adapter::BORDER_WIDTH_SIDES );
		$value = Border_Width_Prop_Type::generate( [
			'block-start' => $this->px( 1 ),
			'inline-end' => Size_Prop_Type::generate( [
				'size' => 1,
				'unit' => 'em',
			] ),
			'block-end' => $this->px( 1 ),
			'inline-start' => $this->px( 1 ),
		] );

		// Act.
		$stored = $adapter->to_control_value( $value, null, [] );

		// Assert.
		$this->assertNull( $stored );
	}
}
