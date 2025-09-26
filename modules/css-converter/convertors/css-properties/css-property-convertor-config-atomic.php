<?php

namespace Elementor\Modules\CssConverter\Convertors\CssProperties;

use Elementor\Modules\CssConverter\Convertors\AtomicProperties\Implementations\Atomic_Prop_Mapper_Factory;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Css_Property_Convertor_Config {
	private static ?self $instance = null;
	private array $config = [];

	private function __construct() {
		$this->init_config_from_atomic_system();
	}

	public static function get_instance(): self {
		if ( null === self::$instance ) {
			self::$instance = new self();
		}
		
		return self::$instance;
	}

	private function init_config_from_atomic_system(): void {
		$supported_properties = Atomic_Prop_Mapper_Factory::get_all_supported_css_properties();
		$capabilities = Atomic_Prop_Mapper_Factory::get_conversion_capability_statistics();
		
		$this->config = [
			'supported_properties' => $supported_properties,
			'total_mappers' => $capabilities['total_atomic_prop_mappers'],
			'total_properties' => $capabilities['total_convertible_css_properties'],
			'system_version' => '2.0.0-atomic',
			'integration_mode' => 'atomic_widgets',
			'legacy_compatibility' => true
		];
	}

	public function get_supported_properties(): array {
		return $this->config['supported_properties'] ?? [];
	}

	public function is_property_supported( string $property ): bool {
		return Atomic_Prop_Mapper_Factory::can_convert_css_property( $property );
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
		return Atomic_Prop_Mapper_Factory::convert_css_property_to_atomic_format( $property, $value );
	}

	public function get_conversion_statistics(): array {
		return Atomic_Prop_Mapper_Factory::get_conversion_capability_statistics();
	}

	public function get_css_categories_coverage(): array {
		return Atomic_Prop_Mapper_Factory::get_css_property_categories_coverage();
	}
}
