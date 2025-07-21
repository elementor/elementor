<?php

namespace Elementor\Modules\AtomicWidgets\PropsResolver\Transformers\Styles;

use Elementor\Modules\AtomicWidgets\PropsResolver\Props_Resolver_Context;
use Elementor\Modules\AtomicWidgets\PropsResolver\Transformer_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Transition_Transformer extends Transformer_Base {
	public function transform( $transitions, Props_Resolver_Context $context ) {
		$transition_strings = array_map( [ $this, 'map_to_transition_string' ], $transitions );
		return implode( ', ', $transition_strings );
	}

	private function map_to_transition_string( $transition ): string {
		if ( ! $transition['selection'] || ! $transition['size'] ) {
			return '';
		}

		$property = $transition['selection'];
		$duration = $transition['size'];

		if ( $transition['selection'] === 'all properties' ) {
			$property = 'all';
		}

		return trim( "{$property} {$duration}" );
	}
}
