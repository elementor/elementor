# PHPUnit Testing Strategy - Atomic Widgets Module Integration

## 🎯 **Testing Philosophy**

Our testing strategy focuses on **validating integration with the real Atomic Widgets Module** rather than mocking or simulating behavior. This ensures our implementation always works with actual Elementor atomic widgets.

---

## **📋 Test Categories**

### **1. Atomic Widgets Module Integration Tests**
**Purpose**: Validate direct integration with `Widget_Builder` and `Element_Builder`

### **2. CSS to Atomic Props Conversion Tests**
**Purpose**: Ensure CSS properties convert to valid atomic prop formats

### **3. Widget Creation Validation Tests**
**Purpose**: Verify created widgets match atomic widget schemas

### **4. End-to-End Conversion Tests**
**Purpose**: Test complete HTML to atomic widget conversion flow

### **5. Performance and Edge Case Tests**
**Purpose**: Validate performance and handle edge cases

---

## **🧪 Test Implementation**

### **1. Base Test Classes**

#### **AtomicWidgetTestCase**
```php
<?php
namespace Elementor\Modules\CssConverter\Tests\AtomicWidgets;

use PHPUnit\Framework\TestCase;

abstract class AtomicWidgetTestCase extends TestCase {
    
    protected function setUp(): void {
        parent::setUp();
        
        // Ensure atomic widgets module is available
        if (!class_exists('Elementor\\Modules\\AtomicWidgets\\Elements\\Widget_Builder')) {
            $this->markTestSkipped('Atomic Widgets Module not available');
        }
    }
    
    protected function assertValidAtomicProp(array $atomic_prop, string $expected_type): void {
        $this->assertIsArray($atomic_prop);
        $this->assertArrayHasKey('$$type', $atomic_prop);
        $this->assertEquals($expected_type, $atomic_prop['$$type']);
        $this->assertArrayHasKey('value', $atomic_prop);
    }
    
    protected function assertValidWidgetStructure(array $widget, string $expected_widget_type): void {
        $this->assertIsArray($widget);
        $this->assertArrayHasKey('elType', $widget);
        $this->assertArrayHasKey('widgetType', $widget);
        $this->assertArrayHasKey('settings', $widget);
        $this->assertEquals('widget', $widget['elType']);
        $this->assertEquals($expected_widget_type, $widget['widgetType']);
    }
    
    protected function assertValidElementStructure(array $element, string $expected_element_type): void {
        $this->assertIsArray($element);
        $this->assertArrayHasKey('elType', $element);
        $this->assertArrayHasKey('settings', $element);
        $this->assertArrayHasKey('elements', $element);
        $this->assertEquals($expected_element_type, $element['elType']);
        $this->assertIsArray($element['elements']);
    }
    
    protected function getAtomicWidgetSchema(string $widget_class): ?array {
        if (!class_exists($widget_class)) {
            return null;
        }
        
        if (!method_exists($widget_class, 'define_props_schema')) {
            return null;
        }
        
        return $widget_class::define_props_schema();
    }
}
```

