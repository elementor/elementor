<?php

namespace Elementor\Modules\CssConverter\Tests\PropertyMappers\StringProperties;

use Elementor\Modules\CssConverter\Tests\PropertyMappers\AtomicWidgetComplianceTestCase;
use Elementor\Modules\CssConverter\Convertors\CssProperties\Properties\Opacity_Property_Mapper;

class OpacityPropertyMapperTest extends AtomicWidgetComplianceTestCase {
    
    private Opacity_Property_Mapper $mapper;
    
    protected function setUp(): void {
        parent::setUp();
        $this->mapper = new Opacity_Property_Mapper();
    }
    
    /**
     * @test
     */
    public function it_has_universal_mapper_compliance(): void {
        $result = $this->mapper->map_to_v4_atomic('opacity', '0.5');
        
        $this->assertUniversalMapperCompliance($result, 'string');
    }
    
    /**
     * @test
     */
    public function it_supports_decimal_opacity_values(): void {
        $decimalTests = [
            '0' => '0',
            '0.0' => '0',
            '0.5' => '0.5',
            '0.75' => '0.75',
            '1' => '1',
            '1.0' => '1',
        ];
        
        foreach ($decimalTests as $input => $expected) {
            $result = $this->mapper->map_to_v4_atomic('opacity', $input);
            
            $this->assertUniversalMapperCompliance($result, 'string');
            $this->assertEquals($expected, $result['value']);
        }
    }
    
    /**
     * @test
     */
    public function it_supports_percentage_opacity_values(): void {
        $percentageTests = [
            '0%' => '0',
            '50%' => '0.5',
            '75%' => '0.75',
            '100%' => '1',
        ];
        
        foreach ($percentageTests as $input => $expected) {
            $result = $this->mapper->map_to_v4_atomic('opacity', $input);
            
            $this->assertUniversalMapperCompliance($result, 'string');
            $this->assertEquals($expected, $result['value']);
        }
    }
    
    /**
     * @test
     */
    public function it_handles_css_parsing_edge_cases(): void {
        $edgeCases = [
            '  0.5  ' => '0.5', // Whitespace
            
            // Invalid values
            '1.5' => null, // Over 1
            '-0.1' => null, // Under 0
            '150%' => null, // Over 100%
            '-10%' => null, // Under 0%
            'transparent' => null, // Not a number
            'inherit' => null,
            '' => null,
        ];
        
        foreach ($edgeCases as $input => $expected) {
            $result = $this->mapper->map_to_v4_atomic('opacity', $input);
            
            if ($expected === null) {
                $this->assertNull($result);
            } else {
                $this->assertUniversalMapperCompliance($result, 'string');
                $this->assertEquals($expected, $result['value']);
            }
        }
    }
    
    /**
     * @test
     */
    public function it_handles_numeric_input_types(): void {
        $numericTests = [
            0 => '0',
            0.5 => '0.5',
            1 => '1',
            0.0 => '0',
            1.0 => '1',
        ];
        
        foreach ($numericTests as $input => $expected) {
            $result = $this->mapper->map_to_v4_atomic('opacity', $input);
            
            $this->assertUniversalMapperCompliance($result, 'string');
            $this->assertEquals($expected, $result['value']);
        }
    }
    
    /**
     * @test
     */
    public function it_correctly_identifies_supported_properties(): void {
        $this->assertTrue($this->mapper->supports('opacity', '0.5'));
        $this->assertTrue($this->mapper->supports('opacity', 0.5));
        $this->assertFalse($this->mapper->supports('visibility', '0.5'));
        $this->assertFalse($this->mapper->supports('opacity', 'invalid-value'));
    }
    
    /**
     * @test
     */
    public function it_returns_consistent_structure(): void {
        $result = $this->mapper->map_to_v4_atomic('opacity', '0.5');
        
        $this->assertIsArray($result);
        $this->assertArrayHasKey('$$type', $result);
        $this->assertArrayHasKey('value', $result);
        $this->assertEquals('string', $result['$$type']);
        $this->assertIsString($result['value']);
    }
    
    /**
     * @test
     */
    public function it_supports_complete_css_parsing(): void {
        $this->assertCompleteCssParsingSupport($this->mapper, 'opacity', 'string');
    }
}
