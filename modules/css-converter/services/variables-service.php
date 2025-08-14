<?php
namespace Elementor\Modules\CssConverter\Services;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

require_once __DIR__ . '/../parsers/css-parser.php';
require_once __DIR__ . '/../variable-conversion.php';

use Elementor\Modules\CssConverter\Parsers\CssParser;
use function Elementor\Modules\CssConverter\elementor_css_variables_convert_to_editor_variables;

class Variables_Service {
	public function variables_from_css_string( string $css ): array {
		$parser = new CssParser();
		$parsed = $parser->parse( $css );
		$variables = $parser->extract_variables( $parsed );
		$normalized = [];
		foreach ( $variables as $var ) {
			$normalized[] = [
				'name' => isset( $var['name'] ) ? $var['name'] : '',
				'value' => isset( $var['value'] ) ? $var['value'] : '',
			];
		}
		return elementor_css_variables_convert_to_editor_variables( $normalized );
	}
}


