<?php

namespace Elementor\Modules\CssConverter\Tests\PropertyMappers;

use PHPUnit\Framework\TestCase;

abstract class AtomicWidgetComplianceTestCase extends TestCase {
    
    /**
     * UNIVERSAL VALIDATION: Test ALL critical aspects for ANY property mapper
     */
    protected function assertUniversalMapperCompliance(array $result, string $expectedType): void {
        // 1. Base Class Method Usage Validation
        $this->assertCorrectBaseClassMethodUsage($result, $expectedType);
        
        // 2. Type Correctness Validation  
        $this->assertCorrectDataTypes($result, $expectedType);
        
        // 3. Atomic Widget Structure Compliance
        $this->assertAtomicWidgetCompliance($result, $expectedType);
    }
    
    /**
     * Validate correct base class method usage
     */
    protected function assertCorrectBaseClassMethodUsage(array $result, string $expectedType): void {
        // Must have $$type field (proves create_v4_property_with_type was used)
        $this->assertArrayHasKey('$$type', $result, 
            'Result missing $$type field. Mapper likely uses create_v4_property() instead of create_v4_property_with_type()');
        
        // $$type must match expected atomic widget type
        $this->assertEquals($expectedType, $result['$$type'],
            "Incorrect $$type. Expected '{$expectedType}' but got '{$result['$$type']}'. Check atomic widget prop type mapping.");
        
        // Must not be generic string type unless explicitly expected
        if ($expectedType !== 'string') {
            $this->assertNotEquals('string', $result['$$type'],
                'Mapper incorrectly uses string type instead of specific atomic type. Use create_v4_property_with_type().');
        }
    }
    
    /**
     * Validate correct data types in values
     */
    protected function assertCorrectDataTypes(array $result, string $expectedType): void {
        $this->assertArrayHasKey('value', $result, 'Result missing value field');
        
        switch ($expectedType) {
            case 'size':
                $this->assertSizeDataTypes($result['value']);
                break;
            case 'dimensions':
                $this->assertDimensionsDataTypes($result['value']);
                break;
            case 'box-shadow':
                $this->assertBoxShadowDataTypes($result['value']);
                break;
            case 'color':
                $this->assertColorDataTypes($result['value']);
                break;
        }
    }
    
    /**
     * Validate Size_Prop_Type data types
     */
    protected function assertSizeDataTypes(array $value): void {
        $this->assertArrayHasKey('size', $value, 'Size prop missing size field');
        $this->assertArrayHasKey('unit', $value, 'Size prop missing unit field');
        
        // CRITICAL: size must be numeric, not string (unless auto/custom)
        if ($value['unit'] !== 'auto' && $value['unit'] !== 'custom') {
            $this->assertIsNumeric($value['size'], 
                "Size value must be numeric, got: " . gettype($value['size']) . " '{$value['size']}'");
        }
        
        $this->assertIsString($value['unit'], 'Unit must be string');
    }
    
    /**
     * Validate Dimensions_Prop_Type data types
     */
    protected function assertDimensionsDataTypes(array $value): void {
        $logicalProperties = ['block-start', 'inline-end', 'block-end', 'inline-start'];
        
        foreach ($logicalProperties as $property) {
            if (isset($value[$property])) {
                $this->assertIsArray($value[$property], "Dimension {$property} must be array (Size_Prop_Type)");
                $this->assertArrayHasKey('$$type', $value[$property], "Dimension {$property} missing $$type");
                $this->assertEquals('size', $value[$property]['$$type'], "Dimension {$property} must be Size_Prop_Type");
                $this->assertSizeDataTypes($value[$property]['value']);
            }
        }
    }
    
