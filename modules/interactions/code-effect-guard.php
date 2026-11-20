<?php

namespace Elementor\Modules\Interactions;

use Elementor\Modules\Interactions\Validators\Code_Effect_Value;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

/**
 * Code effects run as JavaScript for every visitor, so only users with `unfiltered_html` may author them.
 * For everyone else the guard keeps the previously saved code (matched by interaction id) and accepts only
 * param value changes, so a save by such a user never drops or alters trusted code.
 */
class Code_Effect_Guard {
	private array $stored_code_effects;

	private int $stripped_count = 0;

	public function __construct( array $stored_elements ) {
		$this->stored_code_effects = $this->collect_code_effects( $stored_elements );
	}

	public function protect( array $data ): array {
		if ( isset( $data['elements'] ) && is_array( $data['elements'] ) ) {
			$data['elements'] = $this->protect_elements( $data['elements'] );
		}

		return $data;
	}

	public function get_stripped_count(): int {
		return $this->stripped_count;
	}

	private function protect_elements( array $elements ): array {
		foreach ( $elements as &$element ) {
			if ( ! is_array( $element ) ) {
				continue;
			}

			if ( isset( $element['interactions'] ) ) {
				$element['interactions'] = $this->protect_interactions( $element['interactions'] );
			}

			if ( isset( $element['elements'] ) && is_array( $element['elements'] ) ) {
				$element['elements'] = $this->protect_elements( $element['elements'] );
			}
		}

		return $elements;
	}

	private function protect_interactions( $interactions ) {
		$decoded = $this->decode_interactions( $interactions );

		if ( null === $decoded || ! isset( $decoded['items'] ) || ! is_array( $decoded['items'] ) ) {
			return $interactions;
		}

		$items = [];

		foreach ( $decoded['items'] as $item ) {
			$protected_item = $this->protect_item( $item );

			if ( null !== $protected_item ) {
				$items[] = $protected_item;
			}
		}

		$decoded['items'] = $items;

		return $decoded;
	}

	private function protect_item( $item ) {
		$animation_value = $item['value']['animation']['value'] ?? null;

		if ( ! is_array( $animation_value ) ) {
			return $item;
		}

		if ( ! Code_Effect_Value::is_code_effect( $animation_value ) ) {
			unset( $item['value']['animation']['value']['code_effect'] );

			return $item;
		}

		$interaction_id = $item['value']['interaction_id']['value'] ?? null;

		if ( ! is_string( $interaction_id ) || ! isset( $this->stored_code_effects[ $interaction_id ] ) ) {
			++$this->stripped_count;

			return null;
		}

		$item['value']['animation']['value']['code_effect'] = $this->merge_param_values(
			$this->stored_code_effects[ $interaction_id ],
			$animation_value['code_effect'] ?? []
		);

		return $item;
	}

	private function merge_param_values( array $stored_code_effect, $incoming_code_effect ): array {
		$incoming_values = [];

		foreach ( $incoming_code_effect['value']['params']['value'] ?? [] as $param ) {
			$key = $param['value']['key']['value'] ?? null;

			if ( is_string( $key ) && isset( $param['value']['value'] ) ) {
				$incoming_values[ $key ] = $param['value']['value'];
			}
		}

		if ( ! isset( $stored_code_effect['value']['params']['value'] ) ) {
			return $stored_code_effect;
		}

		foreach ( $stored_code_effect['value']['params']['value'] as &$param ) {
			$key = $param['value']['key']['value'] ?? null;
			$incoming_value = $incoming_values[ $key ] ?? null;
			$stored_type = $param['value']['value']['$$type'] ?? $param['value']['default']['$$type'] ?? null;

			if ( null !== $incoming_value && ( $incoming_value['$$type'] ?? null ) === $stored_type ) {
				$param['value']['value'] = $incoming_value;
			}
		}

		return $stored_code_effect;
	}

	private function collect_code_effects( array $elements ): array {
		$code_effects = [];

		foreach ( $elements as $element ) {
			if ( ! is_array( $element ) ) {
				continue;
			}

			$decoded = $this->decode_interactions( $element['interactions'] ?? null );

			foreach ( $decoded['items'] ?? [] as $item ) {
				$interaction_id = $item['value']['interaction_id']['value'] ?? null;
				$animation_value = $item['value']['animation']['value'] ?? null;

				if ( is_string( $interaction_id ) && is_array( $animation_value ) && Code_Effect_Value::is_code_effect( $animation_value ) && isset( $animation_value['code_effect'] ) ) {
					$code_effects[ $interaction_id ] = $animation_value['code_effect'];
				}
			}

			if ( ! empty( $element['elements'] ) && is_array( $element['elements'] ) ) {
				$code_effects = array_merge( $code_effects, $this->collect_code_effects( $element['elements'] ) );
			}
		}

		return $code_effects;
	}

	private function decode_interactions( $interactions ): ?array {
		if ( is_array( $interactions ) ) {
			return $interactions;
		}

		if ( is_string( $interactions ) ) {
			$decoded = json_decode( $interactions, true );

			return is_array( $decoded ) ? $decoded : null;
		}

		return null;
	}
}
