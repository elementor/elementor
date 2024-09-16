<?php

namespace Elementor\Modules\AtomicWidgets\PropTypes;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

abstract class Transformable_Prop_Type extends Prop_Type {

	public function validate( $value ): void {
		if ( ! isset( $value['$$type'] ) ) {
			throw new \Exception( 'Value must have a `$$type` key.' );
		}

		if ( ! is_string( $value['$$type'] ) ) {
			throw new \Exception( 'Key `$$type` must be a string, ' . gettype( $value['$$type'] ) . ' given.' );
		}

		if ( static::get_key() !== $value['$$type'] ) {
			throw new \Exception( '`$$type` must be `' . $this->get_key() . '`, `' . $value['$$type'] . '` given.' );
		}

		if ( ! isset( $value['value'] ) ) {
			throw new \Exception( 'Value must have a `value` key.' );
		}

		$this->validate_value( $value['value'] );
	}

	abstract protected function validate_value( $value ): void;

	public function default( $default ): self {
		$this->default = [
			'$$type' => static::get_key(),
			'value' => $default,
		];

		return $this;
	}

	public static function get_value_schema(): Prop_Type {
		return apply_filters(
			// TODO: Use dedicated filter.
			'elementor/atomic-widgets/props-schema',
			static::define_value_schema(),
		);
	}

	abstract protected static function define_value_schema(): Prop_Type;

	public function jsonSerialize(): array {
		return array_merge(
			parent::jsonSerialize(),
			[ 'value_schema' => static::get_value_schema() ],
		);
	}
}
