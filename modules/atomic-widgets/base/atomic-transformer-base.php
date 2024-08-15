<?php
namespace Elementor\Modules\AtomicWidgets\Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

abstract class Atomic_Transformer_Base {
	/**
	 * Get the transformer type.
	 *
	 * @return string
	 */
	abstract public static function type(): string;

	/**
	 * Transform the value.
	 *
	 * @param mixed $value
	 *
	 * @return mixed
	 */
	abstract public function transform( $value );
}
