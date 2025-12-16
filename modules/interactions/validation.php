<?php

namespace Elementor\Modules\Interactions;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Validation {
	private $valid_ids = [];
	private $elements_to_interactions_counter = [];
	private $max_number_of_interactions = 5;

	public function __construct( Presets $presets ) {
		$this->valid_ids = array_column( $presets->list(), 'value' );
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
			$animation_id = null;

			if ( is_string( $interaction ) ) {
				$animation_id = $interaction;
			} elseif ( is_array( $interaction ) && isset( $interaction['animation']['animation_id'] ) ) {
				$animation_id = $interaction['animation']['animation_id'];
			}

			if ( $animation_id && $this->is_valid_animation_id( $animation_id ) ) {
				$sanitized['items'][] = $interaction;
				$this->increment_interactions_counter_for( $element_id );
			}
		}

		if ( empty( $sanitized['items'] ) ) {
			return [];
		}

		return wp_json_encode( $sanitized );
	}

	private function is_valid_animation_id( $animation_id ) {
		if ( ! is_string( $animation_id ) || empty( $animation_id ) ) {
			return false;
		}

		$sanitized_id = sanitize_text_field( $animation_id );

		if ( $sanitized_id !== $animation_id ) {
			return false;
		}

		return in_array( $animation_id, $this->valid_ids, true );
	}
}
