<?php

namespace Elementor\Modules\AtomicWidgets\Utils;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Atomic_Prop_Remap_Registry {
	/**
	 * @var array<string, callable>
	 */
	private static array $handlers = [];

	public static function register( string $type, callable $handler ): void {
		self::$handlers[ $type ] = $handler;
	}

	public static function get( string $type ): ?callable {
		return self::$handlers[ $type ] ?? null;
	}

	public static function has( string $type ): bool {
		return isset( self::$handlers[ $type ] );
	}

	public static function reset(): void {
		self::$handlers = [];
	}
}
