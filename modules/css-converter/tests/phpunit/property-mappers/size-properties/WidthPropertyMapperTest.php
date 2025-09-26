<?php

namespace Elementor\Modules\CssConverter\Tests\PropertyMappers\SizeProperties;

use Elementor\Modules\CssConverter\Tests\PropertyMappers\AtomicWidgetComplianceTestCase;
use Elementor\Modules\CssConverter\Convertors\CssProperties\Properties\Width_Property_Mapper;

class WidthPropertyMapperTest extends AtomicWidgetComplianceTestCase {
    
    private Width_Property_Mapper $mapper;
    
    protected function setUp(): void {
        parent::setUp();
        $this->mapper = new Width_Property_Mapper();
    }
    
    /**
     * @test
     */
    public function it_has_universal_mapper_compliance(): void {
        $result = $this->mapper->map_to_v4_atomic('width', '100px');
        
        $this->assertUniversalMapperCompliance($result, 'size');
        $this->assertValidSizePropType($result);
    }
    
    /**
     * @test
     */
    public function it_supports_all_size_properties(): void {
        $properties = [
            'width',
            'height',
            'min-width',
            'min-height',
            'max-width',
            'max-height'
        ];
        
        foreach ($properties as $property) {
            $result = $this->mapper->map_to_v4_atomic($property, '100px');
            
            $this->assertUniversalMapperCompliance($result, 'size');
            $this->assertValidSizePropType($result);
        }
    }
    
    /**
     * @test
     */
    public function it_supports_size_value_variations(): void {
        $sizeTests = [
            // Standard pixel values
            '100px' => ['size' => 100.0, 'unit' => 'px'],
            '50px' => ['size' => 50.0, 'unit' => 'px'],
            '0px' => ['size' => 0.0, 'unit' => 'px'],
            
            // Percentage values
            '100%' => ['size' => 100.0, 'unit' => '%'],
            '50%' => ['size' => 50.0, 'unit' => '%'],
            
            // Em values
            '2em' => ['size' => 2.0, 'unit' => 'em'],
            '1.5em' => ['size' => 1.5, 'unit' => 'em'],
            
            // Rem values
            '2rem' => ['size' => 2.0, 'unit' => 'rem'],
            '1.5rem' => ['size' => 1.5, 'unit' => 'rem'],
            
            // Viewport units
            '100vw' => ['size' => 100.0, 'unit' => 'vw'],
            '100vh' => ['size' => 100.0, 'unit' => 'vh'],
            
            // Auto value
            'auto' => ['size' => '', 'unit' => 'auto'],
        ];
        
        foreach ($sizeTests as $input => $expected) {
            $result = $this->mapper->map_to_v4_atomic('width', $input);
            
            $this->assertUniversalMapperCompliance($result, 'size');
            $this->assertValidSizePropType($result);
            
            // Validate specific values match expected parsing
            $this->assertEquals($expected['size'], $result['value']['value']['size']);
            $this->assertEquals($expected['unit'], $result['value']['value']['unit']);
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
            '100vh' => ['size' => 100.0, 'unit' => 'vh'],
            '100vw' => ['size' => 100.0, 'unit' => 'vw'],
        ];
        
        foreach ($unitTests as $input => $expected) {
            $result = $this->mapper->map_to_v4_atomic('width', $input);
            
            $this->assertUniversalMapperCompliance($result, 'size');
            $this->assertValidSizePropType($result);
            $this->assertEquals($expected['size'], $result['value']['value']['size']);
            $this->assertEquals($expected['unit'], $result['value']['value']['unit']);
        }
    }
    
    /**
     * @test
     */
    public function it_supports_special_css_values(): void {
        $specialTests = [
            'auto' => ['size' => '', 'unit' => 'auto'],
            'fit-content(200px)' => ['size' => 'fit-content(200px)', 'unit' => 'custom'],
            'min-content' => ['size' => 'min-content', 'unit' => 'custom'],
            'max-content' => ['size' => 'max-content', 'unit' => 'custom'],
            'calc(100% - 20px)' => ['size' => 'calc(100% - 20px)', 'unit' => 'custom'],
        ];
        
        foreach ($specialTests as $input => $expected) {
            $result = $this->mapper->map_to_v4_atomic('width', $input);
            
            $this->assertUniversalMapperCompliance($result, 'size');
            $this->assertValidSizePropType($result);
            $this->assertEquals($expected['size'], $result['value']['value']['size']);
            $this->assertEquals($expected['unit'], $result['value']['value']['unit']);
        }
    }
    
