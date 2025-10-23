<?php

namespace Elementor\Modules\AtomicWidgets\PropTypes;

use Elementor\Modules\AtomicWidgets\PropTypes\Base\Object_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Primitives\String_Prop_Type;

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

class Interaction_Prop_Type extends Object_Prop_Type {
    public static function get_key(): string {
        return 'interaction';
    }

    public function get_default() {
        return static::generate([
            'animation' => 'fade-in-left',
        ]);
    }

    protected function validate_value( $value ): bool {
        if ( ! is_array( $value ) ) {
            return false;
        }

        // Validate animation property
        if ( ! isset( $value['animation'] ) || ! is_string( $value['animation'] ) ) {
            return false;
        }

        return true;
    }

    /**
     * Define the shape of the interaction object 
     */
    protected function define_shape(): array {
        return [
            'animation' => String_Prop_Type::make(),
        ];
    }
}