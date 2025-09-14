<?php
namespace Elementor\Tests\Phpunit\Modules\CssConverter;

use Elementor\Modules\CssConverter\ClassConvertors\Flex_Property_Mapper;
use PHPUnit\Framework\TestCase;

class Test_Flex_Property_Mapper extends TestCase {

	private $mapper;

	public function setUp(): void {
		$this->mapper = new Flex_Property_Mapper();
	}

	public function test_supports_valid_flex_properties() {
		$this->assertTrue( $this->mapper->supports( 'flex', '1' ) );
		$this->assertTrue( $this->mapper->supports( 'flex', '1 2 auto' ) );
		$this->assertTrue( $this->mapper->supports( 'flex', 'auto' ) );
		$this->assertTrue( $this->mapper->supports( 'flex-grow', '1' ) );
		$this->assertTrue( $this->mapper->supports( 'flex-shrink', '0' ) );
		$this->assertTrue( $this->mapper->supports( 'flex-basis', 'auto' ) );
		$this->assertTrue( $this->mapper->supports( 'flex-basis', '200px' ) );
	}

	public function test_does_not_support_invalid_properties() {
		$this->assertFalse( $this->mapper->supports( 'display', 'flex' ) );
		$this->assertFalse( $this->mapper->supports( 'flex-grow', '-1' ) );
		$this->assertFalse( $this->mapper->supports( 'flex-basis', 'invalid' ) );
	}

	public function test_maps_flex_shorthand_correctly() {
		$result = $this->mapper->map_to_schema( 'flex', '1 2 300px' );
		$expected = [
			'flex-grow' => [ '$$type' => 'number', 'value' => 1.0 ],
			'flex-shrink' => [ '$$type' => 'number', 'value' => 2.0 ],
			'flex-basis' => [ '$$type' => 'size', 'value' => [ 'size' => 300, 'unit' => 'px' ] ]
		];
		$this->assertEquals( $expected, $result );
	}

	public function test_maps_flex_auto_keyword() {
		$result = $this->mapper->map_to_schema( 'flex', 'auto' );
		$expected = [
			'flex-grow' => [ '$$type' => 'number', 'value' => 1.0 ],
			'flex-shrink' => [ '$$type' => 'number', 'value' => 1.0 ],
			'flex-basis' => [ '$$type' => 'size', 'value' => [ 'size' => 'auto', 'unit' => '' ] ]
		];
		$this->assertEquals( $expected, $result );
	}

	public function test_maps_individual_flex_properties() {
		$grow_result = $this->mapper->map_to_schema( 'flex-grow', '2' );
		$this->assertEquals( [ 'flex-grow' => [ '$$type' => 'number', 'value' => 2.0 ] ], $grow_result );

		$shrink_result = $this->mapper->map_to_schema( 'flex-shrink', '0' );
		$this->assertEquals( [ 'flex-shrink' => [ '$$type' => 'number', 'value' => 0.0 ] ], $shrink_result );

		$basis_result = $this->mapper->map_to_schema( 'flex-basis', '200px' );
		$expected_basis = [ 'flex-basis' => [ '$$type' => 'size', 'value' => [ 'size' => 200, 'unit' => 'px' ] ] ];
		$this->assertEquals( $expected_basis, $basis_result );
	}

	public function test_get_supported_properties() {
		$properties = $this->mapper->get_supported_properties();
		$this->assertContains( 'flex', $properties );
		$this->assertContains( 'flex-grow', $properties );
		$this->assertContains( 'flex-shrink', $properties );
		$this->assertContains( 'flex-basis', $properties );
		$this->assertCount( 4, $properties );
	}
}
