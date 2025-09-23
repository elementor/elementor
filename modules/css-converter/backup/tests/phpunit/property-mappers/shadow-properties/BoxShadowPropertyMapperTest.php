<?php

namespace Elementor\Modules\CssConverter\Tests\PropertyMappers\ShadowProperties;

use Elementor\Modules\CssConverter\Tests\PropertyMappers\AtomicWidgetComplianceTestCase;
use Elementor\Modules\CssConverter\Convertors\CssProperties\Properties\Box_Shadow_Property_Mapper;

/**
 * Test box-shadow property mapper compliance with atomic widget expectations
 * 
 * This test WILL FAIL initially because:
 * 1. Box_Shadow_Property_Mapper may use create_v4_property() instead of create_v4_property_with_type()
 * 2. May return string type instead of Box_Shadow_Prop_Type
 * 3. May not parse CSS shadow values into proper Shadow_Prop_Type structure
 */
class BoxShadowPropertyMapperTest extends AtomicWidgetComplianceTestCase {
    
    private Box_Shadow_Property_Mapper $mapper;
    
    protected function setUp(): void {
        parent::setUp();
        $this->mapper = new Box_Shadow_Property_Mapper();
    }
    
    /**
     * @test
     * This test WILL FAIL initially - tests ALL critical aspects
     */
    public function it_converts_box_shadow_with_universal_compliance(): void {
        $result = $this->mapper->map_to_v4_atomic('box-shadow', '0 4px 20px rgba(0,0,0,0.08)');
        
        // UNIVERSAL VALIDATION - will catch ALL common errors:
        // 1. Base class method usage (create_v4_property vs create_v4_property_with_type)
        // 2. Type correctness (numeric vs string values in shadow components)
        // 3. Atomic widget structure compliance (Box_Shadow_Prop_Type -> Shadow_Prop_Type)
        $this->assertUniversalMapperCompliance($result, 'box-shadow');
        
        // Validate shadow structure
        $this->assertCount(1, $result['value']); // Single shadow
        
        $shadow = $result['value'][0];
        $this->assertEquals(0, $shadow['value']['hOffset']['value']['size']);
        $this->assertEquals('px', $shadow['value']['hOffset']['value']['unit']);
        $this->assertEquals(4, $shadow['value']['vOffset']['value']['size']);
        $this->assertEquals(20, $shadow['value']['blur']['value']['size']);
        $this->assertEquals(0, $shadow['value']['spread']['value']['size']);
        $this->assertEquals('rgba(0,0,0,0.08)', $shadow['value']['color']['value']);
        $this->assertNull($shadow['value']['position']);
    }
    
    /**
     * @test
     * Test comprehensive CSS parsing for box-shadow
     */
    public function it_supports_complete_box_shadow_parsing(): void {
        // Test complex box-shadow variations
        $complexTests = [
            '0 2px 4px rgba(0,0,0,0.1)' => 'simple shadow',
            'inset 2px 2px 5px #000' => 'inset shadow',
            '0 2px 4px rgba(0,0,0,0.1), inset 0 1px 2px rgba(255,255,255,0.5)' => 'multiple shadows',
            '2px 2px 0 red, 4px 4px 0 blue' => 'multiple colored shadows',
        ];
        
        foreach ($complexTests as $input => $description) {
            $result = $this->mapper->map_to_v4_atomic('box-shadow', $input);
            
            $this->assertUniversalMapperCompliance($result, 'box-shadow');
            $this->assertIsArray($result['value'], "Failed parsing {$description}: {$input}");
        }
    }
    
    /**
     * @test
     * Test inset box-shadow
     */
    public function it_handles_inset_box_shadow(): void {
        $result = $this->mapper->map_to_v4_atomic('box-shadow', 'inset 2px 2px 5px #000');
        
        $this->assertUniversalMapperCompliance($result, 'box-shadow');
        
        $shadow = $result['value'][0];
        $this->assertEquals('inset', $shadow['value']['position']);
        $this->assertEquals(2, $shadow['value']['hOffset']['value']['size']);
        $this->assertEquals(2, $shadow['value']['vOffset']['value']['size']);
        $this->assertEquals(5, $shadow['value']['blur']['value']['size']);
        $this->assertEquals('#000', $shadow['value']['color']['value']);
    }
    
    /**
     * @test
     * Test multiple box-shadows
     */
    public function it_handles_multiple_box_shadows(): void {
        $result = $this->mapper->map_to_v4_atomic('box-shadow', '0 2px 4px rgba(0,0,0,0.1), inset 0 1px 2px rgba(255,255,255,0.5)');
        
        $this->assertUniversalMapperCompliance($result, 'box-shadow');
        $this->assertCount(2, $result['value']); // Two shadows
        
        // First shadow
        $shadow1 = $result['value'][0];
        $this->assertNull($shadow1['value']['position']);
        $this->assertEquals(2, $shadow1['value']['vOffset']['value']['size']);
        $this->assertEquals(4, $shadow1['value']['blur']['value']['size']);
        
        // Second shadow
        $shadow2 = $result['value'][1];
        $this->assertEquals('inset', $shadow2['value']['position']);
        $this->assertEquals(1, $shadow2['value']['vOffset']['value']['size']);
        $this->assertEquals(2, $shadow2['value']['blur']['value']['size']);
    }
    
    /**
     * @test
     * Test box-shadow with spread radius
     */
    public function it_handles_box_shadow_with_spread(): void {
        $result = $this->mapper->map_to_v4_atomic('box-shadow', '0 0 10px 5px rgba(0,0,0,0.3)');
        
        $this->assertUniversalMapperCompliance($result, 'box-shadow');
        
        $shadow = $result['value'][0];
        $this->assertEquals(0, $shadow['value']['hOffset']['value']['size']);
        $this->assertEquals(0, $shadow['value']['vOffset']['value']['size']);
        $this->assertEquals(10, $shadow['value']['blur']['value']['size']);
        $this->assertEquals(5, $shadow['value']['spread']['value']['size']); // Spread radius
        $this->assertEquals('rgba(0,0,0,0.3)', $shadow['value']['color']['value']);
    }
    
    /**
     * @test
     * Test box-shadow edge cases
     */
    public function it_handles_box_shadow_edge_cases(): void {
        $edgeCases = [
            'none' => null, // box-shadow: none
            'inherit' => null,
            'initial' => null,
            'unset' => null,
        ];
        
        foreach ($edgeCases as $value => $expected) {
            $result = $this->mapper->map_to_v4_atomic('box-shadow', $value);
            
            // Should handle gracefully (return null or default)
            $this->assertTrue($result === null || is_array($result),
                "Mapper should handle box-shadow edge case '{$value}' gracefully");
        }
    }
    
    /**
     * @test
     * Test that mapper correctly identifies supported properties
     */
    public function it_supports_box_shadow_property(): void {
        $this->assertTrue($this->mapper->supports_property('box-shadow'),
            'Box_Shadow_Property_Mapper should support box-shadow property');
    }
}
