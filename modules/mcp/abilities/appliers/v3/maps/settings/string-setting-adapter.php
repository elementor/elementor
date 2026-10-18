<?php

namespace Elementor\Modules\Mcp\Abilities\Appliers\V3\Maps\Settings;

use Elementor\Modules\AtomicWidgets\PropTypes\Contracts\Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Primitives\String_Prop_Type;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class String_Setting_Adapter implements V3_Setting_Adapter {

	/**
	 * @var string[]
	 */
	private array $enum;

	/**
	 * @param string[] $allowed_values
	 */
	public function __construct( array $allowed_values = [] ) {
		$this->enum = $allowed_values;
	}

	public function supports( array $control ): bool {
		return true;
	}

	public function prop_type( array $control ): Prop_Type {
		$prop_type = String_Prop_Type::make();

		return empty( $this->enum ) ? $prop_type : $prop_type->enum( $this->enum );
	}

	public function to_control_value( array $prop_value, array $control ) {
		return $prop_value['value'] ?? null;
	}

	public function from_control_value( $stored, array $control ) {
		return is_scalar( $stored ) ? (string) $stored : null;
	}
}
