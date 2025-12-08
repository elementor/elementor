<?php
namespace Elementor\Modules\Components\PropTypes;

use Elementor\Modules\Components\Documents\Component_Overridable_Props;
use Elementor\Modules\Components\Documents\Component_Overridable_Prop;
use Elementor\Modules\Components\Utils\Parsing_Utils;
use Elementor\Plugin;
use Elementor\Modules\Components\Documents\Component;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Component_Override_Parser extends Override_Parser {
	public static function get_override_type(): string {
		return 'component';
	}

	private ?Component_Overridable_Props $component_overridable_props = null;

	public static function make(): self {
		return new static();
	}

	public function validate_override( string $override_key, ?array $override_value, array $schema_source ): bool {
		if ( ! isset( $schema_source['id'] ) ) {
			return false;
		}

		$component_id = $schema_source['id'];

		$component_overridable_props = $this->get_component_overridable_props( $component_id );

		try {
			[ 'override_key_exists' => $override_key_exists, 'prop_type' => $prop_type ] =
				$this->get_component_overridable_prop( sanitize_key( $override_key ), $component_overridable_props );

			if ( ! $override_key_exists ) {
				// If the override is not one of the component overridable props we'll remove it in sanitize_value method.
				// This is a valid scenario, as the user can delete overridable props from the component after the override created.
				return true;
			}

			if ( null === $override_value ) {
				return true;
			}

			return $prop_type->validate( $override_value );
		} catch ( \Exception $e ) {
			return false;
		}
	}

	public function sanitize( $value ) {
		['override_key' => $override_key, 'override_value' => $override_value, 'schema_source' => $schema_source] = $value;

		$sanitized_override_key = sanitize_key( $override_key );
		$sanitized_schema_source = [
			'type' => sanitize_text_field( $schema_source['type'] ),
			'id' => (int) $schema_source['id'],
		];

		$component_id = $sanitized_schema_source['id'];
		$component_overridable_props = $this->get_component_overridable_props( $component_id );

		try {
			[ 'override_key_exists' => $override_key_exists, 'prop_type' => $prop_type ] =
				$this->get_component_overridable_prop( $sanitized_override_key, $component_overridable_props );

			if ( ! $override_key_exists ) {
				return null;
			}

			return [
				'override_key' => $sanitized_override_key,
				'override_value' => null === $override_value ? null : $prop_type->sanitize( $override_value ),
				'schema_source' => $sanitized_schema_source,
			];
		} catch ( \Exception $e ) {
			return null;
		}
	}

	private function get_component_overridable_prop( string $override_key, ?Component_Overridable_Props $component_overridable_props ): array {
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

		$prop_type = Parsing_Utils::get_prop_type( $el_type, $widget_type, $prop_key );

		return [
			'override_key_exists' => true,
			'prop_type' => $prop_type,
		];
	}

	private function get_component_overridable_props( int $component_id ) {
		if ( $this->component_overridable_props ) {
			return $this->component_overridable_props;
		}

		$component = Plugin::$instance->documents->get( $component_id );

		/** @var Component $component */
		if ( ! $component || $component->get_type() !== Component::TYPE ) {
			return null;
		}

		$this->component_overridable_props = $component->get_overridable_props();

		return $this->component_overridable_props;
	}
}
