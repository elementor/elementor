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
		// Load atomic property mapper base
		require_once __DIR__ . '/atomic-property-mapper-base.php';
		
		// Load atomic property mappers
		require_once __DIR__ . '/../properties/color-property-mapper.php';
		require_once __DIR__ . '/../properties/background-color-property-mapper.php';
		require_once __DIR__ . '/../properties/font-size-property-mapper.php';
		require_once __DIR__ . '/../properties/margin-property-mapper.php';
		require_once __DIR__ . '/../properties/atomic-padding-property-mapper.php';
		require_once __DIR__ . '/../properties/width-property-mapper.php';
		
		// Register atomic property mappers
		$this->mappers['color'] = new \Elementor\Modules\CssConverter\Convertors\CssProperties\Properties\Color_Property_Mapper();
		$this->mappers['background-color'] = new \Elementor\Modules\CssConverter\Convertors\CssProperties\Properties\Background_Color_Property_Mapper();
		$this->mappers['font-size'] = new \Elementor\Modules\CssConverter\Convertors\CssProperties\Properties\Font_Size_Property_Mapper();
		$this->mappers['margin'] = new \Elementor\Modules\CssConverter\Convertors\CssProperties\Properties\Margin_Property_Mapper();
		
		// Register comprehensive atomic padding mapper for all padding variations
		$atomic_padding_mapper = new \Elementor\Modules\CssConverter\Convertors\CssProperties\Properties\Atomic_Padding_Property_Mapper();
		foreach ( $atomic_padding_mapper->get_supported_properties() as $property ) {
			$this->mappers[ $property ] = $atomic_padding_mapper;
		}
		
		// Register comprehensive atomic width mapper for all size properties
		$width_mapper = new \Elementor\Modules\CssConverter\Convertors\CssProperties\Properties\Width_Property_Mapper();
		foreach ( $width_mapper->get_supported_properties() as $property ) {
			$this->mappers[ $property ] = $width_mapper;
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

