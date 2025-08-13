<?php
// modules/atomic-widgets/motion-effects/prop-types/motion-effects-prop-type.php

namespace Elementor\Modules\AtomicWidgets\PropTypes;

use Elementor\Modules\AtomicWidgets\PropTypes\Base\Object_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Base\Array_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Primitives\Boolean_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Primitives\String_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Primitives\Number_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Contracts\Prop_Type;

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

class Motion_Effects_Entrance_Prop_Type extends Object_Prop_Type {
    public static function get_key(): string {
        return 'motion-effects-entrance';
    }
    
    protected function define_shape(): array {
        return [
            'enabled' => Boolean_Prop_Type::make()->default(false),
            'type' => String_Prop_Type::make()->enum([
                'fadeIn', 'fadeInUp', 'slideInUp', 'zoomIn',
                'bounce', 'wobble', 'heartBeat', 'bounceIn'
            ])->default(''),
            'duration' => String_Prop_Type::make()->enum(['slow', 'normal', 'fast'])->default('normal'),
            'delay' => Number_Prop_Type::make()->default(0)
        ];
    }
}

class Motion_Effects_Scroll_Prop_Type extends Object_Prop_Type {
    public static function get_key(): string {
        return 'scroll';
    }
    
    protected function define_shape(): array {
        return [
            'enabled' => Boolean_Prop_Type::make()->default(false),
        'translateY' => Boolean_Prop_Type::make()->default(false), 
        'opacity' => Boolean_Prop_Type::make()->default(false),
        'translateX' => Boolean_Prop_Type::make()->default(false),
        'scale' => Boolean_Prop_Type::make()->default(false),
        'rotate' => Boolean_Prop_Type::make()->default(false),
        ];
    }
}

class Motion_Effects_Mouse_Prop_Type extends Object_Prop_Type {
    public static function get_key(): string {
        return 'motion-effects-mouse';
    }
    
    protected function define_shape(): array {
        return [
            'enabled' => Boolean_Prop_Type::make()->default(false),
        ];
    }
}

class Motion_Effects_Devices_Prop_Type extends Array_Prop_Type {
    public static function get_key(): string {
        return 'motion-effects-devices';
    }
    
    protected function define_item_type(): Prop_Type {
        return String_Prop_Type::make()->enum(['desktop', 'tablet', 'mobile']);
    }
}

class Motion_Effects_Prop_Type extends Object_Prop_Type {
    public static function get_key(): string {
        return 'motion-effects';
    }
    
    protected function define_shape(): array {
        return [
            'entrance' => Motion_Effects_Entrance_Prop_Type::make(),
            'scroll' => Motion_Effects_Scroll_Prop_Type::make(),
            'mouse' => Motion_Effects_Mouse_Prop_Type::make(),
            'devices' => Motion_Effects_Devices_Prop_Type::make()->default(['desktop', 'tablet', 'mobile'])
        ];
    }
}