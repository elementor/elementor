<?php

namespace Elementor\Modules\CssConverter\Tests\PropertyMappers\BackgroundProperties;

use Elementor\Modules\CssConverter\Tests\PropertyMappers\AtomicWidgetComplianceTestCase;
use Elementor\Modules\CssConverter\Convertors\CssProperties\Properties\Background_Image_Property_Mapper;

class BackgroundImagePropertyMapperTest extends AtomicWidgetComplianceTestCase {
    
    private Background_Image_Property_Mapper $mapper;
    
    protected function setUp(): void {
        parent::setUp();
        $this->mapper = new Background_Image_Property_Mapper();
    }
    
    /**
     * @test
     */
    public function it_has_universal_mapper_compliance(): void {
        $result = $this->mapper->map_to_v4_atomic('background-image', 'url("image.jpg")');
        
        $this->assertUniversalMapperCompliance($result, 'string');
    }
    
    /**
     * @test
     */
    public function it_supports_url_values(): void {
        $urlTests = [
            'url("image.jpg")',
            'url(\'image.png\')',
            'url(image.gif)',
            'url("https://example.com/image.jpg")',
            'url( "image with spaces.jpg" )',
        ];
        
        foreach ($urlTests as $url) {
            $result = $this->mapper->map_to_v4_atomic('background-image', $url);
            
            $this->assertUniversalMapperCompliance($result, 'string');
            $this->assertIsString($result['value']);
        }
    }
    
    /**
     * @test
     */
    public function it_supports_gradient_values(): void {
        $gradientTests = [
            'linear-gradient(45deg, red, blue)',
            'radial-gradient(circle, red, blue)',
            'conic-gradient(red, blue)',
            'repeating-linear-gradient(45deg, red, blue)',
            'repeating-radial-gradient(circle, red, blue)',
        ];
        
        foreach ($gradientTests as $gradient) {
            $result = $this->mapper->map_to_v4_atomic('background-image', $gradient);
            
            $this->assertUniversalMapperCompliance($result, 'string');
            $this->assertIsString($result['value']);
        }
    }
    
    /**
     * @test
     */
    public function it_supports_keyword_values(): void {
        $keywordTests = ['none', 'inherit', 'initial', 'unset'];
        
        foreach ($keywordTests as $keyword) {
            $result = $this->mapper->map_to_v4_atomic('background-image', $keyword);
            
            $this->assertUniversalMapperCompliance($result, 'string');
            $this->assertEquals($keyword, $result['value']);
        }
    }
    
    /**
     * @test
     */
    public function it_handles_parsing_edge_cases(): void {
        $edgeCases = [
            'URL("IMAGE.JPG")' => 'url("image.jpg")', // Case normalization
            '  url("image.jpg")  ' => 'url("image.jpg")', // Whitespace
            'NONE' => 'none', // Keyword normalization
            
            // Invalid values
            'invalid-value' => null,
            'url()' => null, // Empty URL
            '' => null,
        ];
        
        foreach ($edgeCases as $input => $expected) {
            $result = $this->mapper->map_to_v4_atomic('background-image', $input);
            
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
        $this->assertTrue($this->mapper->supports('background-image', 'url("image.jpg")'));
        $this->assertTrue($this->mapper->supports('background-image', 'linear-gradient(red, blue)'));
        $this->assertTrue($this->mapper->supports('background-image', 'none'));
        $this->assertFalse($this->mapper->supports('background', 'url("image.jpg")'));
        $this->assertFalse($this->mapper->supports('background-image', 'invalid-value'));
    }
    
    /**
     * @test
     */
    public function it_returns_consistent_structure(): void {
        $result = $this->mapper->map_to_v4_atomic('background-image', 'url("image.jpg")');
        
        $this->assertIsArray($result);
        $this->assertArrayHasKey('$$type', $result);
        $this->assertArrayHasKey('value', $result);
        $this->assertEquals('string', $result['$$type']);
        $this->assertIsString($result['value']);
    }
    
    /**
     * @test
     */
    public function it_supports_complete_css_parsing(): void {
        $this->assertCompleteCssParsingSupport($this->mapper, 'background-image', 'string');
    }
}
