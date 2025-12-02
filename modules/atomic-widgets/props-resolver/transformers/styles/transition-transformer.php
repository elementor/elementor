<?php

namespace Elementor\Modules\AtomicWidgets\PropsResolver\Transformers\Styles;

use Elementor\Modules\AtomicWidgets\PropsResolver\Props_Resolver_Context;
use Elementor\Modules\AtomicWidgets\PropsResolver\Transformer_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Transition_Transformer extends Transformer_Base {
	const EMPTY_STRING = '';

	private function get_allowed_properties(): array {
		$core_properties = [ 'all' ];

		return apply_filters(
			'elementor/atomic-widgets/styles/transitions/allowed-properties',
			$core_properties
		);
	}

	public function transform( $transitions, Props_Resolver_Context $context ) {
		if ( ! is_array( $transitions ) ) {
			return self::EMPTY_STRING;
		}

		$allowed_properties = $this->get_allowed_properties();

		$transition_strings = array_map(
			function( $transition ) use ( $allowed_properties ) {
				return $this->map_to_transition_string( $transition, $allowed_properties );
			},
			$transitions
		);

		$valid_transitions = array_filter( $transition_strings );

		return implode( ', ', $valid_transitions );
	}

	private function map_to_transition_string( $transition, array $allowed_properties ): string {
		if ( empty( $transition['selection'] ) || empty( $transition['size'] ) ) {
			return self::EMPTY_STRING;
		}

		$selection = $transition['selection'];
		$size = $transition['size'];

		if ( empty( $selection['value'] ) ) {
			return self::EMPTY_STRING;
		}

		$property = $selection['value'];

		if ( ! in_array( $property, $allowed_properties, true ) ) {
			return self::EMPTY_STRING;
		}

		return trim( "{$property} {$size}" );
	}
}
