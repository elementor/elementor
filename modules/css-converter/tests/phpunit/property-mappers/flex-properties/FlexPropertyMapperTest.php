<?php

namespace Elementor\Modules\CssConverter\Tests\PropertyMappers\FlexProperties;

use Elementor\Modules\CssConverter\Tests\PropertyMappers\AtomicWidgetComplianceTestCase;
use Elementor\Modules\CssConverter\Convertors\CssProperties\Properties\Flex_Property_Mapper;

class FlexPropertyMapperTest extends AtomicWidgetComplianceTestCase {
    
    private Flex_Property_Mapper $mapper;
    
    protected function setUp(): void {
        parent::setUp();
        $this->mapper = new Flex_Property_Mapper();
    }
    
    /**
     * @test
     */
    public function it_has_universal_mapper_compliance(): void {
        $result = $this->mapper->map_to_v4_atomic('flex', '1 0 auto');
        
        $this->assertUniversalMapperCompliance($result, 'string');
        $this->assertValidStringPropType($result);
    }
    
    /**
     * @test
     */
    public function it_supports_all_flex_properties(): void {
        $properties = [
            'flex' => '1 0 auto',
            'flex-grow' => '1',
            'flex-shrink' => '0',
            'flex-basis' => 'auto'
        ];
        
        foreach ($properties as $property => $value) {
            $result = $this->mapper->map_to_v4_atomic($property, $value);
            
            $this->assertUniversalMapperCompliance($result, 'string');
            $this->assertValidStringPropType($result);
        }
    }
    
    /**
     * @test
     */
    public function it_supports_flex_shorthand_values(): void {
        $shorthandTests = [
            '1' => '1', // flex-grow only
            '1 0' => '1 0', // flex-grow and flex-shrink
            '1 0 auto' => '1 0 auto', // All three values
            '0 1 200px' => '0 1 200px', // With pixel basis
            'auto' => 'auto', // Keyword
            'initial' => 'initial', // Keyword
            'none' => 'none', // Keyword
        ];
        
        foreach ($shorthandTests as $input => $expected) {
            $result = $this->mapper->map_to_v4_atomic('flex', $input);
            
            $this->assertUniversalMapperCompliance($result, 'string');
            $this->assertValidStringPropType($result);
            $this->assertEquals($expected, $result['value']);
        }
    }
    
    /**
     * @test
     */
    public function it_supports_flex_grow_and_shrink_values(): void {
        $numericTests = [
            '0' => '0',
            '1' => '1',
            '2' => '2',
            '0.5' => '0.5',
            '1.5' => '1.5',
        ];
        
        foreach (['flex-grow', 'flex-shrink'] as $property) {
            foreach ($numericTests as $input => $expected) {
                $result = $this->mapper->map_to_v4_atomic($property, $input);
                
                $this->assertUniversalMapperCompliance($result, 'string');
                $this->assertValidStringPropType($result);
                $this->assertEquals($expected, $result['value']);
            }
        }
    }
    
    /**
     * @test
     */
    public function it_supports_flex_basis_values(): void {
        $basisTests = [
            'auto' => 'auto',
            '200px' => '200px',
            '50%' => '50%',
            '10em' => '10em',
            '0' => '0',
        ];
        
        foreach ($basisTests as $input => $expected) {
            $result = $this->mapper->map_to_v4_atomic('flex-basis', $input);
            
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
            '  1 0 auto  ' => '1 0 auto', // Whitespace
            'AUTO' => 'auto', // Case normalization
            
            // Invalid values
            'invalid-flex' => null,
            '-1' => null, // Negative flex-grow/shrink not valid
            '' => null,
        ];
        
        foreach ($edgeCases as $input => $expected) {
            $result = $this->mapper->map_to_v4_atomic('flex', $input);
            
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
    public function it_correctly_identifies_supported_properties(): void {
        $this->assertTrue($this->mapper->supports('flex', '1 0 auto'));
        $this->assertTrue($this->mapper->supports('flex-grow', '1'));
        $this->assertTrue($this->mapper->supports('flex-shrink', '0'));
        $this->assertTrue($this->mapper->supports('flex-basis', 'auto'));
        $this->assertFalse($this->mapper->supports('display', 'flex'));
        $this->assertFalse($this->mapper->supports('flex', 'invalid-value'));
    }
    
    /**
     * @test
     */
    public function it_returns_exact_string_structure(): void {
        $result = $this->mapper->map_to_v4_atomic('flex', '1 0 auto');
        
        $this->assertIsArray($result);
        $this->assertArrayHasKey('$$type', $result);
        $this->assertArrayHasKey('value', $result);
        $this->assertEquals('string', $result['$$type']);
        $this->assertIsString($result['value']);
        $this->assertEquals('1 0 auto', $result['value']);
    }
    
    /**
     * @test
     */
    public function it_supports_complete_css_parsing(): void {
        $this->assertCompleteCssParsingSupport($this->mapper, 'flex', 'string');
    }
}