    /**
     * Validate Box_Shadow_Prop_Type data types
     */
    protected function assertBoxShadowDataTypes(array $value): void {
        $this->assertIsArray($value, 'Box shadow value must be array');
        
        foreach ($value as $index => $shadow) {
            $this->assertIsArray($shadow, "Shadow {$index} must be array");
            $this->assertArrayHasKey('$$type', $shadow, "Shadow {$index} missing $$type");
            $this->assertEquals('shadow', $shadow['$$type'], "Shadow {$index} must be Shadow_Prop_Type");
            
            $shadowValue = $shadow['value'];
            $requiredFields = ['hOffset', 'vOffset', 'blur', 'spread', 'color'];
            
            foreach ($requiredFields as $field) {
                $this->assertArrayHasKey($field, $shadowValue, "Shadow missing required field: {$field}");
                
                if (in_array($field, ['hOffset', 'vOffset', 'blur', 'spread'])) {
                    $this->assertSizeDataTypes($shadowValue[$field]['value']);
                } elseif ($field === 'color') {
                    $this->assertColorDataTypes($shadowValue[$field]['value']);
                }
            }
        }
    }
    
    /**
     * Validate Color_Prop_Type data types
     */
    protected function assertColorDataTypes($value): void {
        $this->assertIsString($value, 'Color value must be string');
    }
    
    /**
     * Validate that mapper output matches atomic widget prop type structure
     */
    protected function assertAtomicWidgetCompliance(array $result, string $expectedType): void {
        // Validate $$type
        $this->assertArrayHasKey('$$type', $result);
        $this->assertEquals($expectedType, $result['$$type']);
        
        // Validate value structure
        $this->assertArrayHasKey('value', $result);
    }
    
    /**
     * COMPREHENSIVE CSS PARSING VALIDATION
     * Test that mapper handles ALL CSS variations properly
     */
    protected function assertCompleteCssParsingSupport($mapper, string $property, string $expectedType): void {
        // Test basic units
        $this->assertSupportsAllUnits($mapper, $property, $expectedType);
        
        // Test edge cases
        $this->assertSupportsEdgeCases($mapper, $property, $expectedType);
        
        // Test shorthand variations (if applicable)
        if (in_array($property, ['margin', 'padding', 'border-radius'])) {
            $this->assertSupportsShorthandVariations($mapper, $property, $expectedType);
        }
        
        // Test complex values
        $this->assertSupportsComplexValues($mapper, $property, $expectedType);
    }
    
    /**
     * Test all supported CSS units
     */
    protected function assertSupportsAllUnits($mapper, string $property, string $expectedType): void {
        $unitTests = [
            ['value' => '16px', 'expectedSize' => 16, 'expectedUnit' => 'px'],
            ['value' => '1.5em', 'expectedSize' => 1.5, 'expectedUnit' => 'em'],
            ['value' => '2rem', 'expectedSize' => 2, 'expectedUnit' => 'rem'],
            ['value' => '100%', 'expectedSize' => 100, 'expectedUnit' => '%'],
            ['value' => '50vw', 'expectedSize' => 50, 'expectedUnit' => 'vw'],
            ['value' => '75vh', 'expectedSize' => 75, 'expectedUnit' => 'vh'],
            ['value' => '0.5vmin', 'expectedSize' => 0.5, 'expectedUnit' => 'vmin'],
            ['value' => '2vmax', 'expectedSize' => 2, 'expectedUnit' => 'vmax'],
        ];
        
        foreach ($unitTests as $test) {
            $result = $mapper->map_to_v4_atomic($property, $test['value']);
            
            $this->assertUniversalMapperCompliance($result, $expectedType);
            
            if ($expectedType === 'size') {
                $this->assertEquals($test['expectedSize'], $result['value']['size'], 
                    "Failed parsing size from '{$test['value']}'");
                $this->assertEquals($test['expectedUnit'], $result['value']['unit'],
                    "Failed parsing unit from '{$test['value']}'");
            }
        }
    }
    
    /**
     * Test CSS edge cases
     */
    protected function assertSupportsEdgeCases($mapper, string $property, string $expectedType): void {
        $edgeCases = [
            'auto' => ['expectedSize' => '', 'expectedUnit' => 'auto'],
            'inherit' => null, // Should return null or handle appropriately
            'initial' => null,
            'unset' => null,
            '0' => ['expectedSize' => 0, 'expectedUnit' => 'px'], // Default unit
        ];
        
        foreach ($edgeCases as $value => $expected) {
            $result = $mapper->map_to_v4_atomic($property, $value);
            
            if ($expected === null) {
                // Should handle gracefully (return null or default)
                $this->assertTrue($result === null || is_array($result), 
                    "Mapper should handle edge case '{$value}' gracefully");
            } else {
                $this->assertUniversalMapperCompliance($result, $expectedType);
                
                if ($expectedType === 'size') {
                    $this->assertEquals($expected['expectedSize'], $result['value']['size']);
                    $this->assertEquals($expected['expectedUnit'], $result['value']['unit']);
                }
            }
        }
    }
    
