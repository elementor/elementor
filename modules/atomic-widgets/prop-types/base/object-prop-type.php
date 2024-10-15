<?php

namespace Elementor\Modules\AtomicWidgets\PropTypes\Base;

use Elementor\Modules\AtomicWidgets\PropTypes\Concerns;
use Elementor\Modules\AtomicWidgets\PropTypes\Contracts\Persistable_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Contracts\Prop_Type;
use Elementor\Utils;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

abstract class Object_Prop_Type implements Persistable_Prop_Type {
	const TYPE = 'object';

	use Concerns\Has_Meta,
		Concerns\Has_Settings,
		Concerns\Has_Default,
		Concerns\Has_Transformable_Validation,
		Concerns\Has_Required_Validation;

	/**
	 * @var array<Prop_Type>
	 */
	protected array $shape;

	public function __construct() {
		$this->shape = $this->define_shape();
	}

	public static function make(): self {
		return new static();
	}

	public function set_shape( array $shape ): self {
		$this->shape = $shape;

		return $this;
	}

	public function get_shape(): array {
		return $this->shape;
	}

	public function get_shape_item( $key ): ?Prop_Type {
		return $this->shape[ $key ] ?? null;
	}

	public function validate( $value ): bool {
		if ( is_null( $value ) ) {
			return ! $this->is_required();
		}

		return $this->validate_transformable( $value );
	}

	protected function validate_value( $value ): bool {
		if ( ! is_array( $value ) ) {
			return false;
		}

		foreach ( $this->get_shape() as $key => $prop_type ) {
			if ( ! ( $prop_type instanceof Prop_Type ) ) {
				Utils::safe_throw( "Object prop type must have a prop type for key: $key" );
			}

			if ( ! $prop_type->validate( $value[ $key ] ?? null ) ) {
				return false;
			}
		}

		return true;
	}

	public function jsonSerialize(): array {
		return [
			'type' => static::TYPE,
			'key' => static::get_key(),
			'default' => $this->get_default(),
			'meta' => $this->get_meta(),
			'settings' => $this->get_settings(),
			'shape' => $this->get_shape(),
		];
	}

	/**
	 * @return array<Prop_Type>
	 */
	abstract protected function define_shape(): array;
}