#### **AtomicWidgetSchemaTestCase**
```php
<?php
namespace Elementor\Modules\CssConverter\Tests\AtomicWidgets;

abstract class AtomicWidgetSchemaTestCase extends AtomicWidgetTestCase {
    
    protected function assertWidgetSettingsMatchSchema(array $widget_settings, array $schema): void {
        foreach ($widget_settings as $prop_name => $prop_value) {
            if (isset($schema[$prop_name])) {
                $prop_type = $schema[$prop_name];
                $this->validatePropAgainstType($prop_value, $prop_type, $prop_name);
            }
        }
    }
    
    protected function validatePropAgainstType($prop_value, $prop_type, string $prop_name): void {
        // Validate based on prop type class
        $prop_type_class = get_class($prop_type);
        
        switch ($prop_type_class) {
            case 'Elementor\\Modules\\AtomicWidgets\\PropTypes\\Size_Prop_Type':
                $this->assertValidSizeProp($prop_value, $prop_name);
                break;
                
            case 'Elementor\\Modules\\AtomicWidgets\\PropTypes\\Color_Prop_Type':
                $this->assertValidColorProp($prop_value, $prop_name);
                break;
                
            case 'Elementor\\Modules\\AtomicWidgets\\PropTypes\\String_Prop_Type':
                $this->assertValidStringProp($prop_value, $prop_name);
                break;
                
            case 'Elementor\\Modules\\AtomicWidgets\\PropTypes\\Dimensions_Prop_Type':
                $this->assertValidDimensionsProp($prop_value, $prop_name);
                break;
                
            default:
                // Generic validation
                if (method_exists($prop_type, 'validate')) {
                    $this->assertTrue(
                        $prop_type->validate($prop_value),
                        "Property '{$prop_name}' failed atomic widget validation"
                    );
                }
        }
    }
    
    protected function assertValidSizeProp($prop_value, string $prop_name): void {
        $this->assertIsArray($prop_value, "Size prop '{$prop_name}' must be array");
        $this->assertEquals('size', $prop_value['$$type'], "Size prop '{$prop_name}' must have $$type 'size'");
        $this->assertIsArray($prop_value['value'], "Size prop '{$prop_name}' value must be array");
        $this->assertIsNumeric($prop_value['value']['size'], "Size prop '{$prop_name}' size must be numeric");
        $this->assertIsString($prop_value['value']['unit'], "Size prop '{$prop_name}' unit must be string");
    }
    
    protected function assertValidColorProp($prop_value, string $prop_name): void {
        $this->assertIsArray($prop_value, "Color prop '{$prop_name}' must be array");
        $this->assertEquals('color', $prop_value['$$type'], "Color prop '{$prop_name}' must have $$type 'color'");
        $this->assertIsString($prop_value['value'], "Color prop '{$prop_name}' value must be string");
        $this->assertMatchesRegularExpression('/^#[0-9a-fA-F]{6}$/', $prop_value['value'], "Color prop '{$prop_name}' must be valid hex color");
    }
    
    protected function assertValidStringProp($prop_value, string $prop_name): void {
        $this->assertIsArray($prop_value, "String prop '{$prop_name}' must be array");
        $this->assertEquals('string', $prop_value['$$type'], "String prop '{$prop_name}' must have $$type 'string'");
        $this->assertIsString($prop_value['value'], "String prop '{$prop_name}' value must be string");
    }
    
    protected function assertValidDimensionsProp($prop_value, string $prop_name): void {
        $this->assertIsArray($prop_value, "Dimensions prop '{$prop_name}' must be array");
        $this->assertEquals('dimensions', $prop_value['$$type'], "Dimensions prop '{$prop_name}' must have $$type 'dimensions'");
        $this->assertIsArray($prop_value['value'], "Dimensions prop '{$prop_name}' value must be array");
        
        $logical_properties = ['block-start', 'inline-end', 'block-end', 'inline-start'];
        foreach ($logical_properties as $logical_prop) {
            if (isset($prop_value['value'][$logical_prop])) {
                $this->assertValidSizeProp($prop_value['value'][$logical_prop], "{$prop_name}.{$logical_prop}");
            }
        }
    }
}
```

### **2. Widget Builder Integration Tests**

