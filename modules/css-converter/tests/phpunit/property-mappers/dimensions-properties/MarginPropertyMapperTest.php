<?php

namespace Elementor\Modules\CssConverter\Tests\PropertyMappers\DimensionsProperties;

use Elementor\Modules\CssConverter\Tests\PropertyMappers\AtomicWidgetComplianceTestCase;
use Elementor\Modules\CssConverter\Convertors\CssProperties\Properties\Margin_Property_Mapper;

/**
 * Test margin property mapper compliance with atomic widget expectations
 * 
 * This test WILL FAIL initially because:
 * 1. Margin_Property_Mapper may use create_v4_property() instead of create_v4_property_with_type()
 * 2. May not parse shorthand correctly (especially "0 auto 40px")
 * 3. May not handle "auto" values properly in Dimensions_Prop_Type structure
 */
class MarginPropertyMapperTest extends AtomicWidgetComplianceTestCase {
    
    private Margin_Property_Mapper $mapper;
    
    protected function setUp(): void {
        parent::setUp();
        $this->mapper = new Margin_Property_Mapper();
    }
    
    /**
     * @test
     * This test WILL FAIL initially - tests ALL critical aspects
     */
    public function it_converts_margin_shorthand_with_universal_compliance(): void {
        // This is the exact case that's failing: margin: 0 auto 40px
        $result = $this->mapper->map_to_v4_atomic('margin', '0 auto 40px');
        
        // UNIVERSAL VALIDATION - will catch ALL common errors:
        // 1. Base class method usage (create_v4_property vs create_v4_property_with_type)
        // 2. Type correctness (numeric vs string values, auto handling)
        // 3. Complete CSS parsing (3-value shorthand with auto)
        $this->assertUniversalMapperCompliance($result, 'dimensions');
        
        // Validate parsed values
        $this->assertEquals(0, $result['value']['block-start']['value']['size']);
        $this->assertEquals('px', $result['value']['block-start']['value']['unit']);
        
        $this->assertEquals('', $result['value']['inline-end']['value']['size']); // auto
        $this->assertEquals('auto', $result['value']['inline-end']['value']['unit']);
        
        $this->assertEquals(40, $result['value']['block-end']['value']['size']);
        $this->assertEquals('px', $result['value']['block-end']['value']['unit']);
        
        $this->assertEquals('', $result['value']['inline-start']['value']['size']); // auto
        $this->assertEquals('auto', $result['value']['inline-start']['value']['unit']);
    }
    
    /**
     * @test
     * Test comprehensive CSS parsing for margin
     */
    public function it_supports_complete_margin_parsing(): void {
        // This will test ALL shorthand variations, units, and edge cases
        $this->assertCompleteCssParsingSupport($this->mapper, 'margin', 'dimensions');
    }
    
    /**
     * @test
     * Test individual margin properties
     */
    public function it_handles_individual_margin_properties(): void {
        $individualTests = [
            'margin-top' => 'block-start',
            'margin-right' => 'inline-end', 
            'margin-bottom' => 'block-end',
            'margin-left' => 'inline-start',
        ];
        
        foreach ($individualTests as $property => $expectedDirection) {
            $result = $this->mapper->map_to_v4_atomic($property, '16px');
            
            $this->assertUniversalMapperCompliance($result, 'dimensions');
            
            // Only the specific direction should be set
            $this->assertArrayHasKey($expectedDirection, $result['value']);
            $this->assertEquals(16, $result['value'][$expectedDirection]['value']['size']);
            $this->assertEquals('px', $result['value'][$expectedDirection]['value']['unit']);
            
            // Other directions should not be set
            $otherDirections = array_diff(['block-start', 'inline-end', 'block-end', 'inline-start'], [$expectedDirection]);
            foreach ($otherDirections as $direction) {
                $this->assertArrayNotHasKey($direction, $result['value'],
                    "Individual property {$property} should not set {$direction}");
            }
        }
    }
    
