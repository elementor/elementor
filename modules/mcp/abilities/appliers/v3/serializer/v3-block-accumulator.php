<?php

namespace Elementor\Modules\Mcp\Abilities\Appliers\V3\Serializer;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Groups CSS declarations by breakpoint + pseudo-state for the serializer's output.
 *
 * Structure: blocks[breakpoint][state][property] = value
 * where state === '' represents the base (no pseudo-state) group.
 *
 * Declarations of a named style target are kept apart in
 * scoped[target][breakpoint][state][property]; {@see for_target()} returns a view that
 * writes there while sharing storage with this accumulator.
 */
class V3_Block_Accumulator {

	/** @var array<string, array<string, array<string, string>>> */
	private array $blocks = [];

	/** @var array<string, array<string, array<string, array<string, string>>>> */
	private array $scoped = [];

	private ?string $target = null;

	public function for_target( ?string $target ): self {
		$view = new self();
		$view->blocks = &$this->blocks;
		$view->scoped = &$this->scoped;
		$view->target = $target;

		return $view;
	}

	public function push( string $breakpoint, ?string $state, string $property, string $value ): void {
		$state_key = $state ?? '';

		if ( null !== $this->target ) {
			$this->scoped[ $this->target ][ $breakpoint ][ $state_key ][ $property ] = $value;

			return;
		}

		$this->blocks[ $breakpoint ][ $state_key ][ $property ] = $value;
	}

	/**
	 * @return array<string, array<string, array<string, array<string, string>>>>
	 */
	public function scoped(): array {
		return $this->scoped;
	}

	/**
	 * @return array<string, array<string, array<string, string>>>
	 */
	public function all(): array {
		return $this->blocks;
	}
}
