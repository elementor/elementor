<?php

namespace Elementor\Modules\CssConverter\Services\GlobalClasses\Unified;

use Elementor\Modules\CssConverter\Services\Css\Processing\Unified_Css_Processor;
use Elementor\Modules\CssConverter\Parsers\CssParser;
use Elementor\Modules\CssConverter\Services\Css\Processing\Css_Property_Conversion_Service;
use Elementor\Modules\CssConverter\Services\Css\Processing\Css_Specificity_Calculator;
use Elementor\Modules\GlobalClasses\Global_Classes_Repository;
use Elementor\Modules\GlobalClasses\Global_Classes_Parser;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Global_Classes_Service_Provider {

	private static ?self $instance = null;
	private array $services = [];

	public static function instance(): self {
		if ( null === self::$instance ) {
			self::$instance = new self();
		}

		return self::$instance;
	}

	private function __construct() {
		// Private constructor for singleton
	}

	public function get_detection_service(): Global_Classes_Detection_Service {
		if ( ! isset( $this->services['detection'] ) ) {
			$this->services['detection'] = new Global_Classes_Detection_Service();
		}

		return $this->services['detection'];
	}

	public function get_conversion_service(): Global_Classes_Conversion_Service {
		if ( ! isset( $this->services['conversion'] ) ) {
			$property_conversion_service = $this->get_css_property_conversion_service();
			$this->services['conversion'] = new Global_Classes_Conversion_Service( $property_conversion_service );
		}

		return $this->services['conversion'];
	}

	public function get_registration_service(): Global_Classes_Registration_Service {
		if ( ! isset( $this->services['registration'] ) ) {
			$this->services['registration'] = new Global_Classes_Registration_Service();
		}

		return $this->services['registration'];
	}

	public function get_integration_service(): Global_Classes_Integration_Service {
		if ( ! isset( $this->services['integration'] ) ) {
			$this->services['integration'] = new Global_Classes_Integration_Service(
				$this->get_detection_service(),
				$this->get_conversion_service(),
				$this->get_registration_service()
			);
		}

		return $this->services['integration'];
	}

	private function get_unified_css_processor(): Unified_Css_Processor {
		if ( ! isset( $this->services['css_processor'] ) ) {
			// Create required dependencies for Unified_Css_Processor
			$css_parser = $this->get_css_parser();
			$property_converter = $this->get_css_property_conversion_service();
			$specificity_calculator = $this->get_css_specificity_calculator();
			
			$this->services['css_processor'] = new Unified_Css_Processor(
				$css_parser,
				$property_converter,
				$specificity_calculator
			);
		}

		return $this->services['css_processor'];
	}

	private function get_css_parser() {
		if ( ! isset( $this->services['css_parser'] ) ) {
			// Use the CSS Parser from the css-converter module
			$this->services['css_parser'] = new CssParser();
		}
		return $this->services['css_parser'];
	}

	public function register_hooks(): void {
		// Register any WordPress hooks needed for the services
		add_action( 'init', [ $this, 'initialize_services' ] );
	}

	public function initialize_services(): void {
		// Initialize services that need early setup
		// This method is called on WordPress 'init' hook
	}

	public function clear_cache(): void {
		// Clear any cached service instances
		$this->services = [];
	}

	public function is_available(): bool {
		// Check if all required dependencies are available
		return class_exists( Unified_Css_Processor::class ) &&
			defined( 'ELEMENTOR_VERSION' );
	}

	private function get_css_property_conversion_service(): Css_Property_Conversion_Service {
		if ( ! isset( $this->services['property_conversion'] ) ) {
			$this->services['property_conversion'] = new Css_Property_Conversion_Service();
		}
		return $this->services['property_conversion'];
	}

	private function get_global_classes_repository(): Global_Classes_Repository {
		return Global_Classes_Repository::make();
	}

	private function get_global_classes_parser(): Global_Classes_Parser {
		return Global_Classes_Parser::make();
	}

	private function get_css_specificity_calculator(): Css_Specificity_Calculator {
		if ( ! isset( $this->services['specificity_calculator'] ) ) {
			$this->services['specificity_calculator'] = new Css_Specificity_Calculator();
		}
		return $this->services['specificity_calculator'];
	}

	public function get_service_status(): array {
		return [
			'provider_available' => true,
			'css_processor_available' => class_exists( Unified_Css_Processor::class ),
			'elementor_available' => defined( 'ELEMENTOR_VERSION' ),
			'services_loaded' => array_keys( $this->services ),
		];
	}
}
