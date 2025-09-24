# Atomic Widgets Module Integration Guide

## 🎯 **Purpose**

This guide provides detailed instructions for integrating with Elementor's Atomic Widgets Module to create widget JSON structures using `Widget_Builder` and `Element_Builder`.

---

## **📋 Atomic Widgets Module Components**

### **1. Widget_Builder Class**
**Location**: `/plugins/elementor/modules/atomic-widgets/elements/widget-builder.php`

**Purpose**: Creates individual widget JSON structures

```php
use Elementor\Modules\AtomicWidgets\Elements\Widget_Builder;

// Basic usage
$widget = Widget_Builder::make('e-heading')
    ->settings([
        'title' => 'My Heading',
        'tag' => ['$$type' => 'string', 'value' => 'h1'],
    ])
    ->is_locked(false)
    ->editor_settings([])
    ->build();
```

**Generated Structure**:
```json
{
  "elType": "widget",
  "widgetType": "e-heading",
  "settings": {
    "title": "My Heading",
    "tag": {"$$type": "string", "value": "h1"}
  },
  "isLocked": false,
  "editor_settings": []
}
```

### **2. Element_Builder Class**
**Location**: `/plugins/elementor/modules/atomic-widgets/elements/element-builder.php`

**Purpose**: Creates container element JSON structures with children

```php
use Elementor\Modules\AtomicWidgets\Elements\Element_Builder;

// Container with children
$container = Element_Builder::make('e-flexbox')
    ->settings([
        'direction' => 'column',
        'align_items' => 'center',
    ])
    ->children([$child_widget1, $child_widget2])
    ->is_locked(false)
    ->editor_settings([])
    ->build();
```

**Generated Structure**:
```json
{
  "elType": "e-flexbox",
  "settings": {
    "direction": "column",
    "align_items": "center"
  },
  "isLocked": false,
  "editor_settings": [],
  "elements": [...]
}
```

---

## **🔧 Integration Implementation**

### **1. Widget Type Mapping**

```php
class Atomic_Widget_Type_Mapper {
    
    private array $widget_mapping = [
        // Text Elements
        'h1' => ['type' => 'e-heading', 'level' => 1],
        'h2' => ['type' => 'e-heading', 'level' => 2],
        'h3' => ['type' => 'e-heading', 'level' => 3],
        'h4' => ['type' => 'e-heading', 'level' => 4],
        'h5' => ['type' => 'e-heading', 'level' => 5],
        'h6' => ['type' => 'e-heading', 'level' => 6],
        'p' => ['type' => 'e-paragraph'],
        'blockquote' => ['type' => 'e-paragraph'],
        
        // Interactive Elements
        'button' => ['type' => 'e-button'],
        'a' => ['type' => 'e-button'], // Link buttons
        
        // Media Elements
        'img' => ['type' => 'e-image'],
        
        // Container Elements
        'div' => ['type' => 'e-flexbox'],
        'section' => ['type' => 'e-flexbox'],
        'article' => ['type' => 'e-flexbox'],
        'header' => ['type' => 'e-flexbox'],
        'footer' => ['type' => 'e-flexbox'],
        'main' => ['type' => 'e-flexbox'],
        'aside' => ['type' => 'e-flexbox'],
        'span' => ['type' => 'e-flexbox'],
    ];
    
    public function get_widget_config(string $html_tag): array {
        return $this->widget_mapping[$html_tag] ?? ['type' => 'e-flexbox'];
    }
    
    public function is_container_widget(string $widget_type): bool {
        return $widget_type === 'e-flexbox';
    }
}
```

### **2. Settings Preparation**

```php
class Atomic_Widget_Settings_Preparer {
    
    public function prepare_widget_settings(string $widget_type, array $atomic_props, string $content, array $attributes = []): array {
        $settings = [];
        
        // Add content based on widget type
        switch ($widget_type) {
            case 'e-heading':
                $settings['title'] = $content;
                $settings['tag'] = $this->create_atomic_prop('string', $this->extract_heading_tag($attributes));
                $settings['level'] = $this->extract_heading_level($attributes);
                break;
                
            case 'e-paragraph':
                $settings['text'] = $content;
                break;
                
            case 'e-button':
                $settings['text'] = $content;
                if (isset($attributes['href'])) {
                    $settings['link'] = $this->create_link_prop($attributes['href']);
                }
                break;
                
            case 'e-image':
                $settings['src'] = $this->create_image_src_prop($attributes['src'] ?? '');
                $settings['alt'] = $attributes['alt'] ?? '';
                break;
                
            case 'e-flexbox':
                $settings['direction'] = 'column'; // Default
                $settings['wrap'] = 'nowrap';
                $settings['justify_content'] = 'flex-start';
                $settings['align_items'] = 'stretch';
                $settings['gap'] = ['column' => '0', 'row' => '0'];
                break;
        }
        
        // Add atomic props as settings
        foreach ($atomic_props as $prop_name => $atomic_prop) {
            $settings[$prop_name] = $atomic_prop;
        }
        
        // Add classes array
        $settings['classes'] = [
            '$$type' => 'classes',
            'value' => [], // Will be populated with generated class IDs
        ];
        
        // Add attributes if present
        if (!empty($attributes)) {
            $settings['attributes'] = $this->filter_attributes($attributes);
        }
        
        return $settings;
    }
    
    private function create_atomic_prop(string $type, $value): array {
        return [
            '$$type' => $type,
            'value' => $value,
        ];
    }
    
    private function create_link_prop(string $url): array {
        return [
            '$$type' => 'link',
            'value' => [
                'url' => $url,
                'is_external' => $this->is_external_url($url),
                'nofollow' => false,
                'custom_attributes' => '',
            ],
        ];
    }
    
    private function create_image_src_prop(string $src): array {
        return [
            '$$type' => 'image-src',
            'value' => [
                'url' => $src,
                'id' => null, // Could be populated if we have attachment ID
            ],
        ];
    }
}
```

