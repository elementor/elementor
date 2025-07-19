<?php

namespace Elementor\Modules\AtomicWidgets;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

const CACHE_KEY_PREFIX = 'elementor_atomic_cache_validity-';

class Cache_Validity {

	public function is_valid( array $keys ): bool {
		$root = array_shift( $keys );

		$state_item = get_option( CACHE_KEY_PREFIX . $root, null );

		if ( ! empty( $keys ) ) {
			if ( ! $state_item ) {
				return false;
			}

			$state_item = $this->get_nested_item( $state_item, $keys );
		}

		return $state_item ? $state_item['state'] : false;
	}

	public function invalidate( array $keys ): void {
		$root = array_shift( $keys );

		$state_item = get_option( CACHE_KEY_PREFIX . $root, [
			'state' => false,
			'children' => [],
		] );

		$current_item = &$state_item;

		if ( ! empty( $keys ) ) {
			$current_item = &$this->get_nested_item( $current_item, $keys );
		}

		$current_item['state'] = false;

		$this->invalidate_nested_items( $current_item );

		update_option( CACHE_KEY_PREFIX . $root, $state_item );
	}

	public function validate( array $keys ): void {
		$root = array_shift( $keys );

		$state_item = get_option( CACHE_KEY_PREFIX . $root, [
			'state' => false,
			'children' => [],
		] );

		$current_item = &$state_item;

		if ( ! empty( $keys ) ) {
			$current_item = &$this->get_nested_item( $current_item, $keys );
		}

		$current_item['state'] = true;

		update_option( CACHE_KEY_PREFIX . $root, $state_item );
	}


	/**
	 * @param array{state: boolean, children: array<string, self>} $root_item
	 * @param array<string> $keys
	 * @return array{state: boolean, children: array<string, self>}
	 */
	private function &get_nested_item( array &$root_item, array $keys ): array {
		$current_item = &$root_item;

		while ( ! empty( $keys ) ) {
			$key = array_shift( $keys );

			if ( ! isset( $current_item['children'][ $key ] ) ) {
				$current_item['children'][ $key ] = [
					'state' => false,
					'children' => [],
				];
			}

			$current_item = &$current_item['children'][ $key ];
		}

		return $current_item;
	}

	private function invalidate_nested_items( array &$root_item ): void {
		foreach ( $root_item['children'] as &$child_item ) {
			$child_item['state'] = false;

			$this->invalidate_nested_items( $child_item );
		}
	}
}
