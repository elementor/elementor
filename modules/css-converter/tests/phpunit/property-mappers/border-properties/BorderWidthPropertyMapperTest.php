<?php

namespace Elementor\Modules\CssConverter\Tests\PropertyMappers\BorderProperties;

use Elementor\Modules\CssConverter\Tests\PropertyMappers\AtomicWidgetComplianceTestCase;
use Elementor\Modules\CssConverter\Convertors\CssProperties\Properties\Border_Width_Property_Mapper;

class BorderWidthPropertyMapperTest extends AtomicWidgetComplianceTestCase {
    
    private Border_Width_Property_Mapper $mapper;
    
    protected function setUp(): void {
        parent::setUp();
        $this->mapper = new Border_Width_Property_Mapper();
    }
    
    /**
     * @test
     */
    public function it_has_universal_mapper_compliance(): void {
        $result = $this->mapper->map_to_v4_atomic('border-width', '2px');
        
        $this->assertUniversalMapperCompliance($result, 'size');
    }
    
    /**
     * @test
     */
    public function it_supports_all_border_width_properties(): void {
        $properties = [
            'border-width',
            'border-top-width',
            'border-right-width',
            'border-bottom-width',
            'border-left-width'
        ];
        
        foreach ($properties as $property) {
            $result = $this->mapper->map_to_v4_atomic($property, '2px');
            
            $this->assertUniversalMapperCompliance($result, 'size');
        }
    }
    
    /**
     * @test
     */
    public function it_supports_size_values_with_units(): void {
        $sizeTests = [
            '1px' => ['size' => 1, 'unit' => 'px'],
            '2.5px' => ['size' => 2.5, 'unit' => 'px'],
            '0.5em' => ['size' => 0.5, 'unit' => 'em'],
            '1rem' => ['size' => 1, 'unit' => 'rem'],
            '5%' => ['size' => 5, 'unit' => '%'],
        ];
        
        foreach ($sizeTests as $input => $expected) {
            $result = $this->mapper->map_to_v4_atomic('border-top-width', $input);
            
            $this->assertUniversalMapperCompliance($result, 'size');
            $this->assertEquals($expected['size'], $result['value']['size']);
            $this->assertEquals($expected['unit'], $result['value']['unit']);
        }
    }
    
    /**
     * @test
     */
    public function it_supports_keyword_values(): void {
        $keywordTests = [
            'thin' => ['size' => 1, 'unit' => 'px'],
            'medium' => ['size' => 3, 'unit' => 'px'],
            'thick' => ['size' => 5, 'unit' => 'px'],
        ];
        
        foreach ($keywordTests as $input => $expected) {
            $result = $this->mapper->map_to_v4_atomic('border-top-width', $input);
            
            $this->assertUniversalMapperCompliance($result, 'size');
            $this->assertEquals($expected['size'], $result['value']['size']);
            $this->assertEquals($expected['unit'], $result['value']['unit']);
        }
    }
    
    /**
     * @test
     */
    public function it_handles_border_width_shorthand(): void {
        $shorthandTests = [
            '2px' => [2, 2, 2, 2], // All sides
            '1px 2px' => [1, 2, 1, 2], // Vertical, horizontal
            '1px 2px 3px' => [1, 2, 3, 2], // Top, horizontal, bottom
            '1px 2px 3px 4px' => [1, 2, 3, 4], // Top, right, bottom, left
        ];
        
        foreach ($shorthandTests as $input => $expected) {
            $result = $this->mapper->map_to_v4_atomic('border-width', $input);
            
            $this->assertUniversalMapperCompliance($result, 'size');
            
            // For shorthand, we expect the first value to be returned
            $this->assertEquals($expected[0], $result['value']['size']);
            $this->assertEquals('px', $result['value']['unit']);
        }
    }
    
    /**
     * @test
     */
    public function it_handles_css_parsing_edge_cases(): void {
        $edgeCases = [
            '  2px  ' => ['size' => 2, 'unit' => 'px'], // Whitespace
            '0' => ['size' => 0, 'unit' => 'px'], // Zero without unit
            'THIN' => ['size' => 1, 'unit' => 'px'], // Case normalization
            
            // Invalid values
            'invalid-width' => null,
            '-1px' => null, // Negative values
            'auto' => null, // Not valid for border-width
            '' => null,
        ];
        
        foreach ($edgeCases as $input => $expected) {
            $result = $this->mapper->map_to_v4_atomic('border-top-width', $input);
            
            if ($expected === null) {
                $this->assertNull($result);
            } else {
                $this->assertUniversalMapperCompliance($result, 'size');
                $this->assertEquals($expected['size'], $result['value']['size']);
                $this->assertEquals($expected['unit'], $result['value']['unit']);
            }
        }
    }
    
    /**
     * @test
     */
    public function it_correctly_identifies_supported_properties(): void {
        $this->assertTrue($this->mapper->supports('border-width', '2px'));
        $this->assertTrue($this->mapper->supports('border-top-width', 'thin'));
        $this->assertFalse($this->mapper->supports('border-color', '2px'));
        $this->assertFalse($this->mapper->supports('border-width', 'invalid-value'));
    }
    
    /**
     * @test
     */
    public function it_returns_consistent_structure(): void {
        $result = $this->mapper->map_to_v4_atomic('border-top-width', '2px');
        
        $this->assertIsArray($result);
        $this->assertArrayHasKey('$$type', $result);
        $this->assertArrayHasKey('value', $result);
        $this->assertEquals('size', $result['$$type']);
        
        $this->assertIsArray($result['value']);
        $this->assertArrayHasKey('size', $result['value']);
        $this->assertArrayHasKey('unit', $result['value']);
    }
    
    /**
     * @test
     */
    public function it_supports_complete_css_parsing(): void {
        $this->assertCompleteCssParsingSupport($this->mapper, 'border-width', 'size');
    }
}
