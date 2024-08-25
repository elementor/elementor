<?php

namespace Elementor\Modules\AtomicWidgets\PropTypes;

use Elementor\Utils;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Prop_Types_Registry {

	/**
	 * @var array<Prop_Type>
	 */
	private array $types = [];

	public function register( Prop_Type $prop_type ) {
		$type = $prop_type->get_type();

		if ( isset( $this->types[ $type ] ) ) {
			Utils::safe_throw( "Prop type with type `$type` already exists" );
			return;
		}

		$this->types[ $type ] = $prop_type;
	}

	public function get( string $type ): ?Prop_Type {
		return $this->types[ $type ] ?? null;
	}

	public function get_all(): array {
		return $this->types;
	}
}
