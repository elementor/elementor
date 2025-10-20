<?php

namespace Elementor\Modules\AtomicWidgets\PropTypes;

use Elementor\Modules\AtomicWidgets\PropTypes\Base\Object_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Primitives\String_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Primitives\Number_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Contracts\Prop_Type;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Entrance_Animation_Prop_Type extends Object_Prop_Type {

	public static function get_key(): string {
		return 'entrance-animation';
	}

	public static function generate( $value, $disable = false ): array {
		return [
			'$$type' => static::get_key(),
			'value' => $value,
		];
	}

	protected function define_shape(): array {
		$animations = self::get_entrance_animations();
		error_log('Entrance Animation define_shape - All animations: ' . print_r($animations, true));

		$animation_names = array_keys($animations);
		error_log('Entrance Animation define_shape - Animation names: ' . print_r($animation_names, true));

		$animation_prop = String_Prop_Type::make()->enum($animation_names)->default('');
		error_log('Entrance Animation define_shape - Animation prop settings: ' . print_r($animation_prop->get_settings(), true));

		$shape = [
			'animation' => String_Prop_Type::make()->enum($animation_names)->default(''),
			'duration' => String_Prop_Type::make()->enum(['slow', 'normal', 'fast'])->default('normal'),
			'delay' => Number_Prop_Type::make()->default(0),
		];

		error_log('Entrance Animation define_shape - Shape: ' . print_r($shape, true));
		return $shape;
	}

	/**
	 * Get duration values in seconds
	 */
	public static function get_duration_values(): array {
		return [
			'slow' => 2.0,
			'normal' => 1.0,
			'fast' => 0.5,
		];
	}

	public function validate( $value ): bool {
		error_log('Entrance Animation validate - Received: ' . json_encode($value, JSON_PRETTY_PRINT));
	
		if ( is_null( $value ) ) {
			error_log('Entrance Animation validate - Null value');
			return ! $this->is_required();
		}
	
		if ( ! $this->is_transformable( $value ) ) {
			error_log('Entrance Animation validate - Not transformable');
			return false;
		}
	
		$inner_value = $value['value'];
		error_log('Entrance Animation validate - Inner value: ' . json_encode($inner_value, JSON_PRETTY_PRINT));
	
		if ( ! is_array( $inner_value ) ) {
			error_log('Entrance Animation validate - Inner value not an array');
			return false;
		}
	
		// Validate each field
		foreach ( ['animation', 'duration', 'delay'] as $key ) {
			if (!isset($inner_value[$key]) || !isset($inner_value[$key]['value'])) {
				error_log("Entrance Animation validate - Missing required field: $key");
				return false;
			}
		}
	
		// Validate animation value
		$animation = $inner_value['animation']['value'];
		$valid_animations = array_keys(self::get_entrance_animations());
		if (!in_array($animation, $valid_animations)) {
			error_log("Entrance Animation validate - Invalid animation value: $animation");
			return false;
		}
	
		// Validate duration value
		$duration = $inner_value['duration']['value'];
		$valid_durations = ['slow', 'normal', 'fast'];
		if (!in_array($duration, $valid_durations)) {
			error_log("Entrance Animation validate - Invalid duration value: $duration");
			return false;
		}
	
		// Validate delay value
		$delay = $inner_value['delay']['value'];
		if (!is_numeric($delay) || $delay < 0) {
			error_log("Entrance Animation validate - Invalid delay value: $delay");
			return false;
		}
	
		error_log('Entrance Animation validate - All fields valid');
		return true;
	}

	/**
	 * Get entrance animations from Animate.css
	 * Based on https://animate.style/
	 */
	public static function get_entrance_animations(): array {
		return [
			'' => 'None',
			
			// Fading entrances
			'fadeIn' => 'Fade In',
			'fadeInDown' => 'Fade In Down',
			'fadeInLeft' => 'Fade In Left',
			'fadeInRight' => 'Fade In Right',
			'fadeInUp' => 'Fade In Up',
			'fadeInTopLeft' => 'Fade In Top Left',
			'fadeInTopRight' => 'Fade In Top Right',
			'fadeInBottomLeft' => 'Fade In Bottom Left',
			'fadeInBottomRight' => 'Fade In Bottom Right',
			
			// Bouncing entrances
			'bounceIn' => 'Bounce In',
			'bounceInDown' => 'Bounce In Down',
			'bounceInLeft' => 'Bounce In Left',
			'bounceInRight' => 'Bounce In Right',
			'bounceInUp' => 'Bounce In Up',
			
			// Sliding entrances
			'slideInDown' => 'Slide In Down',
			'slideInLeft' => 'Slide In Left',
			'slideInRight' => 'Slide In Right',
			'slideInUp' => 'Slide In Up',
			
			// Zooming entrances
			'zoomIn' => 'Zoom In',
			'zoomInDown' => 'Zoom In Down',
			'zoomInLeft' => 'Zoom In Left',
			'zoomInRight' => 'Zoom In Right',
			'zoomInUp' => 'Zoom In Up',
			
			// Rotating entrances
			'rotateIn' => 'Rotate In',
			'rotateInDownLeft' => 'Rotate In Down Left',
			'rotateInDownRight' => 'Rotate In Down Right',
			'rotateInUpLeft' => 'Rotate In Up Left',
			'rotateInUpRight' => 'Rotate In Up Right',
			
			// Back entrances
			'backInDown' => 'Back In Down',
			'backInLeft' => 'Back In Left',
			'backInRight' => 'Back In Right',
			'backInUp' => 'Back In Up',
			
			// Lightspeed
			'lightSpeedInRight' => 'Light Speed In Right',
			'lightSpeedInLeft' => 'Light Speed In Left',
			
			// Flippers
			'flipInX' => 'Flip In X',
			'flipInY' => 'Flip In Y',
			
			// Specials
			'jackInTheBox' => 'Jack In The Box',
			'rollIn' => 'Roll In',
			
			// Attention seekers (can work as entrance)
			'bounce' => 'Bounce',
			'pulse' => 'Pulse',
			'rubberBand' => 'Rubber Band',
			'tada' => 'Tada',
			'wobble' => 'Wobble',
			'jello' => 'Jello',
			'heartBeat' => 'Heart Beat',
		];
	}
} 