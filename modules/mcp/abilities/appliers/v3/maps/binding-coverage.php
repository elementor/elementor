<?php

namespace Elementor\Modules\Mcp\Abilities\Appliers\V3\Maps;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * The part of a style prop value that one binding owns: the whole value, a set of sides, or
 * one field of an object value.
 */
class Binding_Coverage {

	/**
	 * @var string[]|null
	 */
	private ?array $sides;

	private ?string $part;

	private function __construct( ?array $sides, ?string $part ) {
		$this->sides = $sides;
		$this->part = $part;
	}

	public static function whole(): self {
		return new self( null, null );
	}

	/**
	 * @param string[] $sides
	 */
	public static function sides( array $sides ): self {
		return new self( $sides, null );
	}

	public static function part( string $part ): self {
		return new self( null, $part );
	}

	public function overlaps( Binding_Coverage $other ): bool {
		if ( $this->is_whole() || $other->is_whole() ) {
			return true;
		}

		if ( null !== $this->part || null !== $other->part ) {
			return $this->part === $other->part;
		}

		return ! empty( array_intersect( $this->sides, $other->sides ) );
	}

	private function is_whole(): bool {
		return null === $this->sides && null === $this->part;
	}
}
