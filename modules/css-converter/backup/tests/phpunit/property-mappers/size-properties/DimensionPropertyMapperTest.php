<?php

namespace Elementor\Modules\CssConverter\Tests\PropertyMappers\SizeProperties;

use Elementor\Modules\CssConverter\Tests\PropertyMappers\AtomicWidgetComplianceTestCase;
use Elementor\Modules\CssConverter\Convertors\CssProperties\Properties\Dimension_Property_Mapper;

/**
 * Test dimension property mapper for ALL potential issues
 * 
 * This test will identify ALL bugs in the mapper:
 * 1. Base class method usage issues
 * 2. Type correctness problems  
 * 3. CSS parsing completeness
 * 4. Atomic widget compliance
 */
class DimensionPropertyMapperTest extends AtomicWidgetComplianceTestCase {
    
    private Dimension_Property_Mapper $mapper;
    
    protected function setUp(): void {
        parent::setUp();
        $this->mapper = new Dimension_Property_Mapper();
    }
    
    /**
     * @test
     * Universal compliance test for size values - will identify ALL critical issues
     */
    public function it_has_universal_mapper_compliance_for_size_values(): void {
        $result = $this->mapper->map_to_v4_atomic('max-width', '500px');
        
        // This will catch ALL common errors:
        // 1. Wrong base class method usage
        // 2. Incorrect data types
        // 3. Missing atomic widget structure
        $this->assertUniversalMapperCompliance($result, 'size');
        
        // Specific validation
        $this->assertEquals(500, $result['value']['size']);
        $this->assertEquals('px', $result['value']['unit']);
    }
    
    /**
     * @test
     * Universal compliance test for keyword values
     */
    public function it_has_universal_mapper_compliance_for_keyword_values(): void {
        $result = $this->mapper->map_to_v4_atomic('max-width', 'auto');
        
        // Keywords should use string type
        $this->assertUniversalMapperCompliance($result, 'string');
        $this->assertEquals('auto', $result['value']);
    }
    
    /**
     * @test
     * Test all supported dimension properties
     */
    public function it_supports_all_dimension_properties(): void {
        $properties = ['width', 'height', 'min-width', 'min-height', 'max-width', 'max-height'];
        
        foreach ($properties as $property) {
            $result = $this->mapper->map_to_v4_atomic($property, '100px');
            
            $this->assertUniversalMapperCompliance($result, 'size');
            $this->assertEquals(100, $result['value']['size'], 
                "Failed to handle property: {$property}");
            $this->assertEquals('px', $result['value']['unit']);
        }
    }
    
    /**
     * @test
     * Test all supported units
     */
    public function it_supports_all_css_units(): void {
        $unitTests = [
            '100px' => ['size' => 100, 'unit' => 'px'],
            '2.5em' => ['size' => 2.5, 'unit' => 'em'],
            '1.5rem' => ['size' => 1.5, 'unit' => 'rem'],
            '50%' => ['size' => 50, 'unit' => '%'],
            '100vh' => ['size' => 100, 'unit' => 'vh'],
            '50vw' => ['size' => 50, 'unit' => 'vw'],
            '10vmin' => ['size' => 10, 'unit' => 'vmin'],
            '20vmax' => ['size' => 20, 'unit' => 'vmax'],
            
            // Unitless numbers (should default to px)
            '100' => ['size' => 100, 'unit' => 'px'],
            '0' => ['size' => 0, 'unit' => 'px'],
        ];
        
        foreach ($unitTests as $input => $expected) {
            $result = $this->mapper->map_to_v4_atomic('width', $input);
            
            $this->assertUniversalMapperCompliance($result, 'size');
            $this->assertEquals($expected['size'], $result['value']['size'],
                "Failed to parse size from: {$input}");
            $this->assertEquals($expected['unit'], $result['value']['unit'],
                "Failed to parse unit from: {$input}");
        }
    }
    
    /**
     * @test
     * Test keyword values handling
     */
    public function it_handles_all_keyword_values(): void {
        $keywords = ['auto', 'inherit', 'initial', 'unset', 'fit-content', 'max-content', 'min-content'];
        
        foreach ($keywords as $keyword) {
            $result = $this->mapper->map_to_v4_atomic('width', $keyword);
            
            $this->assertUniversalMapperCompliance($result, 'string');
            $this->assertEquals($keyword, $result['value'],
                "Failed to handle keyword: {$keyword}");
        }
    }
    
