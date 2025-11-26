<?php

namespace Elementor\Modules\Interactions;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Prop_Type_Adapter {

	public function prop_type_to_interaction( $data ) {
		if ( isset( $data['elements'] ) && is_array( $data['elements'] ) ) {
			$data['elements'] = $this->process_elements_from_prop_type( $data['elements'] );
		}

		return $data;
	}

	private function process_elements_from_prop_type( $elements ) {
		if ( ! is_array( $elements ) ) {
			return $elements;
		}

		foreach ( $elements as &$element ) {
			if ( isset( $element['interactions'] ) ) {
				$element['interactions'] = $this->transform_interactions_from_prop_type( $element['interactions'] );
			}

			if ( isset( $element['elements'] ) && is_array( $element['elements'] ) ) {
				$element['elements'] = $this->process_elements_from_prop_type( $element['elements'] );
			}
		}

		return $elements;
	}

	private function transform_interactions_from_prop_type( $interactions ) {
		$decoded_interactions = $this->decode_interactions( $interactions );

		if ( empty( $decoded_interactions['items'] ) ) {
			return $interactions;
		}

		$legacy_items = [];

		foreach ( $decoded_interactions['items'] as $item ) {
			if ( $this->is_already_prop_type_format( $item ) ) {
				$legacy_item = $this->convert_prop_type_to_legacy_item( $item );
				if ( $legacy_item ) {
					$legacy_items[] = $legacy_item;
				}
			} else {
				$legacy_items[] = $item;
			}
		}

		return wp_json_encode( [
			'version' => 1,
			'items' => $legacy_items,
		] );
	}

	private function convert_prop_type_to_legacy_item( $item ) {
		$item_value = $this->get_prop_value( $item, null );

		if ( ! is_array( $item_value ) ) {
			return null;
		}

		$interaction_id = $this->extract_value( $item_value, 'interaction_id' );
		$trigger = $this->extract_value( $item_value, 'trigger' );
		
		$animation = $this->extract_value( $item_value, 'animation' );
		if ( ! is_array( $animation ) ) {
			return null;
		}

		$effect = $this->extract_value( $animation, 'effect' );
		$type = $this->extract_value( $animation, 'type' );
		$direction = $this->extract_value( $animation, 'direction' );
		
		$timing_config = $this->extract_value( $animation, 'timing_config' );
		$duration = 300;
		$delay = 0;
		
		if ( is_array( $timing_config ) ) {
			$duration = $this->extract_value( $timing_config, 'duration', 300 );
			$delay = $this->extract_value( $timing_config, 'delay', 0 );
		}

		$animation_id = $this->build_animation_id( $trigger, $effect, $type, $direction, $duration, $delay );

		return [
			'interaction_id' => $interaction_id,
			'animation' => [
				'animation_id' => $animation_id,
				'animation_type' => 'full-preset',
			],
		];
	}

	private function build_animation_id( $trigger, $effect, $type, $direction, $duration, $delay ) {
		return implode( '-', [ $trigger, $effect, $type, $direction, $duration, $delay ] );
	}

	private function is_already_prop_type_format( $item ) {
		return isset( $item['$$type'] ) && $item['$$type'] === 'interaction-item';
	}

	private function decode_interactions( $interactions ) {
		if ( is_array( $interactions ) ) {
			return $interactions;
		}

		if ( is_string( $interactions ) ) {
			$decoded = json_decode( $interactions, true );
			if ( json_last_error() === JSON_ERROR_NONE && is_array( $decoded ) ) {
				return $decoded;
			}
		}

		return [
			'items' => [],
			'version' => 1,
		];
	}

	private function get_prop_value( $data, $key ) {
		if ( $key === null ) {
			if ( is_array( $data ) && isset( $data['$$type'] ) && isset( $data['value'] ) ) {
				return $data['value'];
			}
			return $data;
		}

		if ( ! is_array( $data ) || ! isset( $data[ $key ] ) ) {
			return null;
		}

		$value = $data[ $key ];

		if ( is_array( $value ) && isset( $value['$$type'] ) && isset( $value['value'] ) ) {
			return $value['value'];
		}

		return $value;
	}

	private function extract_value( $data, $key, $default = '' ) {
		if ( ! is_array( $data ) || ! isset( $data[ $key ] ) ) {
			return $default;
		}

		$value = $data[ $key ];

		if ( is_array( $value ) && isset( $value['$$type'] ) && isset( $value['value'] ) ) {
			return $value['value'];
		}

		return $value !== null ? $value : $default;
	}
}