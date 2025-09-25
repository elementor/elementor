<?php

namespace Elementor\Modules\CssConverter\Tests\PropertyMappers\StringProperties;

use Elementor\Modules\CssConverter\Tests\PropertyMappers\AtomicWidgetComplianceTestCase;
use Elementor\Modules\CssConverter\Convertors\CssProperties\Properties\Filter_Property_Mapper;

class FilterPropertyMapperTest extends AtomicWidgetComplianceTestCase {
    
    private Filter_Property_Mapper $mapper;
    
    protected function setUp(): void {
        parent::setUp();
        $this->mapper = new Filter_Property_Mapper();
    }
    
    /**
     * @test
     */
    public function it_has_universal_mapper_compliance(): void {
        $result = $this->mapper->map_to_v4_atomic('filter', 'blur(5px)');
        
        $this->assertUniversalMapperCompliance($result, 'string');
        $this->assertValidStringPropType($result);
    }
    
    /**
     * @test
     */
    public function it_supports_single_filter_functions(): void {
        $filterTests = [
            'blur(5px)' => 'blur(5px)',
            'brightness(0.8)' => 'brightness(0.8)',
            'contrast(150%)' => 'contrast(150%)',
            'grayscale(100%)' => 'grayscale(100%)',
            'hue-rotate(90deg)' => 'hue-rotate(90deg)',
            'invert(1)' => 'invert(1)',
            'opacity(0.5)' => 'opacity(0.5)',
            'saturate(200%)' => 'saturate(200%)',
            'sepia(50%)' => 'sepia(50%)',
        ];
        
        foreach ($filterTests as $input => $expected) {
            $result = $this->mapper->map_to_v4_atomic('filter', $input);
            
            $this->assertUniversalMapperCompliance($result, 'string');
            $this->assertValidStringPropType($result);
            $this->assertEquals($expected, $result['value']);
        }
    }
    
    /**
     * @test
     */
    public function it_supports_multiple_filter_functions(): void {
        $multiFilterTests = [
            'blur(5px) brightness(0.8)' => 'blur(5px) brightness(0.8)',
            'contrast(150%) grayscale(50%)' => 'contrast(150%) grayscale(50%)',
            'blur(2px) brightness(1.2) contrast(120%)' => 'blur(2px) brightness(1.2) contrast(120%)',
        ];
        
        foreach ($multiFilterTests as $input => $expected) {
            $result = $this->mapper->map_to_v4_atomic('filter', $input);
            
            $this->assertUniversalMapperCompliance($result, 'string');
            $this->assertValidStringPropType($result);
            $this->assertEquals($expected, $result['value']);
        }
    }
    
    /**
     * @test
     */
    public function it_supports_drop_shadow_filter(): void {
        $dropShadowTests = [
            'drop-shadow(2px 2px 4px rgba(0,0,0,0.5))' => 'drop-shadow(2px 2px 4px rgba(0,0,0,0.5))',
            'drop-shadow(0 0 10px #ff0000)' => 'drop-shadow(0 0 10px #ff0000)',
        ];
        
        foreach ($dropShadowTests as $input => $expected) {
            $result = $this->mapper->map_to_v4_atomic('filter', $input);
            
            $this->assertUniversalMapperCompliance($result, 'string');
            $this->assertValidStringPropType($result);
            $this->assertEquals($expected, $result['value']);
        }
    }
    
    /**
     * @test
     */
    public function it_handles_filter_edge_cases(): void {
        $edgeCases = [
            'none' => 'none', // No filter
            '  blur(5px)  ' => 'blur(5px)', // Whitespace
            'BLUR(5PX)' => 'blur(5px)', // Case normalization
            
            // Invalid values
            '' => null, // Empty string
            'invalid-filter' => null, // Invalid filter function
        ];
        
        foreach ($edgeCases as $input => $expected) {
            $result = $this->mapper->map_to_v4_atomic('filter', $input);
            
            if ($expected === null) {
                $this->assertNull($result);
            } else {
                $this->assertUniversalMapperCompliance($result, 'string');
                $this->assertValidStringPropType($result);
                $this->assertEquals($expected, $result['value']);
            }
        }
    }
    
    /**
     * @test
     */
    public function it_handles_complex_filter_combinations(): void {
        $complexTests = [
            'blur(5px) brightness(0.8) contrast(120%) grayscale(50%)' => 
                'blur(5px) brightness(0.8) contrast(120%) grayscale(50%)',
            'drop-shadow(2px 2px 4px rgba(0,0,0,0.3)) blur(1px)' => 
                'drop-shadow(2px 2px 4px rgba(0,0,0,0.3)) blur(1px)',
        ];
        
        foreach ($complexTests as $input => $expected) {
            $result = $this->mapper->map_to_v4_atomic('filter', $input);
            
            $this->assertUniversalMapperCompliance($result, 'string');
            $this->assertValidStringPropType($result);
            $this->assertEquals($expected, $result['value']);
        }
    }
    
    /**
     * @test
     */
    public function it_correctly_identifies_supported_properties(): void {
        $this->assertTrue($this->mapper->supports('filter', 'blur(5px)'));
        $this->assertTrue($this->mapper->supports('filter', 'none'));
        $this->assertFalse($this->mapper->supports('backdrop-filter', 'blur(5px)'));
        $this->assertFalse($this->mapper->supports('filter', ''));
    }
    
    /**
     * @test
     */
    public function it_returns_exact_string_structure(): void {
        $result = $this->mapper->map_to_v4_atomic('filter', 'blur(5px)');
        
        $this->assertIsArray($result);
        $this->assertArrayHasKey('$$type', $result);
        $this->assertArrayHasKey('value', $result);
        $this->assertEquals('string', $result['$$type']);
        $this->assertIsString($result['value']);
        $this->assertEquals('blur(5px)', $result['value']);
    }
    
    /**
     * @test
     */
    public function it_supports_complete_css_parsing(): void {
        $this->assertCompleteCssParsingSupport($this->mapper, 'filter', 'string');
    }
}
