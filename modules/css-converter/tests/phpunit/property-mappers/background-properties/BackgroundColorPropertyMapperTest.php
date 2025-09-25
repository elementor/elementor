<?php

namespace Elementor\Modules\CssConverter\Tests\PropertyMappers\BackgroundProperties;

use Elementor\Modules\CssConverter\Tests\PropertyMappers\AtomicWidgetComplianceTestCase;
use Elementor\Modules\CssConverter\Convertors\CssProperties\Properties\Background_Color_Property_Mapper;

/**
 * Test background-color property mapper for ALL potential issues
 * 
 * This test will identify ALL bugs in the mapper:
 * 1. Base class method usage issues
 * 2. Type correctness problems  
 * 3. CSS parsing completeness
 * 4. Atomic widget compliance
 */
class BackgroundColorPropertyMapperTest extends AtomicWidgetComplianceTestCase {
    
    private Background_Color_Property_Mapper $mapper;
    
    protected function setUp(): void {
        parent::setUp();
        $this->mapper = new Background_Color_Property_Mapper();
    }
    
    /**
     * @test
     * Universal compliance test - will identify ALL critical issues
     */
    public function it_has_universal_mapper_compliance(): void {
        $result = $this->mapper->map_to_v4_atomic('background-color', '#ff0000');
        
        // This will catch ALL common errors:
        // 1. Wrong base class method usage
        // 2. Incorrect data types
        // 3. Missing atomic widget structure
        $this->assertUniversalMapperCompliance($result, 'background');
        
        // Specific validation for background structure
        $this->assertArrayHasKey('color', $result['value']);
        $this->assertEquals('color', $result['value']['color']['$$type']);
        $this->assertEquals('#ff0000', $result['value']['color']['value']);
    }
    
    /**
     * @test
     * Test all color format support
     */
    public function it_supports_all_color_formats(): void {
        $colorTests = [
            // Hex colors
            '#fff' => '#ffffff', // 3-digit hex expansion
            '#ffffff' => '#ffffff', // 6-digit hex
            '#ff000080' => '#ff000080', // 8-digit hex with alpha
            
            // RGB colors
            'rgb(255, 0, 0)' => '#ff0000', // RGB to hex conversion
            'rgb(255,0,0)' => '#ff0000', // No spaces
            'rgb( 255 , 0 , 0 )' => '#ff0000', // Extra spaces
            
            // RGBA colors
            'rgba(255, 0, 0, 0.5)' => '#ff0000', // RGBA to hex (alpha ignored)
            'rgba(255,0,0,1)' => '#ff0000', // Full opacity
            
            // HSL colors
            'hsl(0, 100%, 50%)' => 'hsl(0, 100%, 50%)', // HSL preserved
            
            // Named colors
            'red' => 'red',
            'transparent' => 'transparent',
            'white' => 'white',
            'black' => 'black',
        ];
        
        foreach ($colorTests as $input => $expected) {
            $result = $this->mapper->map_to_v4_atomic('background-color', $input);
            
            $this->assertUniversalMapperCompliance($result, 'background');
            $this->assertEquals($expected, $result['value']['color']['value'],
                "Failed to handle color format: '{$input}' -> expected '{$expected}'");
        }
    }
    
    /**
     * @test
     * Test CSS parsing completeness - edge cases and invalid values
     */
    public function it_handles_css_parsing_edge_cases(): void {
        $edgeCases = [
            // Case sensitivity
            '#FF0000' => '#ff0000',
            'RED' => 'red',
            'RGB(255,0,0)' => '#ff0000',
            
            // Whitespace handling
            '  #ff0000  ' => '#ff0000',
            ' red ' => 'red',
            
            // Invalid values that should be rejected
            'invalid-color' => null,
            '#gg0000' => null, // Invalid hex
            'rgb(256, 0, 0)' => '#ff0000', // Out of range RGB (should clamp)
            'rgb(-10, 0, 0)' => '#000000', // Negative RGB (should clamp)
            '' => null,
            'inherit' => null, // CSS keywords not in named colors
            'initial' => null,
            'unset' => null,
        ];
        
        foreach ($edgeCases as $input => $expected) {
            $result = $this->mapper->map_to_v4_atomic('background-color', $input);
            
            if ($expected === null) {
                $this->assertNull($result, 
                    "Should reject invalid background-color value: '{$input}'");
            } else {
                $this->assertUniversalMapperCompliance($result, 'background');
                $this->assertEquals($expected, $result['value']['color']['value'],
                    "Failed to normalize background-color value: '{$input}' -> '{$expected}'");
            }
        }
    }
    
    /**
     * @test
     * Test RGB value clamping
     */
    public function it_clamps_rgb_values_correctly(): void {
        $clampingTests = [
            'rgb(300, 0, 0)' => '#ff0000', // Over 255
            'rgb(-50, 0, 0)' => '#000000', // Under 0
            'rgb(128, 300, -10)' => '#80ff00', // Mixed clamping
        ];
        
        foreach ($clampingTests as $input => $expected) {
            $result = $this->mapper->map_to_v4_atomic('background-color', $input);
            
            $this->assertUniversalMapperCompliance($result, 'background');
            $this->assertEquals($expected, $result['value']['color']['value'],
                "Failed to clamp RGB values: '{$input}' -> expected '{$expected}'");
        }
    }
    
    /**
     * @test
     * Test property support detection
     */
    public function it_correctly_identifies_supported_properties(): void {
        $this->assertTrue($this->mapper->supports('background-color', '#ff0000'));
        $this->assertFalse($this->mapper->supports('color', '#ff0000')); // Different property
        $this->assertFalse($this->mapper->supports('background-color', 'invalid-color'));
    }
    
    /**
     * @test
     * Test v4 property name mapping
     */
    public function it_maps_to_correct_v4_property_name(): void {
        $this->assertEquals('background', $this->mapper->get_v4_property_name('background-color'));
    }
    
    /**
     * @test
     * Test return structure consistency
     */
    public function it_returns_consistent_structure(): void {
        $result = $this->mapper->map_to_v4_atomic('background-color', '#ff0000');
        
        // Check the exact structure returned
        $this->assertIsArray($result);
        $this->assertArrayHasKey('$$type', $result);
        $this->assertArrayHasKey('value', $result);
        $this->assertEquals('background', $result['$$type']);
        
        // Check background value structure
        $this->assertIsArray($result['value']);
        $this->assertArrayHasKey('color', $result['value']);
        
        // Check nested color structure
        $colorValue = $result['value']['color'];
        $this->assertIsArray($colorValue);
        $this->assertArrayHasKey('$$type', $colorValue);
        $this->assertArrayHasKey('value', $colorValue);
        $this->assertEquals('color', $colorValue['$$type']);
        $this->assertEquals('#ff0000', $colorValue['value']);
    }
    
    /**
     * @test
     * Test comprehensive CSS parsing support
     */
    public function it_supports_complete_css_parsing(): void {
        // Test comprehensive parsing for background-color
        $this->assertCompleteCssParsingSupport($this->mapper, 'background-color', 'background');
    }
}
