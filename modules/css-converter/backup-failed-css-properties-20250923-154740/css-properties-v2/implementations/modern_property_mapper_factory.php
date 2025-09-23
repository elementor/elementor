<?php
namespace Elementor\Modules\CssConverter\Convertors\CssPropertiesV2\Implementations;

use Elementor\Modules\CssConverter\Convertors\CssPropertiesV2\Contracts\Atomic_Property_Mapper_Interface;
use Elementor\Modules\CssConverter\Convertors\CssPropertiesV2\Properties\Align_Items_Property_Mapper;
use Elementor\Modules\CssConverter\Convertors\CssPropertiesV2\Properties\Flex_Direction_Property_Mapper;
use Elementor\Modules\CssConverter\Convertors\CssPropertiesV2\Properties\Gap_Property_Mapper;
use Elementor\Modules\CssConverter\Convertors\CssPropertiesV2\Properties\Display_Property_Mapper;
use Elementor\Modules\CssConverter\Convertors\CssPropertiesV2\Properties\Position_Property_Mapper;
use Elementor\Modules\CssConverter\Convertors\CssPropertiesV2\Properties\Margin_Property_Mapper;
use Elementor\Modules\CssConverter\Convertors\CssPropertiesV2\Properties\Padding_Property_Mapper;
use Elementor\Modules\CssConverter\Convertors\CssPropertiesV2\Properties\Font_Size_Property_Mapper;
use Elementor\Modules\CssConverter\Convertors\CssPropertiesV2\Properties\Line_Height_Property_Mapper;
use Elementor\Modules\CssConverter\Convertors\CssPropertiesV2\Properties\Color_Property_Mapper;
use Elementor\Modules\CssConverter\Convertors\CssPropertiesV2\Properties\Background_Color_Property_Mapper;
use Elementor\Modules\CssConverter\Convertors\CssPropertiesV2\Properties\Background_Property_Mapper;
use Elementor\Modules\CssConverter\Convertors\CssPropertiesV2\Properties\Border_Radius_Property_Mapper;
use Elementor\Modules\CssConverter\Convertors\CssPropertiesV2\Properties\Box_Shadow_Property_Mapper;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Modern_Property_Mapper_Factory {

	private array $mappers = [];
	private array $property_to_mapper_cache = [];
	private bool $initialized = false;

	public function __construct() {
		$this->initialize_mappers();
	}

	public function get_mapper_for_property( string $property ): ?Atomic_Property_Mapper_Interface {
		if ( ! $this->initialized ) {
			$this->initialize_mappers();
		}

		if ( isset( $this->property_to_mapper_cache[ $property ] ) ) {
			return $this->property_to_mapper_cache[ $property ];
		}

		foreach ( $this->mappers as $mapper ) {
			if ( $mapper->supports_property( $property ) ) {
				$this->property_to_mapper_cache[ $property ] = $mapper;
				return $mapper;
			}
		}

		$this->property_to_mapper_cache[ $property ] = null;
		return null;
	}

	public function get_all_mappers(): array {
		if ( ! $this->initialized ) {
			$this->initialize_mappers();
		}

		return $this->mappers;
	}

	public function get_supported_properties(): array {
		if ( ! $this->initialized ) {
			$this->initialize_mappers();
		}

		$properties = [];
		foreach ( $this->mappers as $mapper ) {
			$properties = array_merge( $properties, $mapper->get_supported_properties() );
		}

		return array_unique( $properties );
	}

	public function get_supported_atomic_widgets(): array {
		if ( ! $this->initialized ) {
			$this->initialize_mappers();
		}

		$widgets = [];
		foreach ( $this->mappers as $mapper ) {
			$widgets = array_merge( $widgets, $mapper->get_supported_atomic_widgets() );
		}

		return array_unique( $widgets );
	}

	public function get_required_prop_types(): array {
		if ( ! $this->initialized ) {
			$this->initialize_mappers();
		}

		$prop_types = [];
		foreach ( $this->mappers as $mapper ) {
			$prop_types = array_merge( $prop_types, $mapper->get_required_prop_types() );
		}

		return array_unique( $prop_types );
	}

	public function convert_property_to_v4_atomic( string $property, $value ): ?array {
		$mapper = $this->get_mapper_for_property( $property );
		
		if ( null === $mapper ) {
			return null;
		}

		return $mapper->map_to_v4_atomic( $property, $value );
	}

	public function convert_property_to_schema( string $property, $value ): ?array {
		$mapper = $this->get_mapper_for_property( $property );
		
		if ( null === $mapper ) {
			return null;
		}

		return $mapper->map_to_schema( $property, $value );
	}

	public function validate_property_output( string $property, array $output ): bool {
		$mapper = $this->get_mapper_for_property( $property );
		
		if ( null === $mapper ) {
			return false;
		}

		return $mapper->validate_atomic_output( $output );
	}

	public function register_mapper( Atomic_Property_Mapper_Interface $mapper ): void {
		$this->mappers[] = $mapper;
		$this->clear_cache();
	}

	public function get_mapper_statistics(): array {
		if ( ! $this->initialized ) {
			$this->initialize_mappers();
		}

		$stats = [
			'total_mappers' => count( $this->mappers ),
			'total_properties' => count( $this->get_supported_properties() ),
			'total_atomic_widgets' => count( $this->get_supported_atomic_widgets() ),
			'total_prop_types' => count( $this->get_required_prop_types() ),
			'mappers_by_phase' => [
				'phase_1' => 0,
				'phase_2' => 0,
				'phase_3' => 0,
			],
		];

		$phase_1_mappers = [
			Align_Items_Property_Mapper::class,
			Flex_Direction_Property_Mapper::class,
			Gap_Property_Mapper::class,
			Display_Property_Mapper::class,
			Position_Property_Mapper::class,
		];

		$phase_2_mappers = [
			Margin_Property_Mapper::class,
			Padding_Property_Mapper::class,
			Font_Size_Property_Mapper::class,
			Line_Height_Property_Mapper::class,
		];

		$phase_3_mappers = [
			Color_Property_Mapper::class,
			Background_Color_Property_Mapper::class,
			Background_Property_Mapper::class,
			Border_Radius_Property_Mapper::class,
			Box_Shadow_Property_Mapper::class,
		];

		foreach ( $this->mappers as $mapper ) {
			$class_name = get_class( $mapper );
			
			if ( in_array( $class_name, $phase_1_mappers, true ) ) {
				$stats['mappers_by_phase']['phase_1']++;
			} elseif ( in_array( $class_name, $phase_2_mappers, true ) ) {
				$stats['mappers_by_phase']['phase_2']++;
			} elseif ( in_array( $class_name, $phase_3_mappers, true ) ) {
				$stats['mappers_by_phase']['phase_3']++;
			}
		}

		return $stats;
	}

	private function initialize_mappers(): void {
		if ( $this->initialized ) {
			return;
		}

		// Phase 1: Core Layout Properties
		$this->mappers[] = new Align_Items_Property_Mapper();
		$this->mappers[] = new Flex_Direction_Property_Mapper();
		$this->mappers[] = new Gap_Property_Mapper();
		$this->mappers[] = new Display_Property_Mapper();
		$this->mappers[] = new Position_Property_Mapper();

		// Phase 2: Spacing & Sizing Properties
		$this->mappers[] = new Margin_Property_Mapper();
		$this->mappers[] = new Padding_Property_Mapper();
		$this->mappers[] = new Font_Size_Property_Mapper();
		$this->mappers[] = new Line_Height_Property_Mapper();

		// Phase 3: Visual Properties
		$this->mappers[] = new Color_Property_Mapper();
		$this->mappers[] = new Background_Color_Property_Mapper();
		$this->mappers[] = new Background_Property_Mapper();
		$this->mappers[] = new Border_Radius_Property_Mapper();
		$this->mappers[] = new Box_Shadow_Property_Mapper();

		$this->initialized = true;
	}

	private function clear_cache(): void {
		$this->property_to_mapper_cache = [];
	}

	public function is_property_supported( string $property ): bool {
		return null !== $this->get_mapper_for_property( $property );
	}

	public function get_mapper_for_atomic_widget( string $widget_type ): array {
		if ( ! $this->initialized ) {
			$this->initialize_mappers();
		}

		$matching_mappers = [];
		
		foreach ( $this->mappers as $mapper ) {
			$supported_widgets = $mapper->get_supported_atomic_widgets();
			if ( in_array( $widget_type, $supported_widgets, true ) ) {
				$matching_mappers[] = $mapper;
			}
		}

		return $matching_mappers;
	}

	public function get_properties_for_atomic_widget( string $widget_type ): array {
		$mappers = $this->get_mapper_for_atomic_widget( $widget_type );
		$properties = [];

		foreach ( $mappers as $mapper ) {
			$properties = array_merge( $properties, $mapper->get_supported_properties() );
		}

		return array_unique( $properties );
	}
}
