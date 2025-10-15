<?php

namespace Elementor\Modules\AtomicWidgets\PropTypes;

use Elementor\Modules\AtomicWidgets\PropTypes\Base\Array_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Primitives\String_Prop_Type;

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

/**
 * Motion Effects Prop Type
 * Array of motion effect objects with trigger, animation, type, and direction
 */
class Motion_Effects_Prop_Type extends Array_Prop_Type {
    public static function get_key(): string {
        return 'motion-effects';
    }
    
    public function get_default() {
        return [];
    }
    
    /**
     * Define the item type for the array
     */
    protected function define_item_type(): \Elementor\Modules\AtomicWidgets\PropTypes\Contracts\Prop_Type {
        return String_Prop_Type::make();
    }
}

