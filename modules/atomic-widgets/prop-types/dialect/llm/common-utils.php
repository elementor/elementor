<?php

namespace Elementor\Modules\AtomicWidgets\PropTypes\Dialect\Llm;

use Elementor\Modules\AtomicWidgets\PropTypes\Contracts\Prop_Type;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Common_Utils {
	public static function enrich( array $schema, Prop_Type $prop_type ): array {
		$description = $prop_type->get_meta_item( 'description' );
		if ( $description ) {
			$schema['description'] = $description;
		}

		$llm_instructions = $prop_type->get_meta_item( 'llm_instructions' );
		if ( $llm_instructions ) {
			$schema['llm_instructions'] = $llm_instructions;
		}

		$examples = $prop_type->get_meta_item( 'examples' );
		if ( $examples ) {
			$schema['examples'] = is_array( $examples ) ? $examples : [ $examples ];
		}

		return $schema;
	}
}
