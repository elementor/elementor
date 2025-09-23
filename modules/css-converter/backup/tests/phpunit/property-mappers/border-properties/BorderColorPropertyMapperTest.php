<?php

namespace Elementor\Modules\CssConverter\Tests\PropertyMappers\BorderProperties;

use Elementor\Modules\CssConverter\Tests\PropertyMappers\AtomicWidgetComplianceTestCase;
use Elementor\Modules\CssConverter\Convertors\CssProperties\Properties\Border_Color_Property_Mapper;

class BorderColorPropertyMapperTest extends AtomicWidgetComplianceTestCase {
    
    private Border_Color_Property_Mapper $mapper;
    
    protected function setUp(): void {
        parent::setUp();
        $this->mapper = new Border_Color_Property_Mapper();
    }
    
    /**
     * @test
     */
    public function it_has_universal_mapper_compliance(): void {
        $result = $this->mapper->map_to_v4_atomic('border-color', '#ff0000');
        
        $this->assertUniversalMapperCompliance($result, 'color');
        $this->assertValidColorPropType($result);
    }
    
    /**
     * @test
     */
    public function it_supports_all_border_color_properties(): void {
        $properties = [
            'border-color',
            'border-top-color',
            'border-right-color',
            'border-bottom-color',
            'border-left-color'
        ];
        
        foreach ($properties as $property) {
            $result = $this->mapper->map_to_v4_atomic($property, '#ff0000');
            
            $this->assertUniversalMapperCompliance($result, 'color');
            $this->assertValidColorPropType($result);
        }
    }
    
    /**
     * @test
     */
    public function it_supports_hex_color_formats(): void {
        $hexTests = [
            '#f00' => '#ff0000', // 3-digit hex
            '#ff0000' => '#ff0000', // 6-digit hex
            '#FF0000' => '#ff0000', // Uppercase normalization
            '#ff000080' => '#ff000080', // 8-digit hex with alpha
        ];
        
        foreach ($hexTests as $input => $expected) {
            $result = $this->mapper->map_to_v4_atomic('border-color', $input);
            
            $this->assertUniversalMapperCompliance($result, 'color');
            $this->assertValidColorPropType($result);
            $this->assertEquals($expected, $result['value']);
        }
    }
    
    /**
     * @test
     */
    public function it_supports_rgb_and_rgba_formats(): void {
        $rgbTests = [
            'rgb(255, 0, 0)' => '#ff0000',
            'rgb(0, 255, 0)' => '#00ff00',
            'rgba(255, 0, 0, 0.5)' => 'rgba(255, 0, 0, 0.5)',
            'rgba(0, 0, 255, 1)' => '#0000ff', // Full opacity converts to hex
        ];
        
        foreach ($rgbTests as $input => $expected) {
            $result = $this->mapper->map_to_v4_atomic('border-color', $input);
            
            $this->assertUniversalMapperCompliance($result, 'color');
            $this->assertValidColorPropType($result);
            $this->assertEquals($expected, $result['value']);
        }
    }
    
    /**
     * @test
     */
    public function it_supports_named_colors(): void {
        $namedColorTests = [
            'red' => '#ff0000',
            'blue' => '#0000ff',
            'green' => '#008000',
            'white' => '#ffffff',
            'black' => '#000000',
            'transparent' => 'transparent',
        ];
        
        foreach ($namedColorTests as $input => $expected) {
            $result = $this->mapper->map_to_v4_atomic('border-color', $input);
            
            $this->assertUniversalMapperCompliance($result, 'color');
            $this->assertValidColorPropType($result);
            $this->assertEquals($expected, $result['value']);
        }
    }
    
    /**
     * @test
     */
    public function it_handles_border_color_shorthand(): void {
        $shorthandTests = [
            '#ff0000' => '#ff0000', // Single color
            '#ff0000 #00ff00' => '#ff0000', // Two colors - returns first
            '#ff0000 #00ff00 #0000ff' => '#ff0000', // Three colors - returns first
            '#ff0000 #00ff00 #0000ff #ffff00' => '#ff0000', // Four colors - returns first
        ];
        
        foreach ($shorthandTests as $input => $expected) {
            $result = $this->mapper->map_to_v4_atomic('border-color', $input);
            
            $this->assertUniversalMapperCompliance($result, 'color');
            $this->assertValidColorPropType($result);
            $this->assertEquals($expected, $result['value']);
        }
    }
    
    /**
     * @test
     */
    public function it_handles_css_parsing_edge_cases(): void {
        $edgeCases = [
            '  #ff0000  ' => '#ff0000', // Whitespace
            'RED' => '#ff0000', // Case normalization
            
            // Invalid values
            'invalid-color' => null,
            '#gg0000' => null, // Invalid hex
            'rgb(256, 0, 0)' => null, // Out of range RGB
            '' => null,
        ];
        
        foreach ($edgeCases as $input => $expected) {
            $result = $this->mapper->map_to_v4_atomic('border-color', $input);
            
            if ($expected === null) {
                $this->assertNull($result);
            } else {
                $this->assertUniversalMapperCompliance($result, 'color');
                $this->assertValidColorPropType($result);
                $this->assertEquals($expected, $result['value']);
            }
        }
    }
    
    /**
     * @test
     */
    public function it_correctly_identifies_supported_properties(): void {
        $this->assertTrue($this->mapper->supports('border-color', '#ff0000'));
        $this->assertTrue($this->mapper->supports('border-top-color', 'red'));
        $this->assertFalse($this->mapper->supports('color', '#ff0000'));
        $this->assertFalse($this->mapper->supports('border-color', 'invalid-value'));
    }
    
    /**
     * @test
     */
    public function it_returns_exact_color_structure(): void {
        $result = $this->mapper->map_to_v4_atomic('border-color', '#ff0000');
        
        $this->assertIsArray($result);
        $this->assertArrayHasKey('$$type', $result);
        $this->assertArrayHasKey('value', $result);
        $this->assertEquals('color', $result['$$type']);
        $this->assertIsString($result['value']);
        $this->assertEquals('#ff0000', $result['value']);
    }
    
    /**
     * @test
     */
    public function it_supports_complete_css_parsing(): void {
        $this->assertCompleteCssParsingSupport($this->mapper, 'border-color', 'color');
    }
}
