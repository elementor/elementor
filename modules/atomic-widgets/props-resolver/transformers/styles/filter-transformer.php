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

		$keys = array_keys( $filter );

		if ( isset( $filter['xAxis'] ) && isset( $filter['yAxis'] ) && isset( $filter['blur'] ) && isset( $filter['color'] ) ) {
			$x_axis = $filter['xAxis'] ?? '0px';
			$y_axis = $filter['yAxis'] ?? '0px';
			$blur   = $filter['blur'] ?? '0px';
			$color  = $filter['color'] ?? 'transparent';
			return "drop-shadow({$x_axis} {$y_axis} {$blur} {$color})";
		}

		if ( count( $keys ) === 1 ) {
			return $keys[0] . '(' . $filter[ $keys[0] ] . ')';
		}

		return '';
	}
}
