<?php

namespace Elementor\Modules\AtomicWidgets\PropTypes\Traits;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

use Elementor\Modules\AtomicWidgets\PropTypes\Concerns\Has_Default;
use Elementor\Modules\AtomicWidgets\PropTypes\Contracts\Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Size_Prop_Type;

trait Dimensional_Prop_Type {
	use Has_Default;

	/**
	 * Defines the shape of the 3D prop type.
	 *
	 * @return array
	 */
	protected function define_shape(): array {
		$default = $this->get_default_size();

		$shape = [
			'x' => $this->get_prop_type(),
			'y' => $this->get_prop_type(),
			'z' => $this->get_prop_type(),
		];

		if ( ! $default ) {
			return $shape;
		}

		foreach ( $shape as $key => $prop_type ) {
			$shape[ $key ] = $prop_type->default( $default );
		}

		return $shape;
	}

	protected function get_default_size(): ?array {
		return [
			'size' => 0,
			'unit' => 'px',
		];
	}

	protected function get_prop_type(): Prop_Type {
		return Size_Prop_Type::make();
	}
}
