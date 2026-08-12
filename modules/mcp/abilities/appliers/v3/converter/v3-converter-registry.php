<?php

namespace Elementor\Modules\Mcp\Abilities\Appliers\V3\Converter;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Registration-order iterator of {@see V3_Property_Converter}. Mirror of
 * {@see \Elementor\Modules\AtomicWidgets\CssConverter\Converter_Registry}.
 *
 * The mapper iterates converters, taking the first one whose `is_supported()` returns
 * true; a `convert()` returning false marks the rule as unmapped (no fallthrough,
 * because the override shapes do not overlap).
 */
class V3_Converter_Registry {

	/** @var V3_Property_Converter[] */
	private array $converters = [];

	public function register( V3_Property_Converter $converter ): self {
		$this->converters[] = $converter;

		return $this;
	}

	/**
	 * @return V3_Property_Converter[]
	 */
	public function all(): array {
		return $this->converters;
	}
}
