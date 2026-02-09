<?php

namespace Elementor\Core\Utils;

/**
 * @class Registry
 * @template T
 */
class Registry {

	const DEFAULT_NAMESPACE = 'default';

	private static $namespaced_registries = [];
	private $store = [];

	/**
	 * @return Registry<T>
	 */
	public static function instance( string $ns = self::DEFAULT_NAMESPACE ) {
		if ( ! isset( self::$namespaced_registries[ $ns ] ) ) {
			self::$namespaced_registries[ $ns ] = new self();
		}
		return static::$namespaced_registries[ $ns ];
	}

	public static function get_value( string $ns, string $key, mixed $default = null ) {
		return self::instance( $ns )->get( $key ) ?? $default;
	}

	/**
	 * @param string $key
	 * @return T | null
	 */
	public function get( string $key ) {
		return $this->store[ $key ] ?? null;
	}

	/**
	 * @param string $key
	 * @param mixed  $value
	 */
	public function set( string $key, mixed $value ) {
		$this->store[ $key ] = $value;
	}

	public function has( string $key ) : bool {
		return isset( $this->store[ $key ] );
	}

	public function get_all() {
		return array_merge( $this->store );
	}
}
