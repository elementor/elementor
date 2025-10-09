<?php

namespace Elementor\Modules\AtomicWidgets\CacheValidity;

use Elementor\Utils;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}


class Cache_Validity_Item {
	const CACHE_KEY_PREFIX = 'elementor_atomic_cache_validity__';

	private string $root;

	public function __construct( string $root ) {
		$this->root = $root;
	}

	public function get( array $keys ): ?array {
		return $this->wrap_exception( function() use ( $keys ) {
			$data = $this->get_stored_data();

			$node = $this->get_node( $data, $keys );

			if ( null === $node ) {
				return null;
			}

			return is_bool( $node ) ? [ 'state' => $node ] : $node;
		} );
	}

	public function validate( array $keys, $meta = null ) {
		return $this->wrap_exception( function() use ( $keys, $meta ) {
			$data = $this->get_stored_data();

			if ( empty( $keys ) ) {
				$data['state'] = true;
				$data['meta'] = $meta;

				$this->update_stored_data( $data );

				return;
			}

			$this->validate_nested_node( $data, $keys, $meta );
		} );
	}

	public function invalidate( array $keys ) {
		return $this->wrap_exception( function() use ( $keys ) {
			if ( empty( $keys ) ) {
				$this->delete_stored_data();

				return;
			}

			$data = $this->get_stored_data();

			$this->invalidate_nested_node( $data, $keys );
		} );
	}

	/**
	 * @param array{state: boolean, meta: array<string, mixed> | null, children: array<string, self>} | boolean $data
	 * @param array<string>                                                                                     $keys
	 * @param mixed | null                                                                                      $meta
	 */
	private function validate_nested_node( array $data, array $keys, $meta = null ) {
		$data = $this->ensure_path( $data, $keys );

		$last_key = array_pop( $keys );

		// parent is guaranteed to be an array as we send the full $keys array to ensure_path
		$parent = &$this->get_node( $data, $keys );

		$old_node = &$parent['children'][ $last_key ];

		$has_children = is_array( $old_node ) && ! empty( $old_node['children'] );

		if ( null === $meta && ! $has_children ) {
			$parent['children'][ $last_key ] = true;

			$this->update_stored_data( $data );
			return;
		}

		$new_node = [
			'state' => true,
		];

		if ( $has_children ) {
			$new_node['children'] = $old_node['children'];
		}

		if ( null !== $meta ) {
			$new_node['meta'] = $meta;
		}

		$parent['children'][ $last_key ] = $new_node;

		$this->update_stored_data( $data );
	}

	/**
	 * @param array{state: boolean, meta: array<string, mixed> | null, children: array<string, self>} | boolean $data
	 * @param array<string>                                                                                     $keys
	 */
	private function invalidate_nested_node( array $data, array $keys ) {
		$last_key = array_pop( $keys );
		$parent = &$this->get_node( $data, $keys );

		if ( ! is_array( $parent ) || ! isset( $parent['children'][ $last_key ] ) ) {
			// node doesn't exist - no need to do anything
			return;
		}

		if ( count( $parent['children'] ) === 1 ) {
			// if the invalidated node is the parent's o nly child - normalize the data
			$data = $this->get_normalized_data( $data, $keys, $last_key );

			$this->update_stored_data( $data );
			return;
		}

		unset( $parent['children'][ $last_key ] );

		$this->update_stored_data( $data );
	}

	/**
	 * @param array{state: boolean, meta: array<string, mixed> | null, children: array<string, self>} $data
	 * @param array<string>                                                                           $keys
	 * @param string                                                                                  $last_key
	 * @return array{state: boolean, meta: array<string, mixed> | null, children: array<string, self>}
	 */
	private function get_normalized_data( array $data, array $keys, string $last_key ) {
		$obsolete_root_params = &$this->find_empty_parents_path_root( $data, $keys, $last_key );
		$parent = &$this->get_node( $data, $keys );

		if ( $obsolete_root_params['node'] && $obsolete_root_params['key'] ) {
			unset( $obsolete_root_params['node']['children'][ $obsolete_root_params['key'] ] );

			return $data;
		}

		if ( $obsolete_root_params['node'] ) {
			unset( $data['children'] );

			return $data;
		}

		if ( $parent ) {
			unset( $parent['children'][ $last_key ] );
		}

		return $data;
	}

