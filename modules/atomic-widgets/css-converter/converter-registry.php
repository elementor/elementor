<?php

namespace Elementor\Modules\AtomicWidgets\CssConverter;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Converter_Registry {
	/**
	 * @var Property_Converter[]
	 */
	private array $converters = [];

	public function register( Property_Converter $converter ): self {
		$this->converters[] = $converter;

		return $this;
	}

	/**
	 * Converters in registration order. The dispatcher iterates these and applies
	 * the try-until-success flow (is_supported -> convert -> fallthrough on failure).
	 *
	 * @return Property_Converter[]
	 */
	public function all(): array {
		return $this->converters;
	}
}
