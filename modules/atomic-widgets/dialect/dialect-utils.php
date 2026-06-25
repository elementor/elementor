<?php

namespace Elementor\Modules\AtomicWidgets\Dialect;

use Elementor\Modules\AtomicWidgets\PropTypeMigrations\Schema_Resolver;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Dialect_Utils {
	private const OMIT_SIGNAL = '__dialect_omit__';

	public static function omit(): string {
		return self::OMIT_SIGNAL;
	}

	public static function is_omit( $value ): bool {
		return self::OMIT_SIGNAL === $value;
	}

	public static function get_adapters_by_element( string $element_type, string $dialect ): array {
		$schema = Schema_Resolver::get_widget_schema( $element_type );

		if ( ! $schema ) {
			return [];
		}

		$adapters = [];

		foreach ( $schema as $prop_key => $prop_type ) {
			$dialect_adapters = $prop_type->get_dialect_adapters();
			$adapters[ $prop_key ] = $dialect_adapters[ $dialect ] ?? Base_Dialect_Adapter::class;
		}

		return $adapters;
	}
}
