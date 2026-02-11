<?php

namespace Elementor\Modules\AtomicWidgets\PropTypeMigrations;

use Elementor\Modules\AtomicWidgets\Styles\Style_Schema;
use Elementor\Modules\GlobalClasses\Utils\Atomic_Elements_Utils;
use Elementor\Modules\Interactions\Schema\Interactions_Schema;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Schema_Resolver {
	public static function resolve( string $key, array $parent_data ): ?array {
		if ( $key === 'settings' && isset( $parent_data['elType'] ) ) {
			$element_type = $parent_data['widgetType'] ?? $parent_data['elType'];

			return self::make_widget_context( $element_type );
		}

		if ( $key === 'props' ) {
			$schema = Style_Schema::get();

			return ! empty( $schema )
				? [ 'schema' => $schema, 'element_type' => null ]
				: null;
		}

		if ( $key === 'interactions' ) {
			$schema = Interactions_Schema::get()[ 'items' ];

			return ! empty( $schema )
				? [ 'schema' => $schema, 'element_type' => null ]
				: null;
		}

		return null;
	}

	private static function make_widget_context( string $element_type ): ?array {
		$instance = Atomic_Elements_Utils::get_element_instance( $element_type );

		if ( ! $instance || ! method_exists( $instance, 'get_props_schema' ) ) {
			return null;
		}

		$schema = call_user_func( [ $instance, 'get_props_schema' ] );

		if ( ! is_array( $schema ) || empty( $schema ) ) {
			return null;
		}

		return [
			'schema' => $schema,
			'element_type' => $element_type,
		];
	}
}

