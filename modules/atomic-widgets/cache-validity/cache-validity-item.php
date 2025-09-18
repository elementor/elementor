<?php

namespace Elementor\Modules\AtomicWidgets\CacheValidity;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}


class Cache_Validity_Item {
	const CACHE_KEY_PREFIX = 'elementor_atomic_cache_validity-';

	private string $root;

	public function __construct( string $root ) {
		$this->root = $root;
	}

	public function get( array $keys ): ?array {
		$data = $this->get_stored_data();

		$node = $this->get_node( $data, $keys );

		if ( null === $node ) {
			return null;
		}

		return is_bool( $node ) ? [ 'state' => $node ] : $node;
	}

	public function validate( array $keys, $meta = null ) {
		$data = $this->get_stored_data();

		if ( empty( $keys ) ) {
			$data['state'] = true;
			$data['meta'] = $meta;

			$this->update_stored_data( $data );

			return;
		}

		$data = $this->get_data_with_placeholders( $data, $keys );

		$last_key = array_pop( $keys );
		$parent = &$this->get_node( $data, $keys );

		if ( ! isset( $parent['children'] ) ) {
			$parent['children'] = [];
		}

		$node = &$parent['children'][ $last_key ];

		if ( null !== $meta || ( is_array( $node ) && ! empty( $node['children'] ) ) ) {
			if ( is_bool( $node ) ) {
				$node = [ 'state' => $node ];
				$parent['children'][ $last_key ] = $node;
			}

			$node['state'] = true;

			if ( null !== $meta ) {
				$node['meta'] = $meta;
			}
		} else {
			$parent['children'][ $last_key ] = true;
		}

		$this->update_stored_data( $data );
	}

	public function invalidate( array $keys ) {
		$data = $this->get_stored_data();

		if ( empty( $keys ) ) {
			$this->delete_stored_data();

			return;
		}

		$last_key = array_pop( $keys );
		$parent = &$this->get_node( $data, $keys );

		if ( ! is_array( $parent ) ) {
			return;
		}

		if ( isset( $parent['children'] ) && count( $parent['children'] ) > 1 ) {
			// if parent has more children - simply unset the invalidated node from the parent's children.
			unset( $parent['children'][ $last_key ] );

			$this->update_stored_data( $data );
			return;
		}

		$data = &$this->get_data_without_placeholders( $data, $keys, $last_key );

		$this->update_stored_data( $data );
	}

	private function &get_data_without_placeholders( array &$data, array $keys, string $last_key ) {
		$remove_node = [
			'key' => null,
			'node' => null,
		];

		if ( ! isset( $data['children'] ) || $this->is_placeholder_node( $data ) ) {
			$remove_node['node'] = &$data;
		}

		$current = &$data;
		$parent = &$current;

		while ( ! empty( $keys ) ) {
			$key = array_shift( $keys );
			$parent = &$current;
			$current = &$current['children'][ $key ];

			if ( isset( $current['children'] ) && $this->is_placeholder_node( $current ) && empty( $remove_node['node'] ) ) {
				$remove_node = [
					'key' => $key,
					'node' => &$parent,
				];
			} elseif ( is_array( $current ) && ! $this->is_placeholder_node( $current ) ) {
				$remove_node = [
					'key' => null,
					'node' => null,
				];
			}
		}

		if ( $remove_node['node'] ) {
			if ( $remove_node['key'] ) {
				unset( $remove_node['node']['children'][ $remove_node['key'] ] );
			} else {
				unset( $data['children'] );
			}
		} elseif ( $parent ) {
			unset( $parent['children'][ $last_key ] );
		}

		return $data;
	}

	/**
	 * @param array{state: boolean, meta: array<string, mixed> | null, children: array<string, self>} | boolean $data
	 * @param array<string>                                                                                     $keys
	 * @return array<array{state: boolean, meta: array<string, mixed> | null, children: array<string, self>} | boolean | null>
	 */
	private function get_data_with_placeholders( array $data, array $keys ): ?array {
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

	private function is_placeholder_node( $data ): bool {
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
	 * @param string $data
	 */
	private function update_stored_data( $data ) {
		update_option( self::CACHE_KEY_PREFIX . $this->root, $data, false );
	}

	private function delete_stored_data() {
		delete_option( self::CACHE_KEY_PREFIX . $this->root );
	}
}
