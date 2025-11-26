<?php

namespace Elementor\Modules\Interactions;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Validation {
	private $valid_triggers = [ 'load', 'scrollIn', 'scrollOut' ];
	private $valid_effects = [ 'fade', 'slide', 'scale' ];
	private $valid_types = [ 'in', 'out' ];
	private $valid_directions = [ '', 'left', 'right', 'top', 'bottom' ];
	private $valid_durations = [ 0, 100, 200, 300, 400, 500, 750, 1000, 1250, 1500 ];
	private $valid_delays = [ 0, 100, 200, 300, 400, 500, 750, 1000, 1250, 1500 ];
	
	private $elements_to_interactions_counter = [];
	private $max_number_of_interactions = 5;
	private $interaction_id_counter = 0;

	public function __construct( Presets $presets ) {
		// Presets no longer needed with new structure validation
	}

	public function sanitize( $document ) {
		return $this->sanitize_document_data( $document );
	}

	public function validate() {
		foreach ( $this->elements_to_interactions_counter as $element_id => $number_of_interactions ) {
			if ( $number_of_interactions > $this->max_number_of_interactions ) {
				throw new \Exception(
					sprintf(
						// translators: %1 is the element ID and %2 is the maximum number of interactions
						esc_html__( 'Element %1$s has more than %2$d interactions', 'elementor' ),
						esc_html( $element_id ),
						esc_html( $this->max_number_of_interactions )
					)
				);
			}
		}

		return true;
	}

	private function sanitize_document_data( $data ) {
		if ( isset( $data['elements'] ) && is_array( $data['elements'] ) ) {
			$data['elements'] = $this->sanitize_elements_interactions( $data['elements'] );
		}

		return $data;
	}

	private function sanitize_elements_interactions( $elements ) {
		if ( ! is_array( $elements ) ) {
			return $elements;
		}

		foreach ( $elements as &$element ) {
			if ( isset( $element['interactions'] ) ) {
				$element['interactions'] = $this->sanitize_interactions( $element['interactions'], $element['id'] );
			}

			if ( isset( $element['elements'] ) && is_array( $element['elements'] ) ) {
				$element['elements'] = $this->sanitize_elements_interactions( $element['elements'] );
			}
		}

		return $elements;
	}

	private function decode_interactions( $interactions ) {
		if ( is_array( $interactions ) ) {
			return isset( $interactions['items'] ) ? $interactions['items'] : [];
		}

		if ( is_string( $interactions ) ) {
			$decoded = json_decode( $interactions, true );
			if ( json_last_error() === JSON_ERROR_NONE && is_array( $decoded ) ) {
				return isset( $decoded['items'] ) ? $decoded['items'] : [];
			}
		}

		return [];
	}

	private function increment_interactions_counter_for( $element_id ) {
		if ( ! array_key_exists( $element_id, $this->elements_to_interactions_counter ) ) {
			$this->elements_to_interactions_counter[ $element_id ] = 0;
		}

		++$this->elements_to_interactions_counter[ $element_id ];
		return $this;
	}

	private function sanitize_interactions( $interactions, $element_id ) {
		$sanitized = [
			'items' => [],
			'version' => 1,
		];

		$list_of_interactions = $this->decode_interactions( $interactions );

		foreach ( $list_of_interactions as $interaction ) {
			$sanitized_interaction = $this->sanitize_interaction_item( $interaction );
			
			if ( $sanitized_interaction !== null ) {
				$sanitized['items'][] = $sanitized_interaction;
				$this->increment_interactions_counter_for( $element_id );
			}
		}

		if ( empty( $sanitized['items'] ) ) {
			return [];
		}

		return $sanitized;
	}

