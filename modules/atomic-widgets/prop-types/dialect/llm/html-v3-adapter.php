<?php

namespace Elementor\Modules\AtomicWidgets\PropTypes\Dialect\Llm;

use Elementor\Modules\AtomicWidgets\PropTypes\Dialect\Adapter_Context;
use Elementor\Modules\AtomicWidgets\PropTypes\Dialect\Base_Dialect_Adapter;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Html_V3_Adapter extends Base_Dialect_Adapter {
	const ALLOWED_TAGS = [ 'b', 'i', 'em', 'u', 'a', 'del', 'span', 'strong', 'sup', 'sub', 's' ];

	const BASE_DESCRIPTION = 'An innerHTML-like text. Allowed inline tags: b, i, em, u, a, del, span, strong, sup, sub, s.';

	public static function to_schema( Adapter_Context $ctx ) {
		$schema = [ 'type' => 'string' ];

		$description = $ctx->prop_type->get_meta_item( 'description' );
		$schema['description'] = $description
			? $description . ' ' . self::BASE_DESCRIPTION
			: self::BASE_DESCRIPTION;

		$llm_instructions = $ctx->prop_type->get_meta_item( 'llm_instructions', '' );
		$schema['llm_instructions'] = $llm_instructions . ' READ CAREFULLY THE DESCRIPTION.';

		$examples = $ctx->prop_type->get_meta_item( 'examples' );
		if ( $examples ) {
			$schema['examples'] = is_array( $examples ) ? $examples : [ $examples ];
		}

		return $schema;
	}

	public static function to_dialect_value( Adapter_Context $ctx, $canonical ) {
		if ( null === $canonical ) {
			$default = $ctx->prop_type->get_default();
			return $default['value']['content']['value'] ?? null;
		}

		return $canonical['value']['content']['value'] ?? null;
	}

	public static function to_canonical_value( Adapter_Context $ctx, $value ) {
		if ( null === $value ) {
			return null;
		}

		return [
			'$$type' => 'html-v3',
			'value'  => [
				'content'  => [
					'$$type' => 'string',
					'value'  => $value,
				],
				'children' => [],
			],
		];
	}
}
