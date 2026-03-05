<?php

namespace Elementor\Modules\Components;

use Elementor\Core\Base\Document;
use Elementor\Modules\Components\Widgets\Component_Instance;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Override_Addition_Validator {
	private Document $document;
	private array $existing_overrides = [];

	public function __construct( Document $document ) {
		$this->document = $document;
		$this->load_existing_overrides();
	}

	public function validate( array $elements ): array {
		$new_overrides = $this->find_new_overrides( $elements );

		if ( ! empty( $new_overrides ) ) {
			return [
				'success' => false,
				'new_overrides' => $new_overrides,
			];
		}

		return [ 'success' => true ];
	}

	private function load_existing_overrides(): void {
		$existing_elements = $this->document->get_elements_data();

		if ( empty( $existing_elements ) ) {
			return;
		}

		$this->extract_overrides_from_elements( $existing_elements, $this->existing_overrides );
	}

	private function find_new_overrides( array $new_elements ): array {
		$new_overrides = [];
		$incoming_overrides = [];

		$this->extract_overrides_from_elements( $new_elements, $incoming_overrides );

		foreach ( $incoming_overrides as $element_id => $override_keys ) {
			$existing_keys = $this->existing_overrides[ $element_id ] ?? [];

			foreach ( $override_keys as $key ) {
				if ( ! in_array( $key, $existing_keys, true ) ) {
					$new_overrides[] = [
						'element_id' => $element_id,
						'override_key' => $key,
					];
				}
			}
		}

		return $new_overrides;
	}

	private function extract_overrides_from_elements( array $elements, array &$result ): void {
		foreach ( $elements as $element ) {
			if ( $this->is_component_instance( $element ) ) {
				$element_id = $element['id'] ?? '';
				$overrides = $this->get_override_keys_from_element( $element );

				if ( ! empty( $overrides ) && ! empty( $element_id ) ) {
					$result[ $element_id ] = $overrides;
				}
			}

			if ( ! empty( $element['elements'] ) ) {
				$this->extract_overrides_from_elements( $element['elements'], $result );
			}
		}
	}

	private function is_component_instance( array $element ): bool {
		return ( $element['elType'] ?? '' ) === 'widget'
			&& ( $element['widgetType'] ?? '' ) === Component_Instance::get_type();
	}

	private function get_override_keys_from_element( array $element ): array {
		$settings = $element['settings'] ?? [];
		$overrides = $settings['overrides'] ?? [];

		if ( empty( $overrides ) || ! is_array( $overrides ) ) {
			return [];
		}

		return array_keys( $overrides );
	}
}
