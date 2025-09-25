<?php

namespace Elementor\Modules\CssConverter\Tests\PropertyMappers\LayoutProperties;

use Elementor\Modules\CssConverter\Tests\PropertyMappers\AtomicWidgetComplianceTestCase;
use Elementor\Modules\CssConverter\Convertors\CssProperties\Properties\Position_Property_Mapper;

class PositionPropertyMapperTest extends AtomicWidgetComplianceTestCase {
    
    private Position_Property_Mapper $mapper;
    
    protected function setUp(): void {
        parent::setUp();
        $this->mapper = new Position_Property_Mapper();
    }
    
    /**
     * @test
     */
    public function it_has_universal_mapper_compliance(): void {
        $result = $this->mapper->map_to_v4_atomic('position', 'relative');
        
        $this->assertUniversalMapperCompliance($result, 'string');
        $this->assertValidStringPropType($result);
    }
    
    /**
     * @test
     */
    public function it_supports_all_position_properties(): void {
        $properties = [
            'position' => 'relative',
            'top' => '10px',
            'right' => '20px',
            'bottom' => '30px',
            'left' => '40px',
            'z-index' => '100'
        ];
        
        foreach ($properties as $property => $value) {
            $result = $this->mapper->map_to_v4_atomic($property, $value);
            
            $this->assertNotNull($result, "Property {$property} should be supported");
            $this->assertIsArray($result);
            $this->assertArrayHasKey('$$type', $result);
            $this->assertArrayHasKey('value', $result);
        }
    }
    
    /**
     * @test
     */
    public function it_supports_all_position_values(): void {
        $positionValues = [
            'static' => 'static',
            'relative' => 'relative',
            'absolute' => 'absolute',
            'fixed' => 'fixed',
            'sticky' => 'sticky',
        ];
        
        foreach ($positionValues as $input => $expected) {
            $result = $this->mapper->map_to_v4_atomic('position', $input);
            
            $this->assertUniversalMapperCompliance($result, 'string');
            $this->assertValidStringPropType($result);
            $this->assertEquals($expected, $result['value']);
        }
    }
    
    /**
     * @test
     */
    public function it_supports_positioning_offset_values(): void {
        $offsetTests = [
            '10px' => ['size' => 10, 'unit' => 'px'],
            '-5px' => ['size' => -5, 'unit' => 'px'], // Negative values allowed
            '50%' => ['size' => 50, 'unit' => '%'],
            '2em' => ['size' => 2, 'unit' => 'em'],
            'auto' => ['size' => 'auto', 'unit' => ''],
            '0' => ['size' => 0, 'unit' => 'px'],
        ];
        
        foreach (['top', 'right', 'bottom', 'left'] as $property) {
            foreach ($offsetTests as $input => $expected) {
                $result = $this->mapper->map_to_v4_atomic($property, $input);
                
                $this->assertUniversalMapperCompliance($result, 'string');
                $this->assertValidStringPropType($result);
                $this->assertEquals($input, $result['value']);
            }
        }
    }
    
    /**
     * @test
     */
    public function it_supports_z_index_values(): void {
        $zIndexTests = [
            '0' => '0',
            '100' => '100',
            '-10' => '-10', // Negative z-index allowed
            'auto' => 'auto',
        ];
        
        foreach ($zIndexTests as $input => $expected) {
            $result = $this->mapper->map_to_v4_atomic('z-index', $input);
            
            $this->assertUniversalMapperCompliance($result, 'string');
            $this->assertValidStringPropType($result);
            $this->assertEquals($expected, $result['value']);
        }
    }
    
    /**
     * @test
     */
    public function it_handles_css_parsing_edge_cases(): void {
        $edgeCases = [
            // Position edge cases
            'RELATIVE' => ['property' => 'position', 'expected' => 'relative'], // Case normalization
            '  absolute  ' => ['property' => 'position', 'expected' => 'absolute'], // Whitespace
            
            // Offset edge cases
            '  -10px  ' => ['property' => 'top', 'expected' => '-10px'], // Negative with whitespace
            
            // Z-index edge cases
            '  100  ' => ['property' => 'z-index', 'expected' => '100'], // Whitespace
            
            // Invalid values
            'invalid-position' => ['property' => 'position', 'expected' => null],
            'invalid-offset' => ['property' => 'top', 'expected' => null],
            'invalid-z' => ['property' => 'z-index', 'expected' => null],
        ];
        
        foreach ($edgeCases as $input => $test) {
            $result = $this->mapper->map_to_v4_atomic($test['property'], $input);
            
            if ($test['expected'] === null) {
                $this->assertNull($result);
            } else {
                $this->assertUniversalMapperCompliance($result, 'string');
                $this->assertValidStringPropType($result);
                $this->assertEquals($test['expected'], $result['value']);
            }
        }
    }
    
    /**
     * @test
     */
    public function it_correctly_identifies_supported_properties(): void {
        $this->assertTrue($this->mapper->supports('position', 'relative'));
        $this->assertTrue($this->mapper->supports('top', '10px'));
        $this->assertTrue($this->mapper->supports('z-index', '100'));
        $this->assertFalse($this->mapper->supports('display', 'relative'));
        $this->assertFalse($this->mapper->supports('position', 'invalid-value'));
    }
    
    /**
     * @test
     */
    public function it_returns_exact_string_structure(): void {
        $result = $this->mapper->map_to_v4_atomic('position', 'relative');
        
        $this->assertIsArray($result);
        $this->assertArrayHasKey('$$type', $result);
        $this->assertArrayHasKey('value', $result);
        $this->assertEquals('string', $result['$$type']);
        $this->assertIsString($result['value']);
        $this->assertEquals('relative', $result['value']);
    }
    
    /**
     * @test
     */
    public function it_supports_complete_css_parsing(): void {
        $this->assertCompleteCssParsingSupport($this->mapper, 'position', 'string');
    }
}
