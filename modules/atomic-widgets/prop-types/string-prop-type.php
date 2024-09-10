<?php

namespace Elementor\Modules\AtomicWidgets\PropTypes;

use Elementor\Core\Utils\Collection;
use Elementor\Utils;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class String_Prop_Type extends Prop_Type {

	public static function get_key(): string {
		return 'string';
	}

	public function validate( $value ): void {
		if ( ! is_string( $value ) ) {
			throw new \Exception( 'Value must be a string, ' . gettype( $value ) . ' given.' );
		}

		if ( isset( $this->settings['enum'] ) ) {
			$this->validate_enum( $value );
		}
	}

	public function enum( array $allowed_values ): self {
		if ( ! $this->all_are_strings( $allowed_values ) ) {
			Utils::safe_throw( 'All values in an enum must be strings.' );
		}

		$this->settings['enum'] = $allowed_values;

		return $this;
	}

	public function get_enum() {
		return $this->settings['enum'] ?? null;
	}

	private function validate_enum( $value ): void {
		$is_allowed = in_array( $value, $this->settings['enum'], true );

		if ( ! $is_allowed ) {
			$values = Collection::make( $this->settings['enum'] )
				->map( fn ( $item ) => "`$item`" )
				->implode( ', ' );

			throw new \Exception( "`$value` is not in the list of allowed values ($values)." );
		}
	}

	private function all_are_strings( array $allowed_values ): bool {
		return array_reduce(
			$allowed_values,
			fn ( $carry, $item ) => $carry && is_string( $item ),
			true
		);
	}
}
