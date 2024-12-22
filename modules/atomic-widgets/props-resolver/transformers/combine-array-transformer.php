<?php

namespace Elementor\Modules\AtomicWidgets\PropsResolver\Transformers;

use Elementor\Modules\AtomicWidgets\PropsResolver\Transformer_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Combine_Array_Transformer extends Transformer_Base {
	private string $separator;

	public function __construct( string $separator ) {
		$this->separator = $separator;
	}

	public function transform( $value, $key ) {
		return implode( $this->separator, array_filter( $value ) );
	}
}
