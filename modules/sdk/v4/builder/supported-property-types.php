<?php

namespace Elementor\Modules\Sdk\V4\Builder;

use Exception;

/**
 * @package Elementor\Modules\AtomicWidgets\Elements\Sdk
 * @since 3.32.0
 */
enum SUPPORTED_PROPERTY_TYPES: string {

	case IMAGE = 'image';
	case LINK = 'link';
	case BOOLEAN = 'boolean';
	case BOOL = 'bool';
	case SWITCH = 'switch';
	case TEXT = 'text';
	case SELECT = 'select';
	case TEXT_AREA = 'text_area';

	public static function is( string $value ): string {
		foreach ( self::cases() as $type ) {
			if ( $type->value === $value ) {
				return $value;
			}
		}
		throw new Exception( "Unsupported property type {$value}" );
	}
}
