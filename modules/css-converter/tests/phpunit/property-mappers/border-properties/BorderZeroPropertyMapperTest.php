<?php

namespace Elementor\Modules\CssConverter\Tests\PropertyMappers\BorderProperties;

use Elementor\Modules\CssConverter\Tests\PropertyMappers\AtomicWidgetComplianceTestCase;
use Elementor\Modules\CssConverter\Convertors\CssProperties\Properties\Border_Zero_Property_Mapper;

class BorderZeroPropertyMapperTest extends AtomicWidgetComplianceTestCase {
    
    private Border_Zero_Property_Mapper $mapper;
    
    protected function setUp(): void {
        parent::setUp();
        $this->mapper = new Border_Zero_Property_Mapper();
    }
    
    /**
     * @test
     */
    public function it_has_universal_mapper_compliance(): void {
        $result = $this->mapper->map_to_v4_atomic('border', '0');
        
        $this->assertUniversalMapperCompliance($result, 'string');
        $this->assertValidStringPropType($result);
    }
    
    /**
     * @test
     */
    public function it_supports_zero_border_values(): void {
        $zeroValues = [
            '0' => '0',
            '0px' => '0px',
            'none' => 'none',
        ];
        
        foreach ($zeroValues as $input => $expected) {
            $result = $this->mapper->map_to_v4_atomic('border', $input);
            
            $this->assertUniversalMapperCompliance($result, 'string');
            $this->assertValidStringPropType($result);
            $this->assertEquals($expected, $result['value']);
        }
    }
    
    /**
     * @test
     */
    public function it_handles_case_normalization(): void {
        $caseTests = [
            'NONE' => 'none',
            'None' => 'none',
            '0PX' => '0px',
        ];
        
        foreach ($caseTests as $input => $expected) {
            $result = $this->mapper->map_to_v4_atomic('border', $input);
            
            $this->assertUniversalMapperCompliance($result, 'string');
            $this->assertValidStringPropType($result);
            $this->assertEquals($expected, $result['value']);
        }
    }
    
    /**
     * @test
     */
    public function it_handles_whitespace(): void {
        $whitespaceTests = [
            '  0  ' => '0',
            '  none  ' => 'none',
            '  0px  ' => '0px',
        ];
        
        foreach ($whitespaceTests as $input => $expected) {
            $result = $this->mapper->map_to_v4_atomic('border', $input);
            
            $this->assertUniversalMapperCompliance($result, 'string');
            $this->assertValidStringPropType($result);
            $this->assertEquals($expected, $result['value']);
        }
    }
    
    /**
     * @test
     */
    public function it_rejects_non_zero_values(): void {
        $nonZeroValues = [
            '1px',
            '1px solid #000',
            'solid',
            '#000',
            'inherit',
            'initial',
            '',
        ];
        
        foreach ($nonZeroValues as $input) {
            $result = $this->mapper->map_to_v4_atomic('border', $input);
            
            $this->assertNull($result, "Border zero mapper should reject non-zero value: '{$input}'");
        }
    }
    
    /**
     * @test
     */
    public function it_only_supports_border_property(): void {
        $this->assertTrue($this->mapper->supports('border', '0'));
        $this->assertTrue($this->mapper->supports('border', 'none'));
        $this->assertFalse($this->mapper->supports('border-top', '0'));
        $this->assertFalse($this->mapper->supports('border-width', '0'));
        $this->assertFalse($this->mapper->supports('margin', '0'));
    }
    
    /**
     * @test
     */
    public function it_correctly_identifies_supported_values(): void {
        $this->assertTrue($this->mapper->supports('border', '0'));
        $this->assertTrue($this->mapper->supports('border', '0px'));
        $this->assertTrue($this->mapper->supports('border', 'none'));
        $this->assertFalse($this->mapper->supports('border', '1px'));
        $this->assertFalse($this->mapper->supports('border', 'solid'));
        $this->assertFalse($this->mapper->supports('border', ''));
    }
    
    /**
     * @test
     */
    public function it_returns_exact_string_structure(): void {
        $result = $this->mapper->map_to_v4_atomic('border', '0');
        
        $this->assertIsArray($result);
        $this->assertArrayHasKey('$$type', $result);
        $this->assertArrayHasKey('value', $result);
        $this->assertEquals('string', $result['$$type']);
        $this->assertIsString($result['value']);
        $this->assertEquals('0', $result['value']);
    }
    
    /**
     * @test
     */
    public function it_supports_complete_css_parsing(): void {
        $this->assertCompleteCssParsingSupport($this->mapper, 'border', 'string');
    }
}
