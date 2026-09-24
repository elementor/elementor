<?php

namespace Elementor\Modules\Mcp\Abilities\Appliers;

use Elementor\Modules\GlobalClasses\Global_Classes_Repository;
use Elementor\Modules\Mcp\Abilities\Utils\Fixable_Warning;

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
	 *
	 * @return array{error: null, warnings: string[], warning_codes: string[], warning_details: array[]}
	 */
	public function apply( array $config_id_index, array $classes_input ): array {
		$empty = [
			'error' => null,
			'warnings' => [],
			'warning_codes' => [],
			'warning_details' => [],
		];

		if ( empty( $classes_input ) ) {
			return $empty;
		}

		$id_by_label = $this->build_label_to_id_map( $this->repository->all_labels() );
		$warnings = [];
		$warning_codes = [];
		$warning_details = [];

		foreach ( $classes_input as $config_id => $labels ) {
			if ( ! isset( $config_id_index[ $config_id ] ) ) {
				continue;
			}

			if ( ! is_array( $labels ) ) {
				Fixable_Warning::push(
					$warnings,
					$warning_codes,
					$warning_details,
					'unknown_global_class',
					(string) $config_id,
					sprintf( 'classes must be an array of global class labels, got %s.', gettype( $labels ) )
				);
				continue;
			}

			$node = &$config_id_index[ $config_id ];
			$resolved_labels = $this->resolve_labels( $labels, $id_by_label, (string) $config_id, $warnings, $warning_codes, $warning_details );

			if ( V3_Node_Bridge::is_v3_node( $node ) ) {
				if ( empty( $labels ) ) {
					V3_Node_Bridge::clear_classes( $node );
				} elseif ( ! empty( $resolved_labels ) ) {
					V3_Node_Bridge::apply_classes( $node, $resolved_labels );
				}

				unset( $node );
				continue;
			}

			if ( empty( $labels ) ) {
				$node['settings'] = $this->clear_global_classes( $node['settings'] ?? [] );
				unset( $node );
				continue;
			}

			if ( empty( $resolved_labels ) ) {
				unset( $node );
				continue;
			}

			$resolved_ids = array_map(
				static fn( string $label ) => $id_by_label[ $label ],
				$resolved_labels
			);

			$node['settings'] = $this->prepend_global_classes( $node['settings'] ?? [], $resolved_ids );
			unset( $node );
		}

		return [
			'error' => null,
			'warnings' => $warnings,
			'warning_codes' => array_values( array_unique( $warning_codes ) ),
			'warning_details' => $warning_details,
		];
	}

	/**
	 * @param string[]             $labels           Global class labels input for this node.
	 * @param array<string,string> $id_by_label      Map of label => class id (for validation).
	 * @param string               $config_id        Identifier used in warning messages.
	 * @param string[]             $warnings         Collected warning messages.
	 * @param string[]             $warning_codes    Collected warning codes.
	 * @param array[]              $warning_details  Collected warning details.
	 * @return string[] Validated labels.
	 */
	private function resolve_labels( array $labels, array $id_by_label, string $config_id, array &$warnings, array &$warning_codes, array &$warning_details ): array {
		$resolved_labels = [];

		foreach ( $labels as $label ) {
			if ( ! is_string( $label ) || '' === $label ) {
				Fixable_Warning::push(
					$warnings,
					$warning_codes,
					$warning_details,
					'unknown_global_class',
					$config_id,
					'Each global class label must be a non-empty string.'
				);
				continue;
			}

			if ( ! isset( $id_by_label[ $label ] ) ) {
				Fixable_Warning::push(
					$warnings,
					$warning_codes,
					$warning_details,
					'unknown_global_class',
					$config_id,
					sprintf(
						'Unknown global class label "%s". Create it with elementor/manage-classes, then attach it in a follow-up update. Available labels: %s',
						$label,
						! empty( $id_by_label ) ? implode( ', ', array_keys( $id_by_label ) ) : '(none)'
					)
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
