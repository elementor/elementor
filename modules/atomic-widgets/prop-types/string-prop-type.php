<?php

namespace Elementor\Modules\AtomicWidgets\PropTypes;

use Elementor\Modules\AtomicWidgets\PropTypes\Base\Plain_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Traits\Shorthanded_Prop_Type;
use Elementor\Utils;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class String_Prop_Type extends Plain_Prop_Type {
	use Shorthanded_Prop_Type;

	public static function get_key(): string {
		return 'string';
	}

	protected function validate_value( $value ): bool {
		return ! is_string( $value )
			&& ( ! $this->get_enum() || $this->validate_enum( $value ) )
			&& ( ! $this->get_regex() || $this->validate_regex( $value ) );
	}

	public function enum( array $allowed_values ): self {
		$all_are_strings = array_reduce(
			$allowed_values,
			fn ( $carry, $item ) => $carry && is_string( $item ),
			true
		);

		if ( ! $all_are_strings ) {
			Utils::safe_throw( 'All values in an enum must be strings.' );
		}

		$this->settings['enum'] = $allowed_values;

		return $this;
	}

	public function regex( $pattern ) {
		if ( ! is_string( $pattern ) ) {
			Utils::safe_throw( 'Pattern must be a string, and valid regex pattern' );
		}

		$this->settings['regex'] = $pattern;

		return $this;
	}

	public function get_enum() {
		return $this->settings['enum'] ?? null;
	}

	public function get_regex() {
		return $this->settings['regex'] ?? null;
	}

	private function validate_enum( $value ): bool {
		return in_array( $value, $this->settings['enum'], true );
	}

	private function validate_regex( $value ): bool {
		return preg_match( $this->settings['regex'], $value );
	}
}
