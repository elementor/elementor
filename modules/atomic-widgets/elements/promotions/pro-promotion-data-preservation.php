<?php

namespace Elementor\Modules\AtomicWidgets\Elements\Promotions;

use Elementor\Plugin;
use Elementor\Utils;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Pro_Promotion_Data_Preservation {

	const EMAIL_ACTION_COUNT = 2;

	public function register_hooks(): void {
		if ( Utils::has_pro() ) {
			return;
		}

		add_filter( 'elementor/document/save/data', fn ( $data, $document ) => $this->preserve( $data, $document ), 10, 2 );
		add_filter( 'elementor/atomic/form/email_action_count', fn ( $count ) => max( $count, self::EMAIL_ACTION_COUNT ) );
	}

	public function preserve( $data, $document ) {
		if ( empty( $data['elements'] ) || ! is_array( $data['elements'] ) ) {
			return $data;
		}

		$promotion_types = $this->get_promotion_types();

		if ( empty( $promotion_types ) ) {
			return $data;
		}

		$stored = [];
		$this->map_promotion_elements( $document->get_elements_data(), $promotion_types, $stored );

		if ( empty( $stored ) ) {
			return $data;
		}

		$data['elements'] = $this->restore_promotion_elements( $data['elements'], $promotion_types, $stored );

		return $data;
	}

	private function get_promotion_types(): array {
		$types = [];

		foreach ( Plugin::$instance->elements_manager->get_element_types() as $type => $element ) {
			if ( method_exists( $element, 'get_meta_item' ) && $element->get_meta_item( 'is_pro_promotion' ) ) {
				$types[] = $type;
			}
		}

		return $types;
	}

	private function map_promotion_elements( $elements, array $promotion_types, array &$map ): void {
		if ( ! is_array( $elements ) ) {
			return;
		}

		foreach ( $elements as $element ) {
			if ( ! is_array( $element ) ) {
				continue;
			}

			$id = $element['id'] ?? '';
			$is_promotion = in_array( $element['elType'] ?? '', $promotion_types, true );

			if ( $id && $is_promotion && ! empty( $element['elements'] ) ) {
				$map[ $id ] = [
					'settings' => $element['settings'] ?? [],
					'elements' => $element['elements'],
				];

				continue;
			}

			$this->map_promotion_elements( $element['elements'] ?? [], $promotion_types, $map );
		}
	}

	private function restore_promotion_elements( array $elements, array $promotion_types, array $map ): array {
		foreach ( $elements as &$element ) {
			if ( ! is_array( $element ) ) {
				continue;
			}

			$id = $element['id'] ?? '';
			$is_promotion = in_array( $element['elType'] ?? '', $promotion_types, true );

			if ( $is_promotion && empty( $element['elements'] ) && isset( $map[ $id ] ) ) {
				$element['settings'] = $map[ $id ]['settings'];
				$element['elements'] = $map[ $id ]['elements'];

				continue;
			}

			if ( ! empty( $element['elements'] ) && is_array( $element['elements'] ) ) {
				$element['elements'] = $this->restore_promotion_elements( $element['elements'], $promotion_types, $map );
			}
		}

		unset( $element );

		return $elements;
	}
}
