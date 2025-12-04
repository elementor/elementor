<?php

namespace Elementor\Modules\Interactions;

use Elementor\Modules\AtomicWidgets\Utils\Utils;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Parser {
	protected $post_id;
	protected $ids_lookup = [];

	public function __construct( $post_id ) {
		$this->post_id = $post_id;
	}

	public function assign_interaction_ids( $data ) {
		if ( isset( $data['elements'] ) && is_array( $data['elements'] ) ) {
			$data['elements'] = $this->process_interactions_for( $data['elements'] );
		}

		return $data;
	}

	private function process_interactions_for( $elements ) {
		if ( ! is_array( $elements ) ) {
			return $elements;
		}

		foreach ( $elements as &$element ) {
			if ( isset( $element['interactions'] ) ) {
				$element['interactions'] = $this->maybe_assign_interaction_ids( $element['interactions'], $element['id'] );
			}

			if ( isset( $element['elements'] ) && is_array( $element['elements'] ) ) {
				$element['elements'] = $this->process_interactions_for( $element['elements'] );
			}
		}

		return $elements;
	}

	private function maybe_assign_interaction_ids( $interactions_json, $element_id ) {
		$interactions = $this->decode_interactions( $interactions_json );

		if ( ! isset( $interactions['items'] ) ) {
			return [];
		}

		foreach ( $interactions['items'] as &$interaction ) {
			if ( array_key_exists( 'interaction_id', $interaction ) ) {
				$this->ids_lookup[] = $interaction['interaction_id'];
			} else {
				$interaction = array_merge( [
					'interaction_id' => $this->get_next_interaction_id( $element_id ),
				], $interaction );
			}
		}

		return wp_json_encode( $interactions );
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

	protected function get_next_interaction_id( $prefix ) {
		$next_id = Utils::generate_id( "{$this->post_id}-{$prefix}-", $this->ids_lookup );
		$this->ids_lookup[] = $next_id;
		return $next_id;
	}
}
