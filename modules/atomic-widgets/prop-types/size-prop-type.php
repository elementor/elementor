<?php

namespace Elementor\Modules\AtomicWidgets\PropTypes;

use Elementor\Modules\AtomicWidgets\PropTypes\Base\Object_Prop_Type;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Size_Prop_Type extends Object_Prop_Type {
	const DEFAULT_UNITS = [ 'px', 'em', 'rem', '%' ];

	public static function get_key(): string {
		return 'size';
	}

	protected function init_props(): array {
		return [
			'size' => Number_Prop_Type::make()->required(),
			'unit' => String_Prop_Type::make()->enum( static::DEFAULT_UNITS )->required(),
		];
	}

	public function units( array $units ): self {
		$this->get_prop( 'unit' )->enum( $units );

		return $this;
	}
}
