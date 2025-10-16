# PHPUnit Test Proposal for Property Mappers

## Overview
This document proposes a comprehensive testing strategy for CSS property mappers that will validate against atomic widget expectations and ensure quality before implementation.

## Testing Philosophy

### **Fail-First Approach**
1. **Write tests that WILL fail** against current broken mappers
2. **Tests define the correct behavior** based on atomic widget prop types
3. **Fix mappers until tests pass**
4. **No mapper is complete until all tests pass**

### **Validation-Driven Development**
1. **Atomic Widget Compliance**: Every test validates against actual atomic widget prop type expectations
2. **Frontend Schema Compliance**: Tests also validate against frontend Zod schemas where possible
3. **Edge Case Coverage**: Tests cover all CSS variations, shorthand, and edge cases
4. **Type Safety**: Tests ensure correct data types (numeric vs string, required fields)

### **Universal Testing Requirements for ALL Mappers**
Every property mapper test MUST validate these critical aspects:

1. **Base Class Method Usage**:
   - ✅ Uses `create_v4_property_with_type()` for specific atomic types
   - ❌ Never uses `create_v4_property()` unless specifically wanting string type
   - ✅ Specifies correct `$$type` from atomic widget prop types

2. **Type Correctness**:
   - ✅ Numeric values are numeric (not strings) - e.g., `size: 500` not `size: "500"`
   - ✅ String values are strings where expected
   - ✅ Arrays match atomic widget structure exactly
   - ❌ No string types used where specific types expected

3. **Complete CSS Parsing**:
   - ✅ Handles ALL CSS shorthand variations (1, 2, 3, 4 values)
   - ✅ Supports edge cases (auto, inherit, initial, unset)
   - ✅ Parses complex values (rgba, calc, etc.)
   - ✅ Handles unit variations (px, em, rem, %, vw, vh, etc.)
   - ❌ Never assumes simple parsing is sufficient

---

## Test Structure Proposal

### **Test Organization**
```
tests/phpunit/
├── property-mappers/
│   ├── AtomicWidgetComplianceTestCase.php     # Base test class
│   ├── size-properties/
│   │   ├── MaxWidthPropertyMapperTest.php
│   │   ├── WidthPropertyMapperTest.php
│   │   ├── HeightPropertyMapperTest.php
│   │   └── FontSizePropertyMapperTest.php
│   ├── dimensions-properties/
│   │   ├── MarginPropertyMapperTest.php
│   │   ├── PaddingPropertyMapperTest.php
│   │   └── MarginShorthandTest.php
│   ├── shadow-properties/
│   │   ├── BoxShadowPropertyMapperTest.php
│   │   └── ShadowParsingTest.php
│   ├── color-properties/
│   │   ├── ColorPropertyMapperTest.php
│   │   └── BackgroundColorTest.php
│   └── background-properties/
│       ├── BackgroundPropertyMapperTest.php
│       └── BackgroundShorthandTest.php
└── fixtures/
    ├── atomic-widget-expectations/
    │   ├── size-prop-type-examples.php
    │   ├── dimensions-prop-type-examples.php
    │   ├── box-shadow-prop-type-examples.php
    │   └── background-prop-type-examples.php
    └── css-input-examples/
        ├── margin-variations.php
        ├── box-shadow-variations.php
        └── size-variations.php
```

---

## Base Test Class Design

### **AtomicWidgetComplianceTestCase.php**
```php
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
     * Validate Size_Prop_Type structure
     */
    protected function assertValidSizePropType(array $result): void {
        $this->assertAtomicWidgetCompliance($result, 'size', [
            'size' => 'numeric',
            'unit' => 'string'
        ]);
        
        // Validate size is numeric (not string)
        $this->assertIsNumeric($result['value']['size']);
        $this->assertIsString($result['value']['unit']);
    }
    
    /**
     * Validate Dimensions_Prop_Type structure
     */
    protected function assertValidDimensionsPropType(array $result): void {
        $this->assertAtomicWidgetCompliance($result, 'dimensions', [
            'block-start' => 'size_prop_type',
            'inline-end' => 'size_prop_type', 
            'block-end' => 'size_prop_type',
            'inline-start' => 'size_prop_type'
        ]);
        
        // Validate each direction is valid Size_Prop_Type
        foreach (['block-start', 'inline-end', 'block-end', 'inline-start'] as $direction) {
            if (isset($result['value'][$direction])) {
                $this->assertValidSizePropType($result['value'][$direction]);
            }
        }
    }
    
    /**
     * Validate Box_Shadow_Prop_Type structure
     */
    protected function assertValidBoxShadowPropType(array $result): void {
        $this->assertAtomicWidgetCompliance($result, 'box-shadow', []);
        
        // Must be array of Shadow_Prop_Type
        $this->assertIsArray($result['value']);
        
        foreach ($result['value'] as $shadow) {
            $this->assertValidShadowPropType($shadow);
        }
    }
    
    /**
     * Validate Shadow_Prop_Type structure
     */
    protected function assertValidShadowPropType(array $shadow): void {
        $this->assertAtomicWidgetCompliance($shadow, 'shadow', [
            'hOffset' => 'size_prop_type',
            'vOffset' => 'size_prop_type',
            'blur' => 'size_prop_type', 
            'spread' => 'size_prop_type',
            'color' => 'color_prop_type',
            'position' => 'string_or_null'
        ]);
        
        // Validate all required fields present
        $requiredFields = ['hOffset', 'vOffset', 'blur', 'spread', 'color'];
        foreach ($requiredFields as $field) {
            $this->assertArrayHasKey($field, $shadow['value']);
        }
        
        // Validate each offset/blur/spread is Size_Prop_Type
        foreach (['hOffset', 'vOffset', 'blur', 'spread'] as $field) {
            $this->assertValidSizePropType($shadow['value'][$field]);
        }
        
        // Validate color is Color_Prop_Type
        $this->assertValidColorPropType($shadow['value']['color']);
        
        // Validate position is null or "inset"
        $position = $shadow['value']['position'] ?? null;
        $this->assertTrue($position === null || $position === 'inset');
    }
    
    /**
     * Validate Color_Prop_Type structure
     */
    protected function assertValidColorPropType(array $result): void {
        $this->assertAtomicWidgetCompliance($result, 'color', []);
        $this->assertIsString($result['value']);
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
}
```

---

## Specific Test Examples

### **MaxWidthPropertyMapperTest.php** (Will Fail Initially)
```php
<?php

namespace Elementor\Modules\CssConverter\Tests\PropertyMappers\SizeProperties;

use Elementor\Modules\CssConverter\Tests\PropertyMappers\AtomicWidgetComplianceTestCase;
use Elementor\Modules\CssConverter\Convertors\CssProperties\Properties\Dimension_Property_Mapper;

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
     */
    public function it_handles_different_units(): void {
        $testCases = [
            ['input' => '100%', 'expectedSize' => 100, 'expectedUnit' => '%'],
            ['input' => '2em', 'expectedSize' => 2, 'expectedUnit' => 'em'],
            ['input' => '1.5rem', 'expectedSize' => 1.5, 'expectedUnit' => 'rem'],
            ['input' => '50vw', 'expectedSize' => 50, 'expectedUnit' => 'vw'],
        ];
        
        foreach ($testCases as $case) {
            $result = $this->mapper->map_to_v4_atomic('max-width', $case['input']);
            
            $this->assertValidSizePropType($result);
            $this->assertEquals($case['expectedSize'], $result['value']['size']);
            $this->assertEquals($case['expectedUnit'], $result['value']['unit']);
        }
    }
    
    /**
     * @test
     */
    public function it_handles_auto_value(): void {
        $result = $this->mapper->map_to_v4_atomic('max-width', 'auto');
        
        $this->assertValidSizePropType($result);
        $this->assertEquals('', $result['value']['size']); // auto has empty size
        $this->assertEquals('auto', $result['value']['unit']);
    }
}
```

