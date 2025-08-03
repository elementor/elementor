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
		error_log('Entrance Animation Transformer - Received value: ' . print_r($value, true));

		// Get the actual animation value from the transformable structure
		$animation_value = $value['value'] ?? [];
		error_log('Entrance Animation Transformer - Animation value: ' . print_r($animation_value, true));

		// If no animation is selected, return empty properties
		if ( empty( $animation_value ) || empty( $animation_value['animation']['value'] ) ) {
			error_log('Entrance Animation Transformer - Empty animation, returning null');
			return null;
		}

		// Get duration mapping
		$duration_values = Entrance_Animation_Prop_Type::get_duration_values();
		$animation = $animation_value['animation']['value'] ?? '';
		$duration = $animation_value['duration']['value'] ?? 'normal';
		$delay = $animation_value['delay']['value'] ?? 0;
		error_log("Entrance Animation Transformer - Using animation: $animation, duration: $duration, delay: $delay");

		// Convert duration to seconds
		$duration_seconds = $duration_values[ $duration ] ?? 1.0;

		// Generate CSS animation properties
		$properties = [
			'animation-name' => $animation,
			'animation-duration' => $duration_seconds . 's',
			'animation-fill-mode' => 'both',
			'animation-timing-function' => 'ease-in-out'
		];

		// Add delay if specified
		if ( $delay > 0 ) {
			$properties['animation-delay'] = $delay . 's';
		}

		return Multi_Props::generate( $properties );
	}
} 