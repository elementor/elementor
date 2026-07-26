<?php

namespace Elementor\Modules\AtomicWidgets\PropsResolver;

use Elementor\Modules\AtomicWidgets\PropTypes\Contracts\Prop_Type;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Import_Export_Props_Resolver extends Props_Resolver {
	const CONTEXT_IMPORT = 'import';
	const CONTEXT_EXPORT = 'export';
	const CONTEXT_PLAIN = 'plain';

	public static function for_import() {
		return static::instance( self::CONTEXT_IMPORT );
	}

	public static function for_export() {
		return static::instance( self::CONTEXT_EXPORT );
	}

	public static function for_plain() {
		return static::instance( self::CONTEXT_PLAIN );
	}

	public function resolve_value( $value, Prop_Type $prop_type ) {
		return $this->resolve_item( $value, null, $prop_type );
	}

	public function resolve( array $schema, array $props ): array {
		$resolved = [];

		foreach ( $schema as $key => $prop_type ) {
			if ( ! ( $prop_type instanceof Prop_Type ) ) {
				continue;
			}

			$value = $this->resolve_item( $props[ $key ] ?? null, $key, $prop_type );

			if ( null === $value ) {
				continue;
			}

			$resolved[ $key ] = $value;
		}

		return $resolved;
	}

	protected function resolve_item( $value, $key, Prop_Type $prop_type ) {
		if ( null === $value ) {
			return null;
		}

		if ( ! $this->is_transformable( $value ) ) {
			return $value;
		}

		return $this->transform( $value, $key, $prop_type );
	}
}
