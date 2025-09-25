<?php

namespace Elementor\Modules\CssConverter\Tests\PropertyMappers\DimensionsProperties;

use Elementor\Modules\CssConverter\Tests\PropertyMappers\AtomicWidgetComplianceTestCase;
use Elementor\Modules\CssConverter\Convertors\CssProperties\Properties\Padding_Property_Mapper;

class PaddingPropertyMapperTest extends AtomicWidgetComplianceTestCase {
    
    private Padding_Property_Mapper $mapper;
    
    protected function setUp(): void {
        parent::setUp();
        $this->mapper = new Padding_Property_Mapper();
    }
    
    /**
     * @test
     */
    public function it_has_universal_mapper_compliance(): void {
        $result = $this->mapper->map_to_v4_atomic('padding', '10px');
        
        $this->assertUniversalMapperCompliance($result, 'dimensions');
        $this->assertValidDimensionsPropType($result);
    }
    
    /**
     * @test
     */
    public function it_supports_all_padding_properties(): void {
        $properties = [
            'padding',
            'padding-top',
            'padding-right', 
            'padding-bottom',
            'padding-left'
        ];
        
        foreach ($properties as $property) {
            $result = $this->mapper->map_to_v4_atomic($property, '10px');
            
            $this->assertUniversalMapperCompliance($result, 'dimensions');
            $this->assertValidDimensionsPropType($result);
        }
    }
    
    /**
     * @test
     */
    public function it_supports_padding_shorthand_variations(): void {
        $shorthandTests = [
            // 1 value: all sides
            '10px' => [10, 10, 10, 10],
            // 2 values: vertical, horizontal
            '10px 20px' => [10, 20, 10, 20],
            // 3 values: top, horizontal, bottom
            '10px 20px 30px' => [10, 20, 30, 20],
            // 4 values: top, right, bottom, left
            '10px 20px 30px 40px' => [10, 20, 30, 40],
        ];
        
        foreach ($shorthandTests as $input => $expected) {
            $result = $this->mapper->map_to_v4_atomic('padding', $input);
            
            $this->assertUniversalMapperCompliance($result, 'dimensions');
            $this->assertValidDimensionsPropType($result);
            
            // Validate specific values match expected shorthand parsing
            $directions = ['block-start', 'inline-end', 'block-end', 'inline-start'];
            foreach ($directions as $index => $direction) {
                if (isset($result['value'][$direction])) {
                    $this->assertEquals($expected[$index], $result['value'][$direction]['value']['size']);
                    $this->assertEquals('px', $result['value'][$direction]['value']['unit']);
                }
            }
        }
    }
    
    /**
     * @test
     */
    public function it_supports_individual_padding_properties(): void {
        $individualTests = [
            'padding-top' => 'block-start',
            'padding-right' => 'inline-end', 
            'padding-bottom' => 'block-end',
            'padding-left' => 'inline-start',
        ];
        
        foreach ($individualTests as $property => $expectedDirection) {
            $result = $this->mapper->map_to_v4_atomic($property, '15px');
            
            $this->assertUniversalMapperCompliance($result, 'dimensions');
            $this->assertValidDimensionsPropType($result);
            
            // Should only have the specific direction set
            $this->assertArrayHasKey($expectedDirection, $result['value']);
            $this->assertEquals(15, $result['value'][$expectedDirection]['value']['size']);
            $this->assertEquals('px', $result['value'][$expectedDirection]['value']['unit']);
        }
    }
    
    /**
     * @test
     */
    public function it_supports_various_units(): void {
        $unitTests = [
            '16px' => ['size' => 16, 'unit' => 'px'],
            '1.5em' => ['size' => 1.5, 'unit' => 'em'],
            '2rem' => ['size' => 2, 'unit' => 'rem'],
            '10%' => ['size' => 10, 'unit' => '%'],
            '5vh' => ['size' => 5, 'unit' => 'vh'],
            '3vw' => ['size' => 3, 'unit' => 'vw'],
        ];
        
        foreach ($unitTests as $input => $expected) {
            $result = $this->mapper->map_to_v4_atomic('padding-top', $input);
            
            $this->assertUniversalMapperCompliance($result, 'dimensions');
            $this->assertValidDimensionsPropType($result);
            $this->assertEquals($expected['size'], $result['value']['block-start']['value']['size']);
            $this->assertEquals($expected['unit'], $result['value']['block-start']['value']['unit']);
        }
    }
    
    /**
     * @test
     */
    public function it_handles_css_parsing_edge_cases(): void {
        $edgeCases = [
            '  10px  ' => ['size' => 10, 'unit' => 'px'], // Whitespace
            '0' => ['size' => 0, 'unit' => 'px'], // Zero without unit
            
            // Invalid values
            'invalid-padding' => null,
            'auto' => null, // Not valid for padding
            '' => null,
        ];
        
        foreach ($edgeCases as $input => $expected) {
            $result = $this->mapper->map_to_v4_atomic('padding-top', $input);
            
            if ($expected === null) {
                $this->assertNull($result);
            } else {
                $this->assertUniversalMapperCompliance($result, 'dimensions');
                $this->assertValidDimensionsPropType($result);
                $this->assertEquals($expected['size'], $result['value']['block-start']['value']['size']);
                $this->assertEquals($expected['unit'], $result['value']['block-start']['value']['unit']);
            }
        }
    }
    
    /**
     * @test
     */
    public function it_correctly_identifies_supported_properties(): void {
        $this->assertTrue($this->mapper->supports('padding', '10px'));
        $this->assertTrue($this->mapper->supports('padding-top', '10px'));
        $this->assertFalse($this->mapper->supports('margin', '10px'));
        $this->assertFalse($this->mapper->supports('padding', 'invalid-value'));
    }
    
    /**
     * @test
     */
    public function it_returns_exact_dimensions_structure(): void {
        $result = $this->mapper->map_to_v4_atomic('padding', '10px 20px');
        
        $this->assertIsArray($result);
        $this->assertArrayHasKey('$$type', $result);
        $this->assertArrayHasKey('value', $result);
        $this->assertEquals('dimensions', $result['$$type']);
        
        // Validate exact structure for dimensions
        $this->assertIsArray($result['value']);
        $requiredDirections = ['block-start', 'inline-end', 'block-end', 'inline-start'];
        
        foreach ($requiredDirections as $direction) {
            $this->assertArrayHasKey($direction, $result['value']);
            $this->assertIsArray($result['value'][$direction]);
            $this->assertArrayHasKey('$$type', $result['value'][$direction]);
            $this->assertArrayHasKey('value', $result['value'][$direction]);
            $this->assertEquals('size', $result['value'][$direction]['$$type']);
            
            $sizeValue = $result['value'][$direction]['value'];
            $this->assertIsArray($sizeValue);
            $this->assertArrayHasKey('size', $sizeValue);
            $this->assertArrayHasKey('unit', $sizeValue);
            $this->assertIsNumeric($sizeValue['size']);
            $this->assertIsString($sizeValue['unit']);
        }
    }
    
    /**
     * @test
     */
    public function it_supports_complete_css_parsing(): void {
        $this->assertCompleteCssParsingSupport($this->mapper, 'padding', 'dimensions');
    }
}
