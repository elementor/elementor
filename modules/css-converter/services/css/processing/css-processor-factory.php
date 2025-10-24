<?php
namespace Elementor\Modules\CssConverter\Services\Css\Processing;

use Elementor\Modules\CssConverter\Services\Css\Processing\Contracts\Css_Processor_Interface;
use Elementor\Modules\CssConverter\Services\Css\Processing\Contracts\Css_Processing_Context;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Css_Processor_Factory {

	private static $registry = null;

	public static function get_registry(): Css_Processor_Registry {
		if ( null === self::$registry ) {
			self::$registry = new Css_Processor_Registry();
		}

		return self::$registry;
	}

	public static function execute_css_processing( Css_Processing_Context $context ): Css_Processing_Context {
		file_put_contents( '/Users/janvanvlastuin1981/Local Sites/elementor/app/public/wp-content/debug-processor.log', 'FACTORY: execute_css_processing() called' . "\n", FILE_APPEND );
		
		error_log( 'DEBUG: FACTORY - execute_css_processing() called' );
		$registry = self::get_registry();
		error_log( 'DEBUG: FACTORY - Registry obtained, calling execute_pipeline()' );
		
		file_put_contents( '/Users/janvanvlastuin1981/Local Sites/elementor/app/public/wp-content/debug-processor.log', 'FACTORY: About to call registry->execute_pipeline()' . "\n", FILE_APPEND );
		$result = $registry->execute_pipeline( $context );
		file_put_contents( '/Users/janvanvlastuin1981/Local Sites/elementor/app/public/wp-content/debug-processor.log', 'FACTORY: Pipeline execution complete' . "\n", FILE_APPEND );
		
		error_log( 'DEBUG: FACTORY - Pipeline execution complete' );
		return $result;
	}

	public static function register_processor( Css_Processor_Interface $processor ): void {
		$registry = self::get_registry();
		$registry->register( $processor );
	}

	public static function get_statistics( Css_Processing_Context $context ): array {
		$registry = self::get_registry();
		return $registry->get_statistics( $context );
	}

	public static function reset_registry(): void {
		self::$registry = null;
	}
}
