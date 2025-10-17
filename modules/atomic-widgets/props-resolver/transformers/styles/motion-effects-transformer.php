<?php
// /props-resolver/transformers/styles/motion-effects-transformer.php

namespace Elementor\Modules\AtomicWidgets\PropsResolver\Transformers\Styles;

use Elementor\Modules\AtomicWidgets\PropsResolver\Multi_Props;
use Elementor\Modules\AtomicWidgets\PropsResolver\Props_Resolver_Context;
use Elementor\Modules\AtomicWidgets\PropsResolver\Transformer_Base;

if ( ! defined( 'ABSPATH' ) ) {
    exit; // Exit if accessed directly.
}

class Motion_Effects_Transformer extends Transformer_Base {
    
    public function transform($value, Props_Resolver_Context $context) {
        if (!$value || !is_array($value)) {
            return Multi_Props::generate([]);
        }
        
        $properties = [];
        
        // Handle entrance animations
        if ($this->has_entrance_animation($value)) {
            $entrance_properties = $this->process_entrance_animation($value['entrance']);
            $properties = array_merge($properties, $entrance_properties);
        }
        
        // Setup for Motion.js effects
        if ($this->has_motion_js_effects($value)) {
            $properties['will-change'] = 'transform, opacity';
            $properties['transform'] = 'translateZ(0)'; // Hardware acceleration
        }
        
        // 3D perspective for tilt effects
        if ($this->has_tilt_effects($value)) {
            $perspective = $value['mouse']['effects']['tilt']['perspective'] ?? 1200;
            $properties['perspective'] = $perspective . 'px';
            $properties['transform-style'] = 'preserve-3d';
        }
        
        // CSS custom properties for conflict resolution
        if ($this->has_opacity_conflicts($value)) {
            $properties['--motion-opacity-base'] = '1';
        }
        
        if ($this->has_transform_conflicts($value)) {
            $properties['--motion-x'] = '0px';
            $properties['--motion-y'] = '0px';
            $properties['--motion-scale'] = '1';
            $properties['--motion-rotate'] = '0deg';
        }
        
        return empty($properties) ? Multi_Props::generate([]) : Multi_Props::generate($properties);
    }
    
    private function process_entrance_animation($entrance) {
        if (!$entrance['enabled'] || empty($entrance['type'])) {
            return [];
        }
        
        $properties = [];
        $animation_type = $entrance['type'];
        
        if ($this->is_complex_animation($animation_type)) {
            // Use Animate.css for complex animations
            $duration = $this->get_duration_value($entrance['duration']);
            
            $properties['animation-name'] = 'animate__' . $animation_type;
            $properties['animation-duration'] = $duration . 's';
            $properties['animation-fill-mode'] = 'both';
            $properties['animation-timing-function'] = 'ease-in-out';
            
            if ($entrance['delay'] > 0) {
                $properties['animation-delay'] = $entrance['delay'] . 's';
            }
        } else {
            // Simple animations handled by Motion.js
            if (strpos($animation_type, 'fade') !== false) {
                $properties['opacity'] = '0';
            }
            
            if (strpos($animation_type, 'slide') !== false || strpos($animation_type, 'zoom') !== false) {
                $properties['transform'] = 'translateZ(0)';
            }
        }
        
        return $properties;
    }
    
    private function has_entrance_animation($value) {
        return isset($value['entrance']) && 
               $value['entrance']['enabled'] && 
               !empty($value['entrance']['type']);
    }
    
    private function has_motion_js_effects($value) {
        $has_simple_entrance = $this->has_entrance_animation($value) && 
                              !$this->is_complex_animation($value['entrance']['type']);
        
        $has_scroll = isset($value['scroll']) && $value['scroll']['enabled'];
        
        $has_mouse = isset($value['mouse']) && $value['mouse']['enabled'];
        
        return $has_simple_entrance || $has_scroll || $has_mouse;
    }
    
    private function has_tilt_effects($value) {
        return isset($value['mouse']) && 
               $value['mouse']['enabled'] && 
               isset($value['mouse']['effects']['tilt']['enabled']) &&
               $value['mouse']['effects']['tilt']['enabled'];
    }
    
    private function has_opacity_conflicts($value) {
        $entrance_affects_opacity = $this->has_entrance_animation($value) && 
                                   strpos($value['entrance']['type'], 'fade') !== false;
        
        $scroll_affects_opacity = isset($value['scroll']) && 
                                 $value['scroll']['enabled'] && 
                                 isset($value['scroll']['opacity']) &&
                                 $value['scroll']['opacity'];
        
        return $entrance_affects_opacity || $scroll_affects_opacity;
    }
    
    private function has_transform_conflicts($value) {
        $entrance_affects_transform = $this->has_entrance_animation($value) && (
            strpos($value['entrance']['type'], 'slide') !== false ||
            strpos($value['entrance']['type'], 'zoom') !== false
        );
        
        $scroll_affects_transform = isset($value['scroll']) && 
                                   $value['scroll']['enabled'] && 
                                   isset($value['scroll']['translateY']) &&
                                   $value['scroll']['translateY'];
        
        $mouse_affects_transform = isset($value['mouse']) && 
                                  $value['mouse']['enabled'];
        
        return $entrance_affects_transform || $scroll_affects_transform || $mouse_affects_transform;
    }
    
    private function is_complex_animation($type) {
        $complex_animations = [
            'bounce', 'wobble', 'jello', 'heartBeat', 'pulse',
            'bounceIn', 'bounceInUp', 'bounceInDown',
            'rotateIn', 'rotateInDownLeft', 'rotateInUpRight',
            'lightSpeedInRight', 'lightSpeedInLeft',
            'flipInX', 'flipInY', 'rollIn', 'jackInTheBox'
        ];
        
        return in_array($type, $complex_animations);
    }
    
    private function get_duration_value($duration) {
        $duration_map = [
            'slow' => 2,
            'normal' => 1,
            'fast' => 0.5
        ];
        
        return $duration_map[$duration] ?? 1;
    }
}