    /**
     * @test
     */
    public function it_handles_css_parsing_edge_cases(): void {
        $edgeCases = [
            '  100px  ' => ['size' => 100.0, 'unit' => 'px'], // Whitespace
            '0' => ['size' => 0.0, 'unit' => 'px'], // Zero without unit
            
            // Invalid values should return null
            'inherit' => null, // Not supported by atomic widgets
            'initial' => null, // Not supported by atomic widgets
            'unset' => null,   // Not supported by atomic widgets
            'invalid-width' => ['size' => 0.0, 'unit' => 'px'], // Falls back to default
            '' => null, // Empty string
        ];
        
        foreach ($edgeCases as $input => $expected) {
            $result = $this->mapper->map_to_v4_atomic('width', $input);
            
            if ($expected === null) {
                $this->assertNull($result);
            } else {
                $this->assertUniversalMapperCompliance($result, 'size');
                $this->assertValidSizePropType($result);
                $this->assertEquals($expected['size'], $result['value']['value']['size']);
                $this->assertEquals($expected['unit'], $result['value']['value']['unit']);
            }
        }
    }
    
    /**
     * @test
     */
    public function it_correctly_identifies_supported_properties(): void {
        // Test all supported properties
        $supportedProperties = [
            'width',
            'height',
            'min-width',
            'min-height',
            'max-width',
            'max-height'
        ];
        
        foreach ($supportedProperties as $property) {
            $this->assertTrue($this->mapper->supports($property, '100px'), "Should support property: {$property}");
        }
        
        // Test unsupported properties
        $this->assertFalse($this->mapper->supports('padding', '10px'));
        $this->assertFalse($this->mapper->supports('margin', '10px'));
        $this->assertFalse($this->mapper->supports('font-size', '16px'));
    }
    
    /**
     * @test
     */
    public function it_returns_exact_size_structure(): void {
        $result = $this->mapper->map_to_v4_atomic('width', '100px');
        
        $this->assertIsArray($result);
        $this->assertArrayHasKey('property', $result);
        $this->assertArrayHasKey('value', $result);
        $this->assertEquals('width', $result['property']);
        
        // Validate exact structure for size
        $this->assertIsArray($result['value']);
        $this->assertArrayHasKey('$$type', $result['value']);
        $this->assertArrayHasKey('value', $result['value']);
        $this->assertEquals('size', $result['value']['$$type']);
        
        $sizeValue = $result['value']['value'];
        $this->assertIsArray($sizeValue);
        $this->assertArrayHasKey('size', $sizeValue);
        $this->assertArrayHasKey('unit', $sizeValue);
        $this->assertIsNumeric($sizeValue['size']);
        $this->assertIsString($sizeValue['unit']);
    }
    
    /**
     * @test
     */
    public function it_supports_complete_css_parsing(): void {
        $this->assertCompleteCssParsingSupport($this->mapper, 'width', 'size');
    }
    
    /**
     * @test
     */
    public function it_handles_negative_values(): void {
        // Negative values should be parsed but may not be valid for all properties
        $result = $this->mapper->map_to_v4_atomic('width', '-10px');
        
        $this->assertUniversalMapperCompliance($result, 'size');
        $this->assertValidSizePropType($result);
        $this->assertEquals(-10.0, $result['value']['value']['size']);
        $this->assertEquals('px', $result['value']['value']['unit']);
    }
    
    /**
     * @test
     */
    public function it_handles_decimal_values(): void {
        $decimalTests = [
            '10.5px' => ['size' => 10.5, 'unit' => 'px'],
            '1.25em' => ['size' => 1.25, 'unit' => 'em'],
            '0.5rem' => ['size' => 0.5, 'unit' => 'rem'],
            '33.333%' => ['size' => 33.333, 'unit' => '%'],
        ];
        
        foreach ($decimalTests as $input => $expected) {
            $result = $this->mapper->map_to_v4_atomic('width', $input);
            
            $this->assertUniversalMapperCompliance($result, 'size');
            $this->assertValidSizePropType($result);
            $this->assertEquals($expected['size'], $result['value']['value']['size']);
            $this->assertEquals($expected['unit'], $result['value']['value']['unit']);
        }
    }
    
    /**
     * @test
     */
    public function it_supports_v4_conversion_check(): void {
        $this->assertTrue($this->mapper->supports_v4_conversion('width', '100px'));
        $this->assertTrue($this->mapper->supports_v4_conversion('height', '50%'));
        $this->assertFalse($this->mapper->supports_v4_conversion('padding', '10px'));
        $this->assertFalse($this->mapper->supports_v4_conversion('width', ''));
    }
    
    /**
     * @test
     */
    public function it_returns_correct_v4_property_name(): void {
        $this->assertEquals('width', $this->mapper->get_v4_property_name('width'));
        $this->assertEquals('height', $this->mapper->get_v4_property_name('height'));
        $this->assertEquals('max-width', $this->mapper->get_v4_property_name('max-width'));
    }
}
