<?php
namespace Elementor\Modules\AtomicWidgets\PropsResolver;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

abstract class Transformer_Base {
	abstract public function get_type(): string;

	abstract public function transform( $value );
}
