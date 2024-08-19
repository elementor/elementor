<?php

namespace Elementor\Modules\AtomicWidgets\Schema;

use JsonSerializable;

class Atomic_Prop implements JsonSerializable {

	const TYPE_STRING = 'string';
	const TYPE_NUMBER = 'number';
	const TYPE_BOOLEAN = 'boolean';

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
		return $this->type( static::TYPE_STRING, $constraints );
	}

	/**
	 * @param array<Prop_Constraint> $constraints
	 */
	public function number( array $constraints = [] ): self {
		return $this->type( static::TYPE_NUMBER, $constraints );
	}

	/**
	 * @param array<Prop_Constraint> $constraints
	 */
	public function boolean( array $constraints = [] ): self {
		return $this->type( static::TYPE_BOOLEAN, $constraints );
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
			case static::TYPE_STRING:
				return is_string( $value );

			case static::TYPE_NUMBER:
				return is_numeric( $value );

			case static::TYPE_BOOLEAN:
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

	private function is_primitive(): bool {
		$primitives = [
			static::TYPE_STRING,
			static::TYPE_NUMBER,
			static::TYPE_BOOLEAN,
		];

		return in_array( $this->get_type(), $primitives, true );
	}

	public function jsonSerialize(): array {
		return [
			'type' => $this->type,
			'constraints' => $this->constraints,
			'default' => $this->default_value,
		];
	}
}
