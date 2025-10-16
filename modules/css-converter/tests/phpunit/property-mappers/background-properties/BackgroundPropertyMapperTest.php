<?php

namespace Elementor\Modules\CssConverter\Tests\PropertyMappers\BackgroundProperties;

use Elementor\Modules\CssConverter\Tests\PropertyMappers\AtomicWidgetComplianceTestCase;
use Elementor\Modules\CssConverter\Convertors\CssProperties\Properties\Background_Property_Mapper;

class BackgroundPropertyMapperTest extends AtomicWidgetComplianceTestCase {
    
    private Background_Property_Mapper $mapper;
    
    protected function setUp(): void {
        parent::setUp();
        $this->mapper = new Background_Property_Mapper();
    }
    
    /**
     * @test
     */
    public function it_has_universal_mapper_compliance(): void {
        $result = $this->mapper->map_to_v4_atomic('background', '#ff0000');
        
        $this->assertUniversalMapperCompliance($result, 'background');
    }
    
    /**
     * @test
     */
    public function it_supports_background_color_shorthand(): void {
        $colorTests = [
            '#ff0000',
            'red',
            'rgb(255, 0, 0)',
            'rgba(255, 0, 0, 0.5)',
            'transparent',
        ];
        
        foreach ($colorTests as $color) {
            $result = $this->mapper->map_to_v4_atomic('background', $color);
            
            $this->assertUniversalMapperCompliance($result, 'background');
            $this->assertIsArray($result['value']);
        }
    }
    
    /**
     * @test
     */
    public function it_supports_background_image_shorthand(): void {
        $imageTests = [
            'url("image.jpg")',
            'url(\'image.png\')',
            'linear-gradient(45deg, red, blue)',
            'radial-gradient(circle, red, blue)',
        ];
        
        foreach ($imageTests as $image) {
            $result = $this->mapper->map_to_v4_atomic('background', $image);
            
            $this->assertUniversalMapperCompliance($result, 'background');
            $this->assertIsArray($result['value']);
        }
    }
    
    /**
     * @test
     */
    public function it_supports_complex_background_shorthand(): void {
        $complexTests = [
            'url("image.jpg") no-repeat center center',
            '#ff0000 url("image.jpg") repeat-x',
            'linear-gradient(45deg, red, blue) no-repeat',
            'transparent url("bg.png") center / cover',
        ];
        
        foreach ($complexTests as $complex) {
            $result = $this->mapper->map_to_v4_atomic('background', $complex);
            
            $this->assertUniversalMapperCompliance($result, 'background');
            $this->assertIsArray($result['value']);
        }
    }
    
    /**
     * @test
     */
    public function it_handles_css_parsing_edge_cases(): void {
        $edgeCases = [
            '  #ff0000  ' => true, // Whitespace
            'RED' => true, // Case normalization
            'none' => true, // Keyword
            
            // Invalid values
            'invalid-background' => null,
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
        $this->assertTrue($this->mapper->supports('background', '#ff0000'));
        $this->assertTrue($this->mapper->supports('background', 'url("image.jpg")'));
        $this->assertFalse($this->mapper->supports('background-color', '#ff0000'));
        $this->assertFalse($this->mapper->supports('background', 'invalid-value'));
    }
    
    /**
     * @test
     */
    public function it_returns_consistent_structure(): void {
        $result = $this->mapper->map_to_v4_atomic('background', '#ff0000');
        
        $this->assertIsArray($result);
        $this->assertArrayHasKey('$$type', $result);
        $this->assertArrayHasKey('value', $result);
        $this->assertEquals('background', $result['$$type']);
    }
    
    /**
     * @test
     */
    public function it_supports_complete_css_parsing(): void {
        $this->assertCompleteCssParsingSupport($this->mapper, 'background', 'background');
    }
}
