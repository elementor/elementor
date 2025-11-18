<?php

namespace Elementor\Modules\Components\PropTypes;

use Elementor\Modules\AtomicWidgets\PropTypes\Base\Object_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Primitives\Number_Prop_Type;
use Elementor\Plugin;
use Elementor\Modules\Components\Documents\Component;

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
			'overrides' => Component_Overrides_Prop_type::make()->optional()
		];
	}

	protected function validate_value( $value ): bool {
		if ( ! is_array( $value ) ) {
			return false;
		}

		$is_valid_structure = (
			isset( $value['component_id'] ) &&
			$value['component_id'] instanceof Number_Prop_Type &&
			( $value['overrides'] instanceof Component_Overrides_Prop_type || ! isset( $value['overrides'] ))
		);

		if ( ! $is_valid_structure ) {
			return false;
		}

		$is_valid_component_id = Number_Prop_Type::make()->validate( $value['component_id'] );

		if ( ! $is_valid_component_id ) {
			return false;
		}

		$is_valid_overrides = Component_Overrides_Prop_type::make()->set_component_overridable_props($this->get_component_overridable_props($value['component_id']['value']))->validate( $value['overrides'] );

		return $is_valid_overrides;
	}

	public function sanitize_value( $value ): array {
		$sanitized_component_id = Number_Prop_Type::make()->sanitize( $value['component_id'] );
		$sanitized_overrides = Component_Overrides_Prop_type::make()->set_component_overridable_props($this->get_component_overridable_props($sanitized_component_id['value']))->sanitize( $value['overrides'] );

		$sanitized = [
			'component_id' => $sanitized_component_id,
		];

		if ( $sanitized_overrides ) {
			$sanitized['overrides'] = $sanitized_overrides;
		}

		return $sanitized;
	}

	private function get_component_overridable_props( int $component_id ): array | null {
		$component = Plugin::$instance->documents->get( $component_id );

		if ( ! $component instanceof Component ) {
			return null;
		}
		
		return $component->get_overridable_props();
	}
}
