<?php

namespace Elementor\Modules\Components\PropTypes;

use Elementor\Modules\AtomicWidgets\PropTypes\Base\Plain_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Contracts\Prop_Type;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Component_Overridable_Prop_Type extends Plain_Prop_Type {
	public static function get_key(): string {
		return 'component-overridable';
	}

	protected function validate_value( $value ): bool {
		if ( ! is_array( $value ) ) {
			return false;
		}

		$is_valid_structure = (
			isset( $value['override_key'] ) &&
			is_string( $value['override_key'] ) &&
			isset( $value['default_value'] ) &&
			is_array( $value['default_value'] )
		);

		$origin_prop_type = $this->get_origin_prop_type();

		if ( ! $is_valid_structure || ! $origin_prop_type ) {
			return false;
		}

		['default_value' => $default_value] = $value;

		return $origin_prop_type->validate( $default_value );
	}

	protected function sanitize_value( $value ): array {
		['override_key' => $override_key, 'default_value' => $default_value] = $value;

		$origin_prop_type = $this->get_origin_prop_type();

		$sanitized_override_key = sanitize_text_field( $override_key );
		$sanitized_default_value = $origin_prop_type->sanitize( $default_value );

		return [
			'override_key' => $sanitized_override_key,
			'default_value' => $sanitized_default_value,
		];
	}

	public function set_origin_prop_type( Prop_Type $origin_prop_type ) {
		$this->settings['origin_prop_type'] = $origin_prop_type;

		return $this;
	}

	private function get_origin_prop_type(): Prop_Type|null {
		return $this->settings['origin_prop_type'] ?? null;
	}
}
