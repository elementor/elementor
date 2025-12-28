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

	public function validate( string|int $component_id, array $elements, array $known_components = [] ): array {
		$referenced_ids = $this->extract_component_references( $elements );

		if ( in_array( $component_id, $referenced_ids, false ) ) {
			return $this->build_error_response( $component_id );
		}

		foreach ( $referenced_ids as $ref_id ) {
			if ( $this->component_eventually_contains( $ref_id, $component_id, $known_components, [] ) ) {
				return $this->build_error_response( $component_id, $ref_id );
			}
		}

		return [
			'success' => true,
			'messages' => [],
		];
	}

	public function validate_new_components( Collection $items ): array {
		$known_components = [];

		foreach ( $items->all() as $item ) {
			$known_components[ $item['uid'] ] = $item['elements'] ?? [];
		}

		foreach ( $known_components as $uid => $elements ) {
			$result = $this->validate( $uid, $elements, $known_components );

			if ( ! $result['success'] ) {
				return $result;
			}
		}

		return [
			'success' => true,
			'messages' => [],
		];
	}

	private function component_eventually_contains( string|int $component_id, string|int $forbidden_id, array $known_components, array $visited_path ): bool {
		if ( in_array( $component_id, $visited_path, false ) ) {
			return false;
		}

		if ( count( $visited_path ) >= self::MAX_RECURSION_DEPTH ) {
			return false;
		}

		$elements = $this->get_elements_for_component( $component_id, $known_components );

		if ( empty( $elements ) ) {
			return false;
		}

		$nested_ids = $this->extract_component_references( $elements );

		if ( in_array( $forbidden_id, $nested_ids, false ) ) {
			return true;
		}

		$visited_path[] = $component_id;

		foreach ( $nested_ids as $nested_id ) {
			if ( $this->component_eventually_contains( $nested_id, $forbidden_id, $known_components, $visited_path ) ) {
				return true;
			}
		}

		return false;
	}

	private function get_elements_for_component( string|int $component_id, array $known_components ): array {
		if ( isset( $known_components[ $component_id ] ) ) {
			return $known_components[ $component_id ];
		}

		return $this->load_component_elements_from_database( $component_id );
	}

	private function load_component_elements_from_database( string|int $component_id ): array {
		if ( ! is_int( $component_id ) ) {
			return [];
		}

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

	private function extract_component_references( array $elements ): array {
		$ids = [];

		foreach ( $elements as $element ) {
			$widget_type = $element['widgetType'] ?? null;

			if ( self::COMPONENT_WIDGET_TYPE === $widget_type ) {
				$component_id = $this->extract_component_id_from_settings( $element['settings'] ?? [] );

				if ( null !== $component_id ) {
					$ids[] = $component_id;
				}
			}

			if ( ! empty( $element['elements'] ) ) {
				$ids = array_merge( $ids, $this->extract_component_references( $element['elements'] ) );
			}
		}

		return array_unique( $ids, SORT_REGULAR );
	}

	private function extract_component_id_from_settings( array $settings ): string|int|null {
		return $settings['component_instance']['value']['component_id']['value'] ?? null;
	}

	private function build_error_response( string|int $component_id, string|int|null $via_component_id = null ): array {
		if ( null === $via_component_id ) {
			$message = sprintf(
				esc_html__( 'Circular dependency detected: Component "%s" references itself.', 'elementor' ),
				$component_id
			);
		} else {
			$message = sprintf(
				esc_html__( 'Circular dependency detected: Component "%s" would create a cycle via component "%s".', 'elementor' ),
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
