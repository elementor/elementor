<?php

namespace Elementor\Modules\AtomicWidgets\Utils;

use Elementor\Modules\AtomicWidgets\PropTypes\Query_Prop_Type;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Atomic_Prop_Remap {
	public const KIND_POST = 'post';
	public const KIND_TERM = 'term';
	public const KIND_USER = 'user';

	public const FILTER_KEY_TERMS = 'terms';
	public const FILTER_KEY_AUTHORS = 'authors';
	public const FILTER_KEY_MANUAL_SELECTION = 'manual_selection';
	public const FILTER_KEY_CURRENT_POST = 'current_post';

	private const MAP_BY_KIND = [
		self::KIND_POST => 'post_ids',
		self::KIND_TERM => 'term_ids',
		self::KIND_USER => 'user_ids',
	];

	/**
	 * @var list<array{element_id: string, path: string, missing_kind: string, source_id: int}>
	 */
	private static array $warnings = [];

	private static ?string $current_element_id = null;

	private static string $current_path = '';

	public static function apply( array $elements, array $replacements ): array {
		self::ensure_handlers_registered();
		self::$warnings = [];

		if ( ! self::has_any_map( $replacements ) ) {
			return $elements;
		}

		$remapped = array_map(
			function ( $element ) use ( $replacements ) {
				return self::remap_element( $element, $replacements );
			},
			$elements
		);

		if ( function_exists( 'apply_filters' ) ) {
			self::$warnings = apply_filters( 'elementor/atomic_widgets/import_warnings', self::$warnings, $replacements );
		}

		return $remapped;
	}

	public static function consume_warnings(): array {
		$warnings = self::$warnings;
		self::$warnings = [];

		return $warnings;
	}

	public static function register_builtin_handlers(): void {
		Atomic_Prop_Remap_Handlers::register();
	}

	public static function set_tag_resolver( ?callable $resolver ): void {
		Atomic_Prop_Remap_Handlers::set_tag_resolver( $resolver );
	}

	public static function remap_id( $id_node, string $kind, array $replacements ) {
		$source_id = self::extract_numeric_id( $id_node );

		if ( null === $source_id ) {
			return $id_node;
		}

		$mapped_id = self::lookup_mapped_id( $source_id, $kind, $replacements );

		if ( null === $mapped_id ) {
			self::record_warning( $kind, $source_id );

			return $id_node;
		}

		return self::write_numeric_id( $id_node, $mapped_id );
	}

	public static function extract_numeric_id( $node ): ?int {
		if ( is_numeric( $node ) ) {
			return (int) $node;
		}

		if ( is_array( $node ) && isset( $node['value'] ) && is_numeric( $node['value'] ) ) {
			return (int) $node['value'];
		}

		return null;
	}

	public static function extract_string( $node ): string {
		if ( is_string( $node ) ) {
			return $node;
		}

		if ( is_array( $node ) && isset( $node['value'] ) && is_string( $node['value'] ) ) {
			return $node['value'];
		}

		return '';
	}

	private static function ensure_handlers_registered(): void {
		if ( ! Atomic_Prop_Remap_Registry::has( Query_Prop_Type::get_key() ) ) {
			self::register_builtin_handlers();
		}

		if ( function_exists( 'do_action' ) ) {
			do_action( 'elementor/atomic-widgets/prop-remap/register' );
		}
	}

	private static function remap_element( $element, array $replacements ) {
		if ( ! is_array( $element ) ) {
			return $element;
		}

		$previous_element_id = self::$current_element_id;
		self::$current_element_id = isset( $element['id'] ) && is_string( $element['id'] )
			? $element['id']
			: ( self::$current_element_id ?? '' );

		if ( ! empty( $element['settings'] ) && is_array( $element['settings'] ) ) {
			$element['settings'] = self::walk( $element['settings'], $replacements, [] );
		}

		if ( ! empty( $element['elements'] ) && is_array( $element['elements'] ) ) {
			$element['elements'] = array_map(
				function ( $child ) use ( $replacements ) {
					return self::remap_element( $child, $replacements );
				},
				$element['elements']
			);
		}

		self::$current_element_id = $previous_element_id;

		return $element;
	}

	private static function walk( $value, array $replacements, array $context ) {
		if ( ! is_array( $value ) ) {
			return $value;
		}

		if ( self::is_atomic( $value ) ) {
			return self::walk_atomic( $value, $replacements, $context );
		}

		$walked = [];

		foreach ( $value as $key => $item ) {
			$previous_path = self::$current_path;
			self::$current_path = '' === self::$current_path ? (string) $key : self::$current_path . '.' . $key;
			$walked[ $key ] = self::walk( $item, $replacements, $context );
			self::$current_path = $previous_path;
		}

		return $walked;
	}

	private static function walk_atomic( array $atomic, array $replacements, array $context ) {
		$handler = Atomic_Prop_Remap_Registry::get( $atomic['$$type'] );
		$descend = function ( $child, array $child_context = [] ) use ( $replacements ) {
			return self::walk( $child, $replacements, $child_context );
		};

		if ( $handler ) {
			return $handler( $atomic, $replacements, $descend, $context );
		}

		if ( isset( $atomic['value'] ) ) {
			$atomic['value'] = $descend( $atomic['value'], $context );
		}

		return $atomic;
	}

	private static function write_numeric_id( $node, int $mapped_id ) {
		if ( is_array( $node ) && array_key_exists( 'value', $node ) ) {
			$node['value'] = $mapped_id;

			return $node;
		}

		return $mapped_id;
	}

	private static function lookup_mapped_id( int $source_id, string $kind, array $replacements ): ?int {
		$map_key = self::MAP_BY_KIND[ $kind ] ?? null;

		if ( null === $map_key ) {
			return null;
		}

		$map = $replacements[ $map_key ] ?? [];

		if ( isset( $map[ $source_id ] ) ) {
			return (int) $map[ $source_id ];
		}

		if ( isset( $map[ (string) $source_id ] ) ) {
			return (int) $map[ (string) $source_id ];
		}

		return null;
	}

	private static function record_warning( string $kind, int $source_id ): void {
		self::$warnings[] = [
			'element_id' => self::$current_element_id ?? '',
			'path' => self::$current_path,
			'missing_kind' => $kind,
			'source_id' => $source_id,
		];
	}

	private static function is_atomic( array $value ): bool {
		return isset( $value['$$type'] ) && is_string( $value['$$type'] );
	}

	private static function has_any_map( array $replacements ): bool {
		foreach ( self::MAP_BY_KIND as $map_key ) {
			if ( ! empty( $replacements[ $map_key ] ) ) {
				return true;
			}
		}

		return false;
	}
}
