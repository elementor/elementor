<?php

namespace Elementor\Modules\AtomicWidgets\CacheValidity;

use Elementor\Modules\AtomicWidgets\CacheValidity\Cache_Validity_Item;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}


class Cache_Validity {
	/**
	 * @param array<string> $keys
	 * @return bool
	 */
	public function is_valid( $keys ): bool {
		$root = array_shift( $keys );
		$cache_item = new Cache_Validity_Item( $root );

		$item = $cache_item->get( $keys );

		if ( ! $item ) {
			return false;
		}

		return $item['state'] ?? false;
	}

	/**
	 * @param array<string> $keys
	 * @return mixed | null
	 */
	public function get_meta( array $keys ) {
		$root = array_shift( $keys );
		$cache_item = new Cache_Validity_Item( $root );

		$item = $cache_item->get( $keys );

		if ( ! $item || is_bool( $item ) ) {
			return null;
		}

		return $item['meta'] ?? null;
	}

	/**
	 * @param array<string> $keys
	 * @param mixed | null  $meta
	 * @return void
	 */
	public function validate( $keys, $meta = null ): void {
		$root = array_shift( $keys );
		$cache_item = new Cache_Validity_Item( $root );

		$cache_item->validate( $keys, $meta );
	}

	/**
	 * @param array<string> $keys
	 * @return void
	 */
	public function invalidate( array $keys ): void {
		$root = array_shift( $keys );
		$cache_item = new Cache_Validity_Item( $root );

		$cache_item->invalidate( $keys );
	}

	/**
	 * @param array<string> $keys
	 * @return array{state: boolean, meta: array<string, mixed> | null, children: array<string, self>} | null
	 */
	public function get_node( array $keys ): ?array {
		$root = array_shift( $keys );
		$cache_item = new Cache_Validity_Item( $root );

		return $cache_item->get( $keys );
	}
}
