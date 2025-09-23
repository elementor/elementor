<?php

namespace Elementor\Modules\CssConverter\Tests\PropertyMappers\ColorProperties;

use Elementor\Modules\CssConverter\Tests\PropertyMappers\AtomicWidgetComplianceTestCase;
use Elementor\Modules\CssConverter\Convertors\CssProperties\Properties\Color_Property_Mapper;

/**
 * Test color property mapper for ALL potential issues
 * 
 * This test will identify ALL bugs in the mapper:
 * 1. Base class method usage issues
 * 2. Type correctness problems  
 * 3. CSS parsing completeness
 * 4. Atomic widget compliance
 */
class ColorPropertyMapperTest extends AtomicWidgetComplianceTestCase {
    
    private Color_Property_Mapper $mapper;
    
    protected function setUp(): void {
        parent::setUp();
        $this->mapper = new Color_Property_Mapper();
    }
    
    /**
     * @test
     * Universal compliance test - will identify ALL critical issues
     */
    public function it_has_universal_mapper_compliance(): void {
        $result = $this->mapper->map_to_v4_atomic('color', '#ff0000');
        
        // This will catch ALL common errors:
        // 1. Wrong base class method usage
        // 2. Incorrect data types
        // 3. Missing atomic widget structure
        $this->assertUniversalMapperCompliance($result, 'color');
        
        // Specific validation
        $this->assertEquals('#ff0000', $result['value']);
    }
    
    /**
     * @test
     * Test all color format support and normalization
     */
    public function it_supports_all_color_formats_with_normalization(): void {
        $colorTests = [
            // Hex colors
            '#fff' => '#ffffff', // 3-digit hex expansion
            '#FFF' => '#ffffff', // Case normalization
            '#ffffff' => '#ffffff', // 6-digit hex
            '#FFFFFF' => '#ffffff', // Case normalization
            '#ff000080' => '#ff000080', // 8-digit hex with alpha
            
            // RGB colors (converted to hex)
            'rgb(255, 0, 0)' => '#ff0000',
            'rgb(255,0,0)' => '#ff0000', // No spaces
            'rgb( 255 , 0 , 0 )' => '#ff0000', // Extra spaces
            'rgb(128, 128, 128)' => '#808080',
            
            // RGBA colors
            'rgba(255, 0, 0, 1)' => '#ff0000', // Full opacity -> hex
            'rgba(255, 0, 0, 0.5)' => '#ff000080', // Half opacity -> hexa
            'rgba(255,0,0,0.25)' => '#ff000040', // Quarter opacity
            
            // HSL colors (preserved)
            'hsl(0, 100%, 50%)' => 'hsl(0, 100%, 50%)',
            'HSL(120, 100%, 50%)' => 'hsl(120, 100%, 50%)', // Case normalization
            
            // Named colors
            'red' => 'red',
            'RED' => 'red', // Case normalization
            'white' => 'white',
            'black' => 'black',
            'transparent' => 'transparent', // Not in named colors list - should fail
        ];
        
        foreach ($colorTests as $input => $expected) {
            $result = $this->mapper->map_to_v4_atomic('color', $input);
            
            if ($input === 'transparent') {
                // transparent is not in the named colors list, should fail
                $this->assertNull($result, "Should reject 'transparent' as it's not in named colors list");
                continue;
            }
            
            $this->assertUniversalMapperCompliance($result, 'color');
            $this->assertEquals($expected, $result['value'],
                "Failed to normalize color format: '{$input}' -> expected '{$expected}'");
        }
    }
    
