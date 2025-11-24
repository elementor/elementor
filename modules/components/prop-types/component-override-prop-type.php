<?php
namespace Elementor\Modules\Components\PropTypes;

use Elementor\Modules\AtomicWidgets\PropTypes\Base\Plain_Prop_Type;
use Elementor\Plugin;
use Elementor\Modules\AtomicWidgets\Elements\Atomic_Element_Base;
use Elementor\Modules\AtomicWidgets\Elements\Atomic_Widget_Base;
use Elementor\Modules\AtomicWidgets\Utils;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Component_Override_Prop_type extends Plain_Prop_Type {
	public static function get_key(): string {
		return 'component-override';
	}

	protected function validate_value( $value ): bool {
		if ( ! is_array( $value ) ) {
			return false;
		}

		$is_valid_structure = (
			isset( $value['override_key'] ) &&
			is_string( $value['override_key'] ) &&
			isset( $value['value'] ) &&
			is_array( $value['value'] )
		);

		if ( ! $is_valid_structure ) {
			return false;
		}

		['override_key' => $override_key, 'value' => $override_value] = $value;

		[
			'override_key_exists' => $override_key_exists,
			'prop_type' => $prop_type,
		] = $this->get_component_overridable_prop( sanitize_text_field( $override_key ) );

		if ( ! $override_key_exists ) {
			// If the override is not one of the component overridable props we'll remove it in sanitize_value method.
			// This is a valid scenario, as the user can delete overridable props from the component after the override created.
			return true;
		}

		return $prop_type->validate( $override_value );
	}

	protected function sanitize_value( $value ) {
		if ( ! isset( $value['override_key'] ) ) {
			return null;
		}

		$sanitized_override_key = sanitize_text_field( $value['override_key'] );

		[
			'override_key_exists' => $override_key_exists,
			'prop_type' => $prop_type,
		] = $this->get_component_overridable_prop( $sanitized_override_key );

		if ( ! $override_key_exists ) {
			return null;
		}

		return [
			'override_key' => sanitize_text_field( $value['override_key'] ),
			'value' => $prop_type->sanitize( $value['value'] ),
		];
	}
	public function set_component_overridable_props( $component_overridable_props ) {
		$this->settings['component_overridable_props'] = $component_overridable_props;

		return $this;
	}

	private function get_component_overridable_prop( string $override_key ): array {
		$component_overridable_props = $this->settings['component_overridable_props'] ?? null;

		if ( ! $component_overridable_props || ! isset( $component_overridable_props['props'][ $override_key ] ) ) {
			return [
				'override_key_exists' => false,
				'prop_type' => null,
			];
		}

		$overridable = $component_overridable_props['props'][ $override_key ];
		[
			'elType' => $el_type,
			'widgetType' => $widget_type,
			'propKey' => $prop_key,
		] = $overridable;

		$overridable_element = Plugin::$instance->elements_manager->get_element( $el_type, $widget_type );

		if ( ! $overridable_element ) {
			throw new \Exception( esc_html( "Invalid overridable element: Element type $el_type with widget type $widget_type is not registered." ) );
		}

		$element_instance = new $overridable_element();

		/** @var Atomic_Element_Base | Atomic_Widget_Base $element_instance */
		if ( ! Utils::is_atomic( $element_instance ) ) {
			throw new \Exception( esc_html( "Invalid overridable element: Element type $el_type with widget type $widget_type is not an atomic element/widget." ) );
		}

		$props_schema = $element_instance->get_props_schema();

		if ( ! isset( $props_schema[ $prop_key ] ) ) {
			throw new \Exception( esc_html( "Prop key '$prop_key' does not exist in the schema of element '{$element_instance->get_element_type()}'." ) );
		}

		$props_type = $props_schema[ $prop_key ];

		return [
			'override_key_exists' => true,
			'prop_type' => $props_type,
		];
	}
}