    /**
     * @test
     * Test margin shorthand variations
     */
    public function it_handles_all_margin_shorthand_variations(): void {
        $shorthandTests = [
            // 1 value: all sides
            ['input' => '10px', 'expected' => [10, 10, 10, 10], 'description' => '1 value'],
            // 2 values: vertical, horizontal  
            ['input' => '10px 20px', 'expected' => [10, 20, 10, 20], 'description' => '2 values'],
            // 3 values: top, horizontal, bottom (THE FAILING CASE)
            ['input' => '10px 20px 30px', 'expected' => [10, 20, 30, 20], 'description' => '3 values'],
            // 4 values: top, right, bottom, left
            ['input' => '10px 20px 30px 40px', 'expected' => [10, 20, 30, 40], 'description' => '4 values'],
        ];
        
        foreach ($shorthandTests as $test) {
            $result = $this->mapper->map_to_v4_atomic('margin', $test['input']);
            
            $this->assertUniversalMapperCompliance($result, 'dimensions');
            
            // Validate parsed values match expected
            $directions = ['block-start', 'inline-end', 'block-end', 'inline-start'];
            foreach ($directions as $index => $direction) {
                $expectedValue = $test['expected'][$index];
                
                $this->assertArrayHasKey($direction, $result['value'], 
                    "Missing {$direction} for {$test['description']}: {$test['input']}");
                
                $this->assertEquals($expectedValue, $result['value'][$direction]['value']['size'],
                    "Wrong {$direction} value for {$test['description']}: {$test['input']}");
            }
        }
    }
    
    /**
     * @test
     * Test margin with auto values
     */
    public function it_handles_margin_with_auto_values(): void {
        $autoTests = [
            'auto' => ['auto', 'auto', 'auto', 'auto'],
            '0 auto' => [0, 'auto', 0, 'auto'],
            'auto 10px' => ['auto', 10, 'auto', 10],
            '10px auto 20px' => [10, 'auto', 20, 'auto'],
            '10px 20px auto' => [10, 20, 'auto', 20],
        ];
        
        foreach ($autoTests as $input => $expected) {
            $result = $this->mapper->map_to_v4_atomic('margin', $input);
            
            $this->assertUniversalMapperCompliance($result, 'dimensions');
            
            $directions = ['block-start', 'inline-end', 'block-end', 'inline-start'];
            foreach ($directions as $index => $direction) {
                $expectedValue = $expected[$index];
                
                if ($expectedValue === 'auto') {
                    $this->assertEquals('', $result['value'][$direction]['value']['size'],
                        "Auto value should have empty size for {$direction} in: {$input}");
                    $this->assertEquals('auto', $result['value'][$direction]['value']['unit'],
                        "Auto value should have 'auto' unit for {$direction} in: {$input}");
                } else {
                    $this->assertEquals($expectedValue, $result['value'][$direction]['value']['size'],
                        "Numeric value wrong for {$direction} in: {$input}");
                }
            }
        }
    }
    
    /**
     * @test
     * Test margin with mixed units
     */
    public function it_handles_margin_with_mixed_units(): void {
        $result = $this->mapper->map_to_v4_atomic('margin', '1em 2px 3rem 4%');
        
        $this->assertUniversalMapperCompliance($result, 'dimensions');
        
        $expectedUnits = ['em', 'px', 'rem', '%'];
        $expectedSizes = [1, 2, 3, 4];
        $directions = ['block-start', 'inline-end', 'block-end', 'inline-start'];
        
        foreach ($directions as $index => $direction) {
            $this->assertEquals($expectedSizes[$index], $result['value'][$direction]['value']['size']);
            $this->assertEquals($expectedUnits[$index], $result['value'][$direction]['value']['unit']);
        }
    }
    
    /**
     * @test
     * Test that mapper correctly identifies supported properties
     */
    public function it_supports_margin_properties(): void {
        $marginProperties = ['margin', 'margin-top', 'margin-right', 'margin-bottom', 'margin-left'];
        
        foreach ($marginProperties as $property) {
            $this->assertTrue($this->mapper->supports_property($property),
                "Margin_Property_Mapper should support {$property} property");
        }
    }
    
    /**
     * @test
     * Test margin edge cases
     */
    public function it_handles_margin_edge_cases(): void {
        $edgeCases = [
            'inherit' => null,
            'initial' => null,
            'unset' => null,
            '0' => [0, 0, 0, 0], // Unitless zero
        ];
        
        foreach ($edgeCases as $value => $expected) {
            $result = $this->mapper->map_to_v4_atomic('margin', $value);
            
            if ($expected === null) {
                $this->assertTrue($result === null || is_array($result),
                    "Mapper should handle margin edge case '{$value}' gracefully");
            } else {
                $this->assertUniversalMapperCompliance($result, 'dimensions');
                
                $directions = ['block-start', 'inline-end', 'block-end', 'inline-start'];
                foreach ($directions as $index => $direction) {
                    $this->assertEquals($expected[$index], $result['value'][$direction]['value']['size']);
                }
            }
        }
    }
}
