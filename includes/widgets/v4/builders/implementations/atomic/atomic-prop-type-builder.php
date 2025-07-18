<?php

namespace Elementor\V4\Widgets\Builders\Implementations\Atomic;

use Elementor\Modules\AtomicWidgets\Image\Placeholder_Image;
use Elementor\Modules\AtomicWidgets\PropTypes\Contracts\Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Image_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Link_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Primitives\Boolean_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Primitives\String_Prop_Type;
use Elementor\Modules\Sdk\V4\Property_Def_Context;
use Elementor\Modules\Sdk\V4\SUPPORTED_PROPERTY_TYPES;

class Atomic_Prop_Type_Builder implements Property_Def_Context {

    protected $schema = [];

    public function __construct(string $property_name) {
        $this->schema['name'] = $property_name;
    }

    public function get_schema(): array {
        return $this->schema;
    }

    public function section(string $section): self {
        $this->schema['section'] = $section;
        return $this;
    }

    public function kind(string $kind): self {
        $this->schema['kind'] = $kind;
        return $this;
    }

    public function default(mixed $default): self {
        $this->schema['default'] = $default;
        return $this;
    }

    public function label(string $label): self {
        $this->schema['label'] = $label;
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

    public function build(): Prop_Type {
        $schema = $this->schema;
        $kind = $schema['kind'];
        SUPPORTED_PROPERTY_TYPES::is($kind);
        switch ($kind) {
            case 'select':
                $prop = String_Prop_Type::make();
                $resolved_values = [];
                $is_first = true;
                foreach ($schema['options'] as $_ => $value) {
                    if ($is_first) {
                        $prop->default($schema['default'] ?? $value);
                        $is_first = false;
                    }
                    $resolved_values[] = $value;
                }
                $prop->enum($resolved_values);
                return $prop;
            case 'boolean':
            case 'bool':
            case 'switch':
                return Boolean_Prop_Type::make()->default($schema['default'] ?? false);
            case 'text':
            case 'text_area':
                return String_Prop_Type::make()->default($schema['default'] ?? '');
            case 'image':
                $prop = Image_Prop_Type::make();
                if (isset($schema['default'])) {
                    $prop->default_url($schema['default']);
                } else {
                    $prop->default_url(Placeholder_Image::get_placeholder_image());
                }
                $prop->default_size('full');
                return $prop;
            case 'link':
                $prop = Link_Prop_Type::make();
                if (isset($schema['default'])) {
                    $prop->default($schema['default']);
                }
                return $prop;
            default:
                throw new \Exception("Unsupported property type: $kind");
        }
    }
    
}