<?php

namespace Elementor\Modules\AtomicWidgets\PropsResolver;

use Elementor\Modules\AtomicWidgets\PropTypes\Base\Array_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Base\Object_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Contracts\Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Union_Prop_Type;
use Elementor\Modules\GlobalClasses\ImportExport\Import_Export;
use Exception;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Import_Export_Props_Resolver extends Props_Resolver {
	const CONTEXT_IMPORT = 'import';
	const CONTEXT_EXPORT = 'export';

	public static function for_import(): self {
		return static::instance( self::CONTEXT_IMPORT );
	}

	public static function for_export(): self {
		return static::instance( self::CONTEXT_EXPORT );
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