#### **WidgetBuilderIntegrationTest**
```php
<?php
namespace Elementor\Modules\CssConverter\Tests\AtomicWidgets;

use Elementor\Modules\AtomicWidgets\Elements\Widget_Builder;
use Elementor\Modules\AtomicWidgets\Elements\Element_Builder;

class WidgetBuilderIntegrationTest extends AtomicWidgetTestCase {
    
    public function test_widget_builder_creates_heading_widget(): void {
        $widget = Widget_Builder::make('e-heading')
            ->settings([
                'title' => 'Test Heading',
                'tag' => ['$$type' => 'string', 'value' => 'h1'],
                'level' => 1,
            ])
            ->is_locked(false)
            ->editor_settings([])
            ->build();
        
        $this->assertValidWidgetStructure($widget, 'e-heading');
        $this->assertEquals('Test Heading', $widget['settings']['title']);
        $this->assertEquals('h1', $widget['settings']['tag']['value']);
        $this->assertEquals(1, $widget['settings']['level']);
        $this->assertFalse($widget['isLocked']);
    }
    
    public function test_widget_builder_creates_paragraph_widget(): void {
        $widget = Widget_Builder::make('e-paragraph')
            ->settings([
                'text' => 'Test paragraph content',
            ])
            ->build();
        
        $this->assertValidWidgetStructure($widget, 'e-paragraph');
        $this->assertEquals('Test paragraph content', $widget['settings']['text']);
    }
    
    public function test_widget_builder_creates_button_widget(): void {
        $widget = Widget_Builder::make('e-button')
            ->settings([
                'text' => 'Click Me',
                'link' => [
                    '$$type' => 'link',
                    'value' => [
                        'url' => 'https://example.com',
                        'is_external' => true,
                        'nofollow' => false,
                    ],
                ],
            ])
            ->build();
        
        $this->assertValidWidgetStructure($widget, 'e-button');
        $this->assertEquals('Click Me', $widget['settings']['text']);
        $this->assertEquals('https://example.com', $widget['settings']['link']['value']['url']);
    }
    
    public function test_element_builder_creates_flexbox_container(): void {
        $child_widget = Widget_Builder::make('e-paragraph')
            ->settings(['text' => 'Child content'])
            ->build();
        
        $container = Element_Builder::make('e-flexbox')
            ->settings([
                'direction' => 'column',
                'align_items' => 'center',
                'gap' => ['column' => '20', 'row' => '10'],
            ])
            ->children([$child_widget])
            ->build();
        
        $this->assertValidElementStructure($container, 'e-flexbox');
        $this->assertEquals('column', $container['settings']['direction']);
        $this->assertEquals('center', $container['settings']['align_items']);
        $this->assertCount(1, $container['elements']);
        $this->assertEquals('e-paragraph', $container['elements'][0]['widgetType']);
    }
    
    public function test_nested_container_creation(): void {
        $inner_widget = Widget_Builder::make('e-heading')
            ->settings(['title' => 'Nested Heading'])
            ->build();
        
        $inner_container = Element_Builder::make('e-flexbox')
            ->settings(['direction' => 'row'])
            ->children([$inner_widget])
            ->build();
        
        $outer_container = Element_Builder::make('e-flexbox')
            ->settings(['direction' => 'column'])
            ->children([$inner_container])
            ->build();
        
        $this->assertValidElementStructure($outer_container, 'e-flexbox');
        $this->assertCount(1, $outer_container['elements']);
        $this->assertValidElementStructure($outer_container['elements'][0], 'e-flexbox');
        $this->assertCount(1, $outer_container['elements'][0]['elements']);
        $this->assertEquals('e-heading', $outer_container['elements'][0]['elements'][0]['widgetType']);
    }
}
```

### **3. CSS to Atomic Props Tests**

