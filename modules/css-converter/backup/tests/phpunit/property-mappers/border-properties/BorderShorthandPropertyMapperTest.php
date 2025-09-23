<?php

namespace Elementor\Modules\CssConverter\Tests\PropertyMappers\BorderProperties;

use Elementor\Modules\CssConverter\Tests\PropertyMappers\AtomicWidgetComplianceTestCase;
use Elementor\Modules\CssConverter\Convertors\CssProperties\Properties\Border_Shorthand_Property_Mapper;

class BorderShorthandPropertyMapperTest extends AtomicWidgetComplianceTestCase {
    
    private Border_Shorthand_Property_Mapper $mapper;
    
    protected function setUp(): void {
        parent::setUp();
        $this->mapper = new Border_Shorthand_Property_Mapper();
    }
    
    /**
     * @test
     */
    public function it_has_universal_mapper_compliance(): void {
        $result = $this->mapper->map_to_v4_atomic('border', '1px solid #000');
        
        $this->assertUniversalMapperCompliance($result, 'border');
        $this->assertValidBorderPropType($result);
    }
    
    /**
     * @test
     */
    public function it_supports_complete_border_shorthand(): void {
        $shorthandTests = [
            '1px solid #000' => [
                'width' => ['size' => 1, 'unit' => 'px'],
                'style' => 'solid',
                'color' => '#000000'
            ],
            '2px dashed red' => [
                'width' => ['size' => 2, 'unit' => 'px'],
                'style' => 'dashed',
                'color' => '#ff0000'
            ],
            '3px dotted rgba(255,0,0,0.5)' => [
                'width' => ['size' => 3, 'unit' => 'px'],
                'style' => 'dotted',
                'color' => 'rgba(255,0,0,0.5)'
            ],
        ];
        
        foreach ($shorthandTests as $input => $expected) {
            $result = $this->mapper->map_to_v4_atomic('border', $input);
            
            $this->assertUniversalMapperCompliance($result, 'border');
            $this->assertValidBorderPropType($result);
            
            // Validate parsed components
            if (isset($expected['width'])) {
                $this->assertArrayHasKey('width', $result['value']);
                $this->assertEquals('size', $result['value']['width']['$$type']);
                $this->assertEquals($expected['width']['size'], $result['value']['width']['value']['size']);
                $this->assertEquals($expected['width']['unit'], $result['value']['width']['value']['unit']);
            }
            
            if (isset($expected['style'])) {
                $this->assertArrayHasKey('style', $result['value']);
                $this->assertEquals('string', $result['value']['style']['$$type']);
                $this->assertEquals($expected['style'], $result['value']['style']['value']);
            }
            
            if (isset($expected['color'])) {
                $this->assertArrayHasKey('color', $result['value']);
                $this->assertEquals('color', $result['value']['color']['$$type']);
                $this->assertEquals($expected['color'], $result['value']['color']['value']);
            }
        }
    }
    
    /**
     * @test
     */
    public function it_supports_partial_border_shorthand(): void {
        $partialTests = [
            '1px solid' => ['width', 'style'], // Missing color
            'solid #000' => ['style', 'color'], // Missing width
            '2px #ff0000' => ['width', 'color'], // Missing style
            'solid' => ['style'], // Only style
            '#000' => ['color'], // Only color
            '1px' => ['width'], // Only width
        ];
        
        foreach ($partialTests as $input => $expectedComponents) {
            $result = $this->mapper->map_to_v4_atomic('border', $input);
            
            $this->assertUniversalMapperCompliance($result, 'border');
            $this->assertValidBorderPropType($result);
            
            // Check that expected components are present
            foreach ($expectedComponents as $component) {
                $this->assertArrayHasKey($component, $result['value'], 
                    "Border shorthand '{$input}' should contain {$component}");
            }
        }
    }
    
    /**
     * @test
     */
    public function it_handles_different_border_orders(): void {
        $orderTests = [
            '1px solid #000' => true, // Standard order
            'solid 1px #000' => true, // Style first
            '#000 1px solid' => true, // Color first
            'solid #000 1px' => true, // Mixed order
        ];
        
        foreach ($orderTests as $input => $shouldWork) {
            $result = $this->mapper->map_to_v4_atomic('border', $input);
            
            if ($shouldWork) {
                $this->assertUniversalMapperCompliance($result, 'border');
                $this->assertValidBorderPropType($result);
            }
        }
    }
    
    /**
     * @test
     */
    public function it_handles_css_parsing_edge_cases(): void {
        $edgeCases = [
            '  1px solid #000  ' => true, // Whitespace
            'none' => true, // Border none
            '0' => true, // Zero border
            
            // Invalid values
            'invalid-border' => null,
            '' => null,
        ];
        
        foreach ($edgeCases as $input => $expected) {
            $result = $this->mapper->map_to_v4_atomic('border', $input);
            
            if ($expected === null) {
                $this->assertNull($result);
            } else {
                $this->assertNotNull($result);
                $this->assertIsArray($result);
                $this->assertArrayHasKey('$$type', $result);
            }
        }
    }
    
    /**
     * @test
     */
    public function it_correctly_identifies_supported_properties(): void {
        $this->assertTrue($this->mapper->supports('border', '1px solid #000'));
        $this->assertTrue($this->mapper->supports('border', 'none'));
        $this->assertFalse($this->mapper->supports('border-top', '1px solid #000'));
        $this->assertFalse($this->mapper->supports('border', ''));
    }
    
    /**
     * @test
     */
    public function it_returns_exact_border_structure(): void {
        $result = $this->mapper->map_to_v4_atomic('border', '1px solid #000');
        
        $this->assertIsArray($result);
        $this->assertArrayHasKey('$$type', $result);
        $this->assertArrayHasKey('value', $result);
        $this->assertEquals('border', $result['$$type']);
        
        $this->assertIsArray($result['value']);
        $this->assertArrayHasKey('width', $result['value']);
        $this->assertArrayHasKey('style', $result['value']);
        $this->assertArrayHasKey('color', $result['value']);
    }
    
    /**
     * @test
     */
    public function it_supports_complete_css_parsing(): void {
        $this->assertCompleteCssParsingSupport($this->mapper, 'border', 'border');
    }
    
    /**
     * Validate Border_Prop_Type structure (extremely specific)
     */
    protected function assertValidBorderPropType(array $result): void {
        $this->assertAtomicWidgetCompliance($result, 'border');
        $this->assertIsArray($result['value']);
        
        // Border can have width, style, and color components
        $validComponents = ['width', 'style', 'color'];
        
        foreach ($result['value'] as $component => $value) {
            $this->assertContains($component, $validComponents, "Invalid border component: {$component}");
            
            if ($component === 'width') {
                $this->assertValidSizePropType($value);
            } elseif ($component === 'style') {
                $this->assertValidStringPropType($value);
            } elseif ($component === 'color') {
                $this->assertValidColorPropType($value);
            }
        }
    }
}
