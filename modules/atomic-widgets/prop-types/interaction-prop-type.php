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

    // public function get_default() {
    //     return static::generate([
    //         'trigger' => 'scroll-into-view',
    //         'animation' => 'fade',
    //         'type' => 'in',
    //         'direction' => 'left',
    //     ]);
    // }

    protected function validate_value( $value ): bool {
        if ( ! is_array( $value ) ) {
            return false;
        }

        // Validate each required string property directly
        $required_strings = [ 'trigger', 'animation', 'type', 'direction' ];
        
        foreach ( $required_strings as $key ) {
            if ( ! isset( $value[ $key ] ) || ! is_string( $value[ $key ] ) ) {
                return false;
            }
        }

        return true;
    }
    /**
     * Define the shape of the interaction object 
     */
    protected function define_shape(): array {
        return [
            'trigger' => String_Prop_Type::make(),
            'animation' => String_Prop_Type::make(),
            'type' => String_Prop_Type::make(),
            'direction' => String_Prop_Type::make(),
        ];
    }
}