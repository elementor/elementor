<?php

namespace Elementor\Modules\AtomicWidgets\PropTypes;

use Elementor\Modules\AtomicWidgets\PropTypes\Base\Object_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Primitives\Number_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Primitives\String_Prop_Type;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Size_Prop_Type extends Object_Prop_Type {
	const DEFAULT_UNITS = [ 'px', 'em', 'rem', '%' ];

	public static function get_key(): string {
		return 'size';
	}

	protected function define_shape(): array {
		return [
			'size' => Number_Prop_Type::make()->required(),
			'unit' => String_Prop_Type::make()->enum( static::DEFAULT_UNITS )->required(),
		];
	}

	public function units( array $units ): self {
		$this->get_shape_field( 'unit' )->enum( $units );

		return $this;
	}
}