	private function sanitize_interaction_item( $interaction ) {
		if ( ! is_array( $interaction ) ) {
			return null;
		}

		// Unwrap if wrapped with $$type: 'interaction-item'
		$item_value = $interaction;
		if ( isset( $interaction['$$type'] ) && $interaction['$$type'] === 'interaction-item' && isset( $interaction['value'] ) ) {
			$item_value = $interaction['value'];
		}

		// Extract and validate values
		$interaction_id = $this->get_prop_value( $item_value, 'interaction_id' );
		$trigger = $this->get_prop_value( $item_value, 'trigger' );
		$animation = $this->get_prop_value( $item_value, 'animation' );

		// Generate real ID if missing or temporary
		if ( empty( $interaction_id ) || $this->is_temp_id( $interaction_id ) ) {
			$interaction_id = $this->generate_interaction_id();
		}

		if ( empty( $trigger ) || empty( $animation ) ) {
			return null;
		}

		$effect = $this->get_prop_value( $animation, 'effect' );
		$type = $this->get_prop_value( $animation, 'type' );
		$direction = $this->get_prop_value( $animation, 'direction' );
		$timing_config = $this->get_prop_value( $animation, 'timing_config' );

		// Validate required fields
		if ( ! $this->is_valid_trigger( $trigger ) || ! $this->is_valid_effect( $effect ) || ! $this->is_valid_type( $type ) ) {
			return null;
		}

		// Validate optional fields
		if ( ! empty( $direction ) && ! $this->is_valid_direction( $direction ) ) {
			$direction = '';
		}

		// Extract and validate timing
		$duration = 300;
		$delay = 0;
		if ( is_array( $timing_config ) ) {
			$duration = $this->get_prop_value( $timing_config, 'duration', 300 );
			$delay = $this->get_prop_value( $timing_config, 'delay', 0 );
		}

		if ( ! $this->is_valid_duration( $duration ) ) {
			$duration = 300;
		}
		if ( ! $this->is_valid_delay( $delay ) ) {
			$delay = 0;
		}

		// Build sanitized item value
		$sanitized_value = [
			'interaction_id' => $this->create_prop_value( 'string', $interaction_id ),
			'trigger' => $this->create_prop_value( 'string', $trigger ),
			'animation' => $this->create_prop_value( 'animation-preset-props', [
				'effect' => $this->create_prop_value( 'string', $effect ),
				'type' => $this->create_prop_value( 'string', $type ),
				'direction' => $this->create_prop_value( 'string', $direction ),
				'timing_config' => $this->create_prop_value( 'timing-config', [
					'duration' => $this->create_prop_value( 'number', (int) $duration ),
					'delay' => $this->create_prop_value( 'number', (int) $delay ),
				] ),
			] ),
		];

		// Wrap with $$type: 'interaction-item'
		return $this->create_prop_value( 'interaction-item', $sanitized_value );
	}

	private function generate_interaction_id() {
		// Generate unique ID for interaction
		return 'interaction_' . time() . '_' . ++$this->interaction_id_counter;
	}

	private function get_prop_value( $data, $key, $default = '' ) {
		if ( ! is_array( $data ) || ! isset( $data[ $key ] ) ) {
			return $default;
		}

		$value = $data[ $key ];

		// Handle TransformablePropValue structure: { $$type: 'string', value: 'actual-value' }
		if ( is_array( $value ) && isset( $value['$$type'] ) && isset( $value['value'] ) ) {
			return $value['value'];
		}

		return $value !== null ? $value : $default;
	}

	private function create_prop_value( $type, $value ) {
		return [
			'$$type' => $type,
			'value' => $value,
		];
	}

	private function is_temp_id( $id ) {
		return is_string( $id ) && strpos( $id, 'temp-' ) === 0;
	}

	private function is_valid_trigger( $trigger ) {
		return in_array( $trigger, $this->valid_triggers, true );
	}

	private function is_valid_effect( $effect ) {
		return in_array( $effect, $this->valid_effects, true );
	}

	private function is_valid_type( $type ) {
		return in_array( $type, $this->valid_types, true );
	}

	private function is_valid_direction( $direction ) {
		return in_array( $direction, $this->valid_directions, true );
	}

	private function is_valid_duration( $duration ) {
		return is_numeric( $duration ) && in_array( (int) $duration, $this->valid_durations, true );
	}

	private function is_valid_delay( $delay ) {
		return is_numeric( $delay ) && in_array( (int) $delay, $this->valid_delays, true );
	}
}