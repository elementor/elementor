<?php
namespace Elementor\Modules\AtomicWidgets\PropsHandler;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

interface Transformer {
	/**
	 * Get the transformer type.
	 *
	 * @return string
	 */
	public function get_type(): string;

	/**
	 * Transform the value.
	 *
	 * @param mixed $value
	 *
	 * @return mixed
	 */
	public function transform( $value );
}
