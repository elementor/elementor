<?php

namespace Elementor\Modules\Mcp\Abilities\Appliers\V3\Maps\Fragments;

use Elementor\Modules\Mcp\Abilities\Appliers\V3\Maps\Style_Target;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\Maps\V3_Control;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Binds the fields of an Elementor typography group control (`Group_Control_Typography`).
 */
class Typography_Group implements Style_Fragment {

	const FIELDS = [
		'font-family' => [ '_font_family', false ],
		'font-size' => [ '_font_size', true ],
		'font-weight' => [ '_font_weight', false ],
		'text-transform' => [ '_text_transform', false ],
		'font-style' => [ '_font_style', false ],
		'text-decoration' => [ '_text_decoration', false ],
		'line-height' => [ '_line_height', true ],
		'letter-spacing' => [ '_letter_spacing', true ],
		'word-spacing' => [ '_word_spacing', true ],
	];

	private string $prefix;

	/**
	 * @var string[]
	 */
	private array $excluded = [];

	private function __construct( string $prefix ) {
		$this->prefix = $prefix;
	}

	public static function from_prefix( string $prefix ): self {
		return new self( $prefix );
	}

	public function except( string ...$props ): self {
		$this->excluded = $props;

		return $this;
	}

	public function apply_to( Style_Target $target ): void {
		foreach ( self::FIELDS as $prop => [ $suffix, $is_responsive ] ) {
			if ( in_array( $prop, $this->excluded, true ) ) {
				continue;
			}

			$control = V3_Control::bind_to( $this->prefix . $suffix );

			$target->bind( $prop, $is_responsive ? $control->responsive() : $control );
		}
	}
}
