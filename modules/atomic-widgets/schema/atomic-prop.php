<?php

namespace Elementor\Modules\AtomicWidgets\Schema;

use JsonSerializable;

class Atomic_Prop implements JsonSerializable {
	private $default_value = null;

	private ?string $type = null;

	/**
	 * @var array <Prop_Constraint>
	 */
	private array $constraints = [];

	public static function make(): self {
		return new self();
	}

	public function default( $default_value ): self {
		if ( $this->is_primitive() ) {
			$this->default_value = $default_value;
		} else {
			$this->default_value = [
				'$$type' => $this->get_type(),
				'value' => $default_value,
			];
		}

		return $this;
	}

	public function get_default() {
		return $this->default_value;
	}

	/**
	 * @param string $data_type
	 * @param array<Prop_Constraint> $constraints
	 *
	 * @return $this
	 */
	public function type( string $data_type, array $constraints = [] ): self {
		$this->type = $data_type;
		$this->constraints = $constraints;

		return $this;
	}

	/**
	 * @param array<Prop_Constraint> $constraints
	 */
	public function string( array $constraints = [] ): self {
		return $this->type( 'string', $constraints );
	}

	/**
	 * @param array<Prop_Constraint> $constraints
	 */
	public function number( array $constraints = [] ): self {
		return $this->type( 'number', $constraints );
	}

	/**
	 * @param array<Prop_Constraint> $constraints
	 */
	public function boolean( array $constraints = [] ): self {
		return $this->type( 'boolean', $constraints );
	}

	public function get_type(): string {
		return $this->type;
	}

	/**
	 * @return array<Prop_Constraint>
	 */
	public function get_constraints(): array {
		return $this->constraints;
	}

	// TODO: Move to a `Schema_Validator` class?
	public function validate( $value ) {
		switch ( $this->get_type() ) {
			case 'string':
				return is_string( $value );

			case 'number':
				return is_numeric( $value );

			case 'boolean':
				return is_bool( $value );

			default:
				// TODO: Use a shared `is_transformable` function.
				// TODO: Check the `$value['value']` validity against the relevant transformer.
				return $this->is_transformable_of_type( $this->get_type(), $value );
		}
	}

	private function is_transformable_of_type( string $type, $value ): bool {
		return (
			! empty( $value['$$type'] ) &&
			$value['$$type'] === $type &&
			isset( $value['value'] )
		);
	}

	private function is_primitive() {
		return in_array( $this->get_type(), [ 'string', 'number', 'boolean' ], true );
	}

	public function jsonSerialize(): array {
		return [
			'type' => $this->type,
			'constraints' => $this->constraints,
			'default' => $this->default_value,
		];
	}
}
