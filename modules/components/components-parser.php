<?php

namespace Elementor\Modules\Components;

use Elementor\Core\Utils\Api\Parse_Result;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Components_Parser {
	public static function make() {
		return new static();
	}

	public function parse_name( $name ): Parse_Result {
		$result = Parse_Result::make();

		$sanitized = trim( sanitize_text_field( $name ) );

		if ( $sanitized === '' ) {
			$result->errors()->add( 'name', 'sanitized_component_name_is_empty' );
		}

		return $result->wrap( $sanitized );
	}
}
