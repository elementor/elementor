<?php
namespace Elementor\Modules\AtomicWidgets\PropsHandler;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

abstract class Transformer_Base {
	/**
	 * Used for handling inner props inside a prop.
	 *
	 * @var Props_Handler
	 */
	protected Props_Handler $props_handler;

	/**
	 * @param Props_Handler $props_handler
	 *
	 * @return $this
	 */
	public function set_props_handler( Props_Handler $props_handler ): self {
		$this->props_handler = $props_handler;

		return $this;
	}

	/**
	 * Get the transformer type.
	 *
	 * @return string
	 */
	abstract public function get_type(): string;

	/**
	 * Transform the value.
	 *
	 * @param mixed $value
	 *
	 * @return mixed
	 */
	abstract public function transform( $value );
}