### **3. Widget Creation Service**

```php
class Atomic_Widget_Creator {
    
    private Atomic_Widget_Type_Mapper $type_mapper;
    private Atomic_Widget_Settings_Preparer $settings_preparer;
    
    public function __construct() {
        $this->type_mapper = new Atomic_Widget_Type_Mapper();
        $this->settings_preparer = new Atomic_Widget_Settings_Preparer();
    }
    
    public function create_widget(array $element_data): array {
        $widget_config = $this->type_mapper->get_widget_config($element_data['tag']);
        $widget_type = $widget_config['type'];
        
        // Prepare settings
        $settings = $this->settings_preparer->prepare_widget_settings(
            $widget_type,
            $element_data['atomic_props'] ?? [],
            $element_data['content'] ?? '',
            $element_data['attributes'] ?? []
        );
        
        // Create widget using appropriate builder
        if ($this->type_mapper->is_container_widget($widget_type)) {
            return $this->create_container_widget($widget_type, $settings, $element_data['children'] ?? []);
        } else {
            return $this->create_content_widget($widget_type, $settings);
        }
    }
    
    private function create_content_widget(string $widget_type, array $settings): array {
        return Widget_Builder::make($widget_type)
            ->settings($settings)
            ->is_locked(false)
            ->editor_settings([])
            ->build();
    }
    
    private function create_container_widget(string $widget_type, array $settings, array $children): array {
        // Recursively create child widgets
        $child_widgets = [];
        foreach ($children as $child_data) {
            $child_widget = $this->create_widget($child_data);
            if ($child_widget) {
                $child_widgets[] = $child_widget;
            }
        }
        
        return Element_Builder::make($widget_type)
            ->settings($settings)
            ->children($child_widgets)
            ->is_locked(false)
            ->editor_settings([])
            ->build();
    }
}
```

---

## **🎨 Styles Integration**

### **1. Class ID Generation**

```php
class Atomic_Widget_Class_Generator {
    
    public function generate_class_id(string $widget_type = ''): string {
        $prefix = $this->get_widget_prefix($widget_type);
        $hash1 = substr(md5(uniqid()), 0, 8);
        $hash2 = substr(md5(microtime()), 0, 7);
        
        return "{$prefix}-{$hash1}-{$hash2}";
    }
    
    private function get_widget_prefix(string $widget_type): string {
        $prefixes = [
            'e-heading' => 'e',
            'e-paragraph' => 'e',
            'e-button' => 'e',
            'e-image' => 'e',
            'e-flexbox' => 'e',
        ];
        
        return $prefixes[$widget_type] ?? 'e';
    }
}
```

### **2. Styles Integration Service**

```php
class Atomic_Widget_Styles_Integrator {
    
    private Atomic_Widget_Class_Generator $class_generator;
    
    public function __construct() {
        $this->class_generator = new Atomic_Widget_Class_Generator();
    }
    
    public function integrate_styles(array $widget, array $atomic_props): array {
        if (empty($atomic_props)) {
            return $widget;
        }
        
        // Generate class ID
        $class_id = $this->class_generator->generate_class_id($widget['widgetType'] ?? '');
        
        // Create styles structure
        $styles = [
            $class_id => [
                'id' => $class_id,
                'label' => 'local',
                'type' => 'class',
                'variants' => [
                    [
                        'meta' => [
                            'breakpoint' => 'desktop',
                            'state' => null,
                        ],
                        'props' => $atomic_props,
                        'custom_css' => null,
                    ],
                ],
            ],
        ];
        
        // Add styles to widget
        $widget['styles'] = $styles;
        
        // Add class reference to settings
        if (!isset($widget['settings']['classes']['value'])) {
            $widget['settings']['classes']['value'] = [];
        }
        
        $widget['settings']['classes']['value'][] = $class_id;
        
        return $widget;
    }
}
```

