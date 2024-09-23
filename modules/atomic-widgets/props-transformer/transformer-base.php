<?php
namespace Elementor\Modules\AtomicWidgets\PropsTransformer;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

abstract class Transformer_Base {
	abstract public function get_type(): string;

	abstract public function transform( $value );
}
