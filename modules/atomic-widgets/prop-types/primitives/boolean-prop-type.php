<?php

namespace Elementor\Modules\AtomicWidgets\PropTypes\Primitives;

use Elementor\Modules\AtomicWidgets\PropTypes\Base\Plain_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Dialect\Llm\Scalar_Adapter;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Boolean_Prop_Type extends Plain_Prop_Type {
	// Backward compatibility, do not change to "const". Keep name in uppercase.
	// phpcs:ignore
	static $KIND = 'boolean';

	public static function get_key(): string {
		return 'boolean';
	}

	public static function define_default_dialects(): array {
		return [ 'llm' => Scalar_Adapter::class ];
	}

	protected function validate_value( $value ): bool {
		return is_bool( $value );
	}

	protected function sanitize_value( $value ) {
		return (bool) $value;
	}
}
