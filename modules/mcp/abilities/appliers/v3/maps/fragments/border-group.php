<?php

namespace Elementor\Modules\Mcp\Abilities\Appliers\V3\Maps\Fragments;

use Elementor\Modules\Mcp\Abilities\Appliers\V3\Maps\Style_Target;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\Maps\V3_Control;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Binds the fields of an Elementor border group control (`Group_Control_Border`).
 */
class Border_Group implements Style_Fragment {

	private string $prefix;

	private string $state;

	private function __construct( string $prefix, string $state ) {
		$this->prefix = $prefix;
		$this->state = $state;
	}

	public static function from_prefix( string $prefix, string $state = Style_Target::DEFAULT_STATE ): self {
		return new self( $prefix, $state );
	}

	public function apply_to( Style_Target $target ): void {
		$target
			->bind( 'border-style', V3_Control::bind_to( $this->prefix . '_border' ), $this->state )
			->bind( 'border-width', V3_Control::bind_to( $this->prefix . '_width' )->responsive(), $this->state )
			->bind( 'border-color', V3_Control::bind_to( $this->prefix . '_color' ), $this->state );
	}
}
