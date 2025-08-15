<?php
namespace Elementor\Modules\CssConverter;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

require_once __DIR__ . '/variable-convertors/variable-convertor-registry.php';
require_once __DIR__ . '/variable-convertors/variable-convertor-interface.php';
require_once __DIR__ . '/variable-convertors/color-hex-variable-convertor.php';

use Elementor\Modules\CssConverter\VariableConvertors\Variable_Convertor_Registry;

class Variable_Conversion_Service {
	public static function convert_to_editor_variables( array $variables ): array {
		$registry = new Variable_Convertor_Registry();
		$converted = [];
		foreach ( $variables as $variable ) {
			$name = is_array( $variable ) && isset( $variable['name'] ) ? $variable['name'] : null;
			$value = is_array( $variable ) && isset( $variable['value'] ) ? $variable['value'] : null;
			if ( ! is_string( $name ) || ! is_string( $value ) ) {
				continue;
			}
			$convertor = $registry->resolve( $name, $value );
			if ( $convertor ) {
				$converted[] = $convertor->convert( $name, $value );
			}
		}
		return $converted;
	}
}


