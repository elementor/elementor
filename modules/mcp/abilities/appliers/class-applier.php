<?php

namespace Elementor\Modules\Mcp\Abilities\Appliers;

use Elementor\Modules\GlobalClasses\Global_Classes_Repository;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\V3_Widget_Map_Loader;
use Elementor\Modules\Mcp\Abilities\Utils\Widget_Context_Helper;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Class_Applier {

	private Global_Classes_Repository $repository;

	public function __construct( Global_Classes_Repository $repository ) {
		$this->repository = $repository;
	}

	/**
	 * Accepts two shapes per config id (backward compatible):
	 *   - `["label-1", "label-2"]`                 → wrapper-only (legacy).
	 *   - `{ "wrapper": [...], "menu-item": [...] }` → targeted; keys are wrapper or inner-element aliases.
	 *
	 * @param array<string, array&> $config_id_index Index of subtree refs.
	 * @param array<string, mixed>  $classes_input   Per-config-id global class labels.
	 * @return array{error: \WP_Error|null, warnings: string[]}
	 */
	public function apply( array $config_id_index, array $classes_input ): array {
		if ( empty( $classes_input ) ) {
			return [ 'error' => null, 'warnings' => [] ];
		}

		$id_by_label = $this->build_label_to_id_map( $this->repository->all_labels() );
		$errors = [];
		$warnings = [];

		foreach ( $classes_input as $config_id => $raw ) {
			if ( ! isset( $config_id_index[ $config_id ] ) ) {
				continue;
			}

			$targets = $this->normalize_targets( $raw, $config_id, $errors );

			if ( null === $targets ) {
				continue;
			}

			$node = &$config_id_index[ $config_id ];

			if ( V3_Node_Bridge::is_v3_node( $node ) ) {
				$this->apply_v3( $node, $targets, $id_by_label, $config_id, $errors, $warnings );
				unset( $node );
				continue;
			}

			if ( ! isset( $targets[ V3_Widget_Map_Loader::WRAPPER_TARGET ] ) ) {
				foreach ( array_keys( $targets ) as $target ) {
					$warnings[] = sprintf(
						'[%s] Global class target \'%s\' is only supported on V3 widgets.',
						$config_id,
						$target
					);
				}
				unset( $node );
				continue;
			}

			$this->apply_v4_wrapper( $node, $targets[ V3_Widget_Map_Loader::WRAPPER_TARGET ], $id_by_label, $config_id, $errors );

			foreach ( $targets as $target => $_labels ) {
				if ( V3_Widget_Map_Loader::WRAPPER_TARGET === $target ) {
					continue;
				}
				$warnings[] = sprintf(
					'[%s] Global class target \'%s\' is only supported on V3 widgets.',
					$config_id,
					$target
				);
			}

			unset( $node );
		}

		$error = empty( $errors ) ? null : new \WP_Error(
			'elementor_unknown_global_class',
			implode( ' ', $errors ),
			[ 'status' => \WP_Http::BAD_REQUEST ]
		);

		return [
			'error' => $error,
			'warnings' => $warnings,
		];
	}

	/**
	 * @return array<string, string[]>|null Per-target label lists, or null if the input for this
	 *                                       config id was rejected (an error was recorded).
	 */
	private function normalize_targets( $raw, string $config_id, array &$errors ): ?array {
		if ( is_array( $raw ) && $this->is_list( $raw ) ) {
			return [ V3_Widget_Map_Loader::WRAPPER_TARGET => $raw ];
		}

		if ( ! is_array( $raw ) ) {
			$errors[] = sprintf(
				'[%s] classes must be an array of global class labels or a target-keyed map, got %s.',
				$config_id,
				gettype( $raw )
			);
			return null;
		}

		$targets = [];

		foreach ( $raw as $target => $labels ) {
			if ( ! is_string( $target ) || '' === $target ) {
				$errors[] = sprintf( '[%s] Class target keys must be non-empty strings.', $config_id );
				continue;
			}

			if ( ! is_array( $labels ) ) {
				$errors[] = sprintf(
					'[%s] Labels for target \'%s\' must be an array, got %s.',
					$config_id,
					$target,
					gettype( $labels )
				);
				continue;
			}

			$targets[ $target ] = $labels;
		}

		return $targets;
	}

	private function is_list( array $arr ): bool {
		if ( empty( $arr ) ) {
			return true;
		}
		return array_keys( $arr ) === range( 0, count( $arr ) - 1 );
	}

	private function apply_v3(
		array &$node,
		array $targets,
		array $id_by_label,
		string $config_id,
		array &$errors,
		array &$warnings
	): void {
		$widget_type = is_string( $node['widgetType'] ?? null ) ? $node['widgetType'] : '';
		$widget_config = '' !== $widget_type
			? ( Widget_Context_Helper::get_widget_config( $widget_type ) ?? [] )
			: [];

		foreach ( $targets as $target => $labels ) {
			$resolved_labels = $this->resolve_labels( $labels, $id_by_label, $config_id, $errors );

			if ( empty( $labels ) && V3_Widget_Map_Loader::WRAPPER_TARGET === $target ) {
				V3_Node_Bridge::clear_classes( $node );
				continue;
			}

			if ( empty( $resolved_labels ) ) {
				continue;
			}

			$warning = V3_Node_Bridge::apply_classes_to_target( $node, $target, $resolved_labels, $widget_config );

			if ( null !== $warning ) {
				$warnings[] = sprintf( '[%s] %s', $config_id, $warning );
			}
		}
	}

	private function apply_v4_wrapper(
		array &$node,
		array $labels,
		array $id_by_label,
		string $config_id,
		array &$errors
	): void {
		if ( empty( $labels ) ) {
			$node['settings'] = $this->clear_global_classes( $node['settings'] ?? [] );
			return;
		}

		$resolved_labels = $this->resolve_labels( $labels, $id_by_label, $config_id, $errors );

		if ( empty( $resolved_labels ) ) {
			return;
		}

		$resolved_ids = array_map(
			static fn( string $label ) => $id_by_label[ $label ],
			$resolved_labels
		);

		$node['settings'] = $this->prepend_global_classes( $node['settings'] ?? [], $resolved_ids );
	}

	/**
	 * @param string[]             $labels      Global class labels input for this node.
	 * @param array<string,string> $id_by_label Map of label => class id (for validation).
	 * @param string               $config_id   Identifier used in error messages.
	 * @param string[]             $errors      Collected error messages (by reference).
	 * @return string[] Validated labels.
	 */
	private function resolve_labels( array $labels, array $id_by_label, string $config_id, array &$errors ): array {
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

		return $resolved_labels;
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
