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
			'overrides' => Component_Overrides_Prop_type::make()->optional(),
		];
	}

	protected function validate_value( $value ): bool {
		error_log( 'validate_value: ' . print_r( $value, true ) );
		if ( ! is_array( $value ) ) {
			error_log( 'is_array: ');
			error_log( is_array( $value ) ? 'true' : 'false' );
			error_log( 'value: ');
			error_log( print_r( $value, true ) );
			return false;
		}

		$is_valid_structure = (
			isset( $value['component_id'] ) &&
			( isset( $value['overrides'] ) ? is_array( $value['overrides'] ) : true )
		);

		if ( ! $is_valid_structure ) {
			error_log( 'is_valid_structure: ');
			error_log( $is_valid_structure ? 'true' : 'false' );
			error_log( 'is_component_id_valid: ');
			error_log( $value['component_id'] instanceof Number_Prop_Type ? 'true' : 'false' );
			error_log( 'is_overrides_valid: ');
			$is_overrides_valid = isset( $value['overrides'] ) ? $value['overrides'] instanceof Component_Overrides_Prop_type : true;
			error_log( $is_overrides_valid ? 'true' : 'false' );
			return false;
		}

		$is_valid_component_id = Number_Prop_Type::make()->validate( $value['component_id'] );

		if ( ! $is_valid_component_id ) {
			error_log( 'is_valid_component_id: ' . print_r( $is_valid_component_id, true ) );
			error_log( 'value: ' . print_r( $value, true ) );
			return false;
		}

		if ( ! isset( $value['overrides'] ) ) {
			return true;
		}

		$sanitized_component_id = Number_Prop_Type::make()->sanitize( $value['component_id'] );
		$component_overridable_props = $this->get_component_overridable_props( $sanitized_component_id['value'] );

		$is_valid_overrides = Component_Overrides_Prop_type::make()
			->set_component_overridable_props( $component_overridable_props )
			->validate( $value['overrides'] );

		error_log( 'is_valid_overrides: ' . print_r( $is_valid_overrides, true ) );
		error_log( 'value: ' . print_r( $value, true ) );
		return $is_valid_overrides;
	}

	public function sanitize_value( $value ): array {
		$sanitized_component_id = Number_Prop_Type::make()->sanitize( $value['component_id'] );

		$sanitized = [
			'component_id' => $sanitized_component_id,
		];

		if ( ! isset( $value['overrides'] ) ) {
			return $sanitized;
		}

		$component_overridable_props = $this->get_component_overridable_props( $sanitized_component_id['value'] );
		$sanitized_overrides = Component_Overrides_Prop_type::make()
			->set_component_overridable_props( $component_overridable_props )
			->sanitize( $value['overrides'] );

		if ( $sanitized_overrides ) {
			$sanitized['overrides'] = $sanitized_overrides;
		}

		return $sanitized;
	}

	private function get_component_overridable_props( int $component_id ) {
		$component = Plugin::$instance->documents->get( $component_id );

		if ( ! $component instanceof Component ) {
			throw new \Exception( "Component not found: $component_id" );
		}

		return $component->get_overridable_props();
	}
}
