<?php

namespace Elementor\Modules\CssConverter\Tests\PropertyMappers\FontProperties;

use Elementor\Modules\CssConverter\Tests\PropertyMappers\AtomicWidgetComplianceTestCase;
use Elementor\Modules\CssConverter\Convertors\CssProperties\Properties\Font_Weight_Property_Mapper;

class FontWeightPropertyMapperTest extends AtomicWidgetComplianceTestCase {
    
    private Font_Weight_Property_Mapper $mapper;
    
    protected function setUp(): void {
        parent::setUp();
        $this->mapper = new Font_Weight_Property_Mapper();
    }
    
    /**
     * @test
     */
    public function it_has_universal_mapper_compliance(): void {
        $result = $this->mapper->map_to_v4_atomic('font-weight', 'bold');
        
        $this->assertUniversalMapperCompliance($result, 'string');
    }
    
    /**
     * @test
     */
    public function it_supports_keyword_font_weights_with_normalization(): void {
        $keywordTests = [
            'normal' => '400',
            'bold' => '700',
            'lighter' => '300',
            'bolder' => '700',
        ];
        
        foreach ($keywordTests as $input => $expected) {
            $result = $this->mapper->map_to_v4_atomic('font-weight', $input);
            
            $this->assertUniversalMapperCompliance($result, 'string');
            $this->assertEquals($expected, $result['value']);
        }
    }
    
    /**
     * @test
     */
    public function it_supports_numeric_font_weights(): void {
        $numericTests = [
            '100' => '100',
            '200' => '200',
            '300' => '300',
            '400' => '400',
            '500' => '500',
            '600' => '600',
            '700' => '700',
            '800' => '800',
            '900' => '900',
        ];
        
        foreach ($numericTests as $input => $expected) {
            $result = $this->mapper->map_to_v4_atomic('font-weight', $input);
            
            $this->assertUniversalMapperCompliance($result, 'string');
            $this->assertEquals($expected, $result['value']);
        }
    }
    
    /**
     * @test
     */
    public function it_handles_numeric_input_types(): void {
        $numericInputTests = [
            100 => '100',
            400 => '400',
            700 => '700',
            900 => '900',
        ];
        
        foreach ($numericInputTests as $input => $expected) {
            $result = $this->mapper->map_to_v4_atomic('font-weight', $input);
            
            $this->assertUniversalMapperCompliance($result, 'string');
            $this->assertEquals($expected, $result['value']);
        }
    }
    
    /**
     * @test
     */
    public function it_handles_css_parsing_edge_cases(): void {
        $edgeCases = [
            'BOLD' => '700', // Case normalization
            '  400  ' => '400', // Whitespace
            'Normal' => '400', // Mixed case
            
            // Invalid values
            '150' => null, // Not a valid font-weight increment
            '50' => null, // Below minimum
            '1000' => null, // Above maximum
            'heavy' => null, // Not a standard keyword
            'inherit' => null,
            '' => null,
        ];
        
        foreach ($edgeCases as $input => $expected) {
            $result = $this->mapper->map_to_v4_atomic('font-weight', $input);
            
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
    public function it_validates_numeric_font_weight_increments(): void {
        $incrementTests = [
            '100' => '100', // Valid
            '200' => '200', // Valid
            '150' => null, // Invalid - not multiple of 100
            '450' => null, // Invalid - not multiple of 100
            '50' => null, // Invalid - below 100
            '950' => null, // Invalid - above 900
        ];
        
        foreach ($incrementTests as $input => $expected) {
            $result = $this->mapper->map_to_v4_atomic('font-weight', $input);
            
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
        $this->assertTrue($this->mapper->supports('font-weight', 'bold'));
        $this->assertTrue($this->mapper->supports('font-weight', '400'));
        $this->assertTrue($this->mapper->supports('font-weight', 700));
        $this->assertFalse($this->mapper->supports('font-style', 'bold'));
        $this->assertFalse($this->mapper->supports('font-weight', 'invalid-value'));
    }
    
    /**
     * @test
     */
    public function it_returns_consistent_structure(): void {
        $result = $this->mapper->map_to_v4_atomic('font-weight', 'bold');
        
        $this->assertIsArray($result);
        $this->assertArrayHasKey('$$type', $result);
        $this->assertArrayHasKey('value', $result);
        $this->assertEquals('string', $result['$$type']);
        $this->assertEquals('700', $result['value']);
    }
    
    /**
     * @test
     */
    public function it_supports_complete_css_parsing(): void {
        $this->assertCompleteCssParsingSupport($this->mapper, 'font-weight', 'string');
    }
}
