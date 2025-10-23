<?php

namespace Elementor\Modules\AtomicWidgets\PropTypes;

use Elementor\Modules\AtomicWidgets\PropTypes\Base\Array_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Primitives\String_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Interaction_Prop_Type;

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}


class Interactions_Prop_Type extends Array_Prop_Type {
    public static function get_key(): string {
        return 'interactions';
    }

    // public function get_default() {
    //     return [];
    // }

    /**
     * Define the item type for the array
     */
    protected function define_item_type(): \Elementor\Modules\AtomicWidgets\PropTypes\Contracts\Prop_Type {
        return Interaction_Prop_Type::make();
    }
}

// class Interactions_Prop_Type extends String_Prop_Type {
//     public static function get_key(): string {
//         return 'interactions';
//     }

//     public function get_default() {
//         return '';
//     }
// }