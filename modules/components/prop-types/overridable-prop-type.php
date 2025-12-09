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

		$required_fields = [
			'override_key' => 'is_string',
			'origin_value' => 'is_array',
		];

		$is_valid_structure = true;
		foreach ( $required_fields as $field => $validator ) {
			if ( ! array_key_exists( $field, $value ) || ! call_user_func( $validator, $value[ $field ] ) ) {
				$is_valid_structure = false;
				break;
			}
		}

		$origin_prop_type = $this->get_origin_prop_type();

		if ( ! $is_valid_structure || ! $origin_prop_type ) {
			return false;
		}

		['origin_value' => $origin_value] = $value;

		return $origin_prop_type->validate( $origin_value );
	}

	protected function sanitize_value( $value ): ?array {
		['override_key' => $override_key, 'origin_value' => $origin_value] = $value;

		$origin_prop_type = $this->get_origin_prop_type();

		if ( ! $origin_prop_type ) {
			return null;
		}

		$sanitized_override_key = sanitize_key( $override_key );
		$sanitized_origin_value = $origin_prop_type->sanitize( $origin_value );

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
