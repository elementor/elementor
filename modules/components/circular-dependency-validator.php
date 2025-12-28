<?php

namespace Elementor\Modules\Components;

use Elementor\Core\Utils\Collection;
use Elementor\Modules\Components\Documents\Component as Component_Document;
use Elementor\Plugin;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Circular_Dependency_Validator {
	const COMPONENT_WIDGET_TYPE = 'e-component';
	const MAX_RECURSION_DEPTH = 50;

	private array $components_cache = [];

	public static function make(): Circular_Dependency_Validator {
		return new self();
	}

	public function validate( int $component_id, array $elements ): array {
		$referenced_ids = $this->extract_component_ids( $elements );

		if ( in_array( $component_id, $referenced_ids, true ) ) {
			return $this->build_error_response( $component_id );
		}

		foreach ( $referenced_ids as $ref_id ) {
			if ( $this->component_contains_reference( $ref_id, $component_id, [] ) ) {
				return $this->build_error_response( $component_id, $ref_id );
			}
		}

		return [
			'success' => true,
			'messages' => [],
		];
	}

	public function validate_new_components( Collection $items ): array {
		$uid_to_elements = [];

		foreach ( $items->all() as $item ) {
			$uid_to_elements[ $item['uid'] ] = $item['elements'] ?? [];
		}

		foreach ( $uid_to_elements as $uid => $elements ) {
			$referenced_uids = $this->extract_component_uids( $elements );

			foreach ( $referenced_uids as $ref_uid ) {
				if ( $ref_uid === $uid ) {
					return [
						'success' => false,
						'messages' => [
							sprintf(
								esc_html__( 'Circular dependency detected: Component with UID "%s" references itself.', 'elementor' ),
								$uid
							),
						],
					];
				}

				if ( $this->has_circular_reference_in_new_components( $ref_uid, $uid, $uid_to_elements, [] ) ) {
					return [
						'success' => false,
						'messages' => [
							sprintf(
								esc_html__( 'Circular dependency detected: Component with UID "%s" would create a cycle.', 'elementor' ),
								$uid
							),
						],
					];
				}
			}
		}

		return [
			'success' => true,
			'messages' => [],
		];
	}

	private function component_contains_reference( int $check_id, int $target_id, array $visited ): bool {
		if ( in_array( $check_id, $visited, true ) ) {
			return false;
		}

		if ( count( $visited ) >= self::MAX_RECURSION_DEPTH ) {
			return false;
		}

		$elements = $this->get_component_elements( $check_id );

		if ( empty( $elements ) ) {
			return false;
		}

		$nested_ids = $this->extract_component_ids( $elements );

		if ( in_array( $target_id, $nested_ids, true ) ) {
			return true;
		}

		$visited[] = $check_id;

		foreach ( $nested_ids as $nested_id ) {
			if ( $this->component_contains_reference( $nested_id, $target_id, $visited ) ) {
				return true;
			}
		}

		return false;
	}

	private function has_circular_reference_in_new_components( string $check_uid, string $target_uid, array $uid_to_elements, array $visited ): bool {
		if ( in_array( $check_uid, $visited, true ) ) {
			return false;
		}

		if ( count( $visited ) >= self::MAX_RECURSION_DEPTH ) {
			return false;
		}

		if ( ! isset( $uid_to_elements[ $check_uid ] ) ) {
			return false;
		}

		$elements = $uid_to_elements[ $check_uid ];
		$nested_uids = $this->extract_component_uids( $elements );

		if ( in_array( $target_uid, $nested_uids, true ) ) {
			return true;
		}

		$visited[] = $check_uid;

		foreach ( $nested_uids as $nested_uid ) {
			if ( $this->has_circular_reference_in_new_components( $nested_uid, $target_uid, $uid_to_elements, $visited ) ) {
				return true;
			}
		}

		return false;
	}

	private function get_component_elements( int $component_id ): array {
		if ( isset( $this->components_cache[ $component_id ] ) ) {
			return $this->components_cache[ $component_id ];
		}

		$doc = Plugin::$instance->documents->get( $component_id );

		if ( ! $doc instanceof Component_Document ) {
			$this->components_cache[ $component_id ] = [];
			return [];
		}

		$elements = $doc->get_elements_data();
		$this->components_cache[ $component_id ] = $elements;

		return $elements;
	}

	private function extract_component_ids( array $elements ): array {
		$ids = [];

		foreach ( $elements as $element ) {
			$widget_type = $element['widgetType'] ?? null;

			if ( self::COMPONENT_WIDGET_TYPE === $widget_type ) {
				$component_id = $this->get_component_id_from_settings( $element['settings'] ?? [] );

				if ( null !== $component_id ) {
					$ids[] = $component_id;
				}
			}

			if ( ! empty( $element['elements'] ) ) {
				$ids = array_merge( $ids, $this->extract_component_ids( $element['elements'] ) );
			}
		}

		return array_unique( $ids );
	}

	private function extract_component_uids( array $elements ): array {
		$uids = [];

		foreach ( $elements as $element ) {
			$widget_type = $element['widgetType'] ?? null;

			if ( self::COMPONENT_WIDGET_TYPE === $widget_type ) {
				$component_uid = $this->get_component_uid_from_settings( $element['settings'] ?? [] );

				if ( null !== $component_uid ) {
					$uids[] = $component_uid;
				}
			}

			if ( ! empty( $element['elements'] ) ) {
				$uids = array_merge( $uids, $this->extract_component_uids( $element['elements'] ) );
			}
		}

		return array_unique( $uids );
	}

	private function get_component_id_from_settings( array $settings ): ?int {
		$component_instance = $settings['component_instance'] ?? null;

		if ( ! is_array( $component_instance ) ) {
			return null;
		}

		$value = $component_instance['value'] ?? null;

		if ( ! is_array( $value ) ) {
			return null;
		}

		$component_id_wrapper = $value['component_id'] ?? null;

		if ( ! is_array( $component_id_wrapper ) ) {
			return null;
		}

		$component_id = $component_id_wrapper['value'] ?? null;

		if ( ! is_int( $component_id ) ) {
			return null;
		}

		return $component_id;
	}

	private function get_component_uid_from_settings( array $settings ): ?string {
		$component_instance = $settings['component_instance'] ?? null;

		if ( ! is_array( $component_instance ) ) {
			return null;
		}

		$value = $component_instance['value'] ?? null;

		if ( ! is_array( $value ) ) {
			return null;
		}

		$component_id_wrapper = $value['component_id'] ?? null;

		if ( ! is_array( $component_id_wrapper ) ) {
			return null;
		}

		$component_uid = $component_id_wrapper['value'] ?? null;

		if ( ! is_string( $component_uid ) ) {
			return null;
		}

		return $component_uid;
	}

	private function build_error_response( int $component_id, ?int $via_component_id = null ): array {
		if ( null === $via_component_id ) {
			$message = sprintf(
				esc_html__( 'Circular dependency detected: Component %d references itself.', 'elementor' ),
				$component_id
			);
		} else {
			$message = sprintf(
				esc_html__( 'Circular dependency detected: Component %d would create a cycle via component %d.', 'elementor' ),
				$component_id,
				$via_component_id
			);
		}

		return [
			'success' => false,
			'messages' => [ $message ],
		];
	}
}

