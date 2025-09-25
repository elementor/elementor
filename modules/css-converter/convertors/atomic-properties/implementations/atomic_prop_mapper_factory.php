<?php

namespace Elementor\Modules\CssConverter\Convertors\AtomicProperties\Implementations;

use Elementor\Modules\CssConverter\Convertors\AtomicProperties\PropTypes\Size_Prop_Type_Mapper;
use Elementor\Modules\CssConverter\Convertors\AtomicProperties\PropTypes\Color_Prop_Type_Mapper;
use Elementor\Modules\CssConverter\Convertors\AtomicProperties\PropTypes\Dimensions_Prop_Type_Mapper;
use Elementor\Modules\CssConverter\Convertors\AtomicProperties\PropTypes\String_Prop_Type_Mapper;
use Elementor\Modules\CssConverter\Convertors\AtomicProperties\PropTypes\Box_Shadow_Prop_Type_Mapper;
use Elementor\Modules\CssConverter\Convertors\AtomicProperties\PropTypes\Border_Radius_Prop_Type_Mapper;
use Elementor\Modules\CssConverter\Convertors\AtomicProperties\PropTypes\Shadow_Prop_Type_Mapper;
use Elementor\Modules\CssConverter\Convertors\AtomicProperties\PropTypes\Number_Prop_Type_Mapper;
use Elementor\Modules\CssConverter\Convertors\AtomicProperties\PropTypes\Background_Prop_Type_Mapper;
use Elementor\Modules\CssConverter\Convertors\AtomicProperties\PropTypes\Border_Width_Prop_Type_Mapper;
use Elementor\Modules\CssConverter\Convertors\AtomicProperties\PropTypes\Boolean_Prop_Type_Mapper;
use Elementor\Modules\CssConverter\Convertors\AtomicProperties\PropTypes\Url_Prop_Type_Mapper;
use Elementor\Modules\CssConverter\Convertors\AtomicProperties\PropTypes\Transform_Prop_Type_Mapper;
use Elementor\Modules\CssConverter\Convertors\AtomicProperties\PropTypes\Transition_Prop_Type_Mapper;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Atomic_Prop_Mapper_Factory {
	private static array $atomic_prop_type_mappers = [];
	private static array $css_property_to_mapper_registry = [];

	public static function find_mapper_for_css_property( string $css_property ): ?object {
		if ( empty( self::$atomic_prop_type_mappers ) ) {
			self::register_all_atomic_prop_mappers();
		}

		return self::$css_property_to_mapper_registry[ $css_property ] ?? null;
	}

	public static function get_all_atomic_prop_mappers(): array {
		if ( empty( self::$atomic_prop_type_mappers ) ) {
			self::register_all_atomic_prop_mappers();
		}

		return self::$atomic_prop_type_mappers;
	}

	public static function get_all_supported_css_properties(): array {
		if ( empty( self::$atomic_prop_type_mappers ) ) {
			self::register_all_atomic_prop_mappers();
		}

		return array_keys( self::$css_property_to_mapper_registry );
	}

	public static function can_convert_css_property( string $css_property ): bool {
		if ( empty( self::$atomic_prop_type_mappers ) ) {
			self::register_all_atomic_prop_mappers();
		}

		return isset( self::$css_property_to_mapper_registry[ $css_property ] );
	}

	public static function convert_css_property_to_atomic_format( string $css_property, string $css_value ): ?array {
		$atomic_prop_mapper = self::find_mapper_for_css_property( $css_property );
		if ( null === $atomic_prop_mapper ) {
			return null;
		}

		return $atomic_prop_mapper->map_css_to_atomic( $css_value );
	}

	private static function register_all_atomic_prop_mappers(): void {
		self::$atomic_prop_type_mappers = [
			'size' => new Size_Prop_Type_Mapper(),
			'color' => new Color_Prop_Type_Mapper(),
			'dimensions' => new Dimensions_Prop_Type_Mapper(),
			'string' => new String_Prop_Type_Mapper(),
			'box-shadow' => new Box_Shadow_Prop_Type_Mapper(),
			'border-radius' => new Border_Radius_Prop_Type_Mapper(),
			'shadow' => new Shadow_Prop_Type_Mapper(),
			'number' => new Number_Prop_Type_Mapper(),
			'background' => new Background_Prop_Type_Mapper(),
			'border-width' => new Border_Width_Prop_Type_Mapper(),
			'boolean' => new Boolean_Prop_Type_Mapper(),
			'url' => new Url_Prop_Type_Mapper(),
			'transform' => new Transform_Prop_Type_Mapper(),
			'transition' => new Transition_Prop_Type_Mapper(),
		];

		self::build_css_property_to_mapper_registry();
	}

	private static function build_css_property_to_mapper_registry(): void {
		self::$css_property_to_mapper_registry = [];

		foreach ( self::$atomic_prop_type_mappers as $atomic_prop_mapper ) {
			foreach ( $atomic_prop_mapper->get_supported_properties() as $css_property ) {
				self::$css_property_to_mapper_registry[ $css_property ] = $atomic_prop_mapper;
			}
		}
	}

	public static function get_conversion_capability_statistics(): array {
		if ( empty( self::$atomic_prop_type_mappers ) ) {
			self::register_all_atomic_prop_mappers();
		}

		$conversion_stats = [
			'total_atomic_prop_mappers' => count( self::$atomic_prop_type_mappers ),
			'total_convertible_css_properties' => count( self::$css_property_to_mapper_registry ),
			'atomic_prop_types_coverage' => [],
			'css_properties_per_atomic_type' => []
		];

		foreach ( self::$atomic_prop_type_mappers as $atomic_prop_type => $atomic_prop_mapper ) {
			$supported_css_properties = $atomic_prop_mapper->get_supported_properties();
			$conversion_stats['atomic_prop_types_coverage'][ $atomic_prop_type ] = 1;
			$conversion_stats['css_properties_per_atomic_type'][ $atomic_prop_type ] = count( $supported_css_properties );
		}

		return $conversion_stats;
	}

	public static function get_css_property_categories_coverage(): array {
		if ( empty( self::$atomic_prop_type_mappers ) ) {
			self::register_all_atomic_prop_mappers();
		}

		$layout_atomic_types = [ 'size', 'dimensions', 'string' ];
		$visual_atomic_types = [ 'color', 'background', 'box-shadow', 'border-radius', 'shadow', 'border-width' ];
		$interaction_atomic_types = [ 'boolean', 'number', 'url' ];
		$animation_atomic_types = [ 'transform', 'transition' ];

		$layout_css_properties_count = 0;
		$visual_css_properties_count = 0;
		$interaction_css_properties_count = 0;
		$animation_css_properties_count = 0;

		foreach ( self::$atomic_prop_type_mappers as $atomic_prop_type => $atomic_prop_mapper ) {
			$css_properties_count = count( $atomic_prop_mapper->get_supported_properties() );
			
			if ( in_array( $atomic_prop_type, $layout_atomic_types, true ) ) {
				$layout_css_properties_count += $css_properties_count;
			} elseif ( in_array( $atomic_prop_type, $visual_atomic_types, true ) ) {
				$visual_css_properties_count += $css_properties_count;
			} elseif ( in_array( $atomic_prop_type, $interaction_atomic_types, true ) ) {
				$interaction_css_properties_count += $css_properties_count;
			} elseif ( in_array( $atomic_prop_type, $animation_atomic_types, true ) ) {
				$animation_css_properties_count += $css_properties_count;
			}
		}

		return [
			'layout_mappers_count' => count( array_intersect( array_keys( self::$atomic_prop_type_mappers ), $layout_atomic_types ) ),
			'layout_css_properties_count' => $layout_css_properties_count,
			'visual_mappers_count' => count( array_intersect( array_keys( self::$atomic_prop_type_mappers ), $visual_atomic_types ) ),
			'visual_css_properties_count' => $visual_css_properties_count,
			'interaction_mappers_count' => count( array_intersect( array_keys( self::$atomic_prop_type_mappers ), $interaction_atomic_types ) ),
			'interaction_css_properties_count' => $interaction_css_properties_count,
			'animation_mappers_count' => count( array_intersect( array_keys( self::$atomic_prop_type_mappers ), $animation_atomic_types ) ),
			'animation_css_properties_count' => $animation_css_properties_count,
			'total_atomic_prop_mappers' => count( self::$atomic_prop_type_mappers ),
			'total_convertible_css_properties' => count( self::$css_property_to_mapper_registry )
		];
	}

	public static function get_atomic_prop_mappers_organized_by_css_purpose(): array {
		if ( empty( self::$atomic_prop_type_mappers ) ) {
			self::register_all_atomic_prop_mappers();
		}

		return [
			'layout_and_positioning' => [
				'size' => self::$atomic_prop_type_mappers['size'] ?? null,
				'dimensions' => self::$atomic_prop_type_mappers['dimensions'] ?? null,
				'string' => self::$atomic_prop_type_mappers['string'] ?? null,
			],
			'visual_appearance' => [
				'color' => self::$atomic_prop_type_mappers['color'] ?? null,
				'background' => self::$atomic_prop_type_mappers['background'] ?? null,
				'box-shadow' => self::$atomic_prop_type_mappers['box-shadow'] ?? null,
				'border-radius' => self::$atomic_prop_type_mappers['border-radius'] ?? null,
				'shadow' => self::$atomic_prop_type_mappers['shadow'] ?? null,
				'border-width' => self::$atomic_prop_type_mappers['border-width'] ?? null,
			],
			'user_interaction' => [
				'boolean' => self::$atomic_prop_type_mappers['boolean'] ?? null,
				'number' => self::$atomic_prop_type_mappers['number'] ?? null,
				'url' => self::$atomic_prop_type_mappers['url'] ?? null,
			],
			'animations_and_transitions' => [
				'transform' => self::$atomic_prop_type_mappers['transform'] ?? null,
				'transition' => self::$atomic_prop_type_mappers['transition'] ?? null,
			],
		];
	}
}