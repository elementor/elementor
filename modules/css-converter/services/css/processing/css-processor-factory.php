<?php
namespace Elementor\Modules\CssConverter\Services\Css\Processing;

use Elementor\Modules\CssConverter\Services\Css\Processing\Contracts\Css_Processor_Interface;
use Elementor\Modules\CssConverter\Services\Css\Processing\Contracts\Css_Processing_Context;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Css_Processor_Factory {

	private static $registry = null;
	private static $processors_registered = false;

	public static function get_registry(): Css_Processor_Registry {
		if ( null === self::$registry ) {
			self::$registry = new Css_Processor_Registry();
		}

		return self::$registry;
	}

	public static function execute_css_processing( Css_Processing_Context $context ): Css_Processing_Context {
		$registry = self::get_registry();
		
		// Register all processors in the correct execution order (only if not already registered)
		if ( ! self::$processors_registered ) {
			self::register_all_processors( $registry );
			self::$processors_registered = true;
		}
		
		return $registry->execute_pipeline( $context );
	}

	private static function register_all_processors( Css_Processor_Registry $registry ): void {
		// Create property converter for processors that need it
		require_once __DIR__ . '/css-property-conversion-service.php';
		$property_converter = new \Elementor\Modules\CssConverter\Services\Css\Processing\Css_Property_Conversion_Service();

		// Register processors in dependency order (relying on autoloading)
		$processors = [
			new \Elementor\Modules\CssConverter\Services\Css\Processing\Processors\Css_Parsing_Processor(),                      // 1. Parse CSS
			new \Elementor\Modules\CssConverter\Services\Css\Processing\Processors\Css_Variables_Processor(),                    // 2. Extract variables
			new \Elementor\Modules\CssConverter\Services\Css\Processing\Processors\Rule_Classification_Processor(),              // 3. Classify rules
			new \Elementor\Modules\CssConverter\Services\Css\Processing\Processors\Id_Selector_Processor( $property_converter ), // 4. Process ID selectors ✅
			new \Elementor\Modules\CssConverter\Services\Css\Processing\Processors\Nested_Selector_Flattening_Processor(),       // 5. Flatten nested selectors ✅
			new \Elementor\Modules\CssConverter\Services\Css\Processing\Processors\Compound_Class_Selector_Processor(),          // 6. Process compound selectors ✅
			new \Elementor\Modules\CssConverter\Services\Css\Processing\Processors\Style_Collection_Processor(),                 // 7. Collect styles
			new \Elementor\Modules\CssConverter\Services\Css\Processing\Processors\Global_Classes_Processor(),                   // 8. Create global classes
			new \Elementor\Modules\CssConverter\Services\Css\Processing\Processors\Html_Class_Modifier_Processor(),              // 9. Modify HTML classes
			new \Elementor\Modules\CssConverter\Services\Css\Processing\Processors\Style_Resolution_Processor(),                 // 10. Resolve final styles
		];

		foreach ( $processors as $processor ) {
			$processor_name = $processor->get_processor_name();
			if ( ! $registry->has_processor( $processor_name ) ) {
				$registry->register( $processor );
			}
		}
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
		self::$processors_registered = false;
	}
}
