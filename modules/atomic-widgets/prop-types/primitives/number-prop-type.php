<?php

namespace Elementor\Modules\AtomicWidgets\PropTypes\Primitives;

use Elementor\Modules\AtomicWidgets\PropTypes\Base\Plain_Prop_Type;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Number_Prop_Type extends Plain_Prop_Type {
	// Backward compatibility, do not change to "const". Keep name in uppercase.
	// phpcs:ignore
	static $KIND = 'number';

	private bool $is_float = false;

	public static function get_key(): string {
		return 'number';
	}

	public function float(): self {
		$this->is_float = true;

		return $this;
	}

	protected function validate_value( $value ): bool {
		return is_numeric( $value );
	}

	protected function sanitize_value( $value ) {
		return $this->is_float ? (float) $value : (int) $value;
	}
}
