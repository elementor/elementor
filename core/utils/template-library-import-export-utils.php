<?php

namespace Elementor\Core\Utils;

use Elementor\Modules\AtomicWidgets\Module as Atomic_Widgets_Module;
use Elementor\Modules\GlobalClasses\Module as Global_Classes_Module;
use Elementor\Modules\Variables\Module as Variables_Module;
use Elementor\Plugin;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Template_Library_Import_Export_Utils {
	const LABEL_PREFIX = 'DUP_';
	const MAX_LABEL_LENGTH = 50;
	const DEFAULT_RANDOM_STRING_LENGTH = 7;
	const IMPORT_MODE_MATCH_SITE = 'match_site';
	const IMPORT_MODE_KEEP_CREATE = 'keep_create';
	const IMPORT_MODE_KEEP_FLATTEN = 'keep_flatten';

	public static function items_equal( array $a, array $b ): bool {
		$a = self::recursive_ksort( $a );
		$b = self::recursive_ksort( $b );

		return wp_json_encode( $a ) === wp_json_encode( $b );
	}

	public static function recursive_ksort( $value ) {
		if ( is_array( $value ) ) {
			foreach ( $value as $k => $v ) {
				$value[ $k ] = self::recursive_ksort( $v );
			}
			ksort( $value );
		}

		return $value;
	}

	public static function normalize_string_ids( array $ids ): array {
		return array_values(
			array_unique(
				array_filter( $ids, fn( $id ) => is_string( $id ) && '' !== $id )
			)
		);
	}

	public static function extract_labels( array $items, string $label_key = 'label' ): array {
		$labels = [];

		foreach ( $items as $item ) {
			if ( isset( $item[ $label_key ] ) && is_string( $item[ $label_key ] ) ) {
				$labels[] = $item[ $label_key ];
			}
		}

		return $labels;
	}

	public static function apply_unique_label( array $item, array &$existing_labels, string $label_key = 'label' ): array {
		if ( ! isset( $item[ $label_key ] ) || ! is_string( $item[ $label_key ] ) || '' === $item[ $label_key ] ) {
			return $item;
		}

		$label = $item[ $label_key ];

		if ( in_array( $label, $existing_labels, true ) ) {
			$label = self::generate_unique_label( $label, $existing_labels );
			$item[ $label_key ] = $label;
		}

		$existing_labels[] = $label;

		return $item;
	}

	public static function generate_unique_id( array $existing_ids, string $prefix = 'g-' ): string {
		$existing = array_fill_keys( $existing_ids, true );

		do {
			$random = substr( strtolower( dechex( wp_rand( 0, PHP_INT_MAX ) ) ), 0, 7 );
			$id = $prefix . $random;
		} while ( isset( $existing[ $id ] ) );

		return $id;
	}

	public static function generate_random_string( int $length = self::DEFAULT_RANDOM_STRING_LENGTH ): string {
		$length = max( 1, $length );
		$chars = '0123456789abcdef';
		$out = '';

		for ( $i = 0; $i < $length; $i++ ) {
			$out .= $chars[ wp_rand( 0, 15 ) ];
		}

		return $out;
	}

	public static function sanitize_import_mode( $import_mode ): string {
		$allowed = [
			self::IMPORT_MODE_MATCH_SITE,
			self::IMPORT_MODE_KEEP_CREATE,
			self::IMPORT_MODE_KEEP_FLATTEN,
		];

		if ( is_string( $import_mode ) && in_array( $import_mode, $allowed, true ) ) {
			return $import_mode;
		}

		return self::IMPORT_MODE_MATCH_SITE;
	}

	public static function apply_import_mode_to_content( array $content, $import_mode, ?array $global_classes_snapshot = null, ?array $global_variables_snapshot = null ): array {
		$import_mode = self::sanitize_import_mode( $import_mode );

		$result = [
			'content' => $content,
			'updated_global_classes' => null,
			'updated_global_variables' => null,
		];

		$variables_id_map = [];
		$variables_to_flatten = [];
		$has_variables = ! empty( $global_variables_snapshot ) &&
			is_array( $global_variables_snapshot ) &&
			self::is_variables_feature_active() &&
			class_exists( \Elementor\Modules\Variables\Utils\Template_Library_Variables::class );

		$has_classes = ! empty( $global_classes_snapshot ) &&
			is_array( $global_classes_snapshot ) &&
			self::is_classes_feature_active() &&
			class_exists( \Elementor\Modules\GlobalClasses\Utils\Template_Library_Global_Classes::class );

		if ( $has_variables ) {
			switch ( $import_mode ) {
				case self::IMPORT_MODE_KEEP_FLATTEN:
					$result['content'] = \Elementor\Modules\Variables\Utils\Template_Library_Variables::flatten_elements_variables( $result['content'], $global_variables_snapshot );
					if ( $has_classes ) {
						$global_classes_snapshot = self::flatten_variables_in_classes_snapshot( $global_classes_snapshot, $global_variables_snapshot );
					}
					break;

				case self::IMPORT_MODE_KEEP_CREATE:
					$create_result = \Elementor\Modules\Variables\Utils\Template_Library_Variables::create_all_as_new( $global_variables_snapshot );
					$variables_id_map = $create_result['id_map'] ?? [];
					$variables_to_flatten = $create_result['ids_to_flatten'] ?? [];

					if ( ! empty( $variables_id_map ) ) {
						$result['content'] = \Elementor\Modules\Variables\Utils\Template_Library_Variables::rewrite_elements_variable_ids( $result['content'], $variables_id_map );
						if ( $has_classes ) {
							$global_classes_snapshot = self::rewrite_variable_ids_in_classes_snapshot( $global_classes_snapshot, $variables_id_map );
						}
					}

					if ( ! empty( $variables_to_flatten ) ) {
						$result['content'] = \Elementor\Modules\Variables\Utils\Template_Library_Variables::flatten_elements_variables( $result['content'], $global_variables_snapshot, $variables_to_flatten );
						if ( $has_classes ) {
							$global_classes_snapshot = self::flatten_variables_in_classes_snapshot( $global_classes_snapshot, $global_variables_snapshot, $variables_to_flatten );
						}
					}

					$result['updated_global_variables'] = $create_result['variables'] ?? null;
					break;

				case self::IMPORT_MODE_MATCH_SITE:
				default:
					$merge_result = \Elementor\Modules\Variables\Utils\Template_Library_Variables::merge_snapshot_and_get_id_map( $global_variables_snapshot );
					$variables_id_map = $merge_result['id_map'] ?? [];
					$variables_to_flatten = $merge_result['ids_to_flatten'] ?? [];

					if ( ! empty( $variables_id_map ) ) {
						$result['content'] = \Elementor\Modules\Variables\Utils\Template_Library_Variables::rewrite_elements_variable_ids( $result['content'], $variables_id_map );
						if ( $has_classes ) {
							$global_classes_snapshot = self::rewrite_variable_ids_in_classes_snapshot( $global_classes_snapshot, $variables_id_map );
						}
					}

					if ( ! empty( $variables_to_flatten ) ) {
						$result['content'] = \Elementor\Modules\Variables\Utils\Template_Library_Variables::flatten_elements_variables( $result['content'], $global_variables_snapshot, $variables_to_flatten );
						if ( $has_classes ) {
							$global_classes_snapshot = self::flatten_variables_in_classes_snapshot( $global_classes_snapshot, $global_variables_snapshot, $variables_to_flatten );
						}
					}

					$result['updated_global_variables'] = $merge_result['variables'] ?? null;
					break;
			}
		}

		if ( $has_classes ) {
			switch ( $import_mode ) {
				case self::IMPORT_MODE_KEEP_FLATTEN:
					$result['content'] = \Elementor\Modules\GlobalClasses\Utils\Template_Library_Global_Classes::flatten_elements_classes( $result['content'], $global_classes_snapshot );
					break;

				case self::IMPORT_MODE_KEEP_CREATE:
					$create_result = \Elementor\Modules\GlobalClasses\Utils\Template_Library_Global_Classes::create_all_as_new( $global_classes_snapshot );
					$id_map = $create_result['id_map'] ?? [];
					$classes_to_flatten = $create_result['ids_to_flatten'] ?? [];

					if ( ! empty( $id_map ) ) {
						$result['content'] = \Elementor\Modules\GlobalClasses\Utils\Template_Library_Global_Classes::rewrite_elements_classes_ids( $result['content'], $id_map );
					}

					if ( ! empty( $classes_to_flatten ) ) {
						$result['content'] = \Elementor\Modules\GlobalClasses\Utils\Template_Library_Global_Classes::flatten_elements_classes( $result['content'], $global_classes_snapshot, $classes_to_flatten );
					}

					$result['updated_global_classes'] = $create_result['global_classes'] ?? null;
					break;

				case self::IMPORT_MODE_MATCH_SITE:
				default:
					$merge_result = \Elementor\Modules\GlobalClasses\Utils\Template_Library_Global_Classes::merge_snapshot_and_get_id_map( $global_classes_snapshot );
					$id_map = $merge_result['id_map'] ?? [];
					$classes_to_flatten = $merge_result['ids_to_flatten'] ?? [];

					if ( ! empty( $id_map ) ) {
						$result['content'] = \Elementor\Modules\GlobalClasses\Utils\Template_Library_Global_Classes::rewrite_elements_classes_ids( $result['content'], $id_map );
					}

					if ( ! empty( $classes_to_flatten ) ) {
						$result['content'] = \Elementor\Modules\GlobalClasses\Utils\Template_Library_Global_Classes::flatten_elements_classes( $result['content'], $global_classes_snapshot, $classes_to_flatten );
					}

					$result['updated_global_classes'] = $merge_result['global_classes'] ?? null;
					break;
			}
		}

		return $result;
	}

	private static function rewrite_variable_ids_in_classes_snapshot( array $snapshot, array $id_map ): array {
		if ( empty( $snapshot['items'] ) || empty( $id_map ) ) {
			return $snapshot;
		}

		$variable_types = [ 'global-color-variable', 'global-font-variable', 'global-size-variable', 'e-global-custom-size-variable' ];

		foreach ( $snapshot['items'] as $class_id => &$class_item ) {
			if ( empty( $class_item['variants'] ) || ! is_array( $class_item['variants'] ) ) {
				continue;
			}

			foreach ( $class_item['variants'] as &$variant ) {
				if ( empty( $variant['props'] ) || ! is_array( $variant['props'] ) ) {
					continue;
				}

				$variant['props'] = self::rewrite_variable_refs_recursive( $variant['props'], $id_map, $variable_types );
			}
		}

		return $snapshot;
	}

	private static function rewrite_variable_refs_recursive( array $data, array $id_map, array $variable_types ): array {
		foreach ( $data as $key => $value ) {
			if ( ! is_array( $value ) ) {
				continue;
			}

			$type = $value['$$type'] ?? null;
			$val = $value['value'] ?? null;

			if ( $type && in_array( $type, $variable_types, true ) && is_string( $val ) && isset( $id_map[ $val ] ) ) {
				$data[ $key ]['value'] = $id_map[ $val ];
				continue;
			}

			$data[ $key ] = self::rewrite_variable_refs_recursive( $value, $id_map, $variable_types );
		}

		return $data;
	}

	private static function flatten_variables_in_classes_snapshot( array $classes_snapshot, array $variables_snapshot, ?array $only_ids = null ): array {
		if ( empty( $classes_snapshot['items'] ) ) {
			return $classes_snapshot;
		}

		$variable_data = $variables_snapshot['data'] ?? [];
		$variable_types = [ 'global-color-variable', 'global-font-variable', 'global-size-variable', 'e-global-custom-size-variable' ];
		$type_map = [
			'global-color-variable' => 'color',
			'global-font-variable' => 'string',
			'global-size-variable' => 'size',
			'e-global-custom-size-variable' => 'size',
		];

		$ids_to_flatten = null !== $only_ids ? array_fill_keys( $only_ids, true ) : null;

		foreach ( $classes_snapshot['items'] as $class_id => &$class_item ) {
			if ( empty( $class_item['variants'] ) || ! is_array( $class_item['variants'] ) ) {
				continue;
			}

			foreach ( $class_item['variants'] as &$variant ) {
				if ( empty( $variant['props'] ) || ! is_array( $variant['props'] ) ) {
					continue;
				}

				$variant['props'] = self::flatten_variable_refs_in_props( $variant['props'], $variable_data, $variable_types, $type_map, $ids_to_flatten );
			}
		}

		return $classes_snapshot;
	}

	private static function flatten_variable_refs_in_props( array $data, array $variable_data, array $variable_types, array $type_map, ?array $ids_to_flatten = null ): array {
		foreach ( $data as $key => $value ) {
			if ( ! is_array( $value ) ) {
				continue;
			}

			$type = $value['$$type'] ?? null;
			$var_id = $value['value'] ?? null;

			if ( $type && in_array( $type, $variable_types, true ) && is_string( $var_id ) && isset( $variable_data[ $var_id ] ) ) {
				if ( null !== $ids_to_flatten && ! isset( $ids_to_flatten[ $var_id ] ) ) {
					continue;
				}

				$resolved_type = $type_map[ $type ] ?? null;
				$resolved_value = $variable_data[ $var_id ]['value'] ?? null;

				if ( $resolved_type && null !== $resolved_value ) {
					$data[ $key ] = [
						'$$type' => $resolved_type,
						'value' => $resolved_value,
					];
				}
				continue;
			}

			$data[ $key ] = self::flatten_variable_refs_in_props( $value, $variable_data, $variable_types, $type_map, $ids_to_flatten );
		}

		return $data;
	}

	public static function generate_unique_label( string $original_label, array $existing_labels ): string {
		$prefix = self::LABEL_PREFIX;
		$max_length = self::MAX_LABEL_LENGTH;

		$has_prefix = 0 === strpos( $original_label, $prefix );

		if ( $has_prefix ) {
			$base_label = substr( $original_label, strlen( $prefix ) );
			$counter = 1;
			$new_label = $prefix . $base_label . $counter;

			while ( in_array( $new_label, $existing_labels, true ) ) {
				++$counter;
				$new_label = $prefix . $base_label . $counter;
			}

			if ( strlen( $new_label ) > $max_length ) {
				$available_length = $max_length - strlen( $prefix . $counter );
				$base_label = substr( $base_label, 0, $available_length );
				$new_label = $prefix . $base_label . $counter;
			}
		} else {
			$new_label = $prefix . $original_label;

			if ( strlen( $new_label ) > $max_length ) {
				$available_length = $max_length - strlen( $prefix );
				$new_label = $prefix . substr( $original_label, 0, $available_length );
			}

			$counter = 1;
			$base_label = substr( $original_label, 0, $available_length ?? strlen( $original_label ) );

			while ( in_array( $new_label, $existing_labels, true ) ) {
				$new_label = $prefix . $base_label . $counter;

				if ( strlen( $new_label ) > $max_length ) {
					$available_length = $max_length - strlen( $prefix . $counter );
					$base_label = substr( $original_label, 0, $available_length );
					$new_label = $prefix . $base_label . $counter;
				}

				++$counter;
			}
		}

		return $new_label;
	}

	public static function is_classes_feature_active(): bool {
		return Plugin::instance()->experiments->is_feature_active( Global_Classes_Module::NAME )
			&& Plugin::instance()->experiments->is_feature_active( Atomic_Widgets_Module::EXPERIMENT_NAME );
	}

	public static function is_variables_feature_active(): bool {
		return Plugin::instance()->experiments->is_feature_active( Variables_Module::EXPERIMENT_NAME )
			&& Plugin::instance()->experiments->is_feature_active( Atomic_Widgets_Module::EXPERIMENT_NAME );
	}
}
