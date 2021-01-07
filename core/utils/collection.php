<?php
/**
 * Inspired by Laravel Collection.
 * @link https://github.com/illuminate/collections
 */
namespace Elementor\Core\Utils;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Collection implements \ArrayAccess, \Countable, \IteratorAggregate {
	/**
	 * The items contained in the collection.
	 *
	 * @var array
	 */
	protected $items;

	/**
	 * Collection constructor.
	 *
	 * @param array $items
	 */
	public function __construct( array $items ) {
		$this->items = $items;
	}

	/**
	 * @param callable|null $callback
	 *
	 * @return $this
	 */
	public function filter( callable $callback = null ) {
		if ( ! $callback ) {
			return new static( array_filter( $this->items ) );
		}

		return new static( array_filter( $this->items, $callback, ARRAY_FILTER_USE_BOTH ) );
	}

	/**
	 * @param $items
	 *
	 * @return $this
	 */
	public function merge( $items ) {
		if ( $items instanceof Collection ) {
			$items = $items->all();
		}

		return new static( array_merge( $this->items, $items ) );
	}

	/**
	 * Merge array recursively
	 *
	 * @param $items
	 *
	 * @return $this
	 */
	public function merge_recursive( $items ) {
		if ( $items instanceof Collection ) {
			$items = $items->all();
		}

		return new static( array_merge_recursive( $this->items, $items ) );
	}

	/**
	 * Implode the items
	 *
	 * @param $glue
	 *
	 * @return string
	 */
	public function implode( $glue ) {
		return implode( $glue, $this->items );
	}

	/**
	 * Run a map over each of the items.
	 *
	 * @param  callable  $callback
	 * @return $this
	 */
	public function map( callable $callback ) {
		$keys = array_keys( $this->items );

		$items = array_map( $callback, $this->items, $keys );

		return new static( array_combine( $keys, $items ) );
	}

	/**
	 * @param callable $callback
	 *
	 * @return $this
	 */
	public function map_with_keys( callable $callback ) {
		$result = [];

		foreach ( $this->items as $key => $value ) {
			$assoc = $callback( $value, $key );

			foreach ( $assoc as $map_key => $map_value ) {
				$result[ $map_key ] = $map_value;
			}
		}

		return new static( $result );
	}

	/**
	 * Get all items except for those with the specified keys.
	 *
	 * @param array $keys
	 *
	 * @return $this
	 */
	public function except( array $keys ) {
		return $this->filter( function ( $value, $key ) use ( $keys ) {
			return ! in_array( $key, $keys, true );
		} );
	}

	/**
	 * Get the items with the specified keys.
	 *
	 * @param array $keys
	 *
	 * @return $this
	 */
	public function only( array $keys ) {
		return $this->filter( function ( $value, $key ) use ( $keys ) {
			return in_array( $key, $keys, true );
		} );
	}

	/**
	 * @return array
	 */
	public function keys() {
		return array_keys( $this->items );
	}

	/**
	 * @return bool
	 */
	public function is_empty() {
		return empty( $this->items );
	}

	/**
	 * @return array
	 */
	public function all() {
		return $this->items;
	}

	/**
	 * @param mixed $key
	 *
	 * @return bool
	 */
	public function offsetExists( $key ) {
		return isset( $this->items[ $key ] );
	}

	/**
	 * @param mixed $key
	 *
	 * @return mixed
	 */
	public function offsetGet( $key ) {
		return $this->items[ $key ];
	}

	/**
	 * @param mixed $key
	 * @param mixed $value
	 */
	public function offsetSet( $key, $value ) {
		if ( is_null( $key ) ) {
			$this->items[] = $value;
		} else {
			$this->items[ $key ] = $value;
		}
	}

	/**
	 * @param mixed $key
	 */
	public function offsetUnset( $key ) {
		unset( $this->items[ $key ] );
	}

	/**
	 * @return \ArrayIterator|\Traversable
	 */
	public function getIterator() {
		return new \ArrayIterator( $this->items );
	}

	/**
	 * @return int|void
	 */
	public function count() {
		return count( $this->items );
	}
}
