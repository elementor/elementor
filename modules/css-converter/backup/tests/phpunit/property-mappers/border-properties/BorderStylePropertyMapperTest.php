<?php

namespace Elementor\Modules\CssConverter\Tests\PropertyMappers\BorderProperties;

use Elementor\Modules\CssConverter\Tests\PropertyMappers\AtomicWidgetComplianceTestCase;
use Elementor\Modules\CssConverter\Convertors\CssProperties\Properties\Border_Style_Property_Mapper;

class BorderStylePropertyMapperTest extends AtomicWidgetComplianceTestCase {
    
    private Border_Style_Property_Mapper $mapper;
    
    protected function setUp(): void {
        parent::setUp();
        $this->mapper = new Border_Style_Property_Mapper();
    }
    
    /**
     * @test
     */
    public function it_has_universal_mapper_compliance(): void {
        $result = $this->mapper->map_to_v4_atomic('border-style', 'solid');
        
        $this->assertUniversalMapperCompliance($result, 'string');
        $this->assertValidStringPropType($result);
    }
    
    /**
     * @test
     */
    public function it_supports_all_border_style_properties(): void {
        $properties = [
            'border-style',
            'border-top-style',
            'border-right-style',
            'border-bottom-style',
            'border-left-style'
        ];
        
        foreach ($properties as $property) {
            $result = $this->mapper->map_to_v4_atomic($property, 'solid');
            
            $this->assertUniversalMapperCompliance($result, 'string');
            $this->assertValidStringPropType($result);
        }
    }
    
    /**
     * @test
     */
    public function it_supports_all_valid_border_styles(): void {
        $validStyles = [
            'none', 'solid', 'dashed', 'dotted', 'double',
            'groove', 'ridge', 'inset', 'outset'
        ];
        
        foreach ($validStyles as $style) {
            $result = $this->mapper->map_to_v4_atomic('border-style', $style);
            
            $this->assertUniversalMapperCompliance($result, 'string');
            $this->assertValidStringPropType($result);
            $this->assertEquals($style, $result['value']);
        }
    }
    
    /**
     * @test
     */
    public function it_supports_border_style_shorthand(): void {
        $shorthandTests = [
            'solid' => 'solid', // Single value
            'solid dashed' => 'solid', // Two values - returns first
            'solid dashed dotted' => 'solid', // Three values - returns first
            'solid dashed dotted double' => 'solid', // Four values - returns first
        ];
        
        foreach ($shorthandTests as $input => $expected) {
            $result = $this->mapper->map_to_v4_atomic('border-style', $input);
            
            $this->assertUniversalMapperCompliance($result, 'string');
            $this->assertValidStringPropType($result);
            $this->assertEquals($expected, $result['value']);
        }
    }
    
    /**
     * @test
     */
    public function it_handles_individual_border_style_properties(): void {
        $individualTests = [
            'border-top-style' => 'solid',
            'border-right-style' => 'dashed',
            'border-bottom-style' => 'dotted',
            'border-left-style' => 'double',
        ];
        
        foreach ($individualTests as $property => $style) {
            $result = $this->mapper->map_to_v4_atomic($property, $style);
            
            $this->assertUniversalMapperCompliance($result, 'string');
            $this->assertValidStringPropType($result);
            $this->assertEquals($style, $result['value']);
        }
    }
    
    /**
     * @test
     */
    public function it_handles_css_parsing_edge_cases(): void {
        $edgeCases = [
            'SOLID' => 'solid', // Case normalization
            '  dashed  ' => 'dashed', // Whitespace
            'Dotted' => 'dotted', // Mixed case
            
            // Invalid values
            'invalid-style' => null,
            'wavy' => null, // Not in valid styles list
            'inherit' => null,
            '' => null,
        ];
        
        foreach ($edgeCases as $input => $expected) {
            $result = $this->mapper->map_to_v4_atomic('border-style', $input);
            
            if ($expected === null) {
                $this->assertNull($result);
            } else {
                $this->assertUniversalMapperCompliance($result, 'string');
                $this->assertValidStringPropType($result);
                $this->assertEquals($expected, $result['value']);
            }
        }
    }
    
    /**
     * @test
     */
    public function it_validates_shorthand_limits(): void {
        $shorthandLimitTests = [
            'solid dashed dotted double groove' => null, // Too many values (5)
            'solid dashed dotted double' => 'solid', // Valid (4)
            'solid invalid-style' => null, // Invalid style in shorthand
        ];
        
        foreach ($shorthandLimitTests as $input => $expected) {
            $result = $this->mapper->map_to_v4_atomic('border-style', $input);
            
            if ($expected === null) {
                $this->assertNull($result);
            } else {
                $this->assertUniversalMapperCompliance($result, 'string');
                $this->assertValidStringPropType($result);
                $this->assertEquals($expected, $result['value']);
            }
        }
    }
    
    /**
     * @test
     */
    public function it_correctly_identifies_supported_properties(): void {
        $this->assertTrue($this->mapper->supports('border-style', 'solid'));
        $this->assertTrue($this->mapper->supports('border-top-style', 'dashed'));
        $this->assertFalse($this->mapper->supports('border-width', 'solid'));
        $this->assertFalse($this->mapper->supports('border-style', 'invalid-value'));
    }
    
    /**
     * @test
     */
    public function it_returns_exact_string_structure(): void {
        $result = $this->mapper->map_to_v4_atomic('border-style', 'solid');
        
        $this->assertIsArray($result);
        $this->assertArrayHasKey('$$type', $result);
        $this->assertArrayHasKey('value', $result);
        $this->assertEquals('string', $result['$$type']);
        $this->assertIsString($result['value']);
        $this->assertEquals('solid', $result['value']);
    }
    
    /**
     * @test
     */
    public function it_supports_complete_css_parsing(): void {
        $this->assertCompleteCssParsingSupport($this->mapper, 'border-style', 'string');
    }
}
