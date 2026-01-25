<?php
namespace Elementor\Modules\Components\PropTypes;

use Elementor\Plugin;
use Elementor\Modules\Components\Components_Repository;
use Elementor\Modules\Components\Documents\Component_Overridable_Prop;
use Elementor\Modules\Components\Documents\Component_Overridable_Props;
use Elementor\Modules\Components\Utils\Parsing_Utils;
use Elementor\Modules\AtomicWidgets\PropTypes\Contracts\Prop_Type;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Component_Override_Parser extends Override_Parser {
	private static $repository;

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
			$matching_overridable_prop = $this->get_matching_component_overridable_prop( sanitize_key( $override_key ), $component_overridable_props );

			if ( ! $matching_overridable_prop ) {
				// If the override is not one of the component overridable props we'll remove it in sanitize_value method.
				// This is a valid scenario, as the user can delete overridable props from the component after the override created.
				return true;
			}

			$prop_type = $this->get_overridable_prop_type( $matching_overridable_prop );

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
			$matching_overridable_prop = $this->get_matching_component_overridable_prop( $sanitized_override_key, $component_overridable_props );

			if ( ! $matching_overridable_prop ) {
				return null;
			}

			$prop_type = $this->get_overridable_prop_type( $matching_overridable_prop );

			return [
				'override_key' => $sanitized_override_key,
				'override_value' => null === $override_value ? null : $prop_type->sanitize( $override_value ),
				'schema_source' => $sanitized_schema_source,
			];
		} catch ( \Exception $e ) {
			return null;
		}
	}


	private function get_matching_component_overridable_prop( string $override_key, ?Component_Overridable_Props $component_overridable_props ): ?Component_Overridable_Prop {
		if ( ! $component_overridable_props || ! isset( $component_overridable_props->props[ $override_key ] ) ) {
			return null;
		}

		return $component_overridable_props->props[ $override_key ];
	}

	private function get_overridable_prop_type( Component_Overridable_Prop $overridable ): ?Prop_Type {
		if ( $overridable->origin_prop_fields ) {
			['el_type' => $el_type, 'widget_type' => $widget_type, 'prop_key' => $prop_key] = $overridable->origin_prop_fields;
			return Parsing_Utils::get_prop_type( $el_type, $widget_type, $prop_key );
		}

		return Parsing_Utils::get_prop_type( $overridable->el_type, $overridable->widget_type, $overridable->prop_key );
	}

	private function get_component_overridable_props( int $component_id ) {
		if ( $this->component_overridable_props ) {
			return $this->component_overridable_props;
		}

		$component = $this->get_repository()->get( $component_id );

		if ( ! $component ) {
			return null;
		}

		$this->component_overridable_props = $component->get_overridable_props();

		return $this->component_overridable_props;
	}

	private function get_repository() {
		if ( ! self::$repository ) {
			self::$repository = new Components_Repository();
		}

		return self::$repository;
	}
}