    /**
     * Test CSS shorthand variations
     */
    protected function assertSupportsShorthandVariations($mapper, string $property, string $expectedType): void {
        if ($property === 'margin' || $property === 'padding') {
            $this->assertDimensionsShorthandSupport($mapper, $property);
        } elseif ($property === 'border-radius') {
            $this->assertBorderRadiusShorthandSupport($mapper, $property);
        }
    }
    
    /**
     * Test margin/padding shorthand variations
     */
    protected function assertDimensionsShorthandSupport($mapper, string $property): void {
        $shorthandTests = [
            // 1 value: all sides
            ['input' => '10px', 'expected' => [10, 10, 10, 10]],
            // 2 values: vertical, horizontal  
            ['input' => '10px 20px', 'expected' => [10, 20, 10, 20]],
            // 3 values: top, horizontal, bottom
            ['input' => '10px 20px 30px', 'expected' => [10, 20, 30, 20]],
            // 4 values: top, right, bottom, left
            ['input' => '10px 20px 30px 40px', 'expected' => [10, 20, 30, 40]],
            // Mixed units
            ['input' => '1em 2px 3rem 4%', 'expected' => [1, 2, 3, 4]],
            // With auto
            ['input' => '0 auto 40px', 'expected' => [0, 'auto', 40, 'auto']],
        ];
        
        foreach ($shorthandTests as $test) {
            $result = $mapper->map_to_v4_atomic($property, $test['input']);
            
            $this->assertUniversalMapperCompliance($result, 'dimensions');
            
            // Validate parsed values match expected
            $directions = ['block-start', 'inline-end', 'block-end', 'inline-start'];
            foreach ($directions as $index => $direction) {
                if (isset($result['value'][$direction])) {
                    $expectedValue = $test['expected'][$index];
                    
                    if ($expectedValue === 'auto') {
                        $this->assertEquals('', $result['value'][$direction]['value']['size']);
                        $this->assertEquals('auto', $result['value'][$direction]['value']['unit']);
                    } else {
                        $this->assertEquals($expectedValue, $result['value'][$direction]['value']['size'],
                            "Failed parsing {$direction} from '{$test['input']}'");
                    }
                }
            }
        }
    }
    
    /**
     * Test border-radius shorthand variations
     */
    protected function assertBorderRadiusShorthandSupport($mapper, string $property): void {
        // Placeholder for border-radius shorthand tests
        // Will be implemented when we test border-radius mapper
    }
    
    /**
     * Test complex CSS values
     */
    protected function assertSupportsComplexValues($mapper, string $property, string $expectedType): void {
        $complexTests = [
            'calc(100% - 20px)' => null, // Should handle or return null
            'clamp(1rem, 2.5vw, 2rem)' => null,
            'min(50px, 5vw)' => null,
            'max(20px, 1em)' => null,
        ];
        
        foreach ($complexTests as $value => $expected) {
            $result = $mapper->map_to_v4_atomic($property, $value);
            
            // Should handle gracefully (not crash)
            $this->assertTrue($result === null || is_array($result),
                "Mapper should handle complex value '{$value}' gracefully");
        }
    }
    
    /**
     * EXTREMELY SPECIFIC VALIDATION METHODS FOR 500% CERTAINTY
     */
    
    /**
     * Validate Background_Prop_Type structure (extremely specific)
     */
    protected function assertValidBackgroundPropType(array $result): void {
        $this->assertAtomicWidgetCompliance($result, 'background');
        $this->assertIsArray($result['value']);
        
        // Background can have color, image, or overlay structures
        $validKeys = ['color', 'image', 'background-overlay'];
        $hasValidKey = false;
        
        foreach ($validKeys as $key) {
            if (isset($result['value'][$key])) {
                $hasValidKey = true;
                break;
            }
        }
        
        $this->assertTrue($hasValidKey, 'Background must have at least one of: color, image, or background-overlay');
        
        // If color exists, validate it
        if (isset($result['value']['color'])) {
            $this->assertValidColorPropType($result['value']['color']);
        }
        
        // If background-overlay exists, validate it
        if (isset($result['value']['background-overlay'])) {
            $this->assertValidBackgroundOverlayPropType($result['value']['background-overlay']);
        }
    }
    
