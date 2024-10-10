<?php

namespace Elementor\Modules\AtomicWidgets\PropTypes;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Size_Prop_Type extends Transformable_Prop_Type {
	protected array $default_units = [ 'px', 'em', 'rem', '%' ];

	public function __construct() {
		$this->internal_types['size'] = Number_Prop_Type::make();
		$this->internal_types['unit'] = String_Prop_Type::make()->enum( $this->default_units );
	}

	public static function get_key(): string {
		return 'size';
	}

	public function units( array $units ): self {
		$this->internal_types['unit']->enum( $units );

		return $this;
	}

	public function validate_value( $value ): void {
		if ( ! is_array( $value ) ) {
			throw new \Exception( 'Value must be an array, ' . gettype( $value ) . ' given.' );
		}

		$this->internal_types['size']->validate_with_additional( $value['size'] );
		$this->internal_types['unit']->validate_with_additional( $value['unit'] );
	}
}
