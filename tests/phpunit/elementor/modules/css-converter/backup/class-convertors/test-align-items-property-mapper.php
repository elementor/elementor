<?php
namespace Elementor\Tests\Phpunit\Modules\CssConverter;

use Elementor\Modules\CssConverter\Convertors\CssProperties\Properties\Align_Items_Property_Mapper;
use PHPUnit\Framework\TestCase;

class Test_Align_Items_Property_Mapper extends TestCase {

	private $mapper;

	public function setUp(): void {
		$this->mapper = new Align_Items_Property_Mapper();
	}

	public function test_supports_valid_align_items_values() {
		$this->assertTrue( $this->mapper->supports( 'align-items', 'flex-start' ) );
		$this->assertTrue( $this->mapper->supports( 'align-items', 'flex-end' ) );
		$this->assertTrue( $this->mapper->supports( 'align-items', 'center' ) );
		$this->assertTrue( $this->mapper->supports( 'align-items', 'baseline' ) );
		$this->assertTrue( $this->mapper->supports( 'align-items', 'stretch' ) );
	}

	public function test_does_not_support_invalid_properties() {
		$this->assertFalse( $this->mapper->supports( 'align-content', 'center' ) );
		$this->assertFalse( $this->mapper->supports( 'align-items', 'invalid-value' ) );
		$this->assertFalse( $this->mapper->supports( 'align-items', 123 ) );
		$this->assertFalse( $this->mapper->supports( 'align-items', '' ) );
	}

	public function test_maps_center_alignment_to_v4_atomic() {
		$result = $this->mapper->map_to_v4_atomic( 'align-items', 'center' );
		$expected = [
			'property' => 'align-items',
			'value' => [
				'$$type' => 'string',
				'value' => 'center',
			],
		];
		$this->assertEquals( $expected, $result );
	}

	public function test_maps_flex_start_alignment_to_v4_atomic() {
		$result = $this->mapper->map_to_v4_atomic( 'align-items', 'flex-start' );
		$expected = [
			'property' => 'align-items',
			'value' => [
				'$$type' => 'string',
				'value' => 'flex-start',
			],
		];
		$this->assertEquals( $expected, $result );
	}

	public function test_maps_flex_end_alignment_to_v4_atomic() {
		$result = $this->mapper->map_to_v4_atomic( 'align-items', 'flex-end' );
		$expected = [
			'property' => 'align-items',
			'value' => [
				'$$type' => 'string',
				'value' => 'flex-end',
			],
		];
		$this->assertEquals( $expected, $result );
	}

	public function test_maps_baseline_alignment_to_v4_atomic() {
		$result = $this->mapper->map_to_v4_atomic( 'align-items', 'baseline' );
		$expected = [
			'property' => 'align-items',
			'value' => [
				'$$type' => 'string',
				'value' => 'baseline',
			],
		];
		$this->assertEquals( $expected, $result );
	}

	public function test_maps_stretch_alignment_to_v4_atomic() {
		$result = $this->mapper->map_to_v4_atomic( 'align-items', 'stretch' );
		$expected = [
			'property' => 'align-items',
			'value' => [
				'$$type' => 'string',
				'value' => 'stretch',
			],
		];
		$this->assertEquals( $expected, $result );
	}

	public function test_maps_to_schema_correctly() {
		$result = $this->mapper->map_to_schema( 'align-items', 'center' );
		$expected = [
			'align-items' => [
				'$$type' => 'string',
				'value' => 'center',
			],
		];
		$this->assertEquals( $expected, $result );
	}

	public function test_get_supported_properties() {
		$properties = $this->mapper->get_supported_properties();
		$this->assertContains( 'align-items', $properties );
		$this->assertCount( 1, $properties );
	}

	public function test_supports_v4_conversion() {
		$this->assertTrue( $this->mapper->supports_v4_conversion( 'align-items', 'center' ) );
		$this->assertFalse( $this->mapper->supports_v4_conversion( 'align-content', 'center' ) );
	}

	public function test_get_v4_property_name() {
		$this->assertEquals( 'align-items', $this->mapper->get_v4_property_name( 'align-items' ) );
	}

	public function test_map_to_v4_atomic_unsupported_property() {
		$result = $this->mapper->map_to_v4_atomic( 'align-content', 'center' );
		$this->assertNull( $result );
	}

	public function test_map_to_v4_atomic_invalid_value() {
		$result = $this->mapper->map_to_v4_atomic( 'align-items', 'invalid' );
		$this->assertNull( $result );
	}
}
