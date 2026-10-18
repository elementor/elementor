<?php

namespace Elementor\Modules\DataFlow;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Binding_Collector {
	const MARK = "\u{2060}";

	private static array $stack = [];

	public static function begin(): void {
		self::$stack[] = [];
	}

	public static function end(): array {
		return array_pop( self::$stack ) ?? [];
	}

	public static function bindings(): array {
		return empty( self::$stack ) ? [] : end( self::$stack );
	}

	public static function wrap( array $binding, string $text ): string {
		if ( empty( self::$stack ) ) {
			return $text;
		}

		$id = count( self::$stack[ array_key_last( self::$stack ) ] );
		self::$stack[ array_key_last( self::$stack ) ][] = $binding;

		return self::MARK . 'e' . $id . self::MARK . $text . self::MARK . '/e' . $id . self::MARK;
	}

	public static function pattern(): string {
		return '/' . self::MARK . 'e(\d+)' . self::MARK . '(.*?)' . self::MARK . '\/e\1' . self::MARK . '/su';
	}
}
