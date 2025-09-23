<?php

namespace Elementor\Modules\CssConverter\Tests\PropertyMappers\StringProperties;

use Elementor\Modules\CssConverter\Tests\PropertyMappers\AtomicWidgetComplianceTestCase;
use Elementor\Modules\CssConverter\Convertors\CssProperties\Properties\Text_Align_Property_Mapper;

class TextAlignPropertyMapperTest extends AtomicWidgetComplianceTestCase {
    
    private Text_Align_Property_Mapper $mapper;
    
    protected function setUp(): void {
        parent::setUp();
        $this->mapper = new Text_Align_Property_Mapper();
    }
    
    /**
     * @test
     */
    public function it_has_universal_mapper_compliance(): void {
        $result = $this->mapper->map_to_v4_atomic('text-align', 'center');
        
        $this->assertUniversalMapperCompliance($result, 'string');
    }
    
    /**
     * @test
     */
    public function it_supports_all_text_align_values_with_mapping(): void {
        $alignmentTests = [
            'left' => 'start', // CSS left maps to Elementor start
            'right' => 'end', // CSS right maps to Elementor end
            'center' => 'center',
            'justify' => 'justify',
            'start' => 'start',
            'end' => 'end',
        ];
        
        foreach ($alignmentTests as $input => $expected) {
            $result = $this->mapper->map_to_v4_atomic('text-align', $input);
            
            $this->assertUniversalMapperCompliance($result, 'string');
            $this->assertEquals($expected, $result['value']);
        }
    }
    
    /**
     * @test
     */
    public function it_handles_css_parsing_edge_cases(): void {
        $edgeCases = [
            'LEFT' => 'start', // Case normalization
            '  center  ' => 'center', // Whitespace
            'Center' => 'center', // Mixed case
            
            // Invalid values
            'invalid-align' => null,
            'middle' => null, // Not a valid text-align value
            'top' => null, // Vertical alignment, not text-align
            '' => null,
            'inherit' => null,
            'initial' => null,
        ];
        
        foreach ($edgeCases as $input => $expected) {
            $result = $this->mapper->map_to_v4_atomic('text-align', $input);
            
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
        $this->assertTrue($this->mapper->supports('text-align', 'center'));
        $this->assertTrue($this->mapper->supports('text-align', 'left'));
        $this->assertFalse($this->mapper->supports('vertical-align', 'center'));
        $this->assertFalse($this->mapper->supports('text-align', 'invalid-value'));
    }
    
    /**
     * @test
     */
    public function it_returns_consistent_structure(): void {
        $result = $this->mapper->map_to_v4_atomic('text-align', 'center');
        
        $this->assertIsArray($result);
        $this->assertArrayHasKey('$$type', $result);
        $this->assertArrayHasKey('value', $result);
        $this->assertEquals('string', $result['$$type']);
        $this->assertEquals('center', $result['value']);
    }
    
    /**
     * @test
     */
    public function it_supports_complete_css_parsing(): void {
        $this->assertCompleteCssParsingSupport($this->mapper, 'text-align', 'string');
    }
}
