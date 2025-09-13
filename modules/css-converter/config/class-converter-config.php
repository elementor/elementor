<?php
namespace Elementor\Modules\CssConverter\Config;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Class_Converter_Config {
	private static $instance = null;
	private $config = [];

	private function __construct() {
		$this->init_default_config();
	}

	public static function get_instance(): self {
		if ( null === self::$instance ) {
			self::$instance = new self();
		}
		
		return self::$instance;
	}

	private function init_default_config(): void {
		$this->config = [
			'supported_properties' => [ 'color', 'font-size' ],
			'max_css_size' => 1024 * 1024, // 1MB
			'max_classes_per_request' => 100,
			'enable_caching' => true,
			'cache_ttl' => 3600, // 1 hour
			'enable_logging' => true,
			'log_directory' => 'logs',
			'performance_mode' => false,
			'strict_validation' => true,
		];

		$this->config = apply_filters( 'elementor_css_converter_config', $this->config );
	}

	public function get( string $key, $default = null ) {
		return $this->config[ $key ] ?? $default;
	}

	public function set( string $key, $value ): void {
		$this->config[ $key ] = $value;
	}

	public function get_supported_properties(): array {
		return $this->get( 'supported_properties', [] );
	}

	public function is_property_supported( string $property ): bool {
		return in_array( $property, $this->get_supported_properties(), true );
	}

	public function get_max_css_size(): int {
		return $this->get( 'max_css_size', 1024 * 1024 );
	}

	public function get_max_classes_per_request(): int {
		return $this->get( 'max_classes_per_request', 100 );
	}

	public function is_caching_enabled(): bool {
		return $this->get( 'enable_caching', true );
	}

	public function get_cache_ttl(): int {
		return $this->get( 'cache_ttl', 3600 );
	}

	public function is_logging_enabled(): bool {
		return $this->get( 'enable_logging', true );
	}

	public function get_log_directory(): string {
		return $this->get( 'log_directory', 'logs' );
	}

	public function is_performance_mode(): bool {
		return $this->get( 'performance_mode', false );
	}

	public function is_strict_validation(): bool {
		return $this->get( 'strict_validation', true );
	}
}
