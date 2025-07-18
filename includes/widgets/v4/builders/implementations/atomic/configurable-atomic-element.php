<?php

namespace Elementor\V4\Widgets\Builders\Implementations\Atomic;

use Elementor\Core\Utils\Registry;
use Elementor\Modules\AtomicWidgets\Base\Atomic_Control_Base;
use Elementor\Modules\AtomicWidgets\Elements\Atomic_Widget_Base;
use Elementor\Modules\AtomicWidgets\Elements\Has_Template;
use Elementor\Modules\AtomicWidgets\PropTypes\Contracts\Prop_Type;
use Elementor\Modules\AtomicWidgets\Styles\Style_Definition;
use Elementor\Modules\AtomicWidgets\Styles\Style_Variant;

class Configurable_Atomic_Element extends Atomic_Widget_Base {
    use Has_Template {
        render as protected _render;
	}
    
    public static function get_namespace() {
        return __NAMESPACE__;
    }

    /**
     * @var Prop_Type[] | null
     */
    protected static $built_props_schema = null;

    /**
     * @var Atomic_Control_Base[] | null
     */
    protected $built_controls = null;

    protected $_template_contents_cache = null;

    public function get_script_depends(): array {
        $handle = $this->prepare_scripts();
        if (null !== $handle) {
            return [$handle];
        }
        return [];
    }

    public function get_style_depends(): array {
        $handle = $this->prepare_styles();
        if (null !== $handle) {
            return [$handle];
        }
        return [];
    }

    protected function get_templates(): array {
        $template_contents = Registry::get_value('elementor/widget-template', static::class, null);
        if (null === $template_contents) {
            $builder = Registry::get_value('elementor/widget-builders', static::class, null);
            $builder->build_renderer();
            $twig_file_path = Registry::instance('elementor/widget-twig')->get(static::class);
            $twig_key = 'elementor/templates/' . static::class . '/twig';
            $template_contents = [
                $twig_key => $twig_file_path
            ];
            Registry::instance('elementor/widget-template')->set(static::class, $template_contents);
        }
        return $template_contents ?? [];
    }


    protected static function get_static_schema(): array {
        $builder = Registry::get_value('elementor/widget-builders', static::class, null);
        return $builder->get_widget_schema();
    }

    protected function get_widget_schema(): array {
        $builder = Registry::get_value('elementor/widget-builders', static::class, null);
        return $builder->get_widget_schema();
    }

    public static function get_element_type(): string {
        $schema = static::get_static_schema();
        return $schema['name'] ?? 'e-atomic';
    }

    public function get_title(): string {
        $schema = $this->get_widget_schema();
        return $schema['title'] ?? '';
    }


    protected function define_atomic_controls(): array {
        return [];
    }

    protected function get_settings_controls(): array {
        if (null === $this->built_controls) {
            $builder = Registry::get_value('elementor/widget-builders', static::class, null);
            $this->built_controls = $builder->build_controls();
        }
        if (count($this->built_controls) > 0) {

        }
        return $this->built_controls;
    }

    public static function define_props_schema(): array {
        $props_schema = Registry::get_value('elementor/widget-prop-schema', static::class, null);
        if (null === $props_schema) {
            $builder = Registry::get_value('elementor/widget-builders', static::class, null);
            $builder->build_props_schema();
        }
        $props_schema = Registry::get_value('elementor/widget-prop-schema', static::class, null);
        return $props_schema;
    }

    protected function define_base_styles(): array {
        $base_styles = Registry::get_value('elementor/widget-base-styles', static::class, null);
        if (null === $base_styles) {
            return [
                'base' => Style_Definition::make()->add_variant(
                    Style_Variant::make()->add_prop('display', 'initial')
                ),
            ];
        }
        return $base_styles;
    }

    protected function prepare_scripts() {
        $js_file_path = Registry::get_value('elementor/widget-js', static::class, null);
        if (null === $js_file_path) {
            $builder = Registry::get_value('elementor/widget-builders', static::class, null);
            $builder->build_renderer_js_only();
        }
        $js_file_path = Registry::get_value('elementor/widget-js', static::class, null);
        if ($js_file_path) {
            $widget_name = $this->get_widget_schema()['name'];
            $js_handle = 'atomic-element-' . $widget_name;
            if (str_contains($js_file_path, ELEMENTOR_PATH)) {
                $js_file_path = str_replace(ELEMENTOR_PATH, ELEMENTOR_URL, $js_file_path);
            } else if (str_contains($js_file_path, WP_CONTENT_DIR)) {
                $js_file_path = str_replace(WP_CONTENT_DIR, WP_CONTENT_URL, $js_file_path);
            }
            wp_enqueue_script('elementor-v2-frontend-handlers');
            wp_register_script($js_handle, $js_file_path, ['elementor-v2-frontend-handlers'], ELEMENTOR_VERSION, 
                [
                    'in_footer' => true,
                    'strategy' => 'defer',
                ]
            );
            return $js_handle;
        }
        return null;
    }

    protected function prepare_styles() {
        $builder = Registry::get_value('elementor/widget-builders', static::class, null);
        $builder->build_styles_only();
        $css_file_path = Registry::get_value('elementor/widget-css', static::class, null);
        if ($css_file_path) {
            // check if related to elementor or wp-content
            if (str_contains($css_file_path, ELEMENTOR_PATH)) {
                $css_file_path = str_replace(ELEMENTOR_PATH, ELEMENTOR_URL, $css_file_path);
            } else if (str_contains($css_file_path, WP_CONTENT_DIR)) {
                $css_file_path = str_replace(WP_CONTENT_DIR, WP_CONTENT_URL, $css_file_path);
            }
            $widget_name = $this->get_widget_schema()['name'];
            $css_handle = 'atomic-element-' . $widget_name;
            wp_register_style($css_handle, $css_file_path);
            return $css_handle;
        }
        return null;
    }

    protected function render() {
        $extra_context = [
            'e_attrs' => "data-e-type={$this->get_element_type()}",
        ];
        $err_level = error_reporting();
        error_reporting(0);
        ob_start();
        $this->_render($extra_context);
        $output = ob_get_clean();
        error_reporting($err_level);
        echo $output;
    }
}