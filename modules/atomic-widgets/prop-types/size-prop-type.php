<?php

namespace Elementor\Modules\AtomicWidgets\PropTypes;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Size_Prop_Type extends Transformable_Prop_Type {
	protected array $settings = [
		'units' => [ 'px', 'em', 'rem', '%' ],
	];

	public static function get_key(): string {
		return 'size';
	}

	public function units( array $units ): self {
		$this->settings['units'] = $units;

		return $this;
	}

	public function validate_value( $value ): void {
		if ( ! isset( $value['size'] ) || ! isset( $value['unit'] ) ) {
			throw new \Exception( 'Value must include size and unit' );
		}

		if ( array_search( $value['unit'], $this->settings['units'], true ) === false ) {
			throw new \Exception( 'unit is not valid' );
		}
	}
}
