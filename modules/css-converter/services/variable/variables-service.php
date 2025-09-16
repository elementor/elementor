<?php
namespace Elementor\Modules\CssConverter\Services\Variable;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

use Elementor\Modules\CssConverter\Parsers\CssParser;
use Elementor\Modules\CssConverter\Variable_Conversion_Service;

class Variables_Service {
	private $parser;
	public function __construct( $parser = null ) {
		$this->parser = null !== $parser ? $parser : new CssParser();
	}
	public function variables_from_css_string( string $css ): array {
		$parser = $this->parser;
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
