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
		// Load atomic-only enforcement classes
		require_once __DIR__ . '/atomic-only-property-mapper-base.php';
		require_once __DIR__ . '/atomic-only-mapper-factory.php';
		
		// Load atomic property mappers
		require_once __DIR__ . '/../properties/color-property-mapper.php';
		require_once __DIR__ . '/../properties/background-color-property-mapper.php';
		require_once __DIR__ . '/../properties/background-property-mapper.php';
		require_once __DIR__ . '/../properties/flex-properties-mapper.php';
		require_once __DIR__ . '/../properties/font-size-property-mapper.php';
		require_once __DIR__ . '/../properties/margin-property-mapper.php';
		require_once __DIR__ . '/../properties/atomic-padding-property-mapper.php';
		require_once __DIR__ . '/../properties/width-property-mapper.php';
		require_once __DIR__ . '/../properties/border-radius-property-mapper.php';
		require_once __DIR__ . '/../properties/box-shadow-property-mapper.php';
		require_once __DIR__ . '/../properties/opacity-property-mapper.php';
		require_once __DIR__ . '/../properties/height-property-mapper.php';
		require_once __DIR__ . '/../properties/display-property-mapper.php';
		require_once __DIR__ . '/../properties/position-property-mapper.php';
		require_once __DIR__ . '/../properties/flex-direction-property-mapper.php';
		require_once __DIR__ . '/../properties/text-align-property-mapper.php';
		require_once __DIR__ . '/../properties/font-weight-property-mapper.php';
		require_once __DIR__ . '/../properties/border-width-property-mapper.php';
		require_once __DIR__ . '/../properties/border-color-property-mapper.php';
		require_once __DIR__ . '/../properties/border-style-property-mapper.php';
		require_once __DIR__ . '/../properties/border-property-mapper.php';
		require_once __DIR__ . '/../properties/positioning-property-mapper.php';
		require_once __DIR__ . '/../properties/transform-property-mapper.php';
		require_once __DIR__ . '/../properties/text-shadow-property-mapper.php';
		require_once __DIR__ . '/../properties/letter-spacing-property-mapper.php';
		require_once __DIR__ . '/../properties/text-transform-property-mapper.php';
		
		// Register atomic property mappers
		$this->mappers['color'] = new \Elementor\Modules\CssConverter\Convertors\CssProperties\Properties\Color_Property_Mapper();
		$this->mappers['background-color'] = new \Elementor\Modules\CssConverter\Convertors\CssProperties\Properties\Background_Color_Property_Mapper();
		$this->mappers['font-size'] = new \Elementor\Modules\CssConverter\Convertors\CssProperties\Properties\Font_Size_Property_Mapper();
		// Register comprehensive atomic margin mapper for all margin variations
		$margin_mapper = new \Elementor\Modules\CssConverter\Convertors\CssProperties\Properties\Margin_Property_Mapper();
		foreach ( $margin_mapper->get_supported_properties() as $property ) {
			$this->mappers[ $property ] = $margin_mapper;
		}
		
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
		
		// Register comprehensive atomic border-radius mapper for all border-radius properties
		$border_radius_mapper = new \Elementor\Modules\CssConverter\Convertors\CssProperties\Properties\Border_Radius_Property_Mapper();
		foreach ( $border_radius_mapper->get_supported_properties() as $property ) {
			$this->mappers[ $property ] = $border_radius_mapper;
		}
		
		// Register atomic box-shadow mapper
		$this->mappers['box-shadow'] = new \Elementor\Modules\CssConverter\Convertors\CssProperties\Properties\Box_Shadow_Property_Mapper();
		
		// Register atomic opacity mapper
		$this->mappers['opacity'] = new \Elementor\Modules\CssConverter\Convertors\CssProperties\Properties\Opacity_Property_Mapper();
		
		// Register comprehensive atomic height mapper for all height properties
		$height_mapper = new \Elementor\Modules\CssConverter\Convertors\CssProperties\Properties\Height_Property_Mapper();
		foreach ( $height_mapper->get_supported_properties() as $property ) {
			$this->mappers[ $property ] = $height_mapper;
		}
		
		// Register atomic display mapper
		$this->mappers['display'] = new \Elementor\Modules\CssConverter\Convertors\CssProperties\Properties\Display_Property_Mapper();
		
		// Register atomic position mapper
		$this->mappers['position'] = new \Elementor\Modules\CssConverter\Convertors\CssProperties\Properties\Position_Property_Mapper();
		
		// Register atomic flex-direction mapper
		$this->mappers['flex-direction'] = new \Elementor\Modules\CssConverter\Convertors\CssProperties\Properties\Flex_Direction_Property_Mapper();
		
		// Register atomic text-align mapper
		$this->mappers['text-align'] = new \Elementor\Modules\CssConverter\Convertors\CssProperties\Properties\Text_Align_Property_Mapper();
		
		// Register atomic font-weight mapper
		$this->mappers['font-weight'] = new \Elementor\Modules\CssConverter\Convertors\CssProperties\Properties\Font_Weight_Property_Mapper();
		
		// Register comprehensive atomic width mapper for all width/height properties (including max-width)
		$width_mapper = new \Elementor\Modules\CssConverter\Convertors\CssProperties\Properties\Width_Property_Mapper();
		foreach ( $width_mapper->get_supported_properties() as $property ) {
			$this->mappers[ $property ] = $width_mapper;
		}
		
		// Register comprehensive atomic border-width mapper for all border-width properties
		$border_width_mapper = new \Elementor\Modules\CssConverter\Convertors\CssProperties\Properties\Border_Width_Property_Mapper();
		foreach ( $border_width_mapper->get_supported_properties() as $property ) {
			$this->mappers[ $property ] = $border_width_mapper;
		}
		
		// Register comprehensive atomic border-color mapper for all border-color properties
		$border_color_mapper = new \Elementor\Modules\CssConverter\Convertors\CssProperties\Properties\Border_Color_Property_Mapper();
		foreach ( $border_color_mapper->get_supported_properties() as $property ) {
			$this->mappers[ $property ] = $border_color_mapper;
		}
		
		// Register comprehensive atomic border-style mapper for all border-style properties
		$border_style_mapper = new \Elementor\Modules\CssConverter\Convertors\CssProperties\Properties\Border_Style_Property_Mapper();
		foreach ( $border_style_mapper->get_supported_properties() as $property ) {
			$this->mappers[ $property ] = $border_style_mapper;
		}
		
		// Register comprehensive atomic border shorthand mapper for all border shorthand properties
		$border_mapper = new \Elementor\Modules\CssConverter\Convertors\CssProperties\Properties\Border_Property_Mapper();
		foreach ( $border_mapper->get_supported_properties() as $property ) {
			$this->mappers[ $property ] = $border_mapper;
		}
		
		// Register comprehensive atomic positioning mapper for all positioning properties
		$positioning_mapper = new \Elementor\Modules\CssConverter\Convertors\CssProperties\Properties\Positioning_Property_Mapper();
		foreach ( $positioning_mapper->get_supported_properties() as $property ) {
			$this->mappers[ $property ] = $positioning_mapper;
		}
		
		// Register comprehensive atomic background mapper for all background properties
		$background_mapper = new \Elementor\Modules\CssConverter\Convertors\CssProperties\Properties\Background_Property_Mapper();
		foreach ( $background_mapper->get_supported_properties() as $property ) {
			$this->mappers[ $property ] = $background_mapper;
		}
		
		// Register comprehensive atomic flex properties mapper for all flex properties
		$flex_properties_mapper = new \Elementor\Modules\CssConverter\Convertors\CssProperties\Properties\Flex_Properties_Mapper();
		foreach ( $flex_properties_mapper->get_supported_properties() as $property ) {
			$this->mappers[ $property ] = $flex_properties_mapper;
		}
		
		// Register comprehensive atomic transform mapper for all transform properties
		$transform_mapper = new \Elementor\Modules\CssConverter\Convertors\CssProperties\Properties\Transform_Property_Mapper();
		foreach ( $transform_mapper->get_supported_properties() as $property ) {
			$this->mappers[ $property ] = $transform_mapper;
		}
		
		// Register text-shadow mapper
		$this->mappers['text-shadow'] = new \Elementor\Modules\CssConverter\Convertors\CssProperties\Properties\Text_Shadow_Property_Mapper();
		
		// Register letter-spacing mapper
		$this->mappers['letter-spacing'] = new \Elementor\Modules\CssConverter\Convertors\CssProperties\Properties\Letter_Spacing_Property_Mapper();
		
		// Register text-transform mapper
		$this->mappers['text-transform'] = new \Elementor\Modules\CssConverter\Convertors\CssProperties\Properties\Text_Transform_Property_Mapper();
		
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

	/**
	 * 🎯 ATOMIC-ONLY VALIDATION: Validate all registered mappers are atomic compliant
	 */
	public function validate_atomic_compliance(): array {
		return Atomic_Only_Mapper_Factory::validate_all_atomic_mappers();
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

