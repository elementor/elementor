<?php

namespace Elementor\Modules\AtomicWidgets\Schema\Constraints;

use Elementor\Modules\AtomicWidgets\Schema\Prop_Constraint;
use Elementor\Utils;

class Enum extends Prop_Constraint {
	private array $allowed_values;

	public function get_type(): string {
		return 'enum';
	}

	public function get_value(): array {
		return $this->allowed_values;
	}

	public function __construct( array $allowed_values ) {
		if ( ! $this->all_are_strings( $allowed_values ) ) {
			Utils::safe_throw( 'All values in an enum must be strings.' );
		}

		$this->allowed_values = $allowed_values;
	}

	public static function make( array $allowed_values ): self {
		return new static( $allowed_values );
	}

	public function validate( $value ): void {
		$is_allowed = in_array( $value, $this->allowed_values, true );

		if ( ! $is_allowed ) {
			throw new \Exception( 'Value is not in the list of allowed values.' );
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
