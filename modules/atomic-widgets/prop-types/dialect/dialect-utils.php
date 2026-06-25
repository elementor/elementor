<?php

namespace Elementor\Modules\AtomicWidgets\PropTypes\Dialect;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Dialect_Utils {
	private const OMIT_SIGNAL = '__dialect_omit__';

	public static function omit(): string {
		return self::OMIT_SIGNAL;
	}

	public static function is_omit( $value ): bool {
		return self::OMIT_SIGNAL === $value;
	}
}
