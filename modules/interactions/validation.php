<?php

namespace Elementor\Modules\Interactions;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Validation {
	private $elements_to_interactions_counter = [];
	private $max_number_of_interactions = 5;

	private const VALID_TRIGGERS = [ 'load', 'scrollIn', 'scrollOut', 'scrollOn' ];
	private const VALID_EFFECTS = [ 'fade', 'slide', 'scale' ];
	private const VALID_TYPES = [ 'in', 'out' ];
	private const VALID_DIRECTIONS = [ '', 'left', 'right', 'top', 'bottom' ];

	public function sanitize( $document ) {
		return $this->sanitize_document_data( $document );
	}

	public function validate() {
		foreach ( $this->elements_to_interactions_counter as $element_id => $number_of_interactions ) {
			if ( $number_of_interactions > $this->max_number_of_interactions ) {
				throw new \Exception(
					sprintf(
						// translators: %1$s: element ID, %2$d: maximum number of interactions allowed.
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
			if ( $this->is_valid_interaction_item( $interaction ) ) {
				$sanitized['items'][] = $interaction;
				$this->increment_interactions_counter_for( $element_id );
			}
		}

		if ( empty( $sanitized['items'] ) ) {
			return [];
		}

		return wp_json_encode( $sanitized );
	}

	private function is_valid_interaction_item( $item ) {
		if ( ! is_array( $item ) ) {
			return false;
		}

		// Validate PropType format: { $$type: 'interaction-item', value: { ... } }
		if ( ! isset( $item['$$type'] ) || 'interaction-item' !== $item['$$type'] ) {
			return false;
		}

		if ( ! isset( $item['value'] ) || ! is_array( $item['value'] ) ) {
			return false;
		}

		$value = $item['value'];

		// Validate required fields exist
		if ( isset( $value['interaction_id'] ) && ! $this->is_valid_string_prop( $value, 'interaction_id' ) ) {
			return false;
		}

		if ( ! $this->is_valid_string_prop( $value, 'trigger', self::VALID_TRIGGERS ) ) {
			return false;
		}

		if ( ! $this->is_valid_animation_prop( $value ) ) {
			return false;
		}

		return true;
	}

	private function is_valid_string_prop( $data, $key, $allowed_values = null ) {
		if ( ! isset( $data[ $key ] ) || ! is_array( $data[ $key ] ) ) {
			return false;
		}

		$prop = $data[ $key ];

		if ( ! isset( $prop['$$type'] ) || 'string' !== $prop['$$type'] ) {
			return false;
		}

		if ( ! isset( $prop['value'] ) || ! is_string( $prop['value'] ) ) {
			return false;
		}

		if ( null !== $allowed_values && ! in_array( $prop['value'], $allowed_values, true ) ) {
			return false;
		}

		return true;
	}

	private function is_valid_boolean_prop( $data, $key ) {
		if ( ! isset( $data[ $key ] ) || ! is_array( $data[ $key ] ) ) {
			return false;
		}

		$prop = $data[ $key ];

		if ( ! isset( $prop['$$type'] ) || 'boolean' !== $prop['$$type'] ) {
			return false;
		}

		if ( ! isset( $prop['value'] ) || ! is_bool( $prop['value'] ) ) {
			return false;
		}

		return true;
	}

	private function is_valid_number_prop( $data, $key ) {
		if ( ! isset( $data[ $key ] ) || ! is_array( $data[ $key ] ) ) {
			return false;
		}

		$prop = $data[ $key ];

		if ( ! isset( $prop['$$type'] ) || 'number' !== $prop['$$type'] ) {
			return false;
		}

		if ( ! isset( $prop['value'] ) || ! is_numeric( $prop['value'] ) ) {
			return false;
		}

		return true;
	}

	private function is_valid_number_prop_in_range( $data, $key, $min = null, $max = null ) {
		if ( ! $this->is_valid_number_prop( $data, $key ) ) {
			return false;
		}

		$value = (float) $data[ $key ]['value'];

		if ( null !== $min && $value < $min ) {
			return false;
		}

		if ( null !== $max && $value > $max ) {
			return false;
		}

		return true;
	}

	private function is_valid_config_prop( $data ) {
		if ( ! isset( $data['config'] ) || ! is_array( $data['config'] ) ) {
			return false;
		}

		$config = $data['config'];

		if ( ! isset( $config['$$type'] ) || 'config' !== $config['$$type'] ) {
			return false;
		}

		if ( ! isset( $config['value'] ) || ! is_array( $config['value'] ) ) {
			return false;
		}

		$config_value = $config['value'];

		if ( isset( $config_value['replay'] ) && ! $this->is_valid_boolean_prop( $config_value, 'replay' ) ) {
			return false;
		}

		if ( isset( $config_value['relativeTo'] ) && ! $this->is_valid_string_prop( $config_value, 'relativeTo' ) ) {
			return false;
		}

		if ( isset( $config_value['offsetTop'] ) && ! $this->is_valid_number_prop_in_range( $config_value, 'offsetTop', 0, 100 ) ) {
			return false;
		}

		if ( isset( $config_value['offsetBottom'] ) && ! $this->is_valid_number_prop_in_range( $config_value, 'offsetBottom', 0, 100 ) ) {
			return false;
		}

		return true;
	}

	private function is_valid_animation_prop( $data ) {
		if ( ! isset( $data['animation'] ) || ! is_array( $data['animation'] ) ) {
			return false;
		}

		$animation = $data['animation'];

		if ( ! isset( $animation['$$type'] ) || 'animation-preset-props' !== $animation['$$type'] ) {
			return false;
		}

		if ( ! isset( $animation['value'] ) || ! is_array( $animation['value'] ) ) {
			return false;
		}

		$animation_value = $animation['value'];

		// Validate effect
		if ( ! $this->is_valid_string_prop( $animation_value, 'effect', self::VALID_EFFECTS ) ) {
			return false;
		}

		// Validate type
		if ( ! $this->is_valid_string_prop( $animation_value, 'type', self::VALID_TYPES ) ) {
			return false;
		}

		// Validate direction (can be empty string)
		if ( ! $this->is_valid_string_prop( $animation_value, 'direction', self::VALID_DIRECTIONS ) ) {
			return false;
		}

		// Validate timing_config
		if ( ! $this->is_valid_timing_config( $animation_value ) ) {
			return false;
		}

		if ( isset( $animation_value['config'] ) && ! $this->is_valid_config_prop( $animation_value ) ) {
			return false;
		}

		return true;
	}

	private function is_valid_timing_config( $data ) {
		if ( ! isset( $data['timing_config'] ) || ! is_array( $data['timing_config'] ) ) {
			return false;
		}

		$timing = $data['timing_config'];

		if ( ! isset( $timing['$$type'] ) || 'timing-config' !== $timing['$$type'] ) {
			return false;
		}

		if ( ! isset( $timing['value'] ) || ! is_array( $timing['value'] ) ) {
			return false;
		}

		$timing_value = $timing['value'];

		// Validate duration
		if ( ! $this->is_valid_number_prop( $timing_value, 'duration' ) ) {
			return false;
		}

		// Validate delay
		if ( ! $this->is_valid_number_prop( $timing_value, 'delay' ) ) {
			return false;
		}

		return true;
	}
}
