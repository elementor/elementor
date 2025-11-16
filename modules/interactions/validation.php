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
			if ( isset( $element['settings']['interactions'] ) ) {
				$element['settings']['interactions'] = $this->sanitize_interactions( $element['settings']['interactions'] );
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

		if ( ! is_array( $interactions ) || ! isset( $interactions['items'] ) ) {
			return $sanitized;
		}

		foreach ( $interactions['items'] as $interaction ) {
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

		return $sanitized;
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
