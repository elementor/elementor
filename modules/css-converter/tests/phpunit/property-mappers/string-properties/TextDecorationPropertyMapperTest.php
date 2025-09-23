<?php

namespace Elementor\Modules\CssConverter\Tests\PropertyMappers\StringProperties;

use Elementor\Modules\CssConverter\Tests\PropertyMappers\AtomicWidgetComplianceTestCase;
use Elementor\Modules\CssConverter\Convertors\CssProperties\Properties\Text_Decoration_Property_Mapper;

class TextDecorationPropertyMapperTest extends AtomicWidgetComplianceTestCase {
    
    private Text_Decoration_Property_Mapper $mapper;
    
    protected function setUp(): void {
        parent::setUp();
        $this->mapper = new Text_Decoration_Property_Mapper();
    }
    
    /**
     * @test
     */
    public function it_has_universal_mapper_compliance(): void {
        $result = $this->mapper->map_to_v4_atomic('text-decoration', 'underline');
        
        $this->assertUniversalMapperCompliance($result, 'string');
        $this->assertValidStringPropType($result);
    }
    
    /**
     * @test
     */
    public function it_supports_all_text_decoration_values(): void {
        $decorationTests = [
            'none' => 'none',
            'underline' => 'underline',
            'overline' => 'overline',
            'line-through' => 'line-through',
        ];
        
        foreach ($decorationTests as $input => $expected) {
            $result = $this->mapper->map_to_v4_atomic('text-decoration', $input);
            
            $this->assertUniversalMapperCompliance($result, 'string');
            $this->assertValidStringPropType($result);
            $this->assertEquals($expected, $result['value']);
        }
    }
    
    /**
     * @test
     */
    public function it_handles_complex_text_decoration_values(): void {
        $complexTests = [
            'underline solid red' => 'underline', // Extract underline from complex value
            'line-through dotted blue' => 'line-through', // Extract line-through
            'overline wavy green' => 'overline', // Extract overline
            'underline overline' => 'underline', // First match wins
        ];
        
        foreach ($complexTests as $input => $expected) {
            $result = $this->mapper->map_to_v4_atomic('text-decoration', $input);
            
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
            'UNDERLINE' => 'underline', // Case normalization
            '  none  ' => 'none', // Whitespace
            'Underline' => 'underline', // Mixed case
            
            // Invalid values
            'invalid-decoration' => null,
            'blink' => null, // Not in supported list
            'inherit' => null,
            '' => null,
        ];
        
        foreach ($edgeCases as $input => $expected) {
            $result = $this->mapper->map_to_v4_atomic('text-decoration', $input);
            
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
        $this->assertTrue($this->mapper->supports('text-decoration', 'underline'));
        $this->assertTrue($this->mapper->supports('text-decoration', 'none'));
        $this->assertFalse($this->mapper->supports('text-transform', 'underline'));
        $this->assertFalse($this->mapper->supports('text-decoration', 'invalid-value'));
    }
    
    /**
     * @test
     */
    public function it_returns_exact_string_structure(): void {
        $result = $this->mapper->map_to_v4_atomic('text-decoration', 'underline');
        
        $this->assertIsArray($result);
        $this->assertArrayHasKey('$$type', $result);
        $this->assertArrayHasKey('value', $result);
        $this->assertEquals('string', $result['$$type']);
        $this->assertIsString($result['value']);
        $this->assertEquals('underline', $result['value']);
    }
    
    /**
     * @test
     */
    public function it_supports_complete_css_parsing(): void {
        $this->assertCompleteCssParsingSupport($this->mapper, 'text-decoration', 'string');
    }
}