#### **CSSToAtomicPropsTest**
```php
<?php
namespace Elementor\Modules\CssConverter\Tests\AtomicWidgets;

use Elementor\Modules\CssConverter\Services\AtomicWidgets\CSS_To_Atomic_Props_Converter;

class CSSToAtomicPropsTest extends AtomicWidgetTestCase {
    
    private CSS_To_Atomic_Props_Converter $converter;
    
    protected function setUp(): void {
        parent::setUp();
        $this->converter = new CSS_To_Atomic_Props_Converter();
    }
    
    public function test_font_size_converts_to_size_prop(): void {
        $result = $this->converter->convert_css_to_atomic_prop('font-size', '16px');
        
        $this->assertValidAtomicProp($result, 'size');
        $this->assertEquals(16, $result['value']['size']);
        $this->assertEquals('px', $result['value']['unit']);
    }
    
    public function test_color_converts_to_color_prop(): void {
        $result = $this->converter->convert_css_to_atomic_prop('color', '#ff0000');
        
        $this->assertValidAtomicProp($result, 'color');
        $this->assertEquals('#ff0000', $result['value']);
    }
    
    public function test_margin_converts_to_dimensions_prop(): void {
        $result = $this->converter->convert_css_to_atomic_prop('margin', '10px 20px 30px 40px');
        
        $this->assertValidAtomicProp($result, 'dimensions');
        $this->assertIsArray($result['value']);
        
        // Validate each logical property
        $this->assertValidAtomicProp($result['value']['block-start'], 'size');
        $this->assertEquals(10, $result['value']['block-start']['value']['size']);
        
        $this->assertValidAtomicProp($result['value']['inline-end'], 'size');
        $this->assertEquals(20, $result['value']['inline-end']['value']['size']);
        
        $this->assertValidAtomicProp($result['value']['block-end'], 'size');
        $this->assertEquals(30, $result['value']['block-end']['value']['size']);
        
        $this->assertValidAtomicProp($result['value']['inline-start'], 'size');
        $this->assertEquals(40, $result['value']['inline-start']['value']['size']);
    }
    
    public function test_box_shadow_converts_to_box_shadow_prop(): void {
        $result = $this->converter->convert_css_to_atomic_prop('box-shadow', '2px 4px 8px rgba(0,0,0,0.1)');
        
        $this->assertValidAtomicProp($result, 'box-shadow');
        $this->assertIsArray($result['value']);
        $this->assertCount(1, $result['value']); // Single shadow
        
        $shadow = $result['value'][0];
        $this->assertValidAtomicProp($shadow, 'shadow');
        $this->assertValidAtomicProp($shadow['value']['hOffset'], 'size');
        $this->assertEquals(2, $shadow['value']['hOffset']['value']['size']);
    }
    
    /**
     * @dataProvider cssPropertyProvider
     */
    public function test_all_supported_css_properties_convert_correctly(string $property, string $css_value, string $expected_type): void {
        $result = $this->converter->convert_css_to_atomic_prop($property, $css_value);
        
        $this->assertNotNull($result, "Property '{$property}' should be supported");
        $this->assertValidAtomicProp($result, $expected_type);
    }
    
    public function cssPropertyProvider(): array {
        return [
            ['font-size', '16px', 'size'],
            ['width', '100px', 'size'],
            ['height', '50px', 'size'],
            ['max-width', '800px', 'size'],
            ['color', '#333333', 'color'],
            ['background-color', '#ffffff', 'color'],
            ['margin', '10px', 'dimensions'],
            ['padding', '20px 10px', 'dimensions'],
            ['border-radius', '5px', 'size'], // Uniform radius
            ['font-weight', 'bold', 'string'],
            ['text-align', 'center', 'string'],
            ['display', 'flex', 'string'],
        ];
    }
}
```

### **4. Widget Schema Validation Tests**

