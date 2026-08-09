<?php

namespace Elementor\Modules\Mcp\Abilities\Appliers\V3\Converter;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Groups CSS declarations by breakpoint + pseudo-state for the serializer's output.
 *
 * Structure: blocks[breakpoint][state][property] = value
 * where state === '' represents the base (no pseudo-state) group.
 */
class V3_Block_Accumulator {

	/** @var array<string, array<string, array<string, string>>> */
	private array $blocks = [];

	public function push( string $breakpoint, ?string $state, string $property, string $value ): void {
		$state_key = $state ?? '';

		$this->blocks[ $breakpoint ][ $state_key ][ $property ] = $value;
	}

	/**
	 * @return array<string, array<string, array<string, string>>>
	 */
	public function all(): array {
		return $this->blocks;
	}
}
