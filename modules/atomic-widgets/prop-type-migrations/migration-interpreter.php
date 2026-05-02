<?php

namespace Elementor\Modules\AtomicWidgets\PropTypeMigrations;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Migration_Interpreter {
	public static function run( array $migration_schema, array $element_data, string $direction = 'up' ): array {
		if ( ! in_array( $direction, [ 'up', 'down' ], true ) ) {
			throw new \InvalidArgumentException( sprintf( 'Invalid direction "%s". Must be "up" or "down".', esc_html( $direction ) ) );
		}

		$operations = $migration_schema[ $direction ] ?? [];

		if ( empty( $operations ) ) {
			return $element_data;
		}

		foreach ( $operations as $operation_def ) {
			$element_data = self::apply_operation( $operation_def, $element_data );
		}

		return $element_data;
	}

	private static function apply_operation( array $operation_def, array $element_data ): array {
		$op = $operation_def['op'] ?? [];
		$condition = $operation_def['condition'] ?? null;

		$fn = $op['fn'] ?? null;
		$path_pattern = $op['path'] ?? null;

		if ( null === $fn ) {
			return $element_data;
		}

		if ( 'move' === $fn ) {
			self::execute_move( $op, $element_data );
			return $element_data;
		}

		if ( null === $path_pattern ) {
			return $element_data;
		}

		$resolved_paths = Path_Resolver::resolve( $path_pattern, $element_data );

		if ( empty( $resolved_paths ) && 'set' === $fn && ! self::has_wildcard( $path_pattern ) ) {
			$resolved_paths = [
				[
					'path' => $path_pattern,
					'wildcard_values' => [],
				],
			];
		}

		foreach ( $resolved_paths as $path_info ) {
			$resolved_path = $path_info['path'];
			$wildcard_values = $path_info['wildcard_values'];

			if ( null !== $condition && ! self::check_condition( $condition, $wildcard_values, $element_data ) ) {
				continue;
			}

			self::execute_operation( $fn, $op, $resolved_path, $element_data );
		}

		return $element_data;
	}

	private static function has_wildcard( string $path ): bool {
		return strpos( $path, '*' ) !== false;
	}

	private static function execute_operation( string $fn, array $op, string $path, array &$data ): void {
		switch ( $fn ) {
			case 'set':
				self::execute_set( $op, $path, $data );
				break;

			case 'delete':
				$clean = $op['clean'] ?? true;
				self::execute_delete( $data, $path, $clean );
				break;

			case 'move':
				self::execute_move( $op, $data );
				break;
		}
	}

	private static function execute_set( array $op, string $path, array &$data ): void {
		$has_value = array_key_exists( 'value', $op );
		$has_key = array_key_exists( 'key', $op );
		$merge = $op['merge'] ?? true;

		if ( $has_key ) {
			$new_key = $op['key'];
			self::rename_key_at_path( $data, $path, $new_key );
			$path = self::get_renamed_path( $path, $new_key );
		}

		if ( $has_value ) {
			$current_value = Path_Resolver::get( $path, $data );
			$new_value = self::resolve_value( $op['value'], $current_value );

			if ( $merge && is_array( $current_value ) && is_array( $new_value ) ) {
				$new_value = self::deep_merge( $current_value, $new_value );
			}

			self::set_at_path( $data, $path, $new_value );
		} elseif ( ! $has_key ) {
			self::set_at_path( $data, $path, new \stdClass() );
		}
	}

	private static function execute_move( array $op, array &$data ): void {
		$src = $op['src'] ?? null;
		$dest = $op['dest'] ?? null;
		$clean = $op['clean'] ?? true;

		if ( null === $src || null === $dest ) {
			throw new \InvalidArgumentException( 'Move operation requires both "src" and "dest" parameters' );
		}

		$value = Path_Resolver::get( $src, $data );

		if ( null === $value ) {
			return;
		}

		self::set_at_path( $data, $dest, $value );

		if ( $clean ) {
			self::execute_delete( $data, $src, true );
		}
	}

	private static function check_condition( array $condition, array $wildcard_values, array $data ): bool {
		$fn = $condition['fn'] ?? null;

		if ( null === $fn ) {
			return true;
		}

		if ( 'and' === $fn ) {
			return self::check_and_condition( $condition, $wildcard_values, $data );
		}

		if ( 'or' === $fn ) {
			return self::check_or_condition( $condition, $wildcard_values, $data );
		}

		$path_pattern = $condition['path'] ?? null;

		if ( null === $path_pattern ) {
			return false;
		}

		$resolved_path = Path_Resolver::resolve_with_wildcard_binding( $path_pattern, $data, $wildcard_values );

		if ( null === $resolved_path ) {
			if ( 'not_exists' === $fn ) {
				return true;
			}
			return false;
		}

		$value = Path_Resolver::get( $resolved_path, $data );
		$expected = $condition['value'] ?? null;

		return self::evaluate_condition( $fn, $value, $expected );
	}

	private static function check_and_condition( array $condition, array $wildcard_values, array $data ): bool {
		$conditions = $condition['conditions'] ?? [];

		foreach ( $conditions as $condition ) {
			if ( ! self::check_condition( $condition, $wildcard_values, $data ) ) {
				return false;
			}
		}

		return true;
	}

	private static function check_or_condition( array $condition, array $wildcard_values, array $data ): bool {
		$conditions = $condition['conditions'] ?? [];

		foreach ( $conditions as $condition ) {
			if ( self::check_condition( $condition, $wildcard_values, $data ) ) {
				return true;
			}
		}

		return false;
	}

	private static function evaluate_condition( string $fn, $value, $expected ): bool {
		switch ( $fn ) {
			case 'equals':
				return $value === $expected;
			case 'not_equals':
				return $value !== $expected;
			case 'exists':
				return null !== $value;
			case 'not_exists':
				return null === $value;
			case 'in':
				return is_array( $expected ) && in_array( $value, $expected, true );
			case 'not_in':
				return is_array( $expected ) && ! in_array( $value, $expected, true );
			case 'is_primitive':
				return is_scalar( $value );
			case 'is_object':
				return is_array( $value ) && self::is_associative_array( $value );
			case 'is_array':
				return is_array( $value ) && ! self::is_associative_array( $value );
			default:
				return false;
		}
	}

	private static function is_associative_array( array $array ): bool {
		if ( empty( $array ) ) {
			return true;
		}

		return array_keys( $array ) !== range( 0, count( $array ) - 1 );
	}

	private static function resolve_value( $value_definition, $current_value ) {
		if ( ! self::is_reference( $value_definition ) ) {
			return $value_definition;
		}

		if ( is_string( $value_definition ) ) {
			return self::resolve_string_reference( $value_definition, $current_value );
		}

		if ( is_array( $value_definition ) ) {
			return self::resolve_array_reference( $value_definition, $current_value );
		}

		return $value_definition;
	}

	private static function is_reference( $value ): bool {
		if ( is_string( $value ) ) {
			return '$$current' === $value || 0 === strpos( $value, '$$current.' );
		}

		if ( is_array( $value ) ) {
			foreach ( $value as $item ) {
				if ( self::is_reference( $item ) ) {
					return true;
				}
			}
		}

		return false;
	}

	private static function resolve_string_reference( string $value, $current_value ) {
		if ( '$$current' === $value ) {
			return $current_value;
		}

		if ( 0 === strpos( $value, '$$current.' ) ) {
			$path = substr( $value, 10 );
			return self::get_nested_value( $current_value, $path );
		}

		return $value;
	}

	private static function resolve_array_reference( array $value, $current_value ): array {
		$result = [];

		foreach ( $value as $key => $item ) {
			$result[ $key ] = self::resolve_value( $item, $current_value );
		}

		return $result;
	}

	private static function get_nested_value( $data, string $path ) {
		if ( ! is_array( $data ) ) {
			return null;
		}

		$keys = explode( '.', $path );

		foreach ( $keys as $key ) {
			if ( ! is_array( $data ) || ! array_key_exists( $key, $data ) ) {
				return null;
			}

			$data = $data[ $key ];
		}

		return $data;
	}

	private static function deep_merge( array $base, array $overlay ): array {
		foreach ( $overlay as $key => $value ) {
			if ( is_array( $value ) && isset( $base[ $key ] ) && is_array( $base[ $key ] ) ) {
				$base[ $key ] = self::deep_merge( $base[ $key ], $value );
			} else {
				$base[ $key ] = $value;
			}
		}

		return $base;
	}

	private static function get_renamed_path( string $path, string $new_key ): string {
		$last_dot = strrpos( $path, '.' );
		$last_bracket = strrpos( $path, '[' );

		if ( false === $last_dot && false === $last_bracket ) {
			return $new_key;
		}

		$last_separator = max(
			false === $last_dot ? -1 : $last_dot,
			false === $last_bracket ? -1 : $last_bracket
		);

		if ( $last_separator === $last_bracket ) {
			$close_bracket = strpos( $path, ']', $last_bracket );

			if ( false === $close_bracket ) {
				throw new \Exception( sprintf( 'Malformed path: missing closing bracket in "%s"', esc_html( $path ) ) );
			}

			return substr( $path, 0, $last_bracket + 1 ) . $new_key . substr( $path, $close_bracket );
		}

		return substr( $path, 0, $last_dot + 1 ) . $new_key;
	}

	private static function set_at_path( array &$data, string $path, $value ): void {
		$segments = self::parse_path_segments( $path );

		if ( empty( $segments ) ) {
			return;
		}

		self::set_recursive( $data, $segments, $value );
	}

	private static function execute_delete( array &$data, string $path, bool $clean = true ): void {
		$segments = self::parse_path_segments( $path );

		if ( empty( $segments ) ) {
			return;
		}

		self::delete_recursive( $data, $segments, $clean, false );
	}

	private static function rename_key_at_path( array &$data, string $path, string $new_key ): void {
		$segments = self::parse_path_segments( $path );

		if ( empty( $segments ) ) {
			return;
		}

		self::rename_key_recursive( $data, $segments, $new_key );
	}

	private static function parse_path_segments( string $path ): array {
		$segments = [];
		$current = '';
		$length = strlen( $path );

		for ( $i = 0; $i < $length; $i++ ) {
			$char = $path[ $i ];

			if ( '.' === $char ) {
				self::flush_segment( $segments, $current );
			} elseif ( '[' === $char ) {
				self::flush_segment( $segments, $current );
				$i = self::parse_bracket_segment( $path, $i, $segments );
			} else {
				$current .= $char;
			}
		}

		self::flush_segment( $segments, $current );

		return $segments;
	}

	private static function flush_segment( array &$segments, string &$current ): void {
		if ( '' !== $current ) {
			$segments[] = $current;
			$current = '';
		}
	}

	private static function parse_bracket_segment( string $path, int $start_pos, array &$segments ): int {
		$end = strpos( $path, ']', $start_pos );

		if ( false === $end ) {
			throw new \Exception( sprintf( 'Malformed path: unmatched opening bracket in "%s"', esc_html( $path ) ) );
		}

		$index = substr( $path, $start_pos + 1, $end - $start_pos - 1 );

		if ( '' === $index ) {
			$segments[] = '[]';
		} else {
			$segments[] = $index;
		}

		return $end;
	}

	private static function set_recursive( array &$data, array $segments, $value ): void {
		$key = array_shift( $segments );

		if ( '[]' === $key ) {
			if ( empty( $segments ) ) {
				$data[] = $value;
			} else {
				$new_index = count( $data );
				$data[ $new_index ] = [];
				self::set_recursive( $data[ $new_index ], $segments, $value );
			}
			return;
		}

		if ( empty( $segments ) ) {
			$data[ $key ] = $value;
			return;
		}

		if ( ! isset( $data[ $key ] ) || ! is_array( $data[ $key ] ) ) {
			$data[ $key ] = [];
		}

		self::set_recursive( $data[ $key ], $segments, $value );
	}

	private static function delete_recursive( array &$data, array $segments, bool $clean = true, bool $can_convert_to_object = true ): bool {
		$key = array_shift( $segments );

		if ( ! array_key_exists( $key, $data ) ) {
			return false;
		}

		if ( empty( $segments ) ) {
			$was_associative = ! self::is_indexed_array( $data );
			unset( $data[ $key ] );

			if ( ! $was_associative ) {
				$data = array_values( $data );
			}

			if ( $can_convert_to_object && empty( $data ) && $was_associative ) {
				$data = new \stdClass();
			}

			if ( $clean && ( $data instanceof \stdClass || empty( $data ) ) ) {
				return true;
			}

			return false;
		}

		if ( is_array( $data[ $key ] ) ) {
			$should_delete_parent = self::delete_recursive( $data[ $key ], $segments, $clean, true );

			if ( $should_delete_parent ) {
				$was_parent_associative = ! self::is_indexed_array( $data );
				unset( $data[ $key ] );

				if ( ! $was_parent_associative ) {
					$data = array_values( $data );
				}

				if ( $can_convert_to_object && empty( $data ) && $was_parent_associative ) {
					$data = new \stdClass();
				}

				if ( $clean && ( $data instanceof \stdClass || empty( $data ) ) ) {
					return true;
				}
			}
		}

		return false;
	}

	private static function is_indexed_array( array $array ): bool {
		if ( empty( $array ) ) {
			return false;
		}

		$keys = array_keys( $array );
		return range( 0, count( $array ) - 1 ) === $keys;
	}

	private static function rename_key_recursive( array &$data, array $segments, string $new_key ): void {
		$key = array_shift( $segments );

		if ( ! array_key_exists( $key, $data ) ) {
			return;
		}

		if ( empty( $segments ) ) {
			$new_data = [];

			foreach ( $data as $k => $v ) {
				if ( $k === $key ) {
					$new_data[ $new_key ] = $v;
				} else {
					$new_data[ $k ] = $v;
				}
			}

			$data = $new_data;
			return;
		}

		if ( is_array( $data[ $key ] ) ) {
			self::rename_key_recursive( $data[ $key ], $segments, $new_key );
		}
	}
}
