<?php

namespace Elementor\Modules\Mcp\Abilities\Appliers;

use Elementor\Modules\GlobalClasses\Global_Classes_Repository;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Class_Applier {

	private Global_Classes_Repository $repository;

	public function __construct( Global_Classes_Repository $repository ) {
		$this->repository = $repository;
	}

	/**
	 * @param array<string, array&> $config_id_index Index of subtree refs.
	 * @param array<string, mixed>  $classes_input   Per-config-id global class labels.
	 */
	public function apply( array $config_id_index, array $classes_input ): ?\WP_Error {
		if ( empty( $classes_input ) ) {
			return null;
		}

		$id_by_label = $this->build_label_to_id_map( $this->repository->all_labels() );
		$errors = [];

		foreach ( $classes_input as $config_id => $labels ) {
			if ( ! isset( $config_id_index[ $config_id ] ) ) {
				continue;
			}

			if ( ! is_array( $labels ) ) {
				$errors[] = sprintf(
					'[%s] classes must be an array of global class labels, got %s.',
					$config_id,
					gettype( $labels )
				);
				continue;
			}

			$node = &$config_id_index[ $config_id ];

			if ( V3_Node_Bridge::is_v3_node( $node ) ) {
				$this->apply_v3_classes( $node, $labels, $id_by_label, $config_id, $errors );
				unset( $node );
				continue;
			}

			if ( empty( $labels ) ) {
				$node['settings'] = $this->clear_global_classes( $node['settings'] ?? [] );
				unset( $node );
				continue;
			}

			$resolved_ids = [];

			foreach ( $labels as $label ) {
				if ( ! is_string( $label ) || '' === $label ) {
					$errors[] = sprintf( '[%s] Each global class label must be a non-empty string.', $config_id );
					continue;
				}

				if ( ! isset( $id_by_label[ $label ] ) ) {
					$errors[] = sprintf(
						'[%s] Unknown global class label "%s". Available labels: %s',
						$config_id,
						$label,
						! empty( $id_by_label ) ? implode( ', ', array_keys( $id_by_label ) ) : '(none)'
					);
					continue;
				}

				$resolved_ids[] = $id_by_label[ $label ];
			}

			if ( empty( $resolved_ids ) ) {
				unset( $node );
				continue;
			}

			$node['settings'] = $this->prepend_global_classes( $node['settings'] ?? [], $resolved_ids );
			unset( $node );
		}

		if ( empty( $errors ) ) {
			return null;
		}

		return new \WP_Error(
			'elementor_unknown_global_class',
			implode( ' ', $errors ),
			[ 'status' => \WP_Http::BAD_REQUEST ]
		);
	}

	/**
	 * @param array                $node        Reference to a subtree node.
	 * @param string[]             $labels      Global class labels input for this node.
	 * @param array<string,string> $id_by_label Map of label => class id (for validation).
	 * @param string               $config_id   Identifier used in error messages.
	 * @param string[]             $errors      Collected error messages (by reference).
	 */
	private function apply_v3_classes( array &$node, array $labels, array $id_by_label, string $config_id, array &$errors ): void {
		if ( empty( $labels ) ) {
			V3_Node_Bridge::clear_classes( $node );
			return;
		}

		$resolved_labels = [];

		foreach ( $labels as $label ) {
			if ( ! is_string( $label ) || '' === $label ) {
				$errors[] = sprintf( '[%s] Each global class label must be a non-empty string.', $config_id );
				continue;
			}

			if ( ! isset( $id_by_label[ $label ] ) ) {
				$errors[] = sprintf(
					'[%s] Unknown global class label "%s". Available labels: %s',
					$config_id,
					$label,
					! empty( $id_by_label ) ? implode( ', ', array_keys( $id_by_label ) ) : '(none)'
				);
				continue;
			}

			$resolved_labels[] = $label;
		}

		if ( empty( $resolved_labels ) ) {
			return;
		}

		V3_Node_Bridge::apply_classes( $node, $resolved_labels );
	}

	private function build_label_to_id_map( array $label_by_id ): array {
		$id_by_label = [];

		foreach ( $label_by_id as $id => $label ) {
			if ( is_string( $label ) && '' !== $label ) {
				$id_by_label[ $label ] = $id;
			}
		}

		return $id_by_label;
	}

	private function clear_global_classes( array $settings ): array {
		$existing = $settings['classes']['value'] ?? [];

		if ( ! is_array( $existing ) ) {
			$existing = [];
		}

		$local_only = array_values( array_filter(
			$existing,
			static fn( $id ) => is_string( $id ) && str_starts_with( $id, Style_Applier::LOCAL_STYLE_ID_PREFIX )
		) );

		$settings['classes'] = [
			'$$type' => 'classes',
			'value' => $local_only,
		];

		return $settings;
	}

	private function prepend_global_classes( array $settings, array $class_ids ): array {
		$existing = $settings['classes']['value'] ?? [];

		if ( ! is_array( $existing ) ) {
			$existing = [];
		}

		$merged = array_values( array_unique( array_merge( $class_ids, $existing ) ) );

		$settings['classes'] = [
			'$$type' => 'classes',
			'value' => $merged,
		];

		return $settings;
	}
}
