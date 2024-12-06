<?php

namespace Elementor\Modules\AtomicWidgets\PropsResolver\Transformers\Styles;

use Elementor\Core\Utils\Collection;
use Elementor\Modules\AtomicWidgets\PropsResolver\Multi_Props;
use Elementor\Modules\AtomicWidgets\PropsResolver\Transformer_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Corner_Sizes_Transformer extends Transformer_Base {
	private $key_generator;

	public function __construct( callable $key_generator ) {
		$this->key_generator = $key_generator;
	}

	public function transform( $value, $key ) {
		$corners = Collection::make( $value )
			->only( [ 'top-left', 'top-right', 'bottom-right', 'bottom-left' ] )
			->filter()
			->map_with_keys( fn( $corner, $corner_key ) => [ call_user_func( $this->key_generator, $corner_key ) => $corner ] )
			->all();

		return Multi_Props::generate( $corners );
	}
}
