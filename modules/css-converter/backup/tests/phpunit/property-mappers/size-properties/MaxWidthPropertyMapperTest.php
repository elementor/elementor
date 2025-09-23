<?php

namespace Elementor\Modules\CssConverter\Tests\PropertyMappers\SizeProperties;

use Elementor\Modules\CssConverter\Tests\PropertyMappers\AtomicWidgetComplianceTestCase;
use Elementor\Modules\CssConverter\Convertors\CssProperties\Properties\Dimension_Property_Mapper;

/**
 * Test max-width property mapper compliance with atomic widget expectations
 * 
 * This test WILL FAIL initially because:
 * 1. Dimension_Property_Mapper uses create_v4_property() instead of create_v4_property_with_type()
 * 2. Returns string type instead of Size_Prop_Type
 * 3. Doesn't parse CSS values into size/unit structure
 */
class MaxWidthPropertyMapperTest extends AtomicWidgetComplianceTestCase {
    
    private Dimension_Property_Mapper $mapper;
    
    protected function setUp(): void {
        parent::setUp();
        $this->mapper = new Dimension_Property_Mapper();
    }
    
    /**
     * @test
     * This test WILL FAIL initially - tests ALL critical aspects
     */
    public function it_converts_max_width_with_universal_compliance(): void {
        $result = $this->mapper->map_to_v4_atomic('max-width', '500px');
        
        // UNIVERSAL VALIDATION - will catch ALL common errors:
        // 1. Base class method usage (create_v4_property vs create_v4_property_with_type)
        // 2. Type correctness (numeric vs string values)  
        // 3. Atomic widget structure compliance
        $this->assertUniversalMapperCompliance($result, 'size');
        
        // Specific validations
        $this->assertEquals(500, $result['value']['size']); // WILL FAIL: currently string "500px"
        $this->assertEquals('px', $result['value']['unit']); // WILL FAIL: unit not separated
    }
    
    /**
     * @test
     * Test comprehensive CSS parsing support
     */
    public function it_supports_complete_css_parsing(): void {
        // This will test ALL units, edge cases, and complex values
        $this->assertCompleteCssParsingSupport($this->mapper, 'max-width', 'size');
    }
    
    /**
     * @test
     * Test specific max-width edge cases
     */
    public function it_handles_max_width_edge_cases(): void {
        $edgeCases = [
            'none' => null, // max-width: none should be handled
            'fit-content' => null, // CSS3 value
            'max-content' => null, // CSS3 value
            'min-content' => null, // CSS3 value
        ];
        
        foreach ($edgeCases as $value => $expected) {
            $result = $this->mapper->map_to_v4_atomic('max-width', $value);
            
            // Should handle gracefully (not crash)
            $this->assertTrue($result === null || is_array($result),
                "Mapper should handle max-width edge case '{$value}' gracefully");
        }
    }
    
    /**
     * @test
     * Test that mapper correctly identifies supported properties
     */
    public function it_supports_max_width_property(): void {
        $this->assertTrue($this->mapper->supports_property('max-width'),
            'Dimension_Property_Mapper should support max-width property');
    }
    
    /**
     * @test
     * Test zero values
     */
    public function it_handles_zero_values(): void {
        $result = $this->mapper->map_to_v4_atomic('max-width', '0');
        
        $this->assertUniversalMapperCompliance($result, 'size');
        $this->assertEquals(0, $result['value']['size']);
        $this->assertEquals('px', $result['value']['unit']); // Default unit for unitless zero
    }
    
    /**
     * @test
     * Test decimal values
     */
    public function it_handles_decimal_values(): void {
        $result = $this->mapper->map_to_v4_atomic('max-width', '12.5px');
        
        $this->assertUniversalMapperCompliance($result, 'size');
        $this->assertEquals(12.5, $result['value']['size']);
        $this->assertEquals('px', $result['value']['unit']);
    }
}
