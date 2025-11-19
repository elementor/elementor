<?php
namespace Elementor\Modules\Components\PropTypes;

use Elementor\Modules\AtomicWidgets\PropTypes\Base\Array_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Contracts\Prop_Type;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Component_Overrides_Prop_type extends Array_Prop_Type {
	public static function get_key(): string {
		return 'component-overrides';
	}

	protected function define_item_type(): Prop_Type {
		return Component_Override_Prop_type::make();
	}

	protected function validate_value( $value ): bool {
		if ( ! is_array( $value ) ) {
			return false;
		}

		$component_overridable_props = $this->get_component_overridable_props();
		$component_override_prop_type = Component_Override_Prop_type::make()->set_component_overridable_props( $component_overridable_props );

		foreach ( $value as $override ) {
			if ( ! $component_override_prop_type->validate( $override ) ) {
				return false;
			}
		}

		return true;
	}

	public function sanitize_value( $value ) {
		$component_overridable_props = $this->get_component_overridable_props();
		$component_override_prop_type = Component_Override_Prop_type::make()->set_component_overridable_props( $component_overridable_props );

		$sanitized = [];

		foreach ( $value as $override ) {
			$sanitized_override = $component_override_prop_type->sanitize( $override );
			if ( $sanitized_override ) {
				$sanitized[] = $sanitized_override;
			}
		}

		return $sanitized;
	}

	public function set_component_overridable_props( $component_overridable_props ) {
		$this->settings['component_overridable_props'] = $component_overridable_props;

		return $this;
	}

	private function get_component_overridable_props(): array|null {
		return $this->settings['component_overridable_props'] ?? null;
	}
}
