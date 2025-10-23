<?php

namespace Elementor\Modules\CssConverter\Tests\PropertyMappers\StringProperties;

use Elementor\Modules\CssConverter\Tests\PropertyMappers\AtomicWidgetComplianceTestCase;
use Elementor\Modules\CssConverter\Convertors\CssProperties\Properties\Transition_Property_Mapper;

class TransitionPropertyMapperTest extends AtomicWidgetComplianceTestCase {
    
    private Transition_Property_Mapper $mapper;
    
    protected function setUp(): void {
        parent::setUp();
        $this->mapper = new Transition_Property_Mapper();
    }
    
    /**
     * @test
     */
    public function it_has_universal_mapper_compliance(): void {
        $result = $this->mapper->map_to_v4_atomic('transition', 'all 0.3s ease');
        
        $this->assertUniversalMapperCompliance($result, 'string');
    }
    
    /**
     * @test
     */
    public function it_supports_all_transition_properties(): void {
        $properties = [
            'transition',
            'transition-property',
            'transition-duration',
            'transition-timing-function',
            'transition-delay'
        ];
        
        foreach ($properties as $property) {
            $value = $property === 'transition' ? 'all 0.3s ease' : 
                    ($property === 'transition-property' ? 'all' :
                    ($property === 'transition-duration' ? '0.3s' :
                    ($property === 'transition-timing-function' ? 'ease' : '0s')));
            
            $result = $this->mapper->map_to_v4_atomic($property, $value);
            
            $this->assertUniversalMapperCompliance($result, 'string');
        }
    }
    
    /**
     * @test
     */
    public function it_supports_transition_shorthand(): void {
        $shorthandTests = [
            'all 0.3s ease',
            'opacity 0.5s linear',
            'transform 0.2s ease-in-out 0.1s',
            'width 1s, height 1s',
            'none',
        ];
        
        foreach ($shorthandTests as $shorthand) {
            $result = $this->mapper->map_to_v4_atomic('transition', $shorthand);
            
            $this->assertUniversalMapperCompliance($result, 'string');
            $this->assertIsString($result['value']);
        }
    }
    
    /**
     * @test
     */
    public function it_supports_timing_functions(): void {
        $timingFunctions = [
            'ease',
            'linear',
            'ease-in',
            'ease-out',
            'ease-in-out',
            'step-start',
            'step-end',
            'cubic-bezier(0.25, 0.1, 0.25, 1)',
            'steps(4, end)',
        ];
        
        foreach ($timingFunctions as $timing) {
            $result = $this->mapper->map_to_v4_atomic('transition-timing-function', $timing);
            
            $this->assertUniversalMapperCompliance($result, 'string');
            $this->assertIsString($result['value']);
        }
    }
    
    /**
     * @test
     */
    public function it_supports_time_values(): void {
        $timeTests = [
            '0s',
            '0.3s',
            '1.5s',
            '100ms',
            '250ms',
        ];
        
        foreach ($timeTests as $time) {
            $durationResult = $this->mapper->map_to_v4_atomic('transition-duration', $time);
            $delayResult = $this->mapper->map_to_v4_atomic('transition-delay', $time);
            
            $this->assertUniversalMapperCompliance($durationResult, 'string');
            $this->assertUniversalMapperCompliance($delayResult, 'string');
        }
    }
    
    /**
     * @test
     */
    public function it_handles_css_parsing_edge_cases(): void {
        $edgeCases = [
            // Case normalization
            'ALL 0.3S EASE' => 'all 0.3s ease',
            '  all 0.3s ease  ' => 'all 0.3s ease', // Whitespace
            
            // Invalid values
            'invalid-transition' => null,
            '0.3' => null, // Missing time unit
            'invalid-timing' => null,
            '' => null,
        ];
        
        foreach ($edgeCases as $input => $expected) {
            $result = $this->mapper->map_to_v4_atomic('transition', $input);
            
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
        $this->assertTrue($this->mapper->supports('transition', 'all 0.3s ease'));
        $this->assertTrue($this->mapper->supports('transition-duration', '0.3s'));
        $this->assertFalse($this->mapper->supports('animation', 'all 0.3s ease'));
        $this->assertFalse($this->mapper->supports('transition', 'invalid-value'));
    }
    
    /**
     * @test
     */
    public function it_returns_consistent_structure(): void {
        $result = $this->mapper->map_to_v4_atomic('transition', 'all 0.3s ease');
        
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
        $this->assertCompleteCssParsingSupport($this->mapper, 'transition', 'string');
    }
}
