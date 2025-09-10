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
			if ( ! $state_item || 'boolean' === gettype( $state_item ) ) {
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

		if ( ! $state_item || 'boolean' === gettype( $state_item ) ) {
			return null;
		}

		$state_item = $this->get_nested_item( $state_item, $keys );

		return isset( $state_item['meta'] ) ? $state_item['meta'] : null;
	}

	public function invalidate( array $keys ): void {
		$root = array_shift( $keys );

		$state_item = $this->get_stored_data( $root );

		if ( 'boolean' === gettype( $state_item ) && empty( $keys ) ) {
			$state_item = false;

			$this->update_stored_data( $root, $state_item );

			return;
		}

		$current_item = &$state_item;

		if ( ! empty( $keys ) ) {
			if ( ! $state_item || 'boolean' === gettype( $state_item ) ) {
				return;
			}

			$current_item = &$this->get_nested_item( $current_item, $keys );
		}

		if ( 'boolean' === gettype( $current_item ) ) {
			$current_item = false;
		} else {
			$current_item['state'] = false;

			unset( $current_item['meta'] );
			unset( $current_item['children'] );
		}

		$this->update_stored_data( $root, $state_item );
	}

	public function validate( array $keys, $meta = null ): void {
		$root = array_shift( $keys );

		$state_item = $this->get_stored_data( $root );

		if ( 'boolean' === gettype( $state_item ) && ! empty( $keys ) ) {
			$state_item = [
				'state' => $state_item,
			];
		}

		$current_item = &$state_item;

		if ( ! empty( $keys ) ) {
			$current_item = &$this->get_nested_item( $current_item, $keys );
		}

		if ( 'boolean' === gettype( $current_item ) && null === $meta ) {
			$current_item = true;

			$this->update_stored_data( $root, $state_item );

			return;
		}

		$current_item['state'] = true;

		if ( null === $meta ) {
			unset( $current_item['meta'] );
		} else {
			$current_item['meta'] = $meta;
		}

		$this->update_stored_data( $root, $state_item );
	}

	public function clear( array $keys ): void {
		$root = array_shift( $keys );
		$last_key = array_pop( $keys );

		$state_item = $this->get_stored_data( $root );

		if ( 'boolean' === gettype( $state_item ) && ! empty( $keys ) ) {
			if ( empty( $keys ) ) {
				$this->delete_stored_data( $root );

				return;
			}

			$state_item = [
				'state' => $state_item,
			];
		}

		$current_item = &$state_item;

		if ( ! empty( $keys ) ) {
			$current_item = &$this->get_nested_item( $current_item, $keys );
		}

		if ( empty( $current_item['children'] ) ) {
			return;
		}

		unset( $current_item['children'][ $last_key ] );

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
		return get_option( self::CACHE_KEY_PREFIX . $root, false );
	}

	private function update_stored_data( string $root, $data ) {
		update_option( self::CACHE_KEY_PREFIX . $root, $data, false );
	}

	private function delete_stored_data( string $root ) {
		delete_option( self::CACHE_KEY_PREFIX . $root );
	}
}
