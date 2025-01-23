<?php

namespace Elementor\Modules\AtomicWidgets\PropsResolver\Transformers;

use Elementor\Modules\AtomicWidgets\PropsResolver\Transformer_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Combine_Array_Transformer extends Transformer_Base {
	private string $separator;
	private array $additional_items = [];

	public function __construct( string $separator ) {
		$this->separator = $separator;
	}

	public function set_additional_items( array $items ) {
		$this->additional_items = $items;
	}

	public function reset() {
		$this->additional_items = [];
	}

	public function transform( $value, $key ) {
		if ( ! is_array( $value ) ) {
			return null;
		}

		$value = array_merge( $value, $this->additional_items );

		return implode( $this->separator, array_filter( $value ) );
	}
}
