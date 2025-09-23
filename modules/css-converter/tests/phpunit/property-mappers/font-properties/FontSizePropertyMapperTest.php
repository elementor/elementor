<?php

namespace Elementor\Modules\CssConverter\Tests\PropertyMappers\FontProperties;

use Elementor\Modules\CssConverter\Tests\PropertyMappers\AtomicWidgetComplianceTestCase;
use Elementor\Modules\CssConverter\Convertors\CssProperties\Properties\Font_Size_Property_Mapper;

class FontSizePropertyMapperTest extends AtomicWidgetComplianceTestCase {
    
    private Font_Size_Property_Mapper $mapper;
    
    protected function setUp(): void {
        parent::setUp();
        $this->mapper = new Font_Size_Property_Mapper();
    }
    
    /**
     * @test
     */
    public function it_has_universal_mapper_compliance(): void {
        $result = $this->mapper->map_to_v4_atomic('font-size', '16px');
        
        $this->assertUniversalMapperCompliance($result, 'size');
    }
    
    /**
     * @test
     */
    public function it_supports_all_font_size_units(): void {
        $unitTests = [
            '16px' => ['size' => 16, 'unit' => 'px'],
            '1.5em' => ['size' => 1.5, 'unit' => 'em'],
            '2rem' => ['size' => 2, 'unit' => 'rem'],
            '100%' => ['size' => 100, 'unit' => '%'],
            '12pt' => ['size' => 12, 'unit' => 'pt'],
            '5vh' => ['size' => 5, 'unit' => 'vh'],
            '3vw' => ['size' => 3, 'unit' => 'vw'],
        ];
        
        foreach ($unitTests as $input => $expected) {
            $result = $this->mapper->map_to_v4_atomic('font-size', $input);
            
            $this->assertUniversalMapperCompliance($result, 'size');
            $this->assertEquals($expected['size'], $result['value']['size']);
            $this->assertEquals($expected['unit'], $result['value']['unit']);
        }
    }
    
    /**
     * @test
     */
    public function it_handles_decimal_and_integer_values(): void {
        $numberTests = [
            '16px' => 16, // Integer
            '16.0px' => 16, // Float that equals integer
            '16.5px' => 16.5, // Decimal
            '0px' => 0, // Zero
            '0.5em' => 0.5, // Decimal less than 1
        ];
        
        foreach ($numberTests as $input => $expectedSize) {
            $result = $this->mapper->map_to_v4_atomic('font-size', $input);
            
            $this->assertUniversalMapperCompliance($result, 'size');
            $this->assertEquals($expectedSize, $result['value']['size']);
            
            // Verify type is correct (int vs float)
            if ($expectedSize === (int) $expectedSize) {
                $this->assertIsInt($result['value']['size']);
            } else {
                $this->assertIsFloat($result['value']['size']);
            }
        }
    }
    
    /**
     * @test
     */
    public function it_handles_css_parsing_edge_cases(): void {
        $edgeCases = [
            '  16px  ' => ['size' => 16, 'unit' => 'px'], // Whitespace
            
            // Invalid values
            '16' => null, // Missing unit
            'px16' => null, // Unit before number
            '16invalid' => null, // Invalid unit
            'large' => null, // Keyword values not supported
            'inherit' => null,
            '' => null,
        ];
        
        foreach ($edgeCases as $input => $expected) {
            $result = $this->mapper->map_to_v4_atomic('font-size', $input);
            
            if ($expected === null) {
                $this->assertNull($result);
            } else {
                $this->assertUniversalMapperCompliance($result, 'size');
                $this->assertEquals($expected['size'], $result['value']['size']);
                $this->assertEquals($expected['unit'], $result['value']['unit']);
            }
        }
    }
    
    /**
     * @test
     */
    public function it_correctly_identifies_supported_properties(): void {
        $this->assertTrue($this->mapper->supports('font-size', '16px'));
        $this->assertFalse($this->mapper->supports('line-height', '16px'));
        $this->assertFalse($this->mapper->supports('font-size', 'invalid-value'));
    }
    
    /**
     * @test
     */
    public function it_returns_consistent_structure(): void {
        $result = $this->mapper->map_to_v4_atomic('font-size', '16px');
        
        $this->assertIsArray($result);
        $this->assertArrayHasKey('$$type', $result);
        $this->assertArrayHasKey('value', $result);
        $this->assertEquals('size', $result['$$type']);
        
        $this->assertIsArray($result['value']);
        $this->assertArrayHasKey('size', $result['value']);
        $this->assertArrayHasKey('unit', $result['value']);
    }
    
    /**
     * @test
     */
    public function it_supports_complete_css_parsing(): void {
        $this->assertCompleteCssParsingSupport($this->mapper, 'font-size', 'size');
    }
}
