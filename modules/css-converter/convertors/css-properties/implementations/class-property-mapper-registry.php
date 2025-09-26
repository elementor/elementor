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
		// Load specific property mappers
		require_once __DIR__ . '/../properties/color-property-mapper.php';
		require_once __DIR__ . '/../properties/background-color-property-mapper.php';
		require_once __DIR__ . '/../properties/font-size-property-mapper.php';
		require_once __DIR__ . '/../properties/margin-property-mapper.php';
		require_once __DIR__ . '/../properties/padding-property-mapper.php';
		require_once __DIR__ . '/atomic-property-mapper-base.php';
		require_once __DIR__ . '/../properties/atomic-padding-property-mapper.php';
		
		// Register specific property mappers
		$this->mappers['color'] = new \Elementor\Modules\CssConverter\Convertors\CssProperties\Properties\Color_Property_Mapper();
		$this->mappers['background-color'] = new \Elementor\Modules\CssConverter\Convertors\CssProperties\Properties\Background_Color_Property_Mapper();
		$this->mappers['font-size'] = new \Elementor\Modules\CssConverter\Convertors\CssProperties\Properties\Font_Size_Property_Mapper();
		$this->mappers['margin'] = new \Elementor\Modules\CssConverter\Convertors\CssProperties\Properties\Margin_Property_Mapper();
		$this->mappers['padding'] = new \Elementor\Modules\CssConverter\Convertors\CssProperties\Properties\Atomic_Padding_Property_Mapper();
		
		// TODO: Replace with atomic widgets approach
		// Needs atomic mapper update: Add Enhanced_Property_Mapper for remaining properties
		// Load the enhanced mapper for remaining properties
		require_once __DIR__ . '/enhanced-property-mapper.php';
		
		// Fallback properties that still use enhanced mapper
		$fallback_properties = [
			'background',
			'margin-top', 'margin-right', 'margin-bottom', 'margin-left',
			'padding-top', 'padding-right', 'padding-bottom', 'padding-left',
			'border-radius', 'box-shadow', 'text-shadow', 'transform', 'transition',
			'opacity', 'z-index', 'width', 'height', 'display', 'position',
			'flex-direction', 'align-items', 'justify-content', 'gap', 'font-weight',
			'line-height', 'text-align'
		];
		
		foreach ( $fallback_properties as $property ) {
			// TODO: Replace with atomic widgets approach
		// Needs atomic mapper update: Replace Enhanced_Property_Mapper with atomic widget-based mapper
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
		// TODO: Replace with atomic widgets approach
		// Needs atomic mapper update: Replace string type with atomic widget-based type
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
