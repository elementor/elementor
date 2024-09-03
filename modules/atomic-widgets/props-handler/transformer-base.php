<?php
namespace Elementor\Modules\AtomicWidgets\PropsHandler;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

abstract class Transformer_Base {
	/** Used for handling inner props inside a prop. */
	protected Props_Handler $props_handler;

	public function set_props_handler( Props_Handler $props_handler ): self {
		$this->props_handler = $props_handler;

		return $this;
	}

	abstract public function get_type(): string;

	abstract public function transform( $value );
}
