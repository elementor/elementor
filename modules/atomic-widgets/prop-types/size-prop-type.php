<?php

namespace Elementor\Modules\AtomicWidgets\PropTypes;

use Elementor\Modules\AtomicWidgets\PropTypes\Base\Plain_Prop_Type;
use Elementor\Utils;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Size_Prop_Type extends Plain_Prop_Type {
	const SUPPORTED_UNITS = [ 'px', 'em', 'rem', '%', 'vh', 'vw', 'vmin', 'vmax' ];
	const SUPPORTED_EXTENDED_VALUES = [ 'auto' ];

	protected bool $is_extended_value = false;

	public static function get_key(): string {
		return 'size';
	}

	public function add_extended_values( array $allowed_values ): self {

		$invalid_values = array_diff($allowed_values, static::SUPPORTED_EXTENDED_VALUES);

		if (!empty( $invalid_values )) {
			Utils::safe_throw('Unsupported extended values: ' . implode(', ', $invalid_values));
		}

		$this->settings['extended-values'] = $allowed_values;

		return $this;
	}

 	public function get_extended_values() {
		return $this->settings['extended-values'] ?? null;
	}

	protected function validate_value( $value ): bool {
		if ( $this->get_extended_values() && $this->validate_extended_values( $value ) ) {
			return true;
		}

		return is_array( $value ) &&
			array_key_exists( 'size', $value ) &&
			is_numeric( $value['size'] ) &&
			! empty( $value['unit'] ) &&
			in_array( $value['unit'], static::SUPPORTED_UNITS, true );
	}

	private function validate_extended_values( $value ): bool {
		if( is_string($value) && in_array($value, $this->get_extended_values() ?? [], true) ){
			$this->is_extended_value = true;
			return true;
		}

		return false;
	}

	protected function sanitize_value( $value ) {
		if ($this->is_extended_value) {
			return sanitize_text_field($value);
		}

		return [
			'size' => (int) $value['size'],
			'unit' => sanitize_text_field( $value['unit'] ),
		];
	}
}
