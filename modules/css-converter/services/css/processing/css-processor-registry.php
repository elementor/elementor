<?php
namespace Elementor\Modules\CssConverter\Services\Css\Processing;

use Elementor\Modules\CssConverter\Services\Css\Processing\Contracts\Css_Processor_Interface;
use Elementor\Modules\CssConverter\Services\Css\Processing\Contracts\Css_Processing_Context;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Css_Processor_Registry {

	private $processors = [];

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

		foreach ( $sorted_processors as $processor ) {
			$processor_name = $processor->get_processor_name();
			$priority = $processor->get_priority();

			if ( ! $processor->supports_context( $context ) ) {
				continue;
			}

			try {
				$context = $processor->process( $context );
			} catch ( \Exception $e ) {
				throw new \Exception( "Processor '{$processor_name}' failed: " . $e->getMessage(), 0, $e );
			}
		}

		return $context;
	}

	public function get_sorted_processors(): array {
		$processors = array_values( $this->processors );

		usort( $processors, function( Css_Processor_Interface $a, Css_Processor_Interface $b ) {
			return $a->get_priority() <=> $b->get_priority(); // Sort by priority ASC (lower first)
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
}
