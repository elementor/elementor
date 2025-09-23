<?php

namespace Elementor\Modules\CssConverter\Tests\PropertyMappers\BorderProperties;

use Elementor\Modules\CssConverter\Tests\PropertyMappers\AtomicWidgetComplianceTestCase;
use Elementor\Modules\CssConverter\Convertors\CssProperties\Properties\Border_Radius_Property_Mapper;

class BorderRadiusPropertyMapperTest extends AtomicWidgetComplianceTestCase {
    
    private Border_Radius_Property_Mapper $mapper;
    
    protected function setUp(): void {
        parent::setUp();
        $this->mapper = new Border_Radius_Property_Mapper();
    }
    
    /**
     * @test
     */
    public function it_has_universal_mapper_compliance(): void {
        $result = $this->mapper->map_to_v4_atomic('border-radius', '8px');
        
        // Border radius can be either 'size' (uniform) or 'border-radius' (individual corners)
        $this->assertTrue(
            $result['$$type'] === 'size' || $result['$$type'] === 'border-radius',
            'Border radius must be either size or border-radius type'
        );
        
        if ($result['$$type'] === 'size') {
            $this->assertValidSizePropType($result);
        } else {
            $this->assertValidBorderRadiusPropType($result);
        }
    }
    
    /**
     * @test
     */
    public function it_supports_all_border_radius_properties(): void {
        $properties = [
            'border-radius',
            'border-top-left-radius',
            'border-top-right-radius',
            'border-bottom-right-radius',
            'border-bottom-left-radius'
        ];
        
        foreach ($properties as $property) {
            $result = $this->mapper->map_to_v4_atomic($property, '8px');
            
            $this->assertNotNull($result, "Property {$property} should be supported");
            $this->assertTrue(
                $result['$$type'] === 'size' || $result['$$type'] === 'border-radius',
                "Property {$property} must return size or border-radius type"
            );
        }
    }
    
    /**
     * @test
     */
    public function it_supports_uniform_border_radius(): void {
        $uniformTests = [
            '8px' => ['size' => 8, 'unit' => 'px'],
            '1em' => ['size' => 1, 'unit' => 'em'],
            '50%' => ['size' => 50, 'unit' => '%'],
            '0' => ['size' => 0, 'unit' => 'px'],
        ];
        
        foreach ($uniformTests as $input => $expected) {
            $result = $this->mapper->map_to_v4_atomic('border-radius', $input);
            
            // For uniform radius, should return size type
            $this->assertEquals('size', $result['$$type']);
            $this->assertValidSizePropType($result);
            $this->assertEquals($expected['size'], $result['value']['size']);
            $this->assertEquals($expected['unit'], $result['value']['unit']);
        }
    }
    
    /**
     * @test
     */
    public function it_supports_border_radius_shorthand(): void {
        $shorthandTests = [
            '8px 16px' => true, // Two values
            '8px 16px 24px' => true, // Three values
            '8px 16px 24px 32px' => true, // Four values
        ];
        
        foreach ($shorthandTests as $input => $shouldWork) {
            $result = $this->mapper->map_to_v4_atomic('border-radius', $input);
            
            if ($shouldWork) {
                $this->assertNotNull($result, "Shorthand '{$input}' should be supported");
                $this->assertTrue(
                    $result['$$type'] === 'size' || $result['$$type'] === 'border-radius',
                    "Shorthand '{$input}' must return valid type"
                );
            }
        }
    }
    
    /**
     * @test
     */
    public function it_supports_individual_corner_properties(): void {
        $cornerTests = [
            'border-top-left-radius' => '8px',
            'border-top-right-radius' => '16px',
            'border-bottom-right-radius' => '24px',
            'border-bottom-left-radius' => '32px',
        ];
        
        foreach ($cornerTests as $property => $value) {
            $result = $this->mapper->map_to_v4_atomic($property, $value);
            
            $this->assertNotNull($result, "Individual corner {$property} should be supported");
            $this->assertTrue(
                $result['$$type'] === 'size' || $result['$$type'] === 'border-radius',
                "Individual corner {$property} must return valid type"
            );
        }
    }
    
    /**
     * @test
     */
    public function it_handles_css_parsing_edge_cases(): void {
        $edgeCases = [
            '  8px  ' => true, // Whitespace
            '0' => true, // Zero without unit
            
            // Invalid values
            'invalid-radius' => null,
            'auto' => null, // Not valid for border-radius
            '' => null,
            '-5px' => null, // Negative values not valid
        ];
        
        foreach ($edgeCases as $input => $expected) {
            $result = $this->mapper->map_to_v4_atomic('border-radius', $input);
            
            if ($expected === null) {
                $this->assertNull($result);
            } else {
                $this->assertNotNull($result);
                $this->assertTrue(
                    $result['$$type'] === 'size' || $result['$$type'] === 'border-radius',
                    "Edge case '{$input}' must return valid type"
                );
            }
        }
    }
    
    /**
     * @test
     */
    public function it_correctly_identifies_supported_properties(): void {
        $this->assertTrue($this->mapper->supports('border-radius', '8px'));
        $this->assertTrue($this->mapper->supports('border-top-left-radius', '8px'));
        $this->assertFalse($this->mapper->supports('border-width', '8px'));
        $this->assertFalse($this->mapper->supports('border-radius', 'invalid-value'));
    }
    
    /**
     * @test
     */
    public function it_returns_exact_structure_for_uniform_radius(): void {
        $result = $this->mapper->map_to_v4_atomic('border-radius', '8px');
        
        $this->assertIsArray($result);
        $this->assertArrayHasKey('$$type', $result);
        $this->assertArrayHasKey('value', $result);
        
        if ($result['$$type'] === 'size') {
            // Uniform radius structure
            $this->assertIsArray($result['value']);
            $this->assertArrayHasKey('size', $result['value']);
            $this->assertArrayHasKey('unit', $result['value']);
            $this->assertEquals(8, $result['value']['size']);
            $this->assertEquals('px', $result['value']['unit']);
        } else {
            // Individual corners structure
            $this->assertEquals('border-radius', $result['$$type']);
            $this->assertIsArray($result['value']);
        }
    }
    
    /**
     * @test
     */
    public function it_supports_complete_css_parsing(): void {
        // Border radius can be either size or border-radius type
        $result = $this->mapper->map_to_v4_atomic('border-radius', '8px');
        $expectedType = $result['$$type'];
        
        $this->assertCompleteCssParsingSupport($this->mapper, 'border-radius', $expectedType);
    }
}