#### **AtomicWidgetSchemaValidationTest**
```php
<?php
namespace Elementor\Modules\CssConverter\Tests\AtomicWidgets;

use Elementor\Modules\CssConverter\Services\AtomicWidgets\Atomic_Widget_Creator;

class AtomicWidgetSchemaValidationTest extends AtomicWidgetSchemaTestCase {
    
    private Atomic_Widget_Creator $widget_creator;
    
    protected function setUp(): void {
        parent::setUp();
        $this->widget_creator = new Atomic_Widget_Creator();
    }
    
    public function test_heading_widget_settings_match_atomic_schema(): void {
        $element_data = [
            'tag' => 'h1',
            'content' => 'Test Heading',
            'atomic_props' => [
                'font-size' => ['$$type' => 'size', 'value' => ['size' => 32, 'unit' => 'px']],
                'color' => ['$$type' => 'color', 'value' => '#333333'],
            ],
            'attributes' => [],
            'children' => [],
        ];
        
        $widget = $this->widget_creator->create_widget($element_data);
        
        // Get atomic heading schema
        $schema = $this->getAtomicWidgetSchema('Elementor\\Modules\\AtomicWidgets\\Elements\\Atomic_Heading\\Atomic_Heading');
        
        if ($schema) {
            $this->assertWidgetSettingsMatchSchema($widget['settings'], $schema);
        } else {
            $this->markTestSkipped('Atomic Heading schema not available');
        }
    }
    
    public function test_paragraph_widget_settings_match_atomic_schema(): void {
        $element_data = [
            'tag' => 'p',
            'content' => 'Test paragraph content',
            'atomic_props' => [
                'font-size' => ['$$type' => 'size', 'value' => ['size' => 16, 'unit' => 'px']],
                'line-height' => ['$$type' => 'string', 'value' => '1.5'],
            ],
            'attributes' => [],
            'children' => [],
        ];
        
        $widget = $this->widget_creator->create_widget($element_data);
        
        // Get atomic paragraph schema
        $schema = $this->getAtomicWidgetSchema('Elementor\\Modules\\AtomicWidgets\\Elements\\Atomic_Paragraph\\Atomic_Paragraph');
        
        if ($schema) {
            $this->assertWidgetSettingsMatchSchema($widget['settings'], $schema);
        } else {
            $this->markTestSkipped('Atomic Paragraph schema not available');
        }
    }
    
    public function test_button_widget_settings_match_atomic_schema(): void {
        $element_data = [
            'tag' => 'button',
            'content' => 'Click Me',
            'atomic_props' => [
                'background-color' => ['$$type' => 'color', 'value' => '#0073aa'],
                'padding' => [
                    '$$type' => 'dimensions',
                    'value' => [
                        'block-start' => ['$$type' => 'size', 'value' => ['size' => 10, 'unit' => 'px']],
                        'inline-end' => ['$$type' => 'size', 'value' => ['size' => 20, 'unit' => 'px']],
                        'block-end' => ['$$type' => 'size', 'value' => ['size' => 10, 'unit' => 'px']],
                        'inline-start' => ['$$type' => 'size', 'value' => ['size' => 20, 'unit' => 'px']],
                    ],
                ],
            ],
            'attributes' => [],
            'children' => [],
        ];
        
        $widget = $this->widget_creator->create_widget($element_data);
        
        // Get atomic button schema
        $schema = $this->getAtomicWidgetSchema('Elementor\\Modules\\AtomicWidgets\\Elements\\Atomic_Button\\Atomic_Button');
        
        if ($schema) {
            $this->assertWidgetSettingsMatchSchema($widget['settings'], $schema);
        } else {
            $this->markTestSkipped('Atomic Button schema not available');
        }
    }
}
```

### **5. End-to-End Integration Tests**

