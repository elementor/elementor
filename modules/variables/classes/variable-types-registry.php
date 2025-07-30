<?php

namespace Elementor\Modules\Variables\Classes;

use Elementor\Modules\AtomicWidgets\PropTypes\Contracts\Transformable_Prop_Type;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Variable_Types_Registry {
	private array $types;

	public function register( string $key, Transformable_Prop_Type $prop_type ): void {
		$this->types[ $key ] = $prop_type;
	}

	public function get( $key ) {
		return $this->types[ $key ];
	}

	public function all(): array {
		return $this->types;
	}
}
