<?php

namespace Elementor\Modules\AtomicWidgets\PropsResolver\Transformers\Styles;

use Elementor\Modules\AtomicWidgets\PropsResolver\Multi_Props;
use Elementor\Modules\AtomicWidgets\PropsResolver\Props_Resolver_Context;
use Elementor\Modules\AtomicWidgets\PropsResolver\Transformer_Base;

if ( ! defined( 'ABSPATH' ) ) {
    exit; // Exit if accessed directly.
}

class Entrance_Animation_Transformer extends Transformer_Base {
    
    public function transform( $value, Props_Resolver_Context $context ) {
        // This transformer is now disabled - motion effects handle everything
        return null;
        
        // Original code commented out:
        /*
        if (isset($value)) {
            $properties = [
                'animation-name' => 'bounce',
                'animation-duration' => '2s',
                'animation-fill-mode' => 'forwards',
                'animation-timing-function' => 'ease-in-out',
                'animation-play-state' => 'running',
                'animation-iteration-count' => '1',
                'animation-direction' => 'normal',
                'visibility' => 'visible',
                'opacity' => '1',
                'transform' => 'none',
                'will-change' =>'transform, opacity',
            ];
            
            return Multi_Props::generate($properties);
        }
        */
    }
} 