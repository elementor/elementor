<?php

namespace Elementor\Modules\AtomicWidgets\ImportExport\Modifiers;

use Elementor\Modules\AtomicWidgets\Utils\Utils;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Interactions_Ids_Modifier {

	public static function make() {
		return new self();
	}

	public function run( array $element ) {
		if ( empty( $element['id'] ) || ! isset( $element['interactions'] ) ) {
			return $element;
		}

		$interactions = $element['interactions'];
		if ( is_string( $interactions ) ) {
			$decoded = json_decode( $interactions, true );
			if ( json_last_error() !== JSON_ERROR_NONE || ! is_array( $decoded ) ) {
				return $element;
			}
			$interactions = $decoded;
		}

		if ( empty( $interactions['items'] ) || ! is_array( $interactions['items'] ) ) {
			return $element;
		}

		$existing_ids = [];
		$prefix = "e-{$element['id']}-";

		foreach ( $interactions['items'] as $index => $item ) {
			if ( ! is_array( $item ) || ( $item['$$type'] ?? '' ) !== 'interaction-item' || ! isset( $item['value'] ) || ! is_array( $item['value'] ) ) {
				continue;
			}

			$new_id = Utils::generate_id( $prefix, $existing_ids );
			$existing_ids[] = $new_id;

			$interactions['items'][ $index ]['value']['interaction_id'] = [
				'$$type' => 'string',
				'value' => $new_id,
			];
		}

		$element['interactions'] = $interactions;

		return $element;
	}
}
