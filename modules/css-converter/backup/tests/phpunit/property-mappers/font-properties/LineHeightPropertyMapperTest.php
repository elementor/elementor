<?php

namespace Elementor\Modules\CssConverter\Tests\PropertyMappers\FontProperties;

use Elementor\Modules\CssConverter\Tests\PropertyMappers\AtomicWidgetComplianceTestCase;
use Elementor\Modules\CssConverter\Convertors\CssProperties\Properties\Line_Height_Property_Mapper;

class LineHeightPropertyMapperTest extends AtomicWidgetComplianceTestCase {
    
    private Line_Height_Property_Mapper $mapper;
    
    protected function setUp(): void {
        parent::setUp();
        $this->mapper = new Line_Height_Property_Mapper();
    }
    
    /**
     * @test
     */
    public function it_has_universal_mapper_compliance(): void {
        $result = $this->mapper->map_to_v4_atomic('line-height', '1.5');
        
        $this->assertUniversalMapperCompliance($result, 'string');
    }
    
    /**
     * @test
     */
    public function it_supports_unitless_line_height_values(): void {
        $unitlessTests = [
            '1' => '1',
            '1.2' => '1.2',
            '1.5' => '1.5',
            '2' => '2',
            '0.8' => '0.8',
        ];
        
        foreach ($unitlessTests as $input => $expected) {
            $result = $this->mapper->map_to_v4_atomic('line-height', $input);
            
            $this->assertUniversalMapperCompliance($result, 'string');
            $this->assertEquals($expected, $result['value']);
        }
    }
    
    /**
     * @test
     */
    public function it_supports_line_height_with_units(): void {
        $unitTests = [
            '20px' => '20px',
            '1.5em' => '1.5em',
            '2rem' => '2rem',
            '120%' => '120%',
        ];
        
        foreach ($unitTests as $input => $expected) {
            $result = $this->mapper->map_to_v4_atomic('line-height', $input);
            
            $this->assertUniversalMapperCompliance($result, 'string');
            $this->assertEquals($expected, $result['value']);
        }
    }
    
    /**
     * @test
     */
    public function it_handles_normal_keyword(): void {
        $result = $this->mapper->map_to_v4_atomic('line-height', 'normal');
        
        $this->assertUniversalMapperCompliance($result, 'string');
        $this->assertEquals('1.2', $result['value']); // normal maps to 1.2
    }
    
    /**
     * @test
     */
    public function it_handles_numeric_input_types(): void {
        $numericInputTests = [
            1 => '1',
            1.5 => '1.5',
            2 => '2',
            0.8 => '0.8',
        ];
        
        foreach ($numericInputTests as $input => $expected) {
            $result = $this->mapper->map_to_v4_atomic('line-height', $input);
            
            $this->assertUniversalMapperCompliance($result, 'string');
            $this->assertEquals($expected, $result['value']);
        }
    }
    
    /**
     * @test
     */
    public function it_handles_css_parsing_edge_cases(): void {
        $edgeCases = [
            'NORMAL' => '1.2', // Case normalization
            '  1.5  ' => '1.5', // Whitespace
            'Normal' => '1.2', // Mixed case
            
            // Invalid values
            'invalid-height' => null,
            'auto' => null, // Not valid for line-height
            'inherit' => null,
            '' => null,
            '-1' => null, // Negative values not valid
        ];
        
        foreach ($edgeCases as $input => $expected) {
            $result = $this->mapper->map_to_v4_atomic('line-height', $input);
            
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
    public function it_correctly_identifies_supported_properties(): void {
        $this->assertTrue($this->mapper->supports('line-height', '1.5'));
        $this->assertTrue($this->mapper->supports('line-height', 'normal'));
        $this->assertTrue($this->mapper->supports('line-height', '20px'));
        $this->assertTrue($this->mapper->supports('line-height', 1.5));
        $this->assertFalse($this->mapper->supports('font-size', '1.5'));
        $this->assertFalse($this->mapper->supports('line-height', 'invalid-value'));
    }
    
    /**
     * @test
     */
    public function it_returns_consistent_structure(): void {
        $result = $this->mapper->map_to_v4_atomic('line-height', '1.5');
        
        $this->assertIsArray($result);
        $this->assertArrayHasKey('$$type', $result);
        $this->assertArrayHasKey('value', $result);
        $this->assertEquals('string', $result['$$type']);
        $this->assertEquals('1.5', $result['value']);
    }
    
    /**
     * @test
     */
    public function it_supports_complete_css_parsing(): void {
        $this->assertCompleteCssParsingSupport($this->mapper, 'line-height', 'string');
    }
}
