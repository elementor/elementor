<?php
namespace Elementor_Example_Plugin\PropTypes;

use Elementor\Modules\AtomicWidgets\PropTypes\Base\Plain_Prop_Type;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Badge_Prop_Type extends Plain_Prop_Type {

	public static function get_key(): string {
		return 'example-badge';
	}

	protected function validate_value( $value ): bool {
		return is_string( $value ) && in_array( $value, [ 'new', 'featured', 'sale' ], true );
	}

	protected function sanitize_value( $value ) {
		return sanitize_key( $value );
	}
}
