<?php
// /props-resolver/transformers/settings/motion-effects-data-transformer.php

namespace Elementor\Modules\AtomicWidgets\PropsResolver\Transformers\Settings;

use Elementor\Modules\AtomicWidgets\PropsResolver\Props_Resolver_Context;
use Elementor\Modules\AtomicWidgets\PropsResolver\Transformer_Base;


if ( ! defined( 'ABSPATH' ) ) {
    exit; // Exit if accessed directly.
}

class Motion_Effects_Data_Transformer extends Transformer_Base {
    
    public function transform($value, Props_Resolver_Context $context) {
        error_log('🔧 Motion_Effects_Data_Transformer::transform() called!');
        error_log('📊 Value received: ' . print_r($value, true));
        
        // For now, just check if motion effects is enabled
        if (!$value || !is_array($value)) {
            return null;
        }
        
        // Simple check - if any motion effect input is "yes", add the attribute
        $motion_enabled = false;
        
        // Check if entrance is enabled
        if (isset($value['entrance']) && $value['entrance'] === 'yes') {
            $motion_enabled = true;
        }
        
        // Check if any other motion effect is enabled
        if (isset($value['scroll']) && $value['scroll'] === 'yes') {
            $motion_enabled = true;
        }
        
        if (isset($value['mouse']) && $value['mouse'] === 'yes') {
            $motion_enabled = true;
        }
        
        if (!$motion_enabled) {
            error_log('❌ No motion effects enabled');
            return null;
        }
        
        error_log('✅ Motion effects enabled, adding data attribute');
        
        // Return data attribute for JavaScript to pick up
        return [
            'data-motion-effects' => 'enabled'
        ];
    }
}