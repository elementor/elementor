<?php
namespace Elementor\Modules\CssConverter\Services;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

use Elementor\Modules\CssConverter\Parsers\CssParser;
use Elementor\Modules\CssConverter\Variable_Conversion_Service;

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

		return Variable_Conversion_Service::convert_to_editor_variables( $normalized );
	}
}
