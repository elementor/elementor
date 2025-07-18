<?php

namespace Elementor\V4\Widgets\Builders\Implementations\Atomic;

use Elementor\Modules\AtomicWidgets\Controls\Types\Image_Control;
use Elementor\Modules\AtomicWidgets\Controls\Types\Link_Control;
use Elementor\Modules\AtomicWidgets\Controls\Types\Select_Control;
use Elementor\Modules\AtomicWidgets\Controls\Types\Switch_Control;
use Elementor\Modules\AtomicWidgets\Controls\Types\Text_Control;
use Elementor\Modules\AtomicWidgets\Controls\Types\Textarea_Control;
use Elementor\Modules\Sdk\V4\Property_Def_Context;
use Elementor\Modules\Sdk\V4\SUPPORTED_PROPERTY_TYPES;

class Atomic_Controls_Builder implements Property_Def_Context {
    protected $schema = [];

    public function __construct(string $property_name) {
        $this->schema['name'] = $property_name;
    }

    public function section(string $section): self {
        $this->schema['section'] = $section;
        return $this;
    }

    public function kind(string $kind): self {
        $this->schema['kind'] = $kind;
        return $this;
    }

    public function label(string $label): self {
        $this->schema['label'] = $label;
        return $this;
    }

    public function default(mixed $default): self {
        $this->schema['default'] = $default;
        return $this;
    }

    public function placeholder(string $placeholder): self {
        $this->schema['placeholder'] = $placeholder;
        return $this;
    }

    public function options(array $options): self {
        $this->schema['options'] = $options;
        return $this;
    }

    public function build() {
        $schema = $this->schema;
        $kind = $schema['kind'];
        $label = $schema['label'] ?? $schema['name'];
        $placeholder = $schema['placeholder'] ?? '';
        $options = $schema['options'] ?? [];
        $section = $schema['section'] ?? 'Settings';
        SUPPORTED_PROPERTY_TYPES::is($kind);
        $controls = [];
        switch ($kind) {
            case 'text':
                $control = Text_Control::bind_to($schema['name']);
                if (isset($label)) {
                    $control->set_label($label);
                }
                if (isset($placeholder)) {
                    $control->set_placeholder($placeholder);
                }
                $controls[] = $control;
                break;
            case 'text_area':
                $control = Textarea_Control::bind_to($schema['name']);
                if (isset($label)) {
                    $control->set_label($label);
                }
                if (isset($placeholder)) {
                    $control->set_placeholder($placeholder);
                }
                $controls[] = $control;
                break;
            case 'image':
                $control = Image_Control::bind_to($schema['name'])->set_show_mode('media');
                if (isset($label)) {
                    $control->set_label($label);
                }
                $controls[] = $control;
                $img_size_control = Image_Control::bind_to($schema['name'])->set_show_mode('sizes');
                $img_size_control->set_label(__('Image resolution', 'elementor'));
                $img_size_control->set_meta([
                    'layout' => 'two-columns',
                ]);
                $controls[] = $img_size_control;
                break;
            case 'link':
                $control = Link_Control::bind_to($schema['name']);
                if (isset($label)) {
                    $control->set_label($label);
                }
                $controls[] = $control;
                break;
            case 'select':
                $control = Select_Control::bind_to($schema['name']);
                if (isset($label)) {
                    $control->set_label($label);
                }
                $resolved_options = [];
                foreach ($options as $key => $value) {
                    $resolved_options[] = [
                        'value' => $value,
                        'label' => $key,
                    ];
                }
                $control->set_options($resolved_options);
                $controls[] = $control;
                break;
            case 'boolean':
            case 'bool':
            case 'switch':
                $control = Switch_Control::bind_to($schema['name']);
                if (isset($label)) {
                    $control->set_label($label);
                }
                $controls[] = $control;
                break;
        }
        return $controls;
    }
}