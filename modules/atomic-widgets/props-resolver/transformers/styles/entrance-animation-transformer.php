<?php

namespace Elementor\Modules\AtomicWidgets\PropsResolver\Transformers\Styles;

use Elementor\Modules\AtomicWidgets\PropsResolver\Multi_Props;
use Elementor\Modules\AtomicWidgets\PropsResolver\Props_Resolver_Context;
use Elementor\Modules\AtomicWidgets\PropsResolver\Transformer_Base;
use Elementor\Modules\AtomicWidgets\PropTypes\Entrance_Animation_Prop_Type;

if ( ! defined( 'ABSPATH' ) ) {
    exit; // Exit if accessed directly.
}

class Entrance_Animation_Transformer extends Transformer_Base {
    
    public function transform( $value, Props_Resolver_Context $context ) {
        error_log('=== START Entrance Animation Transformer ===');
        error_log('Raw input value: ' . json_encode($value, JSON_PRETTY_PRINT));
        
        // $animation_data = $value['entrance-animation'];

        // $animation = $animation_data['animation']['value'];
        // $duration = $animation_data['duration']['value'];
        // $delay = $animation_data['delay']['value'];

        if (isset($value)) {
            $properties = [
               'animation-name' => 'bounce',
            'animation-duration' => '2s',
            'animation-fill-mode' => 'forwards',  // Changed from 'both' to 'forwards' to maintain final state
            'animation-timing-function' => 'ease-in-out',
            'animation-play-state' => 'running',
            'animation-iteration-count' => '1',
            'animation-direction' => 'normal',
            'visibility' => 'visible',  // Ensure element stays visible
            'opacity' => '1',  // Ensure element stays visible
            'transform' => 'none',  // Reset any transforms that might be applied
            'will-change' =>'transform, opacity',  // Optimize animation performance
            ];
            
            // error_log('Returning animation properties: ' . print_r($properties, true));
            return Multi_Props::generate($properties);
        }

        // error_log('No value found, returning null');
        // return null;
        
        // Basic validation
        // if (!is_array($value) || !isset($value['value'])) {
        //     error_log('Invalid input structure - missing value array');
        //     return null;
        // }

        // $animation_value = $value['value'];
        // error_log('Animation settings: ' . json_encode($animation_value, JSON_PRETTY_PRINT));

        // // Extract values from nested structure
        // $animation = isset($animation_value['animation']['value']) ? $animation_value['animation']['value'] : '';
        // $duration = isset($animation_value['duration']['value']) ? $animation_value['duration']['value'] : 'normal';
        // $delay = isset($animation_value['delay']['value']) ? (float)$animation_value['delay']['value'] : 0;

        // error_log("Extracted values - Animation: $animation, Duration: $duration, Delay: $delay");

        // // If no animation is selected, return null
        // if (empty($animation)) {
        //     error_log('No animation specified, returning null');
        //     return null;
        // }

        // // Get duration mapping
        // $duration_values = Entrance_Animation_Prop_Type::get_duration_values();
        // $duration_seconds = $duration_values[$duration] ?? 1.0;

        // // Important: Add animate__ prefix to match Animate.css keyframe names
        // $keyframe_name = 'animate__' . $animation;

        // // Generate CSS animation properties
        // $properties = [
        //     // Core animation properties
        //     'animation-name' => $keyframe_name,
        //     'animation-duration' => $duration_seconds . 's',
        //     'animation-fill-mode' => 'both',
        //     'animation-timing-function' => 'ease-in-out',
        //     'animation-delay' => $delay > 0 ? $delay . 's' : '0s',
            
        //     // Animate.css custom properties
        //     '--animate-duration' => $duration_seconds . 's',
        //     '--animate-delay' => $delay . 's',
        //     '--animate-repeat' => '1',
            
        //     // Add the animate__animated class as a property
        //     'animation-play-state' => 'running'
        // ];

        // error_log('Generated CSS properties: ' . json_encode($properties, JSON_PRETTY_PRINT));
        // $result = Multi_Props::generate($properties);
        // error_log('Final result: ' . json_encode($result, JSON_PRETTY_PRINT));
        // return $result;
    }
} 