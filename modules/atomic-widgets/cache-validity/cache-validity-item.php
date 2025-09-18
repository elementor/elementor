<?php

namespace Elementor\Modules\AtomicWidgets\CacheValidity;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}


class Cache_Validity_Item {
	const CACHE_KEY_PREFIX = 'elementor_atomic_cache_validity-';

	private string $root;

	function __construct( string $root ) {
		$this->root = $root;
	}

	public function get( array $keys ): ?array {
		$data = $this->get_stored_data();

		[ $data, $nodes ] = $this->get_nodes_on_path( $data, $keys );
		$node = array_reverse( $nodes )[0]['node'] ?? false;

		return is_bool( $node ) ? [ 'state' => $node ] : $node;
	}

	public function validate( array $keys, $meta = null ) {
		$data = $this->get_stored_data();
		[ $data, $nodes ] = $this->get_nodes_on_path( $data, $keys, true );
		// $nodes = array_reverse( $nodes );

		$item = array_pop( $nodes );

		if ( null === $item ) {
			return;
		}

		if ( empty( $keys ) ) {
			$data['state'] = true;
			$data['meta'] = $meta;

			// echo PHP_EOL . 'validate root' . PHP_EOL;
			// echo PHP_EOL . 'root data: ' . json_encode( $data, JSON_PRETTY_PRINT ) . PHP_EOL;
			// echo PHP_EOL . '-----' . PHP_EOL;

			$this->update_stored_data( $data );
			return;
		}

		$parent_node = $item['parent_node'];
		$node = $item['node'];
		[ 'key' => $node_key ] = $nodes[0] ?? null;

		if ( null === $meta && empty( $node['children'] ) ) {
			$parent_node['children'][ $node_key ] = true;
		} else {
			$node['state'] = true;

			if ( null !== $meta ) {
				$node['meta'] = $meta;
			} else {
				unset( $node['meta'] );
			}
		}

		echo PHP_EOL . 'validate: ' . implode( ', ', $keys ) . PHP_EOL;
		echo PHP_EOL . 'data: ' . json_encode( $data, JSON_PRETTY_PRINT ) . PHP_EOL;
		echo PHP_EOL . '-----' . PHP_EOL;

		$this->update_stored_data( $data );
	}

	public function invalidate( array $keys ) {
		$data = $this->get_stored_data();
		[ $data, $nodes ] = $this->get_nodes_on_path( $data, $keys );
		$nodes = array_reverse( $nodes );
		$invalidated_item = array_shift( $nodes );
		$item_to_remove = $invalidated_item;

		if ( empty( $keys ) ) {
			$data['state'] = false;
			$data['meta'] = null;

			$this->update_stored_data( $data );
			return;
		}

		if ( ! $invalidated_item['node'] ) {
			return;
		}

		foreach ( $nodes as $node_data ) {
			if ( ! $this->is_placeholder_node( $node_data['node'] ) ) {
				break;
			}

			$item_to_remove = $node_data;
		}

		unset( $item_to_remove['parent_node']['children'][ $item_to_remove['key'] ] );

		echo PHP_EOL . 'invalidate: ' . implode( ', ', $keys ) . PHP_EOL;
		echo PHP_EOL . 'data: ' . json_encode( $data, JSON_PRETTY_PRINT ) . PHP_EOL;
		echo PHP_EOL . '-----' . PHP_EOL;

		$this->update_stored_data( $data );
	}

	/**
	 * @param array{state: boolean, meta: array<string, mixed> | null, children: array<string, self>} | boolean $data
	 * @param array<string>                                                                                     $keys
	 * @return array{key: string, node: array{state: boolean, meta: array<string, mixed> | null, children: array<string, self>} | boolean, parent_node: array{state: boolean, meta: array<string, mixed> | null, children: array<string, self>} | boolean}
	 */
	private function get_nodes_on_path( array $data, array $keys, ?bool $add_placeholder = false ): array {
		$current = &$data;

		$nodes = array_merge( array_map( function( $key ) use ( &$current, $add_placeholder ) {
			if ( null === $key ) {
				return [
					'key' => $key,
					'node' => &$current,
					'parent_node' => null,
				];
			}

			$parent = &$current;

			if ( $add_placeholder ) {
				if ( ! isset( $current['children'] ) ) {
					$current['children'] = [];
				}

				if ( ! isset( $current['children'][ $key ] ) ) {
					$current['children'][ $key ] = [ 'state' => false ];
				}
			}

			if ( isset( $current['children'][ $key ] ) ) {
				$current = &$current['children'][ $key ];
			} else {
				$current = null;
			}

			return [
				'key' => $key,
				'node' => &$current,
				'parent_node' => &$parent,
			];
		}, array_merge( [ null ], $keys ) ) );

		return [ $data, $nodes ];
	}

	private function is_placeholder_node( $data ): bool {
		return ( ! isset( $data['children'] ) || 1 === count( $data['children'] ) ) && ! $data['state'];
	}

	/**
	 * @param string $root
	 * @return array{state: boolean, meta: array<string, mixed> | null, children: array<string, self>} | boolean
	 */
	private function get_stored_data() {
		return get_option( self::CACHE_KEY_PREFIX . $this->root, [ 'state' => false ] );
	}

	private function update_stored_data( $data ) {
		update_option( self::CACHE_KEY_PREFIX . $this->root, $data, false );
	}

	private function delete_stored_data() {
		delete_option( self::CACHE_KEY_PREFIX . $this->root );
	}
}
