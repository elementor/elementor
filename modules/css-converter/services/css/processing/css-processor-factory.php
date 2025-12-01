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
			self::register_all_processors( self::$registry );
		}

		return self::$registry;
	}

	public static function execute_css_processing( Css_Processing_Context $context ): Css_Processing_Context {
		$registry = self::get_registry();
		$result = $registry->execute_pipeline( $context );

		return $result;
	}

	private static function register_all_processors( Css_Processor_Registry $registry ): void {
		$property_converter = new \Elementor\Modules\CssConverter\Services\Css\Processing\Css_Property_Conversion_Service();
		$specificity_calculator = new \Elementor\Modules\CssConverter\Services\Css\Processing\Css_Specificity_Calculator();
		$reset_style_detector = new \Elementor\Modules\CssConverter\Services\Css\Processing\Reset_Style_Detector( $specificity_calculator );

		$processors = [
			new \Elementor\Modules\CssConverter\Services\Css\Processing\Processors\Css_Parsing_Processor(),
			new \Elementor\Modules\CssConverter\Services\Css\Processing\Processors\Media_Query_Filter_Processor(),
			new \Elementor\Modules\CssConverter\Services\Css\Processing\Processors\Css_Variable_Registry_Processor(),
			new \Elementor\Modules\CssConverter\Services\Css\Processing\Processors\Css_Variable_Resolver(),
			new \Elementor\Modules\CssConverter\Services\Css\Processing\Processors\Container_Variable_Resolver(),
			new \Elementor\Modules\CssConverter\Services\Css\Processing\Processors\Widget_Class_Processor(),
			new \Elementor\Modules\CssConverter\Services\Css\Processing\Processors\Css_Variables_Processor(),
			new \Elementor\Modules\CssConverter\Services\Css\Processing\Processors\Id_Selector_Processor( $property_converter ),
			new \Elementor\Modules\CssConverter\Services\Css\Processing\Processors\Nested_Selector_Flattening_Processor(),
			new \Elementor\Modules\CssConverter\Services\Css\Processing\Processors\Nested_Element_Selector_Processor(),
			new \Elementor\Modules\CssConverter\Services\Css\Processing\Processors\Compound_Class_Selector_Processor(),
			new \Elementor\Modules\CssConverter\Services\Css\Processing\Processors\Style_Collection_Processor(),
			new \Elementor\Modules\CssConverter\Services\Css\Processing\Processors\Body_Styles_Processor(),
			new \Elementor\Modules\CssConverter\Services\Css\Processing\Processors\Reset_Styles_Processor( $reset_style_detector, $property_converter ),
			new \Elementor\Modules\CssConverter\Services\Css\Processing\Processors\Widget_Child_Element_Selector_Processor( $property_converter ),
			new \Elementor\Modules\CssConverter\Services\Css\Processing\Processors\Global_Classes_Processor(),
			new \Elementor\Modules\CssConverter\Services\Css\Processing\Processors\Html_Class_Modifier_Processor(),
			new \Elementor\Modules\CssConverter\Services\Css\Processing\Processors\Style_Resolution_Processor(),
		];

		foreach ( $processors as $processor ) {
			$registry->register( $processor );
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
	}
}
