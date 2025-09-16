<?php
namespace Elementor\Modules\CssConverter\Services\Variable;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

use Elementor\Modules\CssConverter\VariableConvertors\Variable_Convertor_Registry;

class Variable_Conversion_Service {
	public static function convert_to_editor_variables( array $variables ): array {
		$registry = new Variable_Convertor_Registry();
		$converted = [];

		foreach ( $variables as $variable ) {
			$name = is_array( $variable ) && isset( $variable['name'] ) ? $variable['name'] : null;
			$value = is_array( $variable ) && isset( $variable['value'] ) ? $variable['value'] : null;

			if ( ! self::is_valid_variable_pair( $name, $value ) ) {
				continue;
			}

			$convertor = $registry->resolve( $name, $value );

			if ( $convertor ) {
				$converted[] = $convertor->convert( $name, $value );
			}
		}

		return $converted;
	}

	private static function is_valid_variable_pair( $name, $value ): bool {
		return is_string( $name ) && is_string( $value );
	}
}
