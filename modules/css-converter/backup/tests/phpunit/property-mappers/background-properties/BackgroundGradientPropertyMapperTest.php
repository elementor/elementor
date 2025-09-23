<?php

namespace Elementor\Modules\CssConverter\Tests\PropertyMappers\BackgroundProperties;

use Elementor\Modules\CssConverter\Tests\PropertyMappers\AtomicWidgetComplianceTestCase;
use Elementor\Modules\CssConverter\Convertors\CssProperties\Properties\Background_Gradient_Property_Mapper;

class BackgroundGradientPropertyMapperTest extends AtomicWidgetComplianceTestCase {
    
    private Background_Gradient_Property_Mapper $mapper;
    
    protected function setUp(): void {
        parent::setUp();
        $this->mapper = new Background_Gradient_Property_Mapper();
    }
    
    /**
     * @test
     */
    public function it_has_universal_mapper_compliance(): void {
        $result = $this->mapper->map_to_v4_atomic('background', 'linear-gradient(45deg, #667eea, #764ba2)');
        
        $this->assertUniversalMapperCompliance($result, 'background');
        $this->assertValidBackgroundPropType($result);
    }
    
    /**
     * @test
     */
    public function it_supports_linear_gradients(): void {
        $gradientTests = [
            'linear-gradient(45deg, #667eea, #764ba2)',
            'linear-gradient(to right, red, blue)',
            'linear-gradient(90deg, rgba(255,0,0,0.5), rgba(0,255,0,0.5))',
            'linear-gradient(180deg, #ff0000 0%, #00ff00 50%, #0000ff 100%)',
        ];
        
        foreach ($gradientTests as $gradient) {
            $result = $this->mapper->map_to_v4_atomic('background', $gradient);
            
            $this->assertUniversalMapperCompliance($result, 'background');
            $this->assertIsArray($result['value']);
        }
    }
    
    /**
     * @test
     */
    public function it_supports_radial_gradients(): void {
        $gradientTests = [
            'radial-gradient(circle, #667eea, #764ba2)',
            'radial-gradient(ellipse at center, red, blue)',
            'radial-gradient(circle at 50% 50%, rgba(255,0,0,0.5), rgba(0,255,0,0.5))',
        ];
        
        foreach ($gradientTests as $gradient) {
            $result = $this->mapper->map_to_v4_atomic('background', $gradient);
            
            $this->assertUniversalMapperCompliance($result, 'background');
            $this->assertIsArray($result['value']);
        }
    }
    
    /**
     * @test
     */
    public function it_supports_background_and_background_image_properties(): void {
        $properties = ['background', 'background-image'];
        
        foreach ($properties as $property) {
            $result = $this->mapper->map_to_v4_atomic($property, 'linear-gradient(45deg, #667eea, #764ba2)');
            
            $this->assertUniversalMapperCompliance($result, 'background');
        }
    }
    
    /**
     * @test
     */
    public function it_handles_gradient_parsing_edge_cases(): void {
        $edgeCases = [
            'linear-gradient(#667eea, #764ba2)', // No angle
            'linear-gradient( 45deg , #667eea , #764ba2 )', // Extra spaces
            'radial-gradient(#667eea, #764ba2)', // Simple radial
            
            // Invalid values that should be rejected
            'not-a-gradient' => null,
            'background-color: red' => null,
            '' => null,
        ];
        
        foreach ($edgeCases as $input => $expected) {
            $result = $this->mapper->map_to_v4_atomic('background', $input);
            
            if ($expected === null) {
                $this->assertNull($result);
            } else {
                $this->assertUniversalMapperCompliance($result, 'background');
            }
        }
    }
    
    /**
     * @test
     */
    public function it_correctly_identifies_supported_properties(): void {
        $this->assertTrue($this->mapper->supports('background', 'linear-gradient(45deg, red, blue)'));
        $this->assertTrue($this->mapper->supports('background-image', 'radial-gradient(circle, red, blue)'));
        $this->assertFalse($this->mapper->supports('color', 'linear-gradient(45deg, red, blue)'));
        $this->assertFalse($this->mapper->supports('background', 'solid-color'));
    }
    
    /**
     * @test
     */
    public function it_returns_exact_background_gradient_structure(): void {
        $result = $this->mapper->map_to_v4_atomic('background', 'linear-gradient(45deg, #667eea, #764ba2)');
        
        // EXACT structure validation - must match atomic widget expectations
        $this->assertIsArray($result);
        $this->assertArrayHasKey('$$type', $result);
        $this->assertArrayHasKey('value', $result);
        $this->assertEquals('background', $result['$$type']);
        
        // Validate nested background-overlay structure
        $this->assertIsArray($result['value']);
        $this->assertArrayHasKey('background-overlay', $result['value']);
        
        $overlay = $result['value']['background-overlay'];
        $this->assertIsArray($overlay);
        $this->assertArrayHasKey('$$type', $overlay);
        $this->assertArrayHasKey('value', $overlay);
        $this->assertEquals('background-overlay', $overlay['$$type']);
        
        // Validate overlay value is array of gradient overlays
        $this->assertIsArray($overlay['value']);
        $this->assertNotEmpty($overlay['value']);
        
        $gradientOverlay = $overlay['value'][0];
        $this->assertIsArray($gradientOverlay);
        $this->assertArrayHasKey('$$type', $gradientOverlay);
        $this->assertArrayHasKey('value', $gradientOverlay);
        $this->assertEquals('background-gradient-overlay', $gradientOverlay['$$type']);
        
        // Validate gradient data structure
        $gradientData = $gradientOverlay['value'];
        $this->assertIsArray($gradientData);
        $this->assertArrayHasKey('type', $gradientData);
        $this->assertArrayHasKey('angle', $gradientData);
        $this->assertArrayHasKey('stops', $gradientData);
        
        // Validate type structure
        $this->assertIsArray($gradientData['type']);
        $this->assertArrayHasKey('$$type', $gradientData['type']);
        $this->assertArrayHasKey('value', $gradientData['type']);
        $this->assertEquals('string', $gradientData['type']['$$type']);
        $this->assertEquals('linear', $gradientData['type']['value']);
        
        // Validate angle structure
        $this->assertIsArray($gradientData['angle']);
        $this->assertArrayHasKey('$$type', $gradientData['angle']);
        $this->assertArrayHasKey('value', $gradientData['angle']);
        $this->assertEquals('number', $gradientData['angle']['$$type']);
        $this->assertIsNumeric($gradientData['angle']['value']);
        
        // Validate stops structure
        $this->assertIsArray($gradientData['stops']);
        $this->assertArrayHasKey('$$type', $gradientData['stops']);
        $this->assertArrayHasKey('value', $gradientData['stops']);
        $this->assertEquals('gradient-color-stop', $gradientData['stops']['$$type']);
        $this->assertIsArray($gradientData['stops']['value']);
    }
    
    /**
     * @test
     */
    public function it_supports_complete_css_parsing(): void {
        $this->assertCompleteCssParsingSupport($this->mapper, 'background', 'background');
    }
}
