<?php

namespace Elementor\Modules\Components\PropTypes;

use Elementor\Modules\AtomicWidgets\PropTypes\Base\Object_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Primitives\Number_Prop_Type;


if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Component_Instance_Prop_Type extends Object_Prop_Type {
	public static function get_key(): string {
		return 'component-instance';
	}

	protected function define_shape(): array {
		return [
			'component_id' => Number_Prop_Type::make()->required(),
			'overrides' => Overrides_Prop_Type::make()->optional(),
		];
	}

	public function validate_value( $value ): bool {
		if ( ! parent::validate_value( $value ) ) {
			return false;
		}

		$sanitized = parent::sanitize_value( $value );

		$overrides = $sanitized['overrides']['value'] ?? [];

		foreach ( $overrides as $override ) {
			$schema_source = Overridable_Prop_Type::get_key() === $override['$$type']
				? $override['value']['origin_value']['value']['schema_source']
				: $override['value']['schema_source'];

			if ( $schema_source['id'] !== $sanitized['component_id']['value'] ) {
				return false;
			}
		}

		return true;
	}
}
