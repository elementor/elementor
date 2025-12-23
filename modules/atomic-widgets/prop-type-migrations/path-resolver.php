<?php

namespace Elementor\Modules\AtomicWidgets\PropTypeMigrations;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Path_Resolver {
	private array $data;

	private function __construct( array $data ) {
		$this->data = $data;
	}

	public static function make( array $data ): self {
		return new self( $data );
	}

	public function get_data(): array {
		return $this->data;
	}

	public function resolve( string $pattern, bool $allow_missing_leaf = true ): array {
		$segments = $this->parse_path( $pattern );

		return $this->resolve_segments( $segments, $this->data, [], '', $allow_missing_leaf );
	}

	public function resolve_with_wildcard_binding( string $pattern, array $wildcard_values ): ?string {
		$segments = $this->parse_path( $pattern );
		$wildcard_index = 0;

		return $this->resolve_with_binding( $segments, $this->data, '', $wildcard_values, $wildcard_index );
	}

	public function get( string $path ) {
		$segments = $this->parse_concrete_path( $path );
		$current = $this->data;

		foreach ( $segments as $segment ) {
			if ( ! is_array( $current ) ) {
				return null;
			}

			$key = $segment['value'];

			if ( ! array_key_exists( $key, $current ) ) {
				return null;
			}

			$current = $current[ $key ];
		}

		return $current;
	}

	public function set( string $path, $value ): void {
		$segments = $this->parse_concrete_path( $path );

		if ( empty( $segments ) ) {
			return;
		}

		$this->set_recursive( $this->data, $segments, $value );
	}

	public function delete( string $path ): void {
		$segments = $this->parse_concrete_path( $path );

		if ( empty( $segments ) ) {
			return;
		}

		$this->delete_recursive( $this->data, $segments );
	}

	public function exists( string $path ): bool {
		$segments = $this->parse_concrete_path( $path );
		$current = $this->data;

		foreach ( $segments as $segment ) {
			if ( ! is_array( $current ) ) {
				return false;
			}

			$key = $segment['value'];

			if ( ! array_key_exists( $key, $current ) ) {
				return false;
			}

			$current = $current[ $key ];
		}

		return true;
	}

	public function rename_key( string $path, string $new_key ): void {
		$segments = $this->parse_concrete_path( $path );

		if ( empty( $segments ) ) {
			return;
		}

		$this->rename_key_recursive( $this->data, $segments, $new_key );
	}

	private function parse_path( string $path ): array {
		$segments = [];
		$current = '';
		$length = strlen( $path );

		for ( $i = 0; $i < $length; $i++ ) {
			$char = $path[ $i ];

			if ( '.' === $char ) {
				if ( '' !== $current ) {
					$segments[] = $this->create_segment( $current, 'key' );
					$current = '';
				}
			} elseif ( '[' === $char ) {
				if ( '' !== $current ) {
					$segments[] = $this->create_segment( $current, 'key' );
					$current = '';
				}

				$end = strpos( $path, ']', $i );

				if ( false === $end ) {
					break;
				}

				$index = substr( $path, $i + 1, $end - $i - 1 );
				$segments[] = $this->create_segment( $index, 'index' );
				$i = $end;
			} else {
				$current .= $char;
			}
		}

		if ( '' !== $current ) {
			$segments[] = $this->create_segment( $current, 'key' );
		}

		return $segments;
	}

	private function parse_concrete_path( string $path ): array {
		return $this->parse_path( $path );
	}

	private function create_segment( string $value, string $type ): array {
		return [
			'value' => $value,
			'type' => $type,
			'is_wildcard' => '*' === $value,
		];
	}

	private function resolve_segments( array $segments, $data, array $wildcard_values, string $current_path = '', bool $allow_missing_leaf = true ): array {
		if ( empty( $segments ) ) {
			return [
				[
					'path' => $current_path,
					'wildcard_values' => $wildcard_values,
				],
			];
		}

		if ( ! is_array( $data ) ) {
			return [];
		}

		$segment = array_shift( $segments );
		$is_last_segment = empty( $segments );
		$results = [];

		if ( $segment['is_wildcard'] ) {
			foreach ( array_keys( $data ) as $key ) {
				$new_wildcard_values = $wildcard_values;
				$new_wildcard_values[] = [
					'key' => $key,
					'type' => $segment['type'],
				];

				$new_path = $this->append_to_path( $current_path, $key, $segment['type'] );

				$results = array_merge(
					$results,
					$this->resolve_segments( $segments, $data[ $key ], $new_wildcard_values, $new_path, $allow_missing_leaf )
				);
			}
		} else {
			$key = $segment['value'];
			$key_exists = array_key_exists( $key, $data );

			if ( ! $key_exists && ! ( $allow_missing_leaf && $is_last_segment ) ) {
				return [];
			}

			$new_path = $this->append_to_path( $current_path, $key, $segment['type'] );

			if ( $is_last_segment ) {
				$results = [
					[
						'path' => $new_path,
						'wildcard_values' => $wildcard_values,
					],
				];
			} else {
				$results = $this->resolve_segments( $segments, $data[ $key ], $wildcard_values, $new_path, $allow_missing_leaf );
			}
		}

		return $results;
	}

	private function resolve_with_binding( array $segments, $data, string $prefix, array $wildcard_values, int &$wildcard_index ): ?string {
		if ( empty( $segments ) ) {
			return $prefix;
		}

		if ( ! is_array( $data ) ) {
			return null;
		}

		$segment = array_shift( $segments );

		if ( $segment['is_wildcard'] ) {
			if ( ! isset( $wildcard_values[ $wildcard_index ] ) ) {
				return null;
			}

			$key = $wildcard_values[ $wildcard_index ]['key'];
			$wildcard_index++;

			if ( ! array_key_exists( $key, $data ) ) {
				return null;
			}

			$new_prefix = $this->append_to_path( $prefix, $key, $segment['type'] );

			return $this->resolve_with_binding( $segments, $data[ $key ], $new_prefix, $wildcard_values, $wildcard_index );
		}

		$key = $segment['value'];

		if ( ! array_key_exists( $key, $data ) ) {
			return null;
		}

		$new_prefix = $this->append_to_path( $prefix, $key, $segment['type'] );

		return $this->resolve_with_binding( $segments, $data[ $key ], $new_prefix, $wildcard_values, $wildcard_index );
	}

	private function build_path_string( array $wildcard_values ): string {
		$path = '';

		foreach ( $wildcard_values as $entry ) {
			$path = $this->append_to_path( $path, $entry['key'], $entry['type'] );
		}

		return $path;
	}

	private function append_to_path( string $prefix, $key, string $type ): string {
		if ( 'index' === $type ) {
			return $prefix . '[' . $key . ']';
		}

		if ( '' === $prefix ) {
			return (string) $key;
		}

		return $prefix . '.' . $key;
	}

	private function set_recursive( array &$data, array $segments, $value ): void {
		$segment = array_shift( $segments );
		$key = $segment['value'];

		if ( empty( $segments ) ) {
			$data[ $key ] = $value;

			return;
		}

		if ( ! isset( $data[ $key ] ) || ! is_array( $data[ $key ] ) ) {
			$data[ $key ] = [];
		}

		$this->set_recursive( $data[ $key ], $segments, $value );
	}

	private function delete_recursive( array &$data, array $segments ): void {
		$segment = array_shift( $segments );
		$key = $segment['value'];

		if ( ! array_key_exists( $key, $data ) ) {
			return;
		}

		if ( empty( $segments ) ) {
			unset( $data[ $key ] );

			return;
		}

		if ( is_array( $data[ $key ] ) ) {
			$this->delete_recursive( $data[ $key ], $segments );
		}
	}

	private function rename_key_recursive( array &$data, array $segments, string $new_key ): void {
		$segment = array_shift( $segments );
		$key = $segment['value'];

		if ( ! array_key_exists( $key, $data ) ) {
			return;
		}

		if ( empty( $segments ) ) {
			$value = $data[ $key ];
			unset( $data[ $key ] );
			$data[ $new_key ] = $value;

			return;
		}

		if ( is_array( $data[ $key ] ) ) {
			$this->rename_key_recursive( $data[ $key ], $segments, $new_key );
		}
	}
}
