<?php

namespace Elementor\Modules\Mcp\Abilities\Appliers\V3\Maps\Fragments;

use Elementor\Modules\Mcp\Abilities\Appliers\V3\Maps\Style_Target;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\Maps\V3_Control;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Binds the solid color of an Elementor background group control (`Group_Control_Background`),
 * switching the group to its classic type when written.
 */
class Background_Group implements Style_Fragment {

	const CLASSIC = 'classic';

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
		$target->bind(
			'background',
			V3_Control::bind_to( $this->prefix . '_color' )->requires( [ $this->prefix . '_background' => self::CLASSIC ] ),
			$this->state
		);
	}
}
