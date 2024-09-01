<?php

namespace Elementor\Modules\AtomicWidgets\Schema;

use Elementor\Modules\AtomicWidgets\Module as AtomicWidgetsModule;
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
	 * @param string $type
	 * @return $this
	 */
	public function type( string $type ): self {
		$this->type = $type;

		return $this;
	}

	/**
	 * @param array<Prop_Constraint> $constraints
	 * @return $this
	 */
	public function constraints( array $constraints = [] ): self {
		$this->constraints = $constraints;

		return $this;
	}

	public function string(): self {
		return $this->type( static::TYPE_STRING );
	}

	public function number(): self {
		return $this->type( static::TYPE_NUMBER );
	}

	public function boolean(): self {
		return $this->type( static::TYPE_BOOLEAN );
	}

	public function get_type(): ?string {
		return $this->type;
	}

	/**
	 * @return array<Prop_Constraint>
	 */
	public function get_constraints(): array {
		return $this->constraints;
	}

	public function validate( $value ): void {
		$prop_type = AtomicWidgetsModule::instance()->prop_types->get( $this->get_type() );

		if ( ! $prop_type ) {
			throw new \Exception( "Prop type `{$this->get_type()}` is not registered." );
		}

		$prop_type->validate( $value );

		$this->validate_constraints( $value );
	}

	private function validate_constraints( $value ) {
		foreach ( $this->get_constraints() as $constraint ) {
			$constraint->validate( $value );
		}
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
