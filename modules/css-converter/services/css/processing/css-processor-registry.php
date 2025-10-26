<?php
namespace Elementor\Modules\CssConverter\Services\Css\Processing;

use Elementor\Modules\CssConverter\Services\Css\Processing\Contracts\Css_Processor_Interface;
use Elementor\Modules\CssConverter\Services\Css\Processing\Contracts\Css_Processing_Context;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Css_Processor_Registry {

	private $processors = [];
	private $initialized = false;

	public function __construct() {
		$this->initialize_default_processors();
		$this->initialized = true;
	}

	public static function make(): self {
		return new self();
	}

	public function register( Css_Processor_Interface $processor ): void {
		$name = $processor->get_processor_name();

		if ( isset( $this->processors[ $name ] ) ) {
			throw new \Exception( "Processor '{$name}' is already registered" );
		}

		$this->processors[ $name ] = $processor;
	}

	public function unregister( string $processor_name ): void {
		unset( $this->processors[ $processor_name ] );
	}

	public function has_processor( string $processor_name ): bool {
		return isset( $this->processors[ $processor_name ] );
	}

	public function get_processor( string $processor_name ): ?Css_Processor_Interface {
		return $this->processors[ $processor_name ] ?? null;
	}

	public function execute_pipeline( Css_Processing_Context $context ): Css_Processing_Context {
		$sorted_processors = $this->get_sorted_processors();
		
		file_put_contents( '/Users/janvanvlastuin1981/Local Sites/elementor/app/public/wp-content/debug-processor.log', 'REGISTRY: Executing pipeline with ' . count( $sorted_processors ) . ' processors' . "\n", FILE_APPEND );
		
		foreach ( $sorted_processors as $processor ) {
			file_put_contents( '/Users/janvanvlastuin1981/Local Sites/elementor/app/public/wp-content/debug-processor.log', 'REGISTRY: Available processor: ' . $processor->get_processor_name() . "\n", FILE_APPEND );
		}

		foreach ( $sorted_processors as $processor ) {
			$processor_name = $processor->get_processor_name();
			file_put_contents( '/Users/janvanvlastuin1981/Local Sites/elementor/app/public/wp-content/debug-processor.log', 'REGISTRY: Processing ' . $processor_name . "\n", FILE_APPEND );
			
			
			if ( ! $processor->supports_context( $context ) ) {
				file_put_contents( '/Users/janvanvlastuin1981/Local Sites/elementor/app/public/wp-content/debug-processor.log', 'REGISTRY: Skipping ' . $processor_name . ' - does not support context' . "\n", FILE_APPEND );
				continue;
			}

			file_put_contents( '/Users/janvanvlastuin1981/Local Sites/elementor/app/public/wp-content/debug-processor.log', 'REGISTRY: Executing ' . $processor_name . "\n", FILE_APPEND );
			try {
				$context = $processor->process( $context );
				file_put_contents( '/Users/janvanvlastuin1981/Local Sites/elementor/app/public/wp-content/debug-processor.log', 'REGISTRY: Completed ' . $processor_name . "\n", FILE_APPEND );
			} catch ( \Exception $e ) {
				file_put_contents( '/Users/janvanvlastuin1981/Local Sites/elementor/app/public/wp-content/debug-processor.log', 'REGISTRY: Failed ' . $processor_name . ' - ' . $e->getMessage() . "\n", FILE_APPEND );
				throw new \Exception( "Processor '{$processor_name}' failed: " . $e->getMessage(), 0, $e );
			}
		}

		return $context;
	}

	public function get_sorted_processors(): array {
		$processors = array_values( $this->processors );

		usort( $processors, function( Css_Processor_Interface $a, Css_Processor_Interface $b ) {
			return $b->get_priority() <=> $a->get_priority(); // Sort by priority DESC (higher first)
		});

		return $processors;
	}

	public function get_statistics( Css_Processing_Context $context ): array {
		$stats = [];
		$context_stats = $context->get_statistics();

		foreach ( $this->processors as $processor ) {
			$processor_name = $processor->get_processor_name();
			$processor_stats = [];

			foreach ( $processor->get_statistics_keys() as $key ) {
				$processor_stats[ $key ] = $context_stats[ $key ] ?? 0;
			}

			$stats[ $processor_name ] = $processor_stats;
		}

		return $stats;
	}

	public function get_registered_processors(): array {
		return array_keys( $this->processors );
	}

	private function initialize_default_processors(): void {
		require_once __DIR__ . '/processors/nested-selector-flattening-processor.php';
		require_once __DIR__ . '/processors/compound-class-selector-processor.php';
		require_once __DIR__ . '/css-property-conversion-service.php';

		$this->register( new \Elementor\Modules\CssConverter\Services\Css\Processing\Processors\Nested_Selector_Flattening_Processor() );

		// Create property converter for compound processor
		$property_converter = new \Elementor\Modules\CssConverter\Services\Css\Processing\Css_Property_Conversion_Service();
		$this->register( new \Elementor\Modules\CssConverter\Services\Css\Processing\Processors\Compound_Class_Selector_Processor( $property_converter ) );
	}
}
