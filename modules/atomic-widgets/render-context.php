<?php

namespace Elementor\Modules\AtomicWidgets;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Render_Context {
	private static $context_stack = [];

	public static function push( string $key, array $context ): void {
		if ( ! isset( self::$context_stack[ $key ] ) ) {
			self::$context_stack[ $key ] = [];
		}

		self::$context_stack[ $key ][] = $context;
	}

	public static function pop( string $key ): void {
		if ( isset( self::$context_stack[ $key ] ) && ! empty( self::$context_stack[ $key ] ) ) {
			array_pop( self::$context_stack[ $key ] );
		}
	}

	public static function get( string $key ): array {
		if ( ! isset( self::$context_stack[ $key ] ) || empty( self::$context_stack[ $key ] ) ) {
			return [];
		}

		return end( self::$context_stack[ $key ] );
	}

	public static function clear(): void {
		self::$context_stack = [];
	}
}