### **BoxShadowPropertyMapperTest.php** (Will Fail Initially)
```php
<?php

namespace Elementor\Modules\CssConverter\Tests\PropertyMappers\ShadowProperties;

use Elementor\Modules\CssConverter\Tests\PropertyMappers\AtomicWidgetComplianceTestCase;
use Elementor\Modules\CssConverter\Convertors\CssProperties\Properties\Box_Shadow_Property_Mapper;

class BoxShadowPropertyMapperTest extends AtomicWidgetComplianceTestCase {
    
    private Box_Shadow_Property_Mapper $mapper;
    
    protected function setUp(): void {
        parent::setUp();
        $this->mapper = new Box_Shadow_Property_Mapper();
    }
    
    /**
     * @test
     * This test WILL FAIL initially - tests ALL critical aspects
     */
    public function it_converts_box_shadow_with_universal_compliance(): void {
        $result = $this->mapper->map_to_v4_atomic('box-shadow', '0 4px 20px rgba(0,0,0,0.08)');
        
        // UNIVERSAL VALIDATION - will catch ALL common errors:
        // 1. Base class method usage (create_v4_property vs create_v4_property_with_type)
        // 2. Type correctness (numeric vs string values in shadow components)
        // 3. Atomic widget structure compliance (Box_Shadow_Prop_Type -> Shadow_Prop_Type)
        $this->assertUniversalMapperCompliance($result, 'box-shadow');
        
        // Validate shadow structure
        $this->assertCount(1, $result['value']); // Single shadow
        
        $shadow = $result['value'][0];
        $this->assertEquals(0, $shadow['value']['hOffset']['value']['size']);
        $this->assertEquals('px', $shadow['value']['hOffset']['value']['unit']);
        $this->assertEquals(4, $shadow['value']['vOffset']['value']['size']);
        $this->assertEquals(20, $shadow['value']['blur']['value']['size']);
        $this->assertEquals(0, $shadow['value']['spread']['value']['size']);
        $this->assertEquals('rgba(0,0,0,0.08)', $shadow['value']['color']['value']);
        $this->assertNull($shadow['value']['position']);
    }
    
    /**
     * @test
     * Test comprehensive CSS parsing for box-shadow
     */
    public function it_supports_complete_box_shadow_parsing(): void {
        // Test complex box-shadow variations
        $complexTests = [
            '0 2px 4px rgba(0,0,0,0.1)' => 'simple shadow',
            'inset 2px 2px 5px #000' => 'inset shadow',
            '0 2px 4px rgba(0,0,0,0.1), inset 0 1px 2px rgba(255,255,255,0.5)' => 'multiple shadows',
            '2px 2px 0 red, 4px 4px 0 blue' => 'multiple colored shadows',
        ];
        
        foreach ($complexTests as $input => $description) {
            $result = $this->mapper->map_to_v4_atomic('box-shadow', $input);
            
            $this->assertUniversalMapperCompliance($result, 'box-shadow');
            $this->assertIsArray($result['value'], "Failed parsing {$description}: {$input}");
        }
    }
    
    /**
     * @test
     */
    public function it_handles_inset_box_shadow(): void {
        $result = $this->mapper->map_to_v4_atomic('box-shadow', 'inset 2px 2px 5px #000');
        
        $this->assertValidBoxShadowPropType($result);
        
        $shadow = $result['value'][0];
        $this->assertEquals('inset', $shadow['value']['position']);
        $this->assertEquals(2, $shadow['value']['hOffset']['value']['size']);
    }
    
    /**
     * @test
     */
    public function it_handles_multiple_box_shadows(): void {
        $result = $this->mapper->map_to_v4_atomic('box-shadow', '0 2px 4px rgba(0,0,0,0.1), inset 0 1px 2px rgba(255,255,255,0.5)');
        
        $this->assertValidBoxShadowPropType($result);
        $this->assertCount(2, $result['value']); // Two shadows
        
        // First shadow
        $shadow1 = $result['value'][0];
        $this->assertNull($shadow1['value']['position']);
        $this->assertEquals(2, $shadow1['value']['vOffset']['value']['size']);
        
        // Second shadow
        $shadow2 = $result['value'][1];
        $this->assertEquals('inset', $shadow2['value']['position']);
    }
}
```

