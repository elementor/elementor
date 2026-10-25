<?php

namespace Elementor\Testing\Modules\Mcp\Abilities\Appliers\V3\Adapters;

use Elementor\Modules\AtomicWidgets\PropTypes\Background_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Color_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Dimensions_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Font_Family_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Primitives\String_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Size_Prop_Type;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\Adapters\Background_Color_Adapter;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\Adapters\Color_Adapter;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\Adapters\Dimensions_Adapter;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\Adapters\Dimensions_Sides_Slider_Adapter;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\Adapters\Font_Family_Adapter;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\Adapters\Size_Slider_Adapter;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\Adapters\String_Choice_Adapter;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\Adapters\V3_Control_Adapter_Registry;
use PHPUnit\Framework\TestCase;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Test_V3_Control_Adapters extends TestCase {

	const INLINE_SIDES = [ 'inline-start', 'inline-end' ];

	private function size( $size, string $unit = 'px' ): array {
		return Size_Prop_Type::generate( [
			'size' => $size,
			'unit' => $unit,
		] );
	}

	private function dimensions( array $sides ): array {
		return Dimensions_Prop_Type::generate( array_map( fn( $side ) => $this->size( $side[0], $side[1] ?? 'px' ), $sides ) );
	}

	private function all_sides( $block, $inline ): array {
		return $this->dimensions( [
			'block-start' => [ $block ],
			'inline-end' => [ $inline ],
			'block-end' => [ $block ],
			'inline-start' => [ $inline ],
		] );
	}

	public function test_registry__finds_adapter_by_prop_type_control_type_and_sides() {
		// Arrange.
		$registry = V3_Control_Adapter_Registry::create_default();

		// Act.
		$whole = $registry->find( Dimensions_Prop_Type::get_key(), 'dimensions', false );
		$partial = $registry->find( Dimensions_Prop_Type::get_key(), 'slider', true );
		$missing = $registry->find( Color_Prop_Type::get_key(), 'slider', false );

		// Assert.
		$this->assertInstanceOf( Dimensions_Adapter::class, $whole );
		$this->assertInstanceOf( Dimensions_Sides_Slider_Adapter::class, $partial );
		$this->assertNull( $missing );
	}

	public function test_color_adapter__round_trips_color() {
		// Arrange.
		$adapter = new Color_Adapter();

		// Act.
		$stored = $adapter->to_control_value( Color_Prop_Type::generate( '#ff0000' ), null, [] );
		$read = $adapter->from_control_value( $stored, null );

		// Assert.
		$this->assertSame( '#ff0000', $stored );
		$this->assertSame( Color_Prop_Type::generate( '#ff0000' ), $read );
	}

	/**
	 * @dataProvider provide_invalid_colors
	 */
	public function test_color_adapter__reports_text_that_is_not_a_color_as_unstorable( string $color ) {
		// Arrange.
		$adapter = new Color_Adapter();

		// Act.
		$stored = $adapter->to_control_value( Color_Prop_Type::generate( $color ), null, [] );

		// Assert.
		$this->assertNull( $stored );
	}

	public function provide_invalid_colors(): array {
		return [
			'bad hex' => [ '#gggggg' ],
			'no hash' => [ 'aabbcc' ],
			'unknown name' => [ 'notacolor' ],
			'number' => [ '12345' ],
			'gradient' => [ 'linear-gradient(red, blue)' ],
			'too long' => [ str_repeat( 'a', 130 ) ],
		];
	}

	/**
	 * @dataProvider provide_valid_colors
	 */
	public function test_color_adapter__stores_every_color_notation( string $color ) {
		// Arrange.
		$adapter = new Color_Adapter();

		// Act.
		$stored = $adapter->to_control_value( Color_Prop_Type::generate( $color ), null, [] );

		// Assert.
		$this->assertSame( $color, $stored );
	}

	public function provide_valid_colors(): array {
		return [
			'named' => [ 'rebeccapurple' ],
			'short hex' => [ '#abc' ],
			'hex alpha' => [ '#aabbcc80' ],
			'rgb' => [ 'rgb(1, 2, 3)' ],
			'rgba' => [ 'rgba(1,2,3,0.5)' ],
			'space syntax' => [ 'rgb(1 2 3 / 50%)' ],
			'hsl' => [ 'hsl(120, 50%, 50%)' ],
			'oklch' => [ 'oklch(60% 0.2 120)' ],
			'current color' => [ 'currentColor' ],
			'transparent' => [ 'transparent' ],
			'variable' => [ 'var(--e-global-color-primary)' ],
		];
	}

	public function test_font_family_adapter__stores_one_bare_family_without_quotes() {
		// Arrange.
		$adapter = new Font_Family_Adapter();

		// Act & Assert.
		$this->assertSame( 'Playfair Display', $adapter->to_control_value( Font_Family_Prop_Type::generate( '"Playfair Display"' ), null, [] ) );
		$this->assertSame( 'Open Sans', $adapter->to_control_value( Font_Family_Prop_Type::generate( "'Open Sans', sans-serif" ), null, [] ) );
		$this->assertSame( 'Inter', $adapter->to_control_value( Font_Family_Prop_Type::generate( 'Inter, sans-serif' ), null, [] ) );
	}

	public function test_background_color_adapter__accepts_color_only_background() {
		// Arrange.
		$adapter = new Background_Color_Adapter();
		$background = Background_Prop_Type::generate( [ 'color' => Color_Prop_Type::generate( '#fafafa' ) ] );

		// Act.
		$stored = $adapter->to_control_value( $background, null, [] );
		$read = $adapter->from_control_value( $stored, null );

		// Assert.
		$this->assertSame( '#fafafa', $stored );
		$this->assertSame( $background, $read );
	}

	public function test_background_color_adapter__rejects_background_with_image_layers() {
		// Arrange.
		$adapter = new Background_Color_Adapter();
		$background = Background_Prop_Type::generate( [
			'color' => Color_Prop_Type::generate( '#fafafa' ),
			'background-overlay' => [],
		] );

		// Act.
		$stored = $adapter->to_control_value( $background, null, [] );

		// Assert.
		$this->assertNull( $stored );
	}

	public function test_size_slider_adapter__round_trips_size() {
		// Arrange.
		$adapter = new Size_Slider_Adapter();

		// Act.
		$stored = $adapter->to_control_value( $this->size( 18 ), null, [ 'size_units' => [ 'px', 'em' ] ] );
		$read = $adapter->from_control_value( $stored, null );

		// Assert.
		$this->assertSame( [
			'unit' => 'px',
			'size' => 18,
		], $stored );
		$this->assertSame( $this->size( 18 ), $read );
	}

	public function test_size_slider_adapter__rejects_unit_the_control_does_not_offer() {
		// Arrange.
		$adapter = new Size_Slider_Adapter();

		// Act.
		$stored = $adapter->to_control_value( $this->size( 2, 'vw' ), null, [ 'size_units' => [ 'px', 'em' ] ] );

		// Assert.
		$this->assertNull( $stored );
	}

	public function test_size_slider_adapter__skips_empty_stored_size() {
		// Arrange.
		$adapter = new Size_Slider_Adapter();

		// Act.
		$read = $adapter->from_control_value( [
			'unit' => 'px',
			'size' => '',
		], null );

		// Assert.
		$this->assertNull( $read );
	}

	public function test_dimensions_adapter__writes_all_four_sides() {
		// Arrange.
		$adapter = new Dimensions_Adapter();

		// Act.
		$stored = $adapter->to_control_value( $this->all_sides( 10, 20 ), null, [] );

		// Assert.
		$this->assertSame( [
			'top' => '10',
			'right' => '20',
			'bottom' => '10',
			'left' => '20',
			'unit' => 'px',
			'isLinked' => false,
		], $stored );
	}

	public function test_dimensions_adapter__writes_single_size_to_every_side() {
		// Arrange.
		$adapter = new Dimensions_Adapter();

		// Act.
		$stored = $adapter->to_control_value( $this->size( 40 ), null, [] );

		// Assert.
		$this->assertSame( [
			'top' => '40',
			'right' => '40',
			'bottom' => '40',
			'left' => '40',
			'unit' => 'px',
			'isLinked' => true,
		], $stored );
	}

	public function test_dimensions_adapter__rejects_missing_side_or_mixed_units() {
		// Arrange.
		$adapter = new Dimensions_Adapter();
		$missing_side = $this->dimensions( [ 'inline-start' => [ 5 ] ] );
		$mixed_units = $this->dimensions( [
			'block-start' => [ 1, 'em' ],
			'inline-end' => [ 2 ],
			'block-end' => [ 1, 'em' ],
			'inline-start' => [ 2 ],
		] );

		// Act.
		$missing_result = $adapter->to_control_value( $missing_side, null, [] );
		$mixed_result = $adapter->to_control_value( $mixed_units, null, [] );

		// Assert.
		$this->assertNull( $missing_result );
		$this->assertNull( $mixed_result );
	}

	public function test_dimensions_adapter__reads_back_stored_sides() {
		// Arrange.
		$adapter = new Dimensions_Adapter();

		// Act.
		$read = $adapter->from_control_value( [
			'top' => '10',
			'right' => '20',
			'bottom' => '10',
			'left' => '20',
			'unit' => 'px',
			'isLinked' => false,
		], null );

		// Assert.
		$this->assertEquals( $this->all_sides( 10, 20 ), $read );
	}

	public function test_dimensions_sides_slider_adapter__writes_equal_sides_as_one_size() {
		// Arrange.
		$adapter = new Dimensions_Sides_Slider_Adapter();

		// Act.
		$stored = $adapter->to_control_value( $this->all_sides( 4, 12 ), self::INLINE_SIDES, [] );

		// Assert.
		$this->assertSame( [
			'unit' => 'px',
			'size' => 12,
		], $stored );
	}

	public function test_dimensions_sides_slider_adapter__rejects_unequal_sides() {
		// Arrange.
		$adapter = new Dimensions_Sides_Slider_Adapter();
		$unequal = $this->dimensions( [
			'inline-start' => [ 10 ],
			'inline-end' => [ 30 ],
		] );

		// Act.
		$stored = $adapter->to_control_value( $unequal, self::INLINE_SIDES, [] );

		// Assert.
		$this->assertNull( $stored );
	}

	public function test_dimensions_sides_slider_adapter__reads_back_only_its_sides() {
		// Arrange.
		$adapter = new Dimensions_Sides_Slider_Adapter();

		// Act.
		$read = $adapter->from_control_value( [
			'unit' => 'px',
			'size' => 12,
		], self::INLINE_SIDES );

		// Assert.
		$this->assertEquals( $this->dimensions( [
			'inline-start' => [ 12 ],
			'inline-end' => [ 12 ],
		] ), $read );
	}

	public function test_string_choice_adapter__accepts_only_listed_options() {
		// Arrange.
		$adapter = new String_Choice_Adapter();
		$control = [
			'options' => [
				'400' => '400',
				'700' => '700',
			],
		];

		// Act.
		$accepted = $adapter->to_control_value( String_Prop_Type::generate( '700' ), null, $control );
		$rejected = $adapter->to_control_value( String_Prop_Type::generate( '650' ), null, $control );
		$read = $adapter->from_control_value( $accepted, null );

		// Assert.
		$this->assertSame( '700', $accepted );
		$this->assertNull( $rejected );
		$this->assertSame( String_Prop_Type::generate( '700' ), $read );
	}

	public function test_string_choice_adapter__stores_logical_alignment_on_physical_options() {
		// Arrange.
		$adapter = new String_Choice_Adapter();
		$control = [
			'options' => [
				'left' => 'Left',
				'center' => 'Center',
				'right' => 'Right',
			],
		];

		// Act.
		$start = $adapter->to_control_value( String_Prop_Type::generate( 'start' ), null, $control );
		$end = $adapter->to_control_value( String_Prop_Type::generate( 'end' ), null, $control );

		// Assert.
		$this->assertSame( 'left', $start );
		$this->assertSame( 'right', $end );
	}
}
