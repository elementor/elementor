<?php
namespace ElementorCss\Tests\Phpunit\Modules\CssConverter\Convertors\CssProperties\Properties;

use Elementor\Modules\CssConverter\Convertors\CssProperties\Properties\Background_Color_Property_Mapper;
use ElementorEditorTesting\Elementor_Test_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * PHPUnit Tests for Background Color Property Mapper
 * 
 * Tests atomic widget compliance for Color_Prop_Type structure
 * Validates background-color property with various color formats
 * 
 * @group css-converter
 * @group background-color-mapper
 */
class Test_Background_Color_Property_Mapper extends Elementor_Test_Base {

	private Background_Color_Property_Mapper $mapper;

	public function setUp(): void {
		parent::setUp();
		
		$this->mapper = new Background_Color_Property_Mapper();
	}

	private function assert_atomic_structure( array $result, string $expected_value ): void {
		$this->assertNotNull( $result );
		$this->assertEquals( 'color', $result['$$type'] );
		$this->assertEquals( $expected_value, $result['value'] );
	}

	public function test_supports_background_color_property(): void {
		$this->assertTrue( $this->mapper->is_supported_property( 'background-color' ) );
		$this->assertFalse( $this->mapper->is_supported_property( 'color' ) );
		$this->assertFalse( $this->mapper->is_supported_property( 'border-color' ) );
	}

	public function test_get_supported_properties(): void {
		$expected_properties = [
			'background-color',
		];
		
		$this->assertEquals( $expected_properties, $this->mapper->get_supported_properties() );
	}

	public function test_hex_colors(): void {
		$hex_colors = [
			'short_hex' => ['input' => '#fff', 'expected' => '#ffffff'],
			'short_hex_lowercase' => ['input' => '#abc', 'expected' => '#aabbcc'],
			'short_hex_uppercase' => ['input' => '#ABC', 'expected' => '#aabbcc'],
			'long_hex_lowercase' => ['input' => '#ff0000', 'expected' => '#ff0000'],
			'long_hex_uppercase' => ['input' => '#FF0000', 'expected' => '#ff0000'],
			'long_hex_mixed' => ['input' => '#Ff00Aa', 'expected' => '#ff00aa'],
		];

		foreach ( $hex_colors as $case_name => $case_data ) {
			$result = $this->mapper->map_to_v4_atomic( 'background-color', $case_data['input'] );
			
			$this->assert_atomic_structure( $result, $case_data['expected'] );
		}
	}

	public function test_rgb_colors(): void {
		$rgb_colors = [
			'rgb_integers' => ['input' => 'rgb(255, 0, 0)', 'expected' => '#ff0000'],
			'rgb_with_spaces' => ['input' => 'rgb( 255 , 0 , 0 )', 'expected' => '#ff0000'],
			'rgb_no_spaces' => ['input' => 'rgb(255,0,0)', 'expected' => '#ff0000'],
			'rgb_mixed_values' => ['input' => 'rgb(128, 64, 192)', 'expected' => '#8040c0'],
		];

		foreach ( $rgb_colors as $case_name => $case_data ) {
			$result = $this->mapper->map_to_v4_atomic( 'background-color', $case_data['input'] );
			
			$this->assert_atomic_structure( $result, $case_data['expected'] );
		}
	}

	public function test_rgba_colors(): void {
		$rgba_colors = [
			'rgba_full_opacity' => ['input' => 'rgba(255, 0, 0, 1)', 'expected' => '#ff0000'],
			'rgba_half_opacity' => ['input' => 'rgba(255, 0, 0, 0.5)', 'expected' => '#ff000080'],
			'rgba_zero_opacity' => ['input' => 'rgba(255, 0, 0, 0)', 'expected' => '#ff000000'],
			'rgba_decimal_opacity' => ['input' => 'rgba(128, 128, 128, 0.75)', 'expected' => '#808080bf'],
		];

		foreach ( $rgba_colors as $case_name => $case_data ) {
			$result = $this->mapper->map_to_v4_atomic( 'background-color', $case_data['input'] );
			
			$this->assert_atomic_structure( $result, $case_data['expected'] );
		}
	}