    /**
     * @test
     * Test RGB/RGBA validation strictness
     */
    public function it_validates_rgb_values_strictly(): void {
        $validationTests = [
            // Valid RGB values
            'rgb(0, 0, 0)' => '#000000',
            'rgb(255, 255, 255)' => '#ffffff',
            'rgb(128, 64, 192)' => '#8040c0',
            
            // Invalid RGB values (should be rejected)
            'rgb(256, 0, 0)' => null, // Over 255
            'rgb(-1, 0, 0)' => null, // Under 0
            'rgb(255, 256, 0)' => null, // G over 255
            'rgb(255, 0, -1)' => null, // B under 0
            
            // Valid RGBA values
            'rgba(255, 0, 0, 1)' => '#ff0000',
            'rgba(255, 0, 0, 0)' => '#ff000000',
            'rgba(255, 0, 0, 0.5)' => '#ff000080',
            
            // Invalid RGBA values (should be rejected)
            'rgba(255, 0, 0, 1.1)' => null, // Alpha over 1
            'rgba(255, 0, 0, -0.1)' => null, // Alpha under 0
            'rgba(256, 0, 0, 0.5)' => null, // RGB over 255
        ];
        
        foreach ($validationTests as $input => $expected) {
            $result = $this->mapper->map_to_v4_atomic('color', $input);
            
            if ($expected === null) {
                $this->assertNull($result, 
                    "Should reject invalid color value: '{$input}'");
            } else {
                $this->assertUniversalMapperCompliance($result, 'color');
                $this->assertEquals($expected, $result['value'],
                    "Failed to handle valid color: '{$input}' -> expected '{$expected}'");
            }
        }
    }
    
    /**
     * @test
     * Test CSS parsing completeness - edge cases
     */
    public function it_handles_css_parsing_edge_cases(): void {
        $edgeCases = [
            // Whitespace handling
            '  #ff0000  ' => '#ff0000',
            ' red ' => 'red',
            
            // Invalid values that should be rejected
            'invalid-color' => null,
            '#gg0000' => null, // Invalid hex characters
            'rgb(255, 0)' => null, // Missing blue value
            'rgba(255, 0, 0)' => null, // Missing alpha
            'hsl(360, 101%, 50%)' => null, // Invalid HSL values
            '' => null,
            'inherit' => null, // CSS keywords not supported
            'initial' => null,
            'unset' => null,
            'currentColor' => null,
        ];
        
        foreach ($edgeCases as $input => $expected) {
            $result = $this->mapper->map_to_v4_atomic('color', $input);
            
            if ($expected === null) {
                $this->assertNull($result, 
                    "Should reject invalid color value: '{$input}'");
            } else {
                $this->assertUniversalMapperCompliance($result, 'color');
                $this->assertEquals($expected, $result['value'],
                    "Failed to handle edge case: '{$input}' -> expected '{$expected}'");
            }
        }
    }
    
    /**
     * @test
     * Test alpha channel handling in RGBA to hex conversion
     */
    public function it_handles_alpha_channel_correctly(): void {
        $alphaTests = [
            'rgba(255, 0, 0, 1)' => '#ff0000', // Full opacity -> 6-digit hex
            'rgba(255, 0, 0, 0.5)' => '#ff000080', // 50% opacity -> 8-digit hex
            'rgba(255, 0, 0, 0.25)' => '#ff000040', // 25% opacity
            'rgba(255, 0, 0, 0.75)' => '#ff0000bf', // 75% opacity
            'rgba(255, 0, 0, 0)' => '#ff000000', // Fully transparent
        ];
        
        foreach ($alphaTests as $input => $expected) {
            $result = $this->mapper->map_to_v4_atomic('color', $input);
            
            $this->assertUniversalMapperCompliance($result, 'color');
            $this->assertEquals($expected, $result['value'],
                "Failed to handle alpha channel: '{$input}' -> expected '{$expected}'");
        }
    }
    
    /**
     * @test
     * Test property support detection
     */
    public function it_correctly_identifies_supported_properties(): void {
        $this->assertTrue($this->mapper->supports('color', '#ff0000'));
        $this->assertFalse($this->mapper->supports('background-color', '#ff0000')); // Different property
        $this->assertFalse($this->mapper->supports('color', 'invalid-color'));
    }
    
    /**
     * @test
     * Test return structure consistency
     */
    public function it_returns_consistent_structure(): void {
        $result = $this->mapper->map_to_v4_atomic('color', '#ff0000');
        
        // Check the exact structure returned
        $this->assertIsArray($result);
        $this->assertArrayHasKey('$$type', $result);
        $this->assertArrayHasKey('value', $result);
        $this->assertEquals('color', $result['$$type']);
        $this->assertEquals('#ff0000', $result['value']);
    }
    
    /**
     * @test
     * Test comprehensive CSS parsing support
     */
    public function it_supports_complete_css_parsing(): void {
        // Test comprehensive parsing for color
        $this->assertCompleteCssParsingSupport($this->mapper, 'color', 'color');
    }
}