---

## **🧪 Testing Integration**

### **1. Widget Builder Tests**

```php
class AtomicWidgetBuilderIntegrationTest extends TestCase {
    
    public function test_widget_builder_creates_heading_widget(): void {
        $widget = Widget_Builder::make('e-heading')
            ->settings([
                'title' => 'Test Heading',
                'tag' => ['$$type' => 'string', 'value' => 'h1'],
                'level' => 1,
            ])
            ->build();
        
        $this->assertIsArray($widget);
        $this->assertEquals('widget', $widget['elType']);
        $this->assertEquals('e-heading', $widget['widgetType']);
        $this->assertEquals('Test Heading', $widget['settings']['title']);
        $this->assertEquals('h1', $widget['settings']['tag']['value']);
    }
    
    public function test_element_builder_creates_flexbox_container(): void {
        $child = Widget_Builder::make('e-paragraph')
            ->settings(['text' => 'Child content'])
            ->build();
        
        $container = Element_Builder::make('e-flexbox')
            ->settings([
                'direction' => 'column',
                'align_items' => 'center',
            ])
            ->children([$child])
            ->build();
        
        $this->assertIsArray($container);
        $this->assertEquals('e-flexbox', $container['elType']);
        $this->assertEquals('column', $container['settings']['direction']);
        $this->assertCount(1, $container['elements']);
        $this->assertEquals('e-paragraph', $container['elements'][0]['widgetType']);
    }
}
```

### **2. Integration Validation Tests**

```php
class AtomicWidgetIntegrationValidationTest extends TestCase {
    
    public function test_widget_settings_match_atomic_widget_schema(): void {
        // Get actual atomic widget schema
        $heading_class = 'Elementor\\Modules\\AtomicWidgets\\Elements\\Atomic_Heading\\Atomic_Heading';
        
        if (class_exists($heading_class)) {
            $schema = $heading_class::define_props_schema();
            
            // Create widget with our integration
            $creator = new Atomic_Widget_Creator();
            $widget = $creator->create_widget([
                'tag' => 'h1',
                'content' => 'Test Heading',
                'atomic_props' => [
                    'font-size' => ['$$type' => 'size', 'value' => ['size' => 32, 'unit' => 'px']],
                ],
                'attributes' => [],
                'children' => [],
            ]);
            
            // Validate settings against schema
            foreach ($widget['settings'] as $prop_name => $prop_value) {
                if (isset($schema[$prop_name])) {
                    $prop_type = $schema[$prop_name];
                    if (method_exists($prop_type, 'validate')) {
                        $this->assertTrue(
                            $prop_type->validate($prop_value),
                            "Property '{$prop_name}' failed atomic widget validation"
                        );
                    }
                }
            }
        } else {
            $this->markTestSkipped('Atomic Heading class not available');
        }
    }
}
```

---

## **📊 Performance Considerations**

### **1. Builder Instance Reuse**
```php
class Atomic_Widget_Builder_Pool {
    
    private array $builder_cache = [];
    
    public function get_widget_builder(string $widget_type): Widget_Builder {
        if (!isset($this->builder_cache[$widget_type])) {
            $this->builder_cache[$widget_type] = Widget_Builder::make($widget_type);
        }
        
        return $this->builder_cache[$widget_type];
    }
    
    public function get_element_builder(string $element_type): Element_Builder {
        $cache_key = "element_{$element_type}";
        if (!isset($this->builder_cache[$cache_key])) {
            $this->builder_cache[$cache_key] = Element_Builder::make($element_type);
        }
        
        return $this->builder_cache[$cache_key];
    }
}
```

### **2. Batch Widget Creation**
```php
class Atomic_Widget_Batch_Creator {
    
    public function create_widgets_batch(array $elements_data): array {
        $widgets = [];
        
        // Group by widget type for optimized creation
        $grouped_elements = $this->group_by_widget_type($elements_data);
        
        foreach ($grouped_elements as $widget_type => $elements) {
            $type_widgets = $this->create_widgets_of_type($widget_type, $elements);
            $widgets = array_merge($widgets, $type_widgets);
        }
        
        return $widgets;
    }
}
```

---

## **🎯 Best Practices**

### **1. Error Handling**
- Always check if atomic widget classes exist before using them
- Validate settings against atomic widget schemas
- Provide fallbacks for unsupported widget types
- Log integration errors for debugging

### **2. Performance**
- Cache builder instances when creating multiple widgets
- Batch widget creation when possible
- Minimize atomic prop conversions
- Use lazy loading for large widget hierarchies

### **3. Maintainability**
- Keep widget type mapping centralized
- Use consistent naming conventions
- Document atomic widget dependencies
- Version compatibility checks

---

**This integration guide ensures proper usage of Elementor's Atomic Widgets Module for JSON creation while maintaining performance and reliability.**
