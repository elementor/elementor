<?php

namespace Elementor\Modules\AtomicWidgets\CssConverter;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Expander_Registry {
	/**
	 * @var Shorthand_Expander[]
	 */
	private array $expanders = [];

	public function register( Shorthand_Expander $expander ): self {
		$this->expanders[] = $expander;

		return $this;
	}

	/**
	 * Expanders in registration order. The dispatcher applies the first one that supports a rule.
	 *
	 * @return Shorthand_Expander[]
	 */
	public function all(): array {
		return $this->expanders;
	}
}