    /**
     * @test
     * Test case sensitivity and whitespace handling
     */
    public function it_handles_case_and_whitespace_normalization(): void {
        $normalizationTests = [
            '  100px  ' => ['size' => 100, 'unit' => 'px'],
            '100PX' => ['size' => 100, 'unit' => 'px'], // Case normalization
            'AUTO' => 'auto', // Keyword case normalization
            '  AUTO  ' => 'auto', // Whitespace + case
            'Fit-Content' => 'fit-content',
        ];
        
        foreach ($normalizationTests as $input => $expected) {
            $result = $this->mapper->map_to_v4_atomic('width', $input);
            
            if (is_array($expected)) {
                $this->assertUniversalMapperCompliance($result, 'size');
                $this->assertEquals($expected['size'], $result['value']['size']);
                $this->assertEquals($expected['unit'], $result['value']['unit']);
            } else {
                $this->assertUniversalMapperCompliance($result, 'string');
                $this->assertEquals($expected, $result['value']);
            }
        }
    }
    
    /**
     * @test
     * Test decimal and integer handling
     */
    public function it_handles_decimal_and_integer_values_correctly(): void {
        $numberTests = [
            '100px' => 100, // Integer
            '100.0px' => 100, // Float that equals integer
            '100.5px' => 100.5, // Decimal
            '0px' => 0, // Zero
            '0.5px' => 0.5, // Decimal less than 1
        ];
        
        foreach ($numberTests as $input => $expectedSize) {
            $result = $this->mapper->map_to_v4_atomic('width', $input);
            
            $this->assertUniversalMapperCompliance($result, 'size');
            $this->assertEquals($expectedSize, $result['value']['size'],
                "Failed to handle number type for: {$input}");
            
            // Verify type is correct (int vs float)
            if ($expectedSize === (int) $expectedSize) {
                $this->assertIsInt($result['value']['size'],
                    "Should be integer for: {$input}");
            } else {
                $this->assertIsFloat($result['value']['size'],
                    "Should be float for: {$input}");
            }
        }
    }
    
    /**
     * @test
     * Test invalid values are rejected
     */
    public function it_rejects_invalid_values(): void {
        $invalidValues = [
            'invalid-unit',
            '100invalid',
            'px100', // Unit before number
            '',
            'none', // Not in keyword list
            '100 px', // Space between number and unit
            'auto px', // Keyword with unit
        ];
        
        foreach ($invalidValues as $invalid) {
            $result = $this->mapper->map_to_v4_atomic('width', $invalid);
            
            $this->assertNull($result,
                "Should reject invalid value: '{$invalid}'");
        }
    }
    
    /**
     * @test
     * Test property support detection
     */
    public function it_correctly_identifies_supported_properties(): void {
        $supportedProperties = ['width', 'height', 'min-width', 'min-height', 'max-width', 'max-height'];
        $unsupportedProperties = ['margin', 'padding', 'border-width', 'font-size'];
        
        foreach ($supportedProperties as $property) {
            $this->assertTrue($this->mapper->supports($property, '100px'),
                "Should support property: {$property}");
        }
        
        foreach ($unsupportedProperties as $property) {
            $this->assertFalse($this->mapper->supports($property, '100px'),
                "Should not support property: {$property}");
        }
    }
    
    /**
     * @test
     * Test return structure consistency
     */
    public function it_returns_consistent_structure(): void {
        // Test size value structure
        $sizeResult = $this->mapper->map_to_v4_atomic('width', '100px');
        
        $this->assertIsArray($sizeResult);
        $this->assertArrayHasKey('$$type', $sizeResult);
        $this->assertArrayHasKey('value', $sizeResult);
        $this->assertEquals('size', $sizeResult['$$type']);
        
        $this->assertIsArray($sizeResult['value']);
        $this->assertArrayHasKey('size', $sizeResult['value']);
        $this->assertArrayHasKey('unit', $sizeResult['value']);
        
        // Test keyword value structure
        $keywordResult = $this->mapper->map_to_v4_atomic('width', 'auto');
        
        $this->assertIsArray($keywordResult);
        $this->assertArrayHasKey('$$type', $keywordResult);
        $this->assertArrayHasKey('value', $keywordResult);
        $this->assertEquals('string', $keywordResult['$$type']);
        $this->assertIsString($keywordResult['value']);
    }
    
    /**
     * @test
     * Test comprehensive CSS parsing support
     */
    public function it_supports_complete_css_parsing(): void {
        // Test comprehensive parsing for dimension properties
        $this->assertCompleteCssParsingSupport($this->mapper, 'width', 'size');
    }
}
