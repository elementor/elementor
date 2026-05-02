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

		foreach ( $overrides as $item ) {
			$component_id = null;

			switch ( $item['$$type'] ) {
				case Override_Prop_Type::get_key():
					$component_id = $item['value']['schema_source']['id'];
					break;
				case Overridable_Prop_Type::get_key():
					$override = $item['value']['origin_value'];
					$component_id = $override['value']['schema_source']['id'];
					break;
			}

			if ( $component_id !== $sanitized['component_id']['value'] ) {
				return false;
			}
		}

		return true;
	}
}
