<?php

namespace Elementor\Modules\AtomicWidgets\PropTypes;

use Elementor\Modules\AtomicWidgets\PropTypes\Primitives\String_Prop_Type;

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

/**
 * Simple Motion Effects Prop Type
 * Just a string for now - user can type "yes" to enable motion effects
 */
class Motion_Effects_Prop_Type extends String_Prop_Type {
    public static function get_key(): string {
        return 'motion-effects';
    }
    
    public function get_default() {
        return '';
    }
}