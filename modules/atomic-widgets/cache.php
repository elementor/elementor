<?php

namespace Elementor\Modules\AtomicWidgets;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Cache {
	private array $cache = [];

	public function cache( string $key, callable $callback ) {
		return function() use ( $key, $callback ) {
			if ( array_key_exists( $key, $this->cache ) ) {
				return $this->cache[ $key ];
			}

			$this->cache[ $key ] = call_user_func( $callback );
			return $this->cache[ $key ];
		};
	}
}
