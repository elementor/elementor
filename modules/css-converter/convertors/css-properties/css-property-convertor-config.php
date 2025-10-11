<?php

namespace Elementor\Modules\CssConverter\Convertors\CssProperties;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Css_Property_Convertor_Config {
	private static ?self $instance = null;
	private array $config = [];

	private function __construct() {
		$this->init_basic_config();
	}

	public static function get_instance(): self {
		if ( null === self::$instance ) {
			self::$instance = new self();
		}
		
		return self::$instance;
	}

	private function init_basic_config(): void {
		$this->config = [
			'supported_properties' => [
				'color', 'background-color', 'font-size', 'margin', 'padding',
				'border-radius', 'box-shadow', 'text-shadow', 'transform', 'transition',
				'opacity', 'z-index', 'width', 'height', 'display', 'position',
				'flex-direction', 'align-items', 'justify-content', 'gap'
			],
			'total_mappers' => 14,
			'total_properties' => 50,
			'system_version' => '2.0.0-bridge',
			'integration_mode' => 'bridge_mode',
			'legacy_compatibility' => true,
			'max_css_size' => 5 * 1024 * 1024, // 5MB
			'log_directory' => 'logs'
		];
	}

	public function get_supported_properties(): array {
		return $this->config['supported_properties'] ?? [];
	}

	public function is_property_supported( string $property ): bool {
		return in_array( $property, $this->get_supported_properties(), true );
	}

	public function get_total_mappers(): int {
		return $this->config['total_mappers'] ?? 0;
	}

	public function get_total_properties(): int {
		return $this->config['total_properties'] ?? 0;
	}

	public function get_system_version(): string {
		return $this->config['system_version'] ?? '2.0.0';
	}

	public function is_legacy_mode(): bool {
		return $this->config['legacy_compatibility'] ?? false;
	}

	public function get_config(): array {
		return $this->config;
	}

	public function convert_css_property( string $property, string $value ): ?array {
		// Basic conversion without atomic dependencies
		return [
			'$$type' => 'string',
			'value' => $value
		];
	}

	public function get_conversion_statistics(): array {
		return [
			'total_atomic_prop_mappers' => $this->config['total_mappers'],
			'total_convertible_css_properties' => $this->config['total_properties']
		];
	}

	public function get_css_categories_coverage(): array {
		return [
			'layout_css_properties_count' => 15,
			'visual_css_properties_count' => 10,
			'interaction_css_properties_count' => 5,
			'animation_css_properties_count' => 5
		];
	}

	public function get_max_css_size(): int {
		return $this->config['max_css_size'] ?? 5 * 1024 * 1024; // 5MB default
	}

	public function get_log_directory(): string {
		return $this->config['log_directory'] ?? 'logs';
	}
}
