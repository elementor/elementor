<?php

namespace Elementor\V4\Widgets\Builders;

use Elementor\Core\Utils\Registry;
use Elementor\Modules\AtomicWidgets\PropTypes\Classes_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Contracts\Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Key_Value_Array_Prop_Type;
use Elementor\Modules\Variables\Storage\Exceptions\FatalError;
use Elementor\Utils;
use Elementor\V4\Widgets\Builders\Implementations\Atomic\Atomic_Controls_Builder;
use Elementor\V4\Widgets\Builders\Implementations\Atomic\Atomic_Prop_Type_Builder;
use Elementor\V4\Widgets\Builders\Implementations\Atomic\Configurable_Atomic_Element;

require_once __DIR__ . '/implementations/atomic/configurable-atomic-element.php';
require_once __DIR__ . '/implementations/atomic/atomic-prop-type-builder.php';
require_once __DIR__ . '/implementations/atomic/atomic-controls-buider.php';

class Atomic_Widget_Builder {

    /**
     * @var mixed
     */
    protected $widget_descriptor;

    /**
     * @var mixed
     */
    protected $widget_schema = [];

    protected $widget_class_name;

    /**
     * @var Prop_Type[]
     */
    protected $built_properties = [];
    
    public function __construct(mixed $widget_descriptor) {
        $this->widget_descriptor = $widget_descriptor;
        add_action('elementor/widgets/register', fn($ctx) => 
            $this->build_and_register($ctx)
        );
    }

    protected function generate_widget_class_name($clazz): string {
        return str_replace("\\", "_", $clazz::class);
    }

    public function title(string $title): self {
        $this->widget_schema['title'] = $title;
        return $this;
    }

    public function name(string $name): self {
        $this->widget_schema['name'] = $name;
        return $this;
    }

    public function atomic(): self {
        $this->widget_schema['atomic'] = true;
        return $this;
    }

    public function get_widget_schema(): array {
        return $this->widget_schema;
    }

    public function build_and_register($ctx) {
        // prepare schema
        $this->widget_descriptor->define($this);
        $ns = Configurable_Atomic_Element::get_namespace();
        $widget_class_name = "V4Element_" . $this->generate_widget_class_name($this->widget_descriptor);
        $this->widget_class_name = $widget_class_name;

        Registry::instance('elementor/widget-builders')->set($widget_class_name, $this);

        
        $code = "class {$widget_class_name} extends \\{$ns}\Configurable_Atomic_Element {}";
        eval($code);

        // create registries
        Registry::instance('elementor/widget-descriptors')->set($widget_class_name, $this->widget_descriptor);
        $schema = &$this->widget_schema;
        Registry::instance('elementor/widget-schemas')->set($widget_class_name, $schema);
        
        // build class
        $widget_instance = new $widget_class_name();

        $ctx->register($widget_instance);
    }

    public function build_controls() {
        $props = Registry::get_value('elementor/widget-prop-schema', $this->widget_class_name, null);
        if (null === $props) {
            $this->build_props_schema();
        }
        $control_builders = [];
        $facade = new class($control_builders) {
            public $builders;
            public function __construct(&$builders) {
                $this->builders = &$builders;
            }
            public function property(string $name) {
                $control_builder = new Atomic_Controls_Builder($name);
                $this->builders[] = $control_builder;
                return $control_builder;
            }
        };
        $this->widget_descriptor->define_properties($facade);
        $controls = array_map(fn($control_builder) => $control_builder->build(), $control_builders);
        return array_merge(...$controls);
    }

    public function build_props_schema(): void {
        $this->widget_descriptor->define_properties($this);
        $props = array_map(fn ($builder) => $builder->build(), $this->prop_builders);
        
        // force attributes and classes to be defined
        $props['attributes'] = Key_Value_Array_Prop_Type::make();
        $props['classes'] = Classes_Prop_Type::make()->default([]);
        Registry::instance('elementor/widget-prop-schema')->set($this->widget_class_name, $props);
    }

    /**
     * @var Atomic_Prop_Type_Builder[]
     */
    protected $prop_builders = [];
    public function property(string $name): Atomic_Prop_Type_Builder {
        $restricted_property_names = [
            'classes', 'attributes',
        ];
        if (in_array($name, $restricted_property_names)) {
            trigger_error("Property name \"{$name}\" is restricted", E_USER_ERROR);
        }
        $prop_builder = new Atomic_Prop_Type_Builder($name);
        $this->prop_builders[$name] = $prop_builder;
        return $prop_builder;
    }

    public function build_renderer_js_only() {
        $render_schema = [];
        $facade = create_renderer_facade($render_schema);
        $this->widget_descriptor->define_renderer($facade);
        if (isset($render_schema['js'])) {
            Registry::instance('elementor/widget-js')->set($this->widget_class_name, $render_schema['js']);
        }
    }

    public function build_styles_only() {
        $render_schema = [];
        $facade = create_renderer_facade($render_schema);
        $this->widget_descriptor->define_renderer($facade);
        if (isset($render_schema['css'])) {
            Registry::instance('elementor/widget-css')->set($this->widget_class_name, $render_schema['css']);
        }
    }


    public function build_renderer() {
        $render_schema = [];
        $facade = create_renderer_facade($render_schema);
        $this->widget_descriptor->define_renderer($facade);
        if (isset($render_schema['twig'])) {
            Registry::instance('elementor/widget-twig')->set($this->widget_class_name, $render_schema['twig']);
        }
        if (isset($render_schema['css'])) {
            Registry::instance('elementor/widget-css')->set($this->widget_class_name, $render_schema['css']);
        }
        if (isset($render_schema['js'])) {
            Registry::instance('elementor/widget-js')->set($this->widget_class_name, $render_schema['js']);
        }
    }

}

function create_renderer_facade(array &$schema) {
    $facade = new class($schema) {
        public $schema;
        public function __construct(&$render_schema)
        {
            $this->schema = &$render_schema;
        }
        public function twig(string $template) {
            $this->schema['twig'] = $template;
            return $this;
        }
        public function js(string $js) {
            $this->schema['js'] = $js;
            return $this;
        }
        public function css(string $css) {
            $this->schema['css'] = $css;
            return $this;
        }
    };
    return $facade;
}