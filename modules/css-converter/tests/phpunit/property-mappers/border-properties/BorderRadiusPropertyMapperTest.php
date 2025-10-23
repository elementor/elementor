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
        $result = $this->mapper->map_to_v4_atomic('border-radius', '10px');
        
        $this->assertUniversalMapperCompliance($result, 'border-radius');
        $this->assertValidBorderRadiusPropType($result);
    }
    
    /**
     * @test
     */
    public function it_supports_all_border_radius_properties(): void {
        $properties = [
            'border-radius',
            'border-top-left-radius',
            'border-top-right-radius',
            'border-bottom-left-radius',
            'border-bottom-right-radius',
            'border-start-start-radius',
            'border-start-end-radius',
            'border-end-start-radius',
            'border-end-end-radius'
        ];
        
        foreach ($properties as $property) {
            $result = $this->mapper->map_to_v4_atomic($property, '10px');
            
            $this->assertUniversalMapperCompliance($result, 'border-radius');
            $this->assertValidBorderRadiusPropType($result);
        }
    }
    
    /**
     * @test
     */
    public function it_supports_border_radius_shorthand_variations(): void {
        $shorthandTests = [
            // 1 value: all corners
            '10px' => [
                'start-start' => ['size' => 10.0, 'unit' => 'px'],
                'start-end' => ['size' => 10.0, 'unit' => 'px'],
                'end-start' => ['size' => 10.0, 'unit' => 'px'],
                'end-end' => ['size' => 10.0, 'unit' => 'px'],
            ],
            // 2 values: top-left/bottom-right, top-right/bottom-left
            '10px 20px' => [
                'start-start' => ['size' => 10.0, 'unit' => 'px'], // top-left
                'start-end' => ['size' => 20.0, 'unit' => 'px'],   // top-right
                'end-start' => ['size' => 20.0, 'unit' => 'px'],   // bottom-left
                'end-end' => ['size' => 10.0, 'unit' => 'px'],     // bottom-right
            ],
            // 3 values: top-left, top-right/bottom-left, bottom-right
            '10px 20px 30px' => [
                'start-start' => ['size' => 10.0, 'unit' => 'px'], // top-left
                'start-end' => ['size' => 20.0, 'unit' => 'px'],   // top-right
                'end-start' => ['size' => 20.0, 'unit' => 'px'],   // bottom-left (same as top-right)
                'end-end' => ['size' => 30.0, 'unit' => 'px'],     // bottom-right
            ],
            // 4 values: top-left, top-right, bottom-right, bottom-left
            '10px 20px 30px 40px' => [
                'start-start' => ['size' => 10.0, 'unit' => 'px'], // top-left
                'start-end' => ['size' => 20.0, 'unit' => 'px'],   // top-right
                'end-end' => ['size' => 30.0, 'unit' => 'px'],     // bottom-right
                'end-start' => ['size' => 40.0, 'unit' => 'px'],   // bottom-left
            ],
        ];
        
        foreach ($shorthandTests as $input => $expected) {
            $result = $this->mapper->map_to_v4_atomic('border-radius', $input);
            
            $this->assertUniversalMapperCompliance($result, 'border-radius');
            $this->assertValidBorderRadiusPropType($result);
            
            // Validate specific corner values
            foreach ($expected as $corner => $expectedValue) {
                $this->assertEquals($expectedValue['size'], $result['value']['value'][$corner]['value']['size']);
                $this->assertEquals($expectedValue['unit'], $result['value']['value'][$corner]['value']['unit']);
            }
        }
    }
    
    /**
     * @test
     */
    public function it_supports_individual_corner_properties(): void {
        $cornerTests = [
            'border-top-left-radius' => 'start-start',
            'border-top-right-radius' => 'start-end',
            'border-bottom-left-radius' => 'end-start',
            'border-bottom-right-radius' => 'end-end',
        ];
        
        foreach ($cornerTests as $property => $expectedCorner) {
            $result = $this->mapper->map_to_v4_atomic($property, '15px');
            
            $this->assertUniversalMapperCompliance($result, 'border-radius');
            $this->assertValidBorderRadiusPropType($result);
            
            // Validate that only the specific corner is set
            foreach (['start-start', 'start-end', 'end-start', 'end-end'] as $corner) {
                if ($corner === $expectedCorner) {
                    $this->assertEquals(15.0, $result['value']['value'][$corner]['value']['size']);
                    $this->assertEquals('px', $result['value']['value'][$corner]['value']['unit']);
                } else {
                    $this->assertEquals(0.0, $result['value']['value'][$corner]['value']['size']);
                    $this->assertEquals('px', $result['value']['value'][$corner]['value']['unit']);
                }
            }
        }
    }
    
    /**
     * @test
     */
    public function it_supports_logical_border_radius_properties(): void {
        $logicalTests = [
            'border-start-start-radius' => 'start-start',  // Maps to top-left
            'border-start-end-radius' => 'start-end',      // Maps to top-right
            'border-end-start-radius' => 'end-start',      // Maps to bottom-left
            'border-end-end-radius' => 'end-end',          // Maps to bottom-right
        ];
        
        foreach ($logicalTests as $logicalProperty => $expectedCorner) {
            $result = $this->mapper->map_to_v4_atomic($logicalProperty, '20px');
            
            $this->assertUniversalMapperCompliance($result, 'border-radius');
            $this->assertValidBorderRadiusPropType($result);
            
            // Validate that logical property maps to correct physical corner
            foreach (['start-start', 'start-end', 'end-start', 'end-end'] as $corner) {
                if ($corner === $expectedCorner) {
                    $this->assertEquals(20.0, $result['value']['value'][$corner]['value']['size']);
                    $this->assertEquals('px', $result['value']['value'][$corner]['value']['unit']);
                } else {
                    $this->assertEquals(0.0, $result['value']['value'][$corner]['value']['size']);
                    $this->assertEquals('px', $result['value']['value'][$corner]['value']['unit']);
                }
            }
        }
    }
    
    /**
     * @test
     */
    public function it_supports_various_units(): void {
        $unitTests = [
            '16px' => ['size' => 16.0, 'unit' => 'px'],
            '1.5em' => ['size' => 1.5, 'unit' => 'em'],
            '2rem' => ['size' => 2.0, 'unit' => 'rem'],
            '50%' => ['size' => 50.0, 'unit' => '%'],
        ];
        
        foreach ($unitTests as $input => $expected) {
            $result = $this->mapper->map_to_v4_atomic('border-radius', $input);
            
            $this->assertUniversalMapperCompliance($result, 'border-radius');
            $this->assertValidBorderRadiusPropType($result);
            
            // All corners should have the same value for single-value input
            foreach (['start-start', 'start-end', 'end-start', 'end-end'] as $corner) {
                $this->assertEquals($expected['size'], $result['value']['value'][$corner]['value']['size']);
                $this->assertEquals($expected['unit'], $result['value']['value'][$corner]['value']['unit']);
            }
        }
    }
    
    /**
     * @test
     */
    public function it_handles_css_parsing_edge_cases(): void {
        $edgeCases = [
            '  10px  ' => ['size' => 10.0, 'unit' => 'px'], // Whitespace
            '0' => ['size' => 0.0, 'unit' => 'px'], // Zero without unit
            
            // Invalid values should return null
            '' => null, // Empty string
            'invalid-radius' => ['size' => 0.0, 'unit' => 'px'], // Falls back to default
        ];
        
        foreach ($edgeCases as $input => $expected) {
            $result = $this->mapper->map_to_v4_atomic('border-radius', $input);
            
            if ($expected === null) {
                $this->assertNull($result);
            } else {
                $this->assertUniversalMapperCompliance($result, 'border-radius');
                $this->assertValidBorderRadiusPropType($result);
                
                // All corners should have the same value for single-value input
                foreach (['start-start', 'start-end', 'end-start', 'end-end'] as $corner) {
                    $this->assertEquals($expected['size'], $result['value']['value'][$corner]['value']['size']);
                    $this->assertEquals($expected['unit'], $result['value']['value'][$corner]['value']['unit']);
                }
            }
        }
    }
    
    /**
     * @test
     */
    public function it_rejects_elliptical_border_radius_syntax(): void {
        $ellipticalSyntaxes = [
            'border-radius: 50px / 20px',
            'border-radius: 10px 20px / 5px 15px',
            'border-radius: 50px / 20px',
            'border-top-left-radius: 30px / 15px',
        ];
        
        foreach ($ellipticalSyntaxes as $ellipticalValue) {
            // Extract property and value
            if (str_contains($ellipticalValue, ':')) {
                [$property, $value] = explode(':', $ellipticalValue, 2);
                $property = trim($property);
                $value = trim($value);
            } else {
                $property = 'border-radius';
                $value = $ellipticalValue;
            }
            
            $result = $this->mapper->map_to_v4_atomic($property, $value);
            
            // Should return null because elliptical syntax is not supported by atomic widgets
            $this->assertNull($result, "Elliptical syntax should be rejected: {$ellipticalValue}");
        }
    }
    
    /**
     * @test
     */
    public function it_correctly_identifies_supported_properties(): void {
        // Test all supported properties (physical and logical)
        $supportedProperties = [
            'border-radius',
            'border-top-left-radius',
            'border-top-right-radius',
            'border-bottom-left-radius',
            'border-bottom-right-radius',
            'border-start-start-radius',
            'border-start-end-radius',
            'border-end-start-radius',
            'border-end-end-radius'
        ];
        
        foreach ($supportedProperties as $property) {
            $this->assertTrue($this->mapper->supports($property, '10px'), "Should support property: {$property}");
        }
        
        // Test unsupported properties
        $this->assertFalse($this->mapper->supports('padding', '10px'));
        $this->assertFalse($this->mapper->supports('margin', '10px'));
        $this->assertFalse($this->mapper->supports('border-width', '1px'));
    }
    
    /**
     * @test
     */
    public function it_returns_exact_border_radius_structure(): void {
        $result = $this->mapper->map_to_v4_atomic('border-radius', '10px');
        
        $this->assertIsArray($result);
        $this->assertArrayHasKey('property', $result);
        $this->assertArrayHasKey('value', $result);
        $this->assertEquals('border-radius', $result['property']);
        
        // Validate exact structure for border-radius
        $this->assertIsArray($result['value']);
        $this->assertArrayHasKey('$$type', $result['value']);
        $this->assertArrayHasKey('value', $result['value']);
        $this->assertEquals('border-radius', $result['value']['$$type']);
        
        $borderRadiusValue = $result['value']['value'];
        $this->assertIsArray($borderRadiusValue);
        
        // Validate all four corners exist
        $expectedCorners = ['start-start', 'start-end', 'end-start', 'end-end'];
        foreach ($expectedCorners as $corner) {
            $this->assertArrayHasKey($corner, $borderRadiusValue);
            $this->assertIsArray($borderRadiusValue[$corner]);
            $this->assertArrayHasKey('$$type', $borderRadiusValue[$corner]);
            $this->assertArrayHasKey('value', $borderRadiusValue[$corner]);
            $this->assertEquals('size', $borderRadiusValue[$corner]['$$type']);
            
            $sizeValue = $borderRadiusValue[$corner]['value'];
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
        $this->assertCompleteCssParsingSupport($this->mapper, 'border-radius', 'border-radius');
    }
    
    /**
     * @test
     */
    public function it_handles_mixed_units_in_shorthand(): void {
        $result = $this->mapper->map_to_v4_atomic('border-radius', '10px 1em 50% 2rem');
        
        $this->assertUniversalMapperCompliance($result, 'border-radius');
        $this->assertValidBorderRadiusPropType($result);
        
        // Validate mixed units are preserved
        $this->assertEquals(10.0, $result['value']['value']['start-start']['value']['size']);
        $this->assertEquals('px', $result['value']['value']['start-start']['value']['unit']);
        
        $this->assertEquals(1.0, $result['value']['value']['start-end']['value']['size']);
        $this->assertEquals('em', $result['value']['value']['start-end']['value']['unit']);
        
        $this->assertEquals(50.0, $result['value']['value']['end-end']['value']['size']);
        $this->assertEquals('%', $result['value']['value']['end-end']['value']['unit']);
        
        $this->assertEquals(2.0, $result['value']['value']['end-start']['value']['size']);
        $this->assertEquals('rem', $result['value']['value']['end-start']['value']['unit']);
    }
    
    /**
     * @test
     */
    public function it_supports_v4_conversion_check(): void {
        $this->assertTrue($this->mapper->supports_v4_conversion('border-radius', '10px'));
        $this->assertTrue($this->mapper->supports_v4_conversion('border-top-left-radius', '5px'));
        $this->assertFalse($this->mapper->supports_v4_conversion('padding', '10px'));
        $this->assertFalse($this->mapper->supports_v4_conversion('border-radius', ''));
    }
    
    /**
     * @test
     */
    public function it_returns_correct_v4_property_name(): void {
        $this->assertEquals('border-radius', $this->mapper->get_v4_property_name('border-radius'));
        $this->assertEquals('border-radius', $this->mapper->get_v4_property_name('border-top-left-radius'));
        $this->assertEquals('border-radius', $this->mapper->get_v4_property_name('border-bottom-right-radius'));
    }
    
    private function assertValidBorderRadiusPropType(array $result): void {
        $this->assertEquals('border-radius', $result['value']['$$type']);
        $this->assertIsArray($result['value']['value']);
        
        $corners = ['start-start', 'start-end', 'end-start', 'end-end'];
        foreach ($corners as $corner) {
            $this->assertArrayHasKey($corner, $result['value']['value']);
            $cornerValue = $result['value']['value'][$corner];
            $this->assertEquals('size', $cornerValue['$$type']);
            $this->assertIsArray($cornerValue['value']);
            $this->assertArrayHasKey('size', $cornerValue['value']);
            $this->assertArrayHasKey('unit', $cornerValue['value']);
        }
    }
}