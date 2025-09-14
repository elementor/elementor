<?php
namespace Elementor\Tests\Phpunit\Modules\CssConverter;

use Elementor\Modules\CssConverter\ClassConvertors\Transition_Property_Mapper;
use PHPUnit\Framework\TestCase;

class Test_Transition_Property_Mapper extends TestCase {

	private $mapper;

	public function setUp(): void {
		$this->mapper = new Transition_Property_Mapper();
	}

	public function test_supports_valid_transition_properties() {
		$this->assertTrue( $this->mapper->supports( 'transition', 'all 0.3s ease' ) );
		$this->assertTrue( $this->mapper->supports( 'transition', 'none' ) );
		$this->assertTrue( $this->mapper->supports( 'transition-property', 'opacity' ) );
		$this->assertTrue( $this->mapper->supports( 'transition-duration', '0.3s' ) );
		$this->assertTrue( $this->mapper->supports( 'transition-timing-function', 'ease-in-out' ) );
		$this->assertTrue( $this->mapper->supports( 'transition-delay', '100ms' ) );
	}

	public function test_does_not_support_invalid_properties() {
		$this->assertFalse( $this->mapper->supports( 'animation', 'all 0.3s ease' ) );
		$this->assertFalse( $this->mapper->supports( 'transition-duration', 'invalid' ) );
		$this->assertFalse( $this->mapper->supports( 'transition-timing-function', 'invalid' ) );
	}

	public function test_maps_transition_shorthand_correctly() {
		$result = $this->mapper->map_to_schema( 'transition', 'opacity 0.3s ease-in-out 0.1s' );
		$expected = [
			'transition-property' => [ '$$type' => 'string', 'value' => 'opacity' ],
			'transition-duration' => [ '$$type' => 'string', 'value' => '0.3s' ],
			'transition-timing-function' => [ '$$type' => 'string', 'value' => 'ease-in-out' ],
			'transition-delay' => [ '$$type' => 'string', 'value' => '0.1s' ]
		];
		$this->assertEquals( $expected, $result );
	}

	public function test_maps_transition_none() {
		$result = $this->mapper->map_to_schema( 'transition', 'none' );
		$expected = [
			'transition-property' => [ '$$type' => 'string', 'value' => 'none' ]
		];
		$this->assertEquals( $expected, $result );
	}

	public function test_maps_individual_transition_properties() {
		$property_result = $this->mapper->map_to_schema( 'transition-property', 'opacity' );
		$this->assertEquals( [ 'transition-property' => [ '$$type' => 'string', 'value' => 'opacity' ] ], $property_result );

		$duration_result = $this->mapper->map_to_schema( 'transition-duration', '0.5s' );
		$this->assertEquals( [ 'transition-duration' => [ '$$type' => 'string', 'value' => '0.5s' ] ], $duration_result );

		$timing_result = $this->mapper->map_to_schema( 'transition-timing-function', 'linear' );
		$this->assertEquals( [ 'transition-timing-function' => [ '$$type' => 'string', 'value' => 'linear' ] ], $timing_result );
	}

	public function test_get_supported_properties() {
		$properties = $this->mapper->get_supported_properties();
		$expected = [ 'transition', 'transition-property', 'transition-duration', 'transition-timing-function', 'transition-delay' ];
		$this->assertEquals( $expected, $properties );
	}
}
