<?php

namespace Elementor\Modules\Interactions\Cache;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Elements_Interactions {
	private $map;

	public function __construct() {
		$this->map = [];
	}

	public function all() {
		return $this->map;
	}

	public function parse_from( array $payload ) {
		if ( ! isset( $payload['elements'] ) || ! is_array( $payload['elements'] ) ) {
			return;
		}

		$elements = $payload['elements'];

		if ( empty( $elements ) ) {
			return;
		}

		foreach ( $elements as $element ) {
			$element_id = $this->extract_element_id( $element );
			$interactions = $this->extract_interactions( $element );

			if ( $element_id && $interactions ) {
				$this->map[ $element_id ] = $interactions;
			}

			$this->parse_from( $element );
		}
	}

	private function extract_element_id( array $element ) {
		if ( ! isset( $element['id'] ) || empty( $element['id'] ) ) {
			return null;
		}
		return $element['id'];
	}

	private function extract_interactions( $element ) {
		if ( ! isset( $element['interactions'] ) ) {
			return null;
		}

		$interactions_value = $this->decode_interactions( $element['interactions'] );

		if ( ! is_array( $interactions_value ) ) {
			return null;
		}

		if ( ! isset( $interactions_value['items'] ) || ! is_array( $interactions_value['items'] ) ) {
			return null;
		}

		return $interactions_value['items'];
	}

	private function decode_interactions( $source ) {
		if ( is_string( $source ) ) {
			$decoded = json_decode( $source, true );

			if ( JSON_ERROR_NONE === json_last_error() && is_array( $decoded ) ) {
				return $decoded;
			}
		}

		return $source;
	}
}
