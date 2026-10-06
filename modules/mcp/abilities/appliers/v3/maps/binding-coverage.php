<?php

namespace Elementor\Modules\Mcp\Abilities\Appliers\V3\Maps;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * The part of a style prop value that one binding owns: the whole value, or a set of sides.
 */
class Binding_Coverage {

	/**
	 * @var string[]|null Null when the binding owns the whole value.
	 */
	private ?array $sides;

	private function __construct( ?array $sides ) {
		$this->sides = $sides;
	}

	public static function whole(): self {
		return new self( null );
	}

	/**
	 * @param string[] $sides
	 */
	public static function sides( array $sides ): self {
		return new self( $sides );
	}

	public function overlaps( Binding_Coverage $other ): bool {
		if ( null === $this->sides || null === $other->sides ) {
			return true;
		}

		return ! empty( array_intersect( $this->sides, $other->sides ) );
	}
}
