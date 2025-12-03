<?php
namespace Elementor\Modules\Components\PropTypes;

use Elementor\Plugin;
use Elementor\Modules\AtomicWidgets\Elements\Atomic_Element_Base;
use Elementor\Modules\AtomicWidgets\Elements\Atomic_Widget_Base;
use Elementor\Modules\AtomicWidgets\Utils\Utils;
use Elementor\Modules\Components\Documents\Component_Overridable_Props;
use Elementor\Modules\Components\Documents\Component_Overridable_Prop;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Component_Override_Utils {
	private ?Component_Overridable_Props $component_overridable_props = null;
	public function __construct( ?Component_Overridable_Props $component_overridable_props = null ) {
		$this->component_overridable_props = $component_overridable_props;
	}

	public function validate( $value ): bool {
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

		try {
			[ 'override_key_exists' => $override_key_exists, 'prop_type' => $prop_type ] =
				$this->get_component_overridable_prop( sanitize_text_field( $override_key ) );

			if ( ! $override_key_exists ) {
				// If the override is not one of the component overridable props we'll remove it in sanitize_value method.
				// This is a valid scenario, as the user can delete overridable props from the component after the override created.
				return true;
			}

			return $prop_type->validate( $override_value );
		} catch ( \Exception $e ) {
			return false;
		}
	}

	public function sanitize( $value ) {
		if ( ! isset( $value['override_key'] ) ) {
			return null;
		}

		$sanitized_override_key = sanitize_text_field( $value['override_key'] );

		try {
			[ 'override_key_exists' => $override_key_exists, 'prop_type' => $prop_type ] =
				$this->get_component_overridable_prop( $sanitized_override_key );

			if ( ! $override_key_exists ) {
				return null;
			}

			return [
				'override_key' => sanitize_text_field( $value['override_key'] ),
				'value' => $prop_type->sanitize( $value['value'] ),
			];
		} catch ( \Exception $e ) {
			return null;
		}
	}

	private function get_component_overridable_prop( string $override_key ): array {
		$component_overridable_props = $this->component_overridable_props;

		if ( ! $component_overridable_props || ! isset( $component_overridable_props->props[ $override_key ] ) ) {
			return [
				'override_key_exists' => false,
				'prop_type' => null,
			];
		}

		/** @var Component_Overridable_Prop $overridable */
		$overridable = $component_overridable_props->props[ $override_key ];

		$el_type = $overridable->el_type;
		$widget_type = $overridable->widget_type;
		$prop_key = $overridable->prop_key;

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

		$prop_type = $props_schema[ $prop_key ];

		return [
			'override_key_exists' => true,
			'prop_type' => $prop_type,
		];
	}
}
