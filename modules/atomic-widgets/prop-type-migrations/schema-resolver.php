<?php

namespace Elementor\Modules\AtomicWidgets\PropTypeMigrations;

use Elementor\Modules\AtomicWidgets\PropTypes\Contracts\Prop_Type;
use Elementor\Modules\AtomicWidgets\Styles\Style_Schema;
use Elementor\Modules\GlobalClasses\Utils\Atomic_Elements_Utils;
use Elementor\Modules\Interactions\Schema\Interactions_Schema;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Schema_Resolver {
	const UNIQUE_PATHS_IDENTIFIERS = [
		'widget_settings' => 'settings',
		'style_variants' => 'variants',
		'style_props' => 'props',
		'interactions_items' => 'items',
		'interactions' => 'interactions',
	];

	private static ?string $widget_context = null;

	public static function update_widget_context( array $data ): void {
		if ( isset( $data['elType'] ) || isset( $data['widgetType'] ) ) {
			self::$widget_context = $data['widgetType'] ?? $data['elType'] ?? null;
		}
	}

	public static function get_widget_context(): ?string {
		return self::$widget_context;
	}

	public static function resolve( string $key, array $path ): ?Prop_Type {
		if ( in_array( self::UNIQUE_PATHS_IDENTIFIERS['widget_settings'], $path, true ) && self::$widget_context ) {
			$widget_context = self::make_widget_context( self::$widget_context );
			return $widget_context['schema'][ $key ] ?? null;
		} elseif ( in_array( self::UNIQUE_PATHS_IDENTIFIERS['style_variants'], $path, true ) && in_array( self::UNIQUE_PATHS_IDENTIFIERS['style_props'], $path, true ) ) {
			$style_schema = Style_Schema::get();
			return $style_schema[ $key ] ?? null;
		} elseif ( in_array( self::UNIQUE_PATHS_IDENTIFIERS['interactions'], $path, true ) && in_array( self::UNIQUE_PATHS_IDENTIFIERS['interactions_items'], $path, true ) ) {
			$interactions_schema = Interactions_Schema::get();
			return $interactions_schema[ self::UNIQUE_PATHS_IDENTIFIERS['interactions_items'] ][0] ?? null;
		}

		return null;
	}

	private static function make_widget_context( string $element_type ): ?array {
		$schema = self::get_widget_schema( $element_type );

		if ( ! $schema ) {
			return null;
		}

		return [
			'schema' => $schema,
			'element_type' => $element_type,
		];
	}

	public static function get_widget_schema( string $element_type ): ?array {
		$instance = Atomic_Elements_Utils::get_element_instance( $element_type );

		if ( ! $instance || ! method_exists( $instance, 'get_props_schema' ) ) {
			return null;
		}

		$schema = call_user_func( [ $instance, 'get_props_schema' ] );

		return is_array( $schema ) && ! empty( $schema ) ? $schema : null;
	}
}
