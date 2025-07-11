<?php

namespace Elementor\Modules\Sdk\V4\Builder;

use Exception;

class SUPPORTED_PROPERTY_TYPES {

	protected const SUPPORTED_PROPERTY_TYPES = [
		'image',
		'link',
		'boolean',
		'bool',
		'switch',
		'text',
		'select',
		'text_area',
	];

	public static function is( string $value ): string {
		if ( ! in_array( $value, self::SUPPORTED_PROPERTY_TYPES, true ) ) {
			throw new Exception( esc_html( "Unsupported property type {$value}" ) );
		}
		return $value;
	}
}