	public function test_named_colors(): void {
		$named_colors = [
			'red' => '#ff0000',
			'green' => '#008000',
			'blue' => '#0000ff',
			'white' => '#ffffff',
			'black' => '#000000',
			'transparent' => 'transparent',
		];

		foreach ( $named_colors as $named_color => $expected_hex ) {
			$result = $this->mapper->map_to_v4_atomic( 'background-color', $named_color );
			
			$this->assert_atomic_structure( $result, $expected_hex );
		}
	}

	public function test_css_keywords(): void {
		$keywords = [
			'inherit',
			'initial',
			'unset',
			'revert',
			'currentColor',
		];

		foreach ( $keywords as $keyword ) {
			$result = $this->mapper->map_to_v4_atomic( 'background-color', $keyword );
			
			$this->assert_atomic_structure( $result, $keyword );
		}
	}

	public function test_invalid_colors(): void {
		$invalid_colors = [
			'empty_string' => '',
			'whitespace_only' => '   ',
			'invalid_hex_short' => '#gg',
			'invalid_hex_long' => '#gggggg',
			'invalid_rgb' => 'rgb(256, 0, 0)',
			'invalid_rgba' => 'rgba(255, 0, 0, 2)',
			'invalid_format' => 'color(255, 0, 0)',
			'invalid_keyword' => 'invalid',
		];

		foreach ( $invalid_colors as $case_name => $color ) {
			$result = $this->mapper->map_to_v4_atomic( 'background-color', $color );
			$this->assertNull( 
				$result, 
				"Should be null for case: $case_name with invalid color: '$color'"
			);
		}
	}

	public function test_whitespace_handling(): void {
		$whitespace_colors = [
			'  #ff0000  ',
			"\t#00ff00\n",
			' rgb(0, 0, 255) ',
			'  red  ',
		];

		$expected_colors = [
			'#ff0000',
			'#00ff00',
			'#0000ff',
			'#ff0000',
		];

		foreach ( $whitespace_colors as $index => $color ) {
			$result = $this->mapper->map_to_v4_atomic( 'background-color', $color );
			$this->assert_atomic_structure( $result, $expected_colors[$index] );
		}
	}

	public function test_unsupported_property(): void {
		$result = $this->mapper->map_to_v4_atomic( 'color', '#ff0000' );
		$this->assertNull( $result );
	}

	public function test_non_string_value(): void {
		$invalid_types = [
			'integer' => 123,
			'array' => [],
			'null' => null,
			'boolean' => true,
			'float' => 12.5,
		];

		foreach ( $invalid_types as $type_name => $value ) {
			$result = $this->mapper->map_to_v4_atomic( 'background-color', $value );
			$this->assertNull( 
				$result, 
				"Should be null for $type_name type: " . var_export( $value, true )
			);
		}
	}

	public function test_atomic_widget_compliance(): void {
		$result = $this->mapper->map_to_v4_atomic( 'background-color', '#ff0000' );
		
		// Verify exact atomic widget structure
		$this->assertEquals( 'color', $result['$$type'] );
		$this->assertIsString( $result['value'] );
		$this->assertEquals( '#ff0000', $result['value'] );
		
		// Verify structure matches Color_Prop_Type expectations
		$this->assertArrayHasKey( '$$type', $result );
		$this->assertArrayHasKey( 'value', $result );
		$this->assertCount( 2, $result );
	}

	public function test_color_normalization(): void {
		// Test that colors are normalized to lowercase hex format
		$normalization_cases = [
			'uppercase_hex' => ['input' => '#FF0000', 'expected' => '#ff0000'],
			'mixed_case_hex' => ['input' => '#Ff00Aa', 'expected' => '#ff00aa'],
			'short_hex_expansion' => ['input' => '#f0a', 'expected' => '#ff00aa'],
			'rgb_to_hex' => ['input' => 'rgb(255, 0, 0)', 'expected' => '#ff0000'],
			'named_to_hex' => ['input' => 'red', 'expected' => '#ff0000'],
		];

		foreach ( $normalization_cases as $case_name => $case_data ) {
			$result = $this->mapper->map_to_v4_atomic( 'background-color', $case_data['input'] );
			
			$this->assertNotNull( $result, "Failed for case: $case_name" );
			$this->assert_atomic_structure( $result, $case_data['expected'] );
		}
	}
}
