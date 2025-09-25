<?php

namespace Elementor\Modules\CssConverter\Tests\PropertyMappers\FlexProperties;

use Elementor\Modules\CssConverter\Tests\PropertyMappers\AtomicWidgetComplianceTestCase;
use Elementor\Modules\CssConverter\Convertors\CssProperties\Properties\Align_Items_Property_Mapper;

/**
 * Test align-items property mapper for ALL potential issues
 * 
 * This test will identify ALL bugs in the mapper:
 * 1. Base class method usage issues
 * 2. Type correctness problems  
 * 3. CSS parsing completeness
 * 4. Atomic widget compliance
 */
class AlignItemsPropertyMapperTest extends AtomicWidgetComplianceTestCase {
    
    private Align_Items_Property_Mapper $mapper;
    
    protected function setUp(): void {
        parent::setUp();
        $this->mapper = new Align_Items_Property_Mapper();
    }
    
    /**
     * @test
     * Universal compliance test - will identify ALL critical issues
     */
    public function it_has_universal_mapper_compliance(): void {
        $result = $this->mapper->map_to_v4_atomic('align-items', 'center');
        
        // This will catch ALL common errors:
        // 1. Wrong base class method usage
        // 2. Incorrect data types
        // 3. Missing atomic widget structure
        $this->assertUniversalMapperCompliance($result, 'string');
        
        // Specific validation
        $this->assertEquals('center', $result['value']['value']);
    }
    
    /**
     * @test
     * Test all valid align-items values
     */
    public function it_supports_all_valid_align_items_values(): void {
        $validValues = [
            'stretch', 'flex-start', 'flex-end', 'center', 'baseline', 
            'start', 'end', 'self-start', 'self-end'
        ];
        
        foreach ($validValues as $value) {
            $result = $this->mapper->map_to_v4_atomic('align-items', $value);
            
            $this->assertUniversalMapperCompliance($result, 'string');
            $this->assertEquals($value, $result['value']['value'], 
                "Failed to handle valid align-items value: {$value}");
        }
    }
    
    /**
     * @test
     * Test CSS parsing completeness - edge cases and variations
     */
    public function it_handles_css_parsing_edge_cases(): void {
        $edgeCases = [
            // Case sensitivity
            'CENTER' => 'center',
            'Flex-Start' => 'flex-start',
            '  center  ' => 'center', // Whitespace
            
            // Invalid values that should be rejected
            'invalid-value' => null,
            'left' => null, // Not valid for align-items
            'right' => null,
            '' => null,
        ];
        
        foreach ($edgeCases as $input => $expected) {
            $result = $this->mapper->map_to_v4_atomic('align-items', $input);
            
            if ($expected === null) {
                $this->assertNull($result, 
                    "Should reject invalid align-items value: '{$input}'");
            } else {
                $this->assertUniversalMapperCompliance($result, 'string');
                $this->assertEquals($expected, $result['value']['value'],
                    "Failed to normalize align-items value: '{$input}' -> '{$expected}'");
            }
        }
    }
    
    /**
     * @test
     * Test property support detection
     */
    public function it_correctly_identifies_supported_properties(): void {
        $this->assertTrue($this->mapper->supports('align-items', 'center'));
        $this->assertFalse($this->mapper->supports('align-content', 'center')); // Different property
        $this->assertFalse($this->mapper->supports('align-items', 'invalid-value'));
    }
    
    /**
     * @test
     * Test return structure consistency
     */
    public function it_returns_consistent_structure(): void {
        $result = $this->mapper->map_to_v4_atomic('align-items', 'flex-start');
        
        // Check the exact structure returned
        $this->assertIsArray($result);
        $this->assertArrayHasKey('property', $result);
        $this->assertArrayHasKey('value', $result);
        $this->assertEquals('align-items', $result['property']);
        
        // Check value structure
        $this->assertIsArray($result['value']);
        $this->assertArrayHasKey('$$type', $result['value']);
        $this->assertArrayHasKey('value', $result['value']);
        $this->assertEquals('string', $result['value']['$$type']);
        $this->assertEquals('flex-start', $result['value']['value']);
    }
    
    /**
     * @test
     * Test comprehensive CSS parsing support
     */
    public function it_supports_complete_css_parsing(): void {
        // Note: align-items doesn't have complex parsing like shorthand properties
        // but we still test for completeness
        $this->assertCompleteCssParsingSupport($this->mapper, 'align-items', 'string');
    }
}