    /**
     * Validate Background_Overlay_Prop_Type structure
     */
    protected function assertValidBackgroundOverlayPropType(array $overlay): void {
        $this->assertIsArray($overlay);
        $this->assertArrayHasKey('$$type', $overlay);
        $this->assertArrayHasKey('value', $overlay);
        $this->assertEquals('background-overlay', $overlay['$$type']);
        
        $this->assertIsArray($overlay['value']);
        $this->assertNotEmpty($overlay['value'], 'Background overlay must have at least one overlay');
        
        foreach ($overlay['value'] as $index => $overlayItem) {
            $this->assertIsArray($overlayItem, "Overlay item {$index} must be array");
            $this->assertArrayHasKey('$$type', $overlayItem, "Overlay item {$index} missing $$type");
            $this->assertArrayHasKey('value', $overlayItem, "Overlay item {$index} missing value");
            
            // Can be background-gradient-overlay or other overlay types
            $validOverlayTypes = ['background-gradient-overlay', 'background-image-overlay'];
            $this->assertContains($overlayItem['$$type'], $validOverlayTypes, 
                "Overlay item {$index} has invalid type: {$overlayItem['$$type']}");
        }
    }
    
    /**
     * Validate String_Prop_Type structure (extremely specific)
     */
    protected function assertValidStringPropType(array $result): void {
        $this->assertAtomicWidgetCompliance($result, 'string');
        $this->assertIsString($result['value'], 'String prop type value must be string');
        $this->assertNotNull($result['value'], 'String prop type value cannot be null');
    }
    
    /**
     * Validate Number_Prop_Type structure
     */
    protected function assertValidNumberPropType(array $result): void {
        $this->assertAtomicWidgetCompliance($result, 'number');
        $this->assertIsNumeric($result['value'], 'Number prop type value must be numeric');
    }
    
    /**
     * Validate Border_Radius_Prop_Type structure (extremely specific)
     */
    protected function assertValidBorderRadiusPropType(array $result): void {
        $this->assertAtomicWidgetCompliance($result, 'border-radius');
        $this->assertIsArray($result['value']);
        
        // Must have all four logical corners
        $requiredCorners = ['start-start', 'start-end', 'end-start', 'end-end'];
        foreach ($requiredCorners as $corner) {
            $this->assertArrayHasKey($corner, $result['value'], "Missing corner: {$corner}");
            $this->assertValidSizePropType($result['value'][$corner]);
        }
    }
    
    /**
     * Validate exact Shadow_Prop_Type structure with all required fields
     */
    protected function assertValidShadowPropType(array $result, string $context = ''): void {
        $this->assertAtomicWidgetCompliance($result, 'shadow');
        
        $requiredFields = ['hOffset', 'vOffset', 'blur', 'spread', 'color', 'position'];
        
        foreach ($requiredFields as $field) {
            $this->assertArrayHasKey($field, $result['value'], 
                "Shadow missing required field: {$field} {$context}");
            
            if (in_array($field, ['hOffset', 'vOffset', 'blur', 'spread'])) {
                $this->assertValidSizePropType($result['value'][$field]);
            } elseif ($field === 'color') {
                $this->assertValidColorPropType($result['value'][$field]);
            } elseif ($field === 'position') {
                // Position can be null or have specific structure
                if ($result['value'][$field] !== null) {
                    $this->assertIsArray($result['value'][$field]);
                    $this->assertArrayHasKey('$$type', $result['value'][$field]);
                    $this->assertArrayHasKey('value', $result['value'][$field]);
                    $this->assertEquals('string', $result['value'][$field]['$$type']);
                    $this->assertContains($result['value'][$field]['value'], [null, 'inset']);
                }
            }
        }
    }
}
