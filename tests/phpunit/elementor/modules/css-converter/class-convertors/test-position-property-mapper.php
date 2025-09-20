<?php
namespace Elementor\Tests\Phpunit\Modules\CssConverter;

use Elementor\Modules\CssConverter\Convertors\CssProperties\Position_Property_Mapper;
use PHPUnit\Framework\TestCase;

class Test_Position_Property_Mapper extends TestCase {

	private $mapper;

	public function setUp(): void {
		$this->mapper = new Position_Property_Mapper();
	}

	public function test_supports_valid_position_properties() {
		$this->assertTrue( $this->mapper->supports( 'position', 'absolute' ) );
		$this->assertTrue( $this->mapper->supports( 'position', 'relative' ) );
		$this->assertTrue( $this->mapper->supports( 'top', '10px' ) );
		$this->assertTrue( $this->mapper->supports( 'left', 'auto' ) );
		$this->assertTrue( $this->mapper->supports( 'z-index', '999' ) );
		$this->assertTrue( $this->mapper->supports( 'z-index', 'auto' ) );
	}

	public function test_does_not_support_invalid_properties() {
		$this->assertFalse( $this->mapper->supports( 'display', 'absolute' ) );
		$this->assertFalse( $this->mapper->supports( 'position', 'invalid' ) );
		$this->assertFalse( $this->mapper->supports( 'z-index', 'invalid' ) );
	}

	public function test_maps_position_values_correctly() {
		$result = $this->mapper->map_to_schema( 'position', 'absolute' );
		$expected = [
			'position' => [
				'$$type' => 'string',
				'value' => 'absolute'
			]
		];
		$this->assertEquals( $expected, $result );
	}

	public function test_maps_coordinate_values_correctly() {
		$result = $this->mapper->map_to_schema( 'top', '10px' );
		$expected = [
			'top' => [
				'$$type' => 'size',
				'value' => [ 'size' => 10, 'unit' => 'px' ]
			]
		];
		$this->assertEquals( $expected, $result );
	}

	public function test_maps_auto_coordinates() {
		$result = $this->mapper->map_to_schema( 'left', 'auto' );
		$expected = [
			'left' => [
				'$$type' => 'size',
				'value' => [ 'size' => 'auto', 'unit' => '' ]
			]
		];
		$this->assertEquals( $expected, $result );
	}

	public function test_maps_z_index_correctly() {
		$result = $this->mapper->map_to_schema( 'z-index', '999' );
		$expected = [
			'z-index' => [
				'$$type' => 'number',
				'value' => 999
			]
		];
		$this->assertEquals( $expected, $result );

		$auto_result = $this->mapper->map_to_schema( 'z-index', 'auto' );
		$expected_auto = [
			'z-index' => [
				'$$type' => 'number',
				'value' => 0
			]
		];
		$this->assertEquals( $expected_auto, $auto_result );
	}

	public function test_get_supported_properties() {
		$properties = $this->mapper->get_supported_properties();
		$expected = [ 'position', 'top', 'right', 'bottom', 'left', 'z-index' ];
		$this->assertEquals( $expected, $properties );
	}
}
