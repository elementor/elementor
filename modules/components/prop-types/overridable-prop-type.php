<?php

namespace Elementor\Modules\Components\PropTypes;

use Elementor\Modules\AtomicWidgets\PropTypes\Base\Plain_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Contracts\Prop_Type;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Overridable_Prop_Type extends Plain_Prop_Type {
	const META_KEY = 'overridable';

	/**
	 * Return a tuple that lets the developer ignore the component overridable prop type in the props schema
	 * using `Prop_Type::meta()`, e.g. `String_Prop_Type::make()->meta( Overridable_Prop_Type::ignore() )`.
	 */
	public static function ignore(): array {
		return [ static::META_KEY, false ];
	}

	public static function get_key(): string {
		return 'overridable';
	}

	protected function validate_value( $value ): bool {
		if ( ! is_array( $value ) ) {
			return false;
		}

		if ( ! array_key_exists( 'override_key', $value ) || ! is_string( $value['override_key'] ) ) {
			return false;
		}

		if ( ! array_key_exists( 'origin_value', $value ) ) {
			return false;
		}

		$origin_prop_type = $this->get_origin_prop_type();

		if ( ! $origin_prop_type ) {
			return false;
		}

		return $origin_prop_type->validate( $value['origin_value'] );
	}

	protected function sanitize_value( $value ): ?array {
		['override_key' => $override_key, 'origin_value' => $origin_value] = $value;

		$origin_prop_type = $this->get_origin_prop_type();

		if ( ! $origin_prop_type ) {
			return null;
		}

		$sanitized_override_key = sanitize_key( $override_key );
		$sanitized_origin_value = is_null( $origin_value ) ? null : $origin_prop_type->sanitize( $origin_value );

		return [
			'override_key' => $sanitized_override_key,
			'origin_value' => $sanitized_origin_value,
		];
	}

	public function set_origin_prop_type( Prop_Type $origin_prop_type ) {
		$this->settings['origin_prop_type'] = $origin_prop_type;

		return $this;
	}

	public function get_origin_prop_type() {
		return $this->settings['origin_prop_type'] ?? null;
	}
}
