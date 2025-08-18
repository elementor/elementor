<?php
// /props-resolver/transformers/settings/motion-effects-data-transformer.php

namespace Elementor\Modules\AtomicWidgets\PropsResolver\Transformers\Settings;

use Elementor\Modules\AtomicWidgets\PropsResolver\Props_Resolver_Context;
use Elementor\Modules\AtomicWidgets\PropsResolver\Transformer_Base;
use Elementor\Modules\AtomicWidgets\PropsResolver\Multi_Props;


if ( ! defined( 'ABSPATH' ) ) {
    exit; // Exit if accessed directly.
}

class Motion_Effects_Data_Transformer extends Transformer_Base {
    
    private const COMPLEX_ANIMATIONS = [
        'bounce', 'wobble', 'jello', 'heartBeat', 'pulse',
        'bounceIn', 'bounceInUp', 'bounceInDown',
        'rotateIn', 'rotateInDownLeft', 'rotateInUpRight',
        'lightSpeedInRight', 'lightSpeedInLeft',
        'flipInX', 'flipInY', 'rollIn', 'jackInTheBox'
    ];
    
    private const DURATION_MAP = [
        'slow' => 2.0,
        'normal' => 1.0,
        'fast' => 0.5
    ];
    
    public function transform($value, Props_Resolver_Context $context) {
        // var_dump('hello');
        // var_dump($value);
        // error_log('🔧 Motion_Effects_Data_Transformer::transform() called!');
        // error_log('📊 Value received: ' . print_r($value, true));
        // error_log('📊 Context: ' . print_r($context, true));
        // if (!$value || !is_array($value)) {
        //     return [];
        // }

        // $motion_data = [];
        
        // Process simple entrance animations for Motion.js
        // if ($this->has_simple_entrance_animation($value)) {
        //     $entrance = $value['entrance'];
            
        //     $motion_data['entrance'] = [
        //         'type' => $entrance['type'],
        //         'duration' => self::DURATION_MAP[$entrance['duration']] ?? 1.0,
        //         'delay' => $entrance['delay'] ?? 0
        //     ];
        // }
        
        // // Process scroll effects
        // if ($this->has_scroll_effects($value)) {
        //     $motion_data['scroll'] = $this->process_scroll_effects($value['scroll']);
        // }
        
        // // Process mouse effects
        // if ($this->has_mouse_effects($value)) {
        //     $motion_data['mouse'] = $this->process_mouse_effects($value['mouse']);
        // }
        
        // // Add responsive settings
        // if (isset($value['devices']) && is_array($value['devices'])) {
        //     $motion_data['devices'] = $value['devices'];
        // } else {
        //     $motion_data['devices'] = ['desktop', 'tablet', 'mobile']; // Default
        // }
        
        // if (empty($motion_data)) {
        //     return null;
        // }

        $motion_data = [
            'scroll' => [
                'enabled' => true,
                'translateY' => [
                    'enabled' => true,
                    'speed' => 2,
                    'direction' => 'up',
                    'range' => ['start' => 0, 'end' => 100]
                ],
                'opacity' => [
                    'enabled' => true,
                    'direction' => 'fade-in',
                    'range' => ['start' => 20, 'end' => 80]
                ],
                'scale' => [
                    'enabled' => true,
                    'direction' => 'scale-up', 
                    'speed' => 0.3,
                    'range' => ['start' => 10, 'end' => 90]
                ]
            ],
            'entrance' => [
                'enabled' => false
            ],
            'mouse' => [
                'enabled' => false
            ],
            'devices' => ['desktop', 'tablet', 'mobile']
        ];
        
        // var_dump($motion_data);
        $json_data = wp_json_encode($motion_data);

        return $motion_data;
    }
    
    private function has_simple_entrance_animation($value) {
        return isset($value['entrance']) && 
               $value['entrance']['enabled'] && 
               !empty($value['entrance']['type']) &&
               !$this->is_complex_animation($value['entrance']['type']);
    }
    
    private function has_scroll_effects($value) {
        return isset($value['scroll']) && 
               $value['scroll']['enabled'] && 
               isset($value['scroll']['effects']);
    }
    
    private function has_mouse_effects($value) {
        return isset($value['mouse']) && 
               $value['mouse']['enabled'] && 
               isset($value['mouse']['effects']);
    }
    
    private function process_scroll_effects($scroll) {
        $scroll_data = [];
        $effects = $scroll['effects'] ?? [];
        
        // Process translateY
        if (isset($effects['translateY']) && $effects['translateY']['enabled']) {
            $scroll_data['translateY'] = [
                'speed' => $effects['translateY']['speed'] ?? 1,
                'direction' => $effects['translateY']['direction'] ?? 'up',
                'range' => $effects['translateY']['range'] ?? [
                    'start' => 0,
                    'end' => 100
                ]
            ];
        }
        
        // Process translateX
        if (isset($effects['translateX']) && $effects['translateX']['enabled']) {
            $scroll_data['translateX'] = [
                'speed' => $effects['translateX']['speed'] ?? 1,
                'direction' => $effects['translateX']['direction'] ?? 'left',
                'range' => $effects['translateX']['range'] ?? [
                    'start' => 0,
                    'end' => 100
                ]
            ];
        }
        
        // Process opacity
        if (isset($effects['opacity']) && $effects['opacity']['enabled']) {
            $scroll_data['opacity'] = [
                'direction' => $effects['opacity']['direction'] ?? 'fade-in',
                'range' => $effects['opacity']['range'] ?? [
                    'start' => 20,
                    'end' => 80
                ]
            ];
        }
        
        // Process scale
        if (isset($effects['scale']) && $effects['scale']['enabled']) {
            $scroll_data['scale'] = [
                'direction' => $effects['scale']['direction'] ?? 'scale-up',
                'speed' => $effects['scale']['speed'] ?? 0.2,
                'range' => $effects['scale']['range'] ?? [
                    'start' => 20,
                    'end' => 80
                ]
            ];
        }
        
        // Process rotate
        if (isset($effects['rotate']) && $effects['rotate']['enabled']) {
            $scroll_data['rotate'] = [
                'speed' => $effects['rotate']['speed'] ?? 1,
                'direction' => $effects['rotate']['direction'] ?? 'clockwise',
                'range' => $effects['rotate']['range'] ?? [
                    'start' => 0,
                    'end' => 100
                ]
            ];
        }
        
        // Add viewport setting
        $scroll_data['viewport'] = $scroll['viewport'] ?? 'viewport';
        
        return $scroll_data;
    }
    
    private function process_mouse_effects($mouse) {
        $mouse_data = [];
        $effects = $mouse['effects'] ?? [];
        
        // Process mouse tracking
        if (isset($effects['track']) && $effects['track']['enabled']) {
            $mouse_data['track'] = [
                'speed' => $effects['track']['speed'] ?? 1,
                'direction' => $effects['track']['direction'] ?? 'opposite'
            ];
        }
        
        // Process 3D tilt
        if (isset($effects['tilt']) && $effects['tilt']['enabled']) {
            $mouse_data['tilt'] = [
                'speed' => $effects['tilt']['speed'] ?? 4,
                'direction' => $effects['tilt']['direction'] ?? 'direct',
                'perspective' => $effects['tilt']['perspective'] ?? 1200
            ];
        }
        
        return $mouse_data;
    }
    
    private function is_complex_animation($type) {
        return in_array($type, self::COMPLEX_ANIMATIONS);
    }
}