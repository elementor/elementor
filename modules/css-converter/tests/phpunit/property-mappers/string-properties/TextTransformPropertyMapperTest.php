<?php

namespace Elementor\Modules\CssConverter\Tests\PropertyMappers\StringProperties;

use Elementor\Modules\CssConverter\Tests\PropertyMappers\AtomicWidgetComplianceTestCase;
use Elementor\Modules\CssConverter\Convertors\CssProperties\Properties\Text_Transform_Property_Mapper;

/**
 * Test text-transform property mapper for ALL potential issues
 * 
 * This test will identify ALL bugs in the mapper:
 * 1. Base class method usage issues (CRITICAL: uses create_v4_property instead of create_v4_property_with_type)
 * 2. Type correctness problems  
 * 3. CSS parsing completeness
 * 4. Atomic widget compliance
 */
class TextTransformPropertyMapperTest extends AtomicWidgetComplianceTestCase {
    
    private Text_Transform_Property_Mapper $mapper;
    
    protected function setUp(): void {
        parent::setUp();
        $this->mapper = new Text_Transform_Property_Mapper();
    }
    
    /**
     * @test
     * Universal compliance test - will identify ALL critical issues
     * EXPECTED TO FAIL: This mapper uses create_v4_property() instead of create_v4_property_with_type()
     */
    public function it_has_universal_mapper_compliance(): void {
        $result = $this->mapper->map_to_v4_atomic('text-transform', 'uppercase');
        
        // This will catch ALL common errors:
        // 1. Wrong base class method usage (WILL FAIL - uses create_v4_property)
        // 2. Incorrect data types
        // 3. Missing atomic widget structure
        $this->assertUniversalMapperCompliance($result, 'string');
        
        // Specific validation
        $this->assertEquals('uppercase', $result['value']);
    }
    
    /**
     * @test
     * Test all valid text-transform values
     */
    public function it_supports_all_valid_text_transform_values(): void {
        $validTransforms = ['none', 'uppercase', 'lowercase', 'capitalize'];
        
        foreach ($validTransforms as $transform) {
            $result = $this->mapper->map_to_v4_atomic('text-transform', $transform);
            
            $this->assertUniversalMapperCompliance($result, 'string');
            $this->assertEquals($transform, $result['value'],
                "Failed to handle valid text-transform: {$transform}");
        }
    }
    
    /**
     * @test
     * Test CSS parsing completeness - case sensitivity and normalization
     */
    public function it_handles_css_parsing_edge_cases(): void {
        $edgeCases = [
            // Case sensitivity
            'UPPERCASE' => 'uppercase',
            'Capitalize' => 'capitalize',
            'NONE' => 'none',
            'LowerCase' => 'lowercase',
            
            // Whitespace handling
            '  uppercase  ' => 'uppercase',
            ' none ' => 'none',
            
            // Invalid values that should be rejected
            'invalid-transform' => null,
            'small-caps' => null, // Valid CSS but not in our list
            'full-width' => null, // Valid CSS but not supported
            '' => null,
            'inherit' => null, // CSS keywords not supported
            'initial' => null,
            'unset' => null,
        ];
        
        foreach ($edgeCases as $input => $expected) {
            $result = $this->mapper->map_to_v4_atomic('text-transform', $input);
            
            if ($expected === null) {
                $this->assertNull($result,
                    "Should reject invalid text-transform value: '{$input}'");
            } else {
                $this->assertUniversalMapperCompliance($result, 'string');
                $this->assertEquals($expected, $result['value'],
                    "Failed to normalize text-transform: '{$input}' -> '{$expected}'");
            }
        }
    }
    
    /**
     * @test
     * Test property support detection
     */
    public function it_correctly_identifies_supported_properties(): void {
        $this->assertTrue($this->mapper->supports('text-transform', 'uppercase'));
        $this->assertFalse($this->mapper->supports('text-decoration', 'uppercase')); // Different property
        $this->assertFalse($this->mapper->supports('text-transform', 'invalid-value'));
    }
    
    /**
     * @test
     * Test return structure consistency
     * EXPECTED TO FAIL: This will reveal the wrong structure from create_v4_property()
     */
    public function it_returns_consistent_structure(): void {
        $result = $this->mapper->map_to_v4_atomic('text-transform', 'uppercase');
        
        // Check the exact structure returned
        $this->assertIsArray($result);
        $this->assertArrayHasKey('$$type', $result);
        $this->assertArrayHasKey('value', $result);
        $this->assertEquals('string', $result['$$type']);
        $this->assertEquals('uppercase', $result['value']);
    }
    
    /**
     * @test
     * Test non-string input handling
     */
    public function it_rejects_non_string_inputs(): void {
        $nonStringInputs = [
            123,
            true,
            false,
            [],
            null,
        ];
        
        foreach ($nonStringInputs as $input) {
            $result = $this->mapper->map_to_v4_atomic('text-transform', $input);
            
            $this->assertNull($result,
                "Should reject non-string input: " . var_export($input, true));
        }
    }
    
    /**
     * @test
     * Test comprehensive CSS parsing support
     */
    public function it_supports_complete_css_parsing(): void {
        // Test comprehensive parsing for text-transform
        $this->assertCompleteCssParsingSupport($this->mapper, 'text-transform', 'string');
    }
    
    /**
     * @test
     * Test base class method usage detection
     * This test specifically checks for the create_v4_property vs create_v4_property_with_type issue
     */
    public function it_uses_correct_base_class_method(): void {
        $result = $this->mapper->map_to_v4_atomic('text-transform', 'uppercase');
        
        // This should pass if using create_v4_property_with_type()
        // This will FAIL if using create_v4_property() - which this mapper does
        $this->assertCorrectBaseClassMethodUsage($result, 'string');
    }
}
