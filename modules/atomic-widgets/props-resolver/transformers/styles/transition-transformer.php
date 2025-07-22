<?php

namespace Elementor\Modules\AtomicWidgets\PropsResolver\Transformers\Styles;

use Elementor\Modules\AtomicWidgets\PropsResolver\Props_Resolver_Context;
use Elementor\Modules\AtomicWidgets\PropsResolver\Transformer_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Transition_Transformer extends Transformer_Base {

	const ALL_PROPERTIES_VALUE = 'all properties';
	const CSS_ALL_KEYWORD = 'all';
	const EMPTY_STRING = '';

	public function transform( $transitions, Props_Resolver_Context $context ) {
		if ( ! is_array( $transitions ) ) {
			return self::EMPTY_STRING;
		}

		$transition_strings = array_map( [ $this, 'map_to_transition_string' ], $transitions );
		$valid_transitions = array_filter( $transition_strings );

		return implode( ', ', $valid_transitions );
	}

	private function map_to_transition_string( $transition ): string {
		if ( ! is_array( $transition ) ) {
			return self::EMPTY_STRING;
		}

		if ( ! isset( $transition['selection'] ) || ! isset( $transition['size'] ) ) {
			return self::EMPTY_STRING;
		}

		$property = $transition['selection'];
		$duration = $transition['size'];

		if ( self::ALL_PROPERTIES_VALUE === $property ) {
			$property = self::CSS_ALL_KEYWORD;
		}

		return trim( "{$property} {$duration}" );
	}
}
