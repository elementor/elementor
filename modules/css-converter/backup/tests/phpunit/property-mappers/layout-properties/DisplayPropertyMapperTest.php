<?php

namespace Elementor\Modules\CssConverter\Tests\PropertyMappers\LayoutProperties;

use Elementor\Modules\CssConverter\Tests\PropertyMappers\AtomicWidgetComplianceTestCase;
use Elementor\Modules\CssConverter\Convertors\CssProperties\Properties\Display_Property_Mapper;

class DisplayPropertyMapperTest extends AtomicWidgetComplianceTestCase {
    
    private Display_Property_Mapper $mapper;
    
    protected function setUp(): void {
        parent::setUp();
        $this->mapper = new Display_Property_Mapper();
    }
    
    /**
     * @test
     */
    public function it_has_universal_mapper_compliance(): void {
        $result = $this->mapper->map_to_v4_atomic('display', 'flex');
        
        $this->assertUniversalMapperCompliance($result, 'string');
    }
    
    /**
     * @test
     */
    public function it_supports_all_valid_display_values(): void {
        $validDisplays = [
            'block', 'inline', 'inline-block', 'flex', 'inline-flex',
            'grid', 'inline-grid', 'none', 'table', 'table-cell', 'table-row'
        ];
        
        foreach ($validDisplays as $display) {
            $result = $this->mapper->map_to_v4_atomic('display', $display);
            
            $this->assertUniversalMapperCompliance($result, 'string');
            $this->assertEquals($display, $result['value']);
        }
    }
    
    /**
     * @test
     */
    public function it_handles_css_parsing_edge_cases(): void {
        $edgeCases = [
            'FLEX' => 'flex', // Case normalization
            '  block  ' => 'block', // Whitespace
            'Grid' => 'grid', // Mixed case
            
            // Invalid values
            'invalid-display' => null,
            'flexbox' => null, // Not a valid CSS display value
            'contents' => null, // Valid CSS but not in our list
            '' => null,
            'inherit' => null,
            'initial' => null,
        ];
        
        foreach ($edgeCases as $input => $expected) {
            $result = $this->mapper->map_to_v4_atomic('display', $input);
            
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
        $this->assertTrue($this->mapper->supports('display', 'flex'));
        $this->assertFalse($this->mapper->supports('visibility', 'flex'));
        $this->assertFalse($this->mapper->supports('display', 'invalid-value'));
    }
    
    /**
     * @test
     */
    public function it_returns_consistent_structure(): void {
        $result = $this->mapper->map_to_v4_atomic('display', 'flex');
        
        $this->assertIsArray($result);
        $this->assertArrayHasKey('$$type', $result);
        $this->assertArrayHasKey('value', $result);
        $this->assertEquals('string', $result['$$type']);
        $this->assertEquals('flex', $result['value']);
    }
    
    /**
     * @test
     */
    public function it_supports_complete_css_parsing(): void {
        $this->assertCompleteCssParsingSupport($this->mapper, 'display', 'string');
    }
}
