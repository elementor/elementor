<?php

namespace Elementor\Modules\CssConverter\Convertors\CssProperties\Implementations;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Class_Property_Mapper_Registry {
	private array $mappers = [];
	private static ?self $instance = null;

	public function __construct() {
		$this->initialize_basic_mappers();
	}

	public static function get_instance(): self {
		if ( null === self::$instance ) {
			self::$instance = new self();
		}
		
		return self::$instance;
	}

	private function initialize_basic_mappers(): void {
		// Initialize enhanced property mappers for better CSS conversion
		$basic_properties = [
			'color', 'background-color', 'background', 'font-size', 'margin', 'padding',
			'margin-top', 'margin-right', 'margin-bottom', 'margin-left',
			'padding-top', 'padding-right', 'padding-bottom', 'padding-left',
			'border-radius', 'box-shadow', 'text-shadow', 'transform', 'transition',
			'opacity', 'z-index', 'width', 'height', 'display', 'position',
			'flex-direction', 'align-items', 'justify-content', 'gap', 'font-weight',
			'line-height', 'text-align'
		];
		
		// Load the enhanced mapper
		require_once __DIR__ . '/enhanced_property_mapper.php';
		
		foreach ( $basic_properties as $property ) {
			$this->mappers[ $property ] = new Enhanced_Property_Mapper( $property );
		}
	}

	public function register( string $property, object $mapper ): void {
		$this->mappers[ $property ] = $mapper;
	}

	public function resolve( string $property, $value = null ): ?object {
		if ( isset( $this->mappers[ $property ] ) ) {
			return $this->mappers[ $property ];
		}
		
		return null;
	}

	public function get_all_mappers(): array {
		return $this->mappers;
	}

	public function get_supported_properties(): array {
		return array_keys( $this->mappers );
	}

	public function supports_property( string $property ): bool {
		return isset( $this->mappers[ $property ] );
	}

	public function get_mapper_count(): int {
		return count( $this->mappers );
	}

	public function get_statistics(): array {
		return [
			'total_mappers' => count( $this->mappers ),
			'supported_properties' => count( $this->mappers )
		];
	}

	public static function reset_instance(): void {
		self::$instance = null;
	}
}

class Basic_Property_Mapper {
	private string $property;

	public function __construct( string $property ) {
		$this->property = $property;
	}

	public function map_to_v4_atomic( string $property, $value ): ?array {
		// Basic conversion - return as string type
		return [
			'$$type' => 'string',
			'value' => (string) $value
		];
	}

	public function supports( string $property, $value = null ): bool {
		return $this->property === $property;
	}

	public function get_supported_properties(): array {
		return [ $this->property ];
	}

	public function get_property(): string {
		return $this->property;
	}
}
