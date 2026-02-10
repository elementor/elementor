<?php

namespace Elementor\Modules\Variables\Utils;

use Elementor\Modules\Variables\Adapters\Prop_Type_Adapter;
use Elementor\Modules\Variables\PropTypes\Color_Variable_Prop_Type;
use Elementor\Modules\Variables\PropTypes\Font_Variable_Prop_Type;
use Elementor\Modules\Variables\PropTypes\Size_Variable_Prop_Type;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Variable_Type_Keys {
	private static ?array $types_cache = null;
	private static ?array $mappings_cache = null;

	public static function get_all(): array {
		if ( null === self::$types_cache ) {
			self::$types_cache = [
				Color_Variable_Prop_Type::get_key(),
				Font_Variable_Prop_Type::get_key(),
				Size_Variable_Prop_Type::get_key(),
				Prop_Type_Adapter::GLOBAL_CUSTOM_SIZE_VARIABLE_KEY,
			];
		}

		return self::$types_cache;
	}

	public static function is_variable_type( $type ): bool {
		if ( ! is_string( $type ) || '' === $type ) {
			return false;
		}

		return in_array( $type, self::get_all(), true );
	}

	public static function get_type_mappings(): array {
		if ( null === self::$mappings_cache ) {
			self::$mappings_cache = [
				Color_Variable_Prop_Type::get_key() => 'color',
				Font_Variable_Prop_Type::get_key() => 'string',
				Size_Variable_Prop_Type::get_key() => 'size',
				Prop_Type_Adapter::GLOBAL_CUSTOM_SIZE_VARIABLE_KEY => 'size',
			];
		}

		return self::$mappings_cache;
	}

	public static function get_resolved_type( string $variable_type ): ?string {
		return self::get_type_mappings()[ $variable_type ] ?? null;
	}
}