#### **EndToEndAtomicWidgetTest**
```php
<?php
namespace Elementor\Modules\CssConverter\Tests\AtomicWidgets;

use Elementor\Modules\CssConverter\Services\AtomicWidgets\Atomic_Widgets_Orchestrator;

class EndToEndAtomicWidgetTest extends AtomicWidgetTestCase {
    
    private Atomic_Widgets_Orchestrator $orchestrator;
    
    protected function setUp(): void {
        parent::setUp();
        $this->orchestrator = new Atomic_Widgets_Orchestrator();
    }
    
    public function test_simple_heading_conversion(): void {
        $html = '<h1 style="font-size: 32px; color: #333;">Test Heading</h1>';
        
        $result = $this->orchestrator->convert_html_to_atomic_widgets($html);
        
        $this->assertTrue($result['success']);
        $this->assertCount(1, $result['widgets']);
        
        $widget = $result['widgets'][0];
        $this->assertValidWidgetStructure($widget, 'e-heading');
        $this->assertEquals('Test Heading', $widget['settings']['title']);
        
        // Verify styles were created and integrated
        $this->assertArrayHasKey('styles', $widget);
        $this->assertNotEmpty($widget['styles']);
        
        // Verify class reference was added
        $this->assertArrayHasKey('classes', $widget['settings']);
        $this->assertNotEmpty($widget['settings']['classes']['value']);
    }
    
    public function test_nested_container_conversion(): void {
        $html = '<div style="display: flex; flex-direction: column;">
                    <h1 style="font-size: 32px;">Heading</h1>
                    <p style="font-size: 16px;">Paragraph</p>
                 </div>';
        
        $result = $this->orchestrator->convert_html_to_atomic_widgets($html);
        
        $this->assertTrue($result['success']);
        $this->assertCount(1, $result['widgets']);
        
        $container = $result['widgets'][0];
        $this->assertValidElementStructure($container, 'e-flexbox');
        $this->assertEquals('column', $container['settings']['direction']);
        $this->assertCount(2, $container['elements']);
        
        // Verify child widgets
        $heading = $container['elements'][0];
        $paragraph = $container['elements'][1];
        
        $this->assertValidWidgetStructure($heading, 'e-heading');
        $this->assertValidWidgetStructure($paragraph, 'e-paragraph');
        
        $this->assertEquals('Heading', $heading['settings']['title']);
        $this->assertEquals('Paragraph', $paragraph['settings']['text']);
    }
    
    public function test_complex_html_structure_conversion(): void {
        $html = '<section style="padding: 40px; background-color: #f5f5f5;">
                    <div style="max-width: 800px; margin: 0 auto;">
                        <h1 style="font-size: 48px; text-align: center; margin-bottom: 20px;">Main Title</h1>
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 30px;">
                            <div style="background: white; padding: 20px; border-radius: 8px;">
                                <h2 style="color: #0073aa;">Feature One</h2>
                                <p>Description of feature one.</p>
                            </div>
                            <div style="background: white; padding: 20px; border-radius: 8px;">
                                <h2 style="color: #0073aa;">Feature Two</h2>
                                <p>Description of feature two.</p>
                            </div>
                        </div>
                    </div>
                 </section>';
        
        $result = $this->orchestrator->convert_html_to_atomic_widgets($html);
        
        $this->assertTrue($result['success']);
        $this->assertNotEmpty($result['widgets']);
        
        // Verify stats
        $this->assertArrayHasKey('stats', $result);
        $this->assertGreaterThan(0, $result['stats']['total_widgets_created']);
        $this->assertGreaterThan(0, $result['stats']['supported_elements']);
    }
    
    public function test_conversion_with_unsupported_elements(): void {
        $html = '<div>
                    <h1>Supported Heading</h1>
                    <custom-element>Unsupported Element</custom-element>
                    <p>Supported Paragraph</p>
                 </div>';
        
        $result = $this->orchestrator->convert_html_to_atomic_widgets($html);
        
        $this->assertTrue($result['success']);
        
        // Should still create widgets for supported elements
        $this->assertNotEmpty($result['widgets']);
        
        // Stats should reflect unsupported elements
        $this->assertArrayHasKey('stats', $result);
        $this->assertGreaterThan(0, $result['stats']['unsupported_elements']);
    }
}
```

### **6. Performance Tests**

#### **AtomicWidgetPerformanceTest**
```php
<?php
namespace Elementor\Modules\CssConverter\Tests\AtomicWidgets;

class AtomicWidgetPerformanceTest extends AtomicWidgetTestCase {
    
    public function test_large_html_conversion_performance(): void {
        // Generate large HTML structure
        $html = $this->generateLargeHtmlStructure(100); // 100 elements
        
        $orchestrator = new Atomic_Widgets_Orchestrator();
        
        $start_time = microtime(true);
        $result = $orchestrator->convert_html_to_atomic_widgets($html);
        $end_time = microtime(true);
        
        $execution_time = $end_time - $start_time;
        
        $this->assertTrue($result['success']);
        $this->assertLessThan(1.0, $execution_time, 'Conversion should complete within 1 second');
        
        // Verify all elements were processed
        $this->assertEquals(100, $result['stats']['total_elements_parsed']);
    }
    
    public function test_memory_usage_during_conversion(): void {
        $initial_memory = memory_get_usage(true);
        
        $html = $this->generateLargeHtmlStructure(50);
        $orchestrator = new Atomic_Widgets_Orchestrator();
        $result = $orchestrator->convert_html_to_atomic_widgets($html);
        
        $final_memory = memory_get_usage(true);
        $memory_increase = $final_memory - $initial_memory;
        
        $this->assertTrue($result['success']);
        $this->assertLessThan(50 * 1024 * 1024, $memory_increase, 'Memory increase should be less than 50MB');
    }
    
    private function generateLargeHtmlStructure(int $element_count): string {
        $html = '<div>';
        
        for ($i = 0; $i < $element_count; $i++) {
            $html .= "<div style=\"padding: 10px; margin: 5px;\">";
            $html .= "<h2 style=\"font-size: 24px; color: #333;\">Heading {$i}</h2>";
            $html .= "<p style=\"font-size: 16px; line-height: 1.5;\">Paragraph content {$i}</p>";
            $html .= "</div>";
        }
        
        $html .= '</div>';
        
        return $html;
    }
}
```

