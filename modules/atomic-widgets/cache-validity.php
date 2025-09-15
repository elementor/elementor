<?php

namespace Elementor\Modules\AtomicWidgets;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}


class Cache_Validity {
	const CACHE_KEY_PREFIX = 'elementor_atomic_cache_validity-';

	public function is_valid( array $keys ): bool {
		$root = array_shift( $keys );

		$state_item = $this->get_stored_data( $root );

		if ( ! empty( $keys ) ) {
			if ( ! isset( $state_item['children'] ) ) {
				return false;
			}

			$state_item = $this->get_nested_item( $state_item, $keys );
		}

		if ( 'boolean' === gettype( $state_item ) ) {
			return $state_item;
		}

		return isset( $state_item['state'] ) ? $state_item['state'] : false;
	}

	public function get_meta( array $keys ) {
		$root = array_shift( $keys );

		$state_item = $this->get_stored_data( $root );

		$state_item = $this->get_nested_item(
			$state_item,
			$keys,
		);

		return isset( $state_item['meta'] ) ? $state_item['meta'] : null;
	}

	public function invalidate( array $keys ): void {
		$root = array_shift( $keys );
		$state_item = $this->get_stored_data( $root );

		if ( empty( $keys ) ) {
			$this->delete_stored_data( $root );

			return;
		}

		$last_key = array_pop( $keys );

		$current_item = &$this->get_nested_item( $state_item, $keys );

		if ( $this->is_leaf( $current_item ) ) {
			return;
		}

		unset( $current_item['children'][ $last_key ] );

		if ( empty( $current_item['children'] ) ) {
			unset( $current_item['children'] );
		}

		$this->update_stored_data( $root, $state_item );
	}

	public function validate( array $keys, $meta = null ): void {
		$root = array_shift( $keys );

		$state_item = $this->get_stored_data( $root );

		if ( empty( $keys ) ) {
			$state_item['state'] = true;

			$this->update_stored_data( $root, $state_item );

			return;
		}

		$current_item = &$this->get_nested_item( $state_item, $keys );

		if ( $this->is_leaf( $current_item ) && null === $meta ) {
			// Leaf nodes with no meta should just be a boolean value instead of an array
			$this->validate_primitive_leaf_node( $state_item, $root, $keys );

			return;
		}

		if ( null === $meta ) {
			unset( $current_item['meta'] );
		} else {
			$current_item = [
				'state' => true,
				'meta' => $meta,
			];
		}

		$this->update_stored_data( $root, $state_item );
	}

	private function is_leaf( $item ): bool {
		return ! is_array( $item ) || ! isset( $item['children'] ) || empty( $item['children'] );
	}

	private function validate_empty_root_node( array &$state_item, string $root, $meta = null ) {
		$data = [
			'state' => true,

		];

		if ( 'boolean' === gettype( $state_item ) ) {
			$data['state'] = $state_item;
		}

		if ( null !== $meta && 'boolean' === gettype( $state_item ) ) {
			$data = $meta;
		}

		$this->update_stored_data( $root, $data );
	}

	private function validate_primitive_leaf_node( array &$state_item, string $root, array $keys = [] ) {
		$last_key = array_pop( $keys );
		$parent_item = &$state_item;

		if ( ! empty( $keys ) ) {
			$parent_item = &$this->get_nested_item( $parent_item, $keys );
		}

		$parent_item['children'][ $last_key ] = true;

		$this->update_stored_data( $root, $state_item );
	}

	/**
	 * @param array{state: boolean, meta: array<string, mixed> | null, children: array<string, self>} $root_item
	 * @param array<string>                                                                           $keys
	 * @return array{state: boolean, meta: array<string, mixed> | null, children: array<string, self>} | boolean
	 */
	private function &get_nested_item( array &$root_item, array $keys ) {
		$current_item = &$root_item;

		while ( ! empty( $keys ) ) {
			$key = array_shift( $keys );

			if ( 'boolean' === gettype( $current_item ) ) {
				$current_item = [
					'state' => $current_item,
				];
			}

			if ( ! isset( $current_item['children'] ) ) {
				$current_item['children'] = [];
			}

			if ( ! isset( $current_item['children'][ $key ] ) ) {
				$current_item['children'][ $key ] = [
					'state' => false,
				];
			}

			$current_item = &$current_item['children'][ $key ];
		}

		return $current_item;
	}

	/**
	 * @param string $root
	 * @return array{state: boolean, meta: array<string, mixed> | null, children: array<string, self>} | boolean
	 */
	private function get_stored_data( string $root ) {
		return get_option( self::CACHE_KEY_PREFIX . $root, [ 'state' => false ] );
	}

	private function update_stored_data( string $root, $data ) {
		update_option( self::CACHE_KEY_PREFIX . $root, $data, false );
	}

	private function delete_stored_data( string $root ) {
		delete_option( self::CACHE_KEY_PREFIX . $root );
	}
}
