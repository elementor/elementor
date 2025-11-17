<?php

namespace Elementor\Modules\Interactions;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Validation {
	private $valid_ids = [];

	public function __construct( Presets $presets ) {
		$this->valid_ids = array_column( $presets->list(), 'value' );
	}

	public function sanitize( $document ) {
		return $this->sanitize_document_data( $document );
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
				$element['interactions'] = $this->sanitize_interactions( $element['interactions'] );
			}

			if ( isset( $element['elements'] ) && is_array( $element['elements'] ) ) {
				$element['elements'] = $this->sanitize_elements_interactions( $element['elements'] );
			}
		}

		return $elements;
	}

	private function sanitize_interactions( $interactions ) {
		$sanitized = [
			'items' => [],
			'version' => 1,
		];

		$list_of_interactions = [];

		if ( is_array( $interactions ) ) {
			$list_of_interactions = isset( $interactions['items'] ) ? $interactions['items'] : [];
		} elseif ( is_string( $interactions ) ) {
			$decoded = json_decode( $interactions, true );
			if ( json_last_error() === JSON_ERROR_NONE && is_array( $decoded ) ) {
				$list_of_interactions = isset( $decoded['items'] ) ? $decoded['items'] : [];
			}
		}

		foreach ( $list_of_interactions as $interaction ) {
			$animation_id = null;

			if ( is_string( $interaction ) ) {
				$animation_id = $interaction;
			} elseif ( is_array( $interaction ) && isset( $interaction['animation']['animation_id'] ) ) {
				$animation_id = $interaction['animation']['animation_id'];
			}

			if ( $animation_id && $this->is_valid_animation_id( $animation_id ) ) {
				$sanitized['items'][] = $interaction;
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