---

## **📊 Test Execution Strategy**

### **1. Test Suites Organization**
```
tests/phpunit/atomic-widgets/
├── integration/
│   ├── WidgetBuilderIntegrationTest.php
│   ├── ElementBuilderIntegrationTest.php
│   └── AtomicWidgetSchemaValidationTest.php
├── conversion/
│   ├── CSSToAtomicPropsTest.php
│   ├── HTMLParsingTest.php
│   └── StylesIntegrationTest.php
├── end-to-end/
│   ├── EndToEndAtomicWidgetTest.php
│   └── ComplexStructureConversionTest.php
├── performance/
│   ├── AtomicWidgetPerformanceTest.php
│   └── MemoryUsageTest.php
└── base/
    ├── AtomicWidgetTestCase.php
    └── AtomicWidgetSchemaTestCase.php
```

### **2. Continuous Integration Setup**
```php
// phpunit.xml configuration
<?xml version="1.0" encoding="UTF-8"?>
<phpunit bootstrap="tests/bootstrap.php">
    <testsuites>
        <testsuite name="AtomicWidgets">
            <directory>tests/phpunit/atomic-widgets</directory>
        </testsuite>
    </testsuites>
    
    <filter>
        <whitelist>
            <directory suffix=".php">services/atomic-widgets</directory>
        </whitelist>
    </filter>
    
    <logging>
        <log type="coverage-html" target="coverage-html"/>
        <log type="coverage-clover" target="coverage.xml"/>
    </logging>
</phpunit>
```

### **3. Test Data Providers**
```php
class AtomicWidgetTestDataProvider {
    
    public static function htmlElementsProvider(): array {
        return [
            'heading' => ['<h1 style="font-size: 32px;">Heading</h1>', 'e-heading'],
            'paragraph' => ['<p style="color: #333;">Paragraph</p>', 'e-paragraph'],
            'button' => ['<button style="background: #0073aa;">Button</button>', 'e-button'],
            'container' => ['<div style="display: flex;">Container</div>', 'e-flexbox'],
        ];
    }
    
    public static function cssPropertiesProvider(): array {
        return [
            'font-size' => ['font-size', '16px', 'size'],
            'color' => ['color', '#ff0000', 'color'],
            'margin' => ['margin', '10px 20px', 'dimensions'],
            'background' => ['background-color', '#ffffff', 'color'],
        ];
    }
}
```

---

## **🎯 Success Metrics**

### **Coverage Targets**
- **Unit Test Coverage**: 95%+
- **Integration Test Coverage**: 90%+
- **End-to-End Test Coverage**: 85%+

### **Performance Targets**
- **Single Widget Creation**: < 10ms
- **100 Element Conversion**: < 1 second
- **Memory Usage**: < 50MB for large conversions

### **Quality Gates**
- All tests must pass before deployment
- No memory leaks during conversion
- All atomic widget schemas validated
- Performance benchmarks met

---

**This testing strategy ensures robust validation of our Atomic Widgets Module integration while maintaining high performance and reliability standards.**
