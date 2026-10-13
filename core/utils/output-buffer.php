<?php
namespace Elementor\Core\Utils;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Output_Buffer {

	private const MAX_ITERATIONS = 100;

	public static function discard_all(): void {
		$iterations = 0;
		$max_iterations = min( self::MAX_ITERATIONS, ob_get_level() + 1 );

		while ( ob_get_level() > 0 && $iterations < $max_iterations ) {
			$level_before = ob_get_level();

			@ob_end_clean();

			if ( ob_get_level() >= $level_before ) {
				break;
			}

			++$iterations;
			$max_iterations = min( self::MAX_ITERATIONS, ob_get_level() + 1 );
		}

		if ( ob_get_level() > 0 ) {
			@ob_clean();
		}
	}
}
