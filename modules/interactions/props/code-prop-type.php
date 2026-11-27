<?php

namespace Elementor\Modules\Interactions\Props;

use Elementor\Modules\AtomicWidgets\PropTypes\Base\Plain_Prop_Type;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Code_Prop_Type extends Plain_Prop_Type {
	const MAX_LENGTH = 20000;

	public static function get_key(): string {
		return 'code';
	}

	protected function validate_value( $value ): bool {
		return is_string( $value ) && '' !== trim( $value ) && strlen( $value ) <= self::MAX_LENGTH;
	}

	protected function sanitize_value( $value ) {
		return (string) $value;
	}

	public function to_json_schema(): array {
		return $this->wrap_json_schema( [
			'type' => 'string',
			'maxLength' => self::MAX_LENGTH,
		] );
	}
}