### **MarginPropertyMapperTest.php** (Will Fail Initially)
```php
<?php

namespace Elementor\Modules\CssConverter\Tests\PropertyMappers\DimensionsProperties;

use Elementor\Modules\CssConverter\Tests\PropertyMappers\AtomicWidgetComplianceTestCase;
use Elementor\Modules\CssConverter\Convertors\CssProperties\Properties\Margin_Property_Mapper;

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
     */
    public function it_handles_individual_margin_properties(): void {
        $result = $this->mapper->map_to_v4_atomic('margin-bottom', '16px');
        
        $this->assertValidDimensionsPropType($result);
        
        // Only block-end should be set for margin-bottom
        $this->assertArrayHasKey('block-end', $result['value']);
        $this->assertEquals(16, $result['value']['block-end']['value']['size']);
        $this->assertEquals('px', $result['value']['block-end']['value']['unit']);
        
        // Other directions should not be set or be null/empty
        $this->assertArrayNotHasKey('block-start', $result['value']);
        $this->assertArrayNotHasKey('inline-start', $result['value']);
        $this->assertArrayNotHasKey('inline-end', $result['value']);
    }
}
```

---

## Test Execution Strategy

### **Phase 1: Write All Failing Tests**
```bash
# Run tests - they WILL fail
composer test:property-mappers

# Expected output:
# ❌ MaxWidthPropertyMapperTest::it_converts_max_width_to_size_prop_type
# ❌ BoxShadowPropertyMapperTest::it_converts_simple_box_shadow_to_box_shadow_prop_type  
# ❌ MarginPropertyMapperTest::it_converts_margin_shorthand_three_values_with_auto
```

### **Phase 2: Fix Mappers One by One**
1. Fix `Dimension_Property_Mapper` to use `create_v4_property_with_type('size')`
2. Fix `Box_Shadow_Property_Mapper` to parse and create proper structure
3. Fix `Margin_Property_Mapper` to handle shorthand correctly

### **Phase 3: Validate All Tests Pass**
```bash
# After fixes - all tests should pass
composer test:property-mappers

# Expected output:
# ✅ All property mapper tests passing
```

---

## Test Data Fixtures

### **Expected Atomic Widget Structures**
```php
// fixtures/atomic-widget-expectations/size-prop-type-examples.php
<?php

return [
    'valid_size_prop_type' => [
        '$$type' => 'size',
        'value' => [
            'size' => 500,  // MUST be numeric
            'unit' => 'px'  // MUST be string
        ]
    ],
    'auto_size_prop_type' => [
        '$$type' => 'size', 
        'value' => [
            'size' => '',   // Empty for auto
            'unit' => 'auto'
        ]
    ]
];
```

---

## Benefits of This Approach

### **Quality Assurance**
1. **No broken mappers can be deployed** - tests will catch them
2. **Atomic widget compliance guaranteed** - tests validate against real expectations
3. **Edge cases covered** - comprehensive test scenarios

### **Development Workflow**
1. **Clear requirements** - tests define exactly what mappers should do
2. **Immediate feedback** - know instantly when mapper is correct
3. **Regression prevention** - changes can't break existing functionality

### **Documentation**
1. **Living documentation** - tests show exactly how mappers should work
2. **Examples for developers** - clear patterns to follow
3. **Validation reference** - what atomic widgets expect

---

## Next Steps for Implementation

1. **✅ Create base test class** with atomic widget validation methods
2. **✅ Write failing tests** for our 3 critical broken mappers (max-width, box-shadow, margin)
3. **✅ Create test fixtures** with expected atomic widget structures
4. **⏳ Run tests to confirm they fail** against current mappers
5. **⏳ Fix mappers one by one** until tests pass
6. **⏳ Expand test coverage** to all property mappers

This approach ensures we build quality, compliant property mappers that work correctly with Elementor's atomic widget system.
