<?php

namespace Elementor\Modules\AtomicWidgets\PropTypes\Base;

use Elementor\Utils;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

abstract class Object_Prop_Type extends Prop_Type {
	/**
	 * @var array<Prop_Type>
	 */
	protected array $shape = [];

	public static function get_type(): string {
		return 'object';
	}

	public function __construct() {
		$this->shape = $this->define_shape();
	}

	public function get_shape(): array {
		return $this->shape;
	}

	public function get_shape_item( $key ): ?Prop_Type {
		return $this->shape[ $key ] ?? null;
	}

	public function generate_value( $value ) {
		$parsed_value = [];

		foreach ( $this->get_shape() as $key => $prop_type ) {
			if ( ! isset( $value[ $key ] ) ) {
				continue;
			}

			$parsed_value[ $key ] = $prop_type->generate_value( $value[ $key ] );
		}

		return [
			'$$type' => static::get_key(),
			'value' => $parsed_value,
		];
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
			...parent::jsonSerialize(),
			'shape' => $this->get_shape(),
		];
	}

	/**
	 * @return array<Prop_Type>
	 */
	abstract protected function define_shape(): array;
}
