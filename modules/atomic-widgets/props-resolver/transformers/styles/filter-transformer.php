<?php

namespace Elementor\Modules\AtomicWidgets\PropsResolver\Transformers\Styles;

use Elementor\Modules\AtomicWidgets\PropsResolver\Props_Resolver_Context;
use Elementor\Modules\AtomicWidgets\PropsResolver\Transformer_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Filter_Transformer extends Transformer_Base {
	public function transform( $filters, Props_Resolver_Context $context ) {
		$filter_strings = array_map( [ $this, 'map_to_filter_string' ], $filters );
		return implode( ' ', $filter_strings );
	}

	private function map_to_filter_string( $filter ): string {
		if ( isset( $filter['radius'] ) ) {
			return 'blur(' . $filter['radius'] . ')';
		}

		if ( isset( $filter['amount'] ) ) {
			return 'brightness(' . $filter['amount'] . ')';
		}

		return '';
	}
}
