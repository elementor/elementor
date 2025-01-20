<?php
namespace Elementor\Modules\AtomicWidgets\Controls\Types;

use Elementor\Base_Data_Control;
use Elementor\Modules\AtomicWidgets\Base\Atomic_Control_Base;

if ( ! defined( 'ABSPATH' ) ) {
    exit; // Exit if accessed directly.
}

class Svg_Control extends Atomic_Control_Base {
    private ?string $default = null;
    private ?string $label = null;
    private ?string $description = null;

    public function get_type(): string {
        return 'svg';
    }

    public static function make( string $bind ): self {
        return new self( $bind );
    }

    public function set_default( string $default ): self {
        $this->default = $default;
        return $this;
    }

    public function set_label( string $label ): self {
        $this->label = $label;
        return $this;
    }

    public function set_description( string $description ): self {
        $this->description = $description;
        return $this;
    }

    public function get_props(): array {
        return [
            'type' => 'svg',
            'default' => $this->default,
            'label' => $this->label,
            'description' => $this->description,
            'show_label' => true,
            'label_block' => true,
        ];
    }

    public function with_default(?string $default): self {
        $this->default = $default;
        return $this;
    }
}