	/**
	 * @param array{state: boolean, meta: array<string, mixed> | null, children: array<string, self>} | boolean $data
	 * @param array<string>                                                                                     $keys
	 * @return array{key: string | null, node: array{state: boolean, meta: array<string, mixed> | null, children: array<string, self>} | null}
	 */
	private function &find_empty_parents_path_root( array &$data, array $keys ) {
		$root_node = [
			'key' => null,
			'node' => null,
		];

		$current = &$data;
		$parent = &$current;

		while ( ! empty( $keys ) ) {
			$key = array_shift( $keys );
			$parent = &$current;
			$current = &$current['children'][ $key ];

			if ( $this->is_empty_parent( $current ) && empty( $root_node['node'] ) ) {
				$root_node = [
					'key' => $key,
					'node' => &$parent,
				];
			} elseif ( is_array( $current ) && ! $this->is_empty_parent( $current ) ) {
				$root_node = [
					'key' => null,
					'node' => null,
				];
			}
		}

		return $root_node;
	}

	/**
	 * Retrieves the stored tree, guaranteed to have a path representation based on $keys
	 *
	 * @param array{state: boolean, meta: array<string, mixed> | null, children: array<string, self>} | boolean $data
	 * @param array<string>                                                                                     $keys
	 * @return array{state: boolean, meta: array<string, mixed> | null, children: array<string, self>}
	 */
	private function ensure_path( array $data, array $keys ): ?array {
		$current = &$data;

		while ( ! empty( $keys ) ) {
			$key = array_shift( $keys );

			if ( is_bool( $current ) ) {
				$current = [ 'state' => $current ];
			}

			if ( ! isset( $current['children'] ) ) {
				$current['children'] = [];
			}

			if ( ! isset( $current['children'][ $key ] ) ) {
				$current['children'][ $key ] = [ 'state' => false ];
			}

			$current = &$current['children'][ $key ];
		}

		return $data;
	}

	/**
	 * @param array{state: boolean, meta: array<string, mixed> | null, children: array<string, self>} | boolean $data
	 * @param array<string>                                                                                     $keys
	 * @return array<array{state: boolean, meta: array<string, mixed> | null, children: array<string, self>} | boolean | null> | null | boolean
	 */
	private function &get_node( array &$data, array $keys ) {
		$current = &$data;

		while ( ! empty( $keys ) ) {
			$key = array_shift( $keys );

			if ( isset( $current['children'][ $key ] ) ) {
				$current = &$current['children'][ $key ];
			} else {
				$current = null;
			}
		}

		return $current;
	}

	private function is_empty_parent( $data ): bool {
		if ( ! is_array( $data ) ) {
			return false;
		}

		return ( ! isset( $data['children'] ) || 1 === count( $data['children'] ) ) && ! $data['state'];
	}

	/**
	 * @return array{state: boolean, meta: array<string, mixed> | null, children: array<string, self>}
	 */
	private function get_stored_data() {
		return get_option( self::CACHE_KEY_PREFIX . $this->root, [ 'state' => false ] );
	}

	/**
	 * @param array{state: boolean, meta: array<string, mixed> | null, children: array<string, self>} $data
	 */
	private function update_stored_data( $data ) {
		// setting autoload with false to avoid unnecessary memory usage
		update_option( self::CACHE_KEY_PREFIX . $this->root, $data, false );
	}

	private function delete_stored_data() {
		delete_option( self::CACHE_KEY_PREFIX . $this->root );
	}

	private function wrap_exception( callable $callback ) {
		try {
			return $callback();
		} catch ( \Exception $e ) {
			$this->delete_stored_data();
		}
	}
}
