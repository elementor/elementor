<?php

namespace Elementor\Modules\AtomicWidgets\PropTypes;

use Elementor\Modules\AtomicWidgets\PropTypes\Base\Plain_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Primitives\Number_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Primitives\String_Prop_Type;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Size_Prop_Type extends Plain_Prop_Type {
	const SUPPORTED_UNITS = [ 'px', 'em', 'rem', '%', 'vh', 'vw', 'vmin', 'vmax' ];

	public static function get_key(): string {
		return 'size';
	}

	protected function validate_value( $value ): bool {
		return (
			is_array( $value ) &&
			array_key_exists( 'size', $value ) &&
			is_numeric( $value['size'] ) &&
			! empty( $value['unit'] ) &&
			in_array( $value['unit'], static::SUPPORTED_UNITS, true )
		);
	}

	protected function sanitize_value( $value ) {
		return [
			'size' => (int) $value['size'],
			'unit' => sanitize_text_field( $value['unit'] ),
		];
	}
}
