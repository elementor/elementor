<?php

namespace Elementor\Modules\AtomicWidgets\PropTypes\Dialect\Llm;

use Elementor\Modules\AtomicWidgets\PropTypes\Dialect\Adapter_Context;
use Elementor\Modules\AtomicWidgets\PropTypes\Dialect\Base_Dialect_Adapter;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Scalar_Adapter extends Base_Dialect_Adapter {
	public static function to_schema( Adapter_Context $ctx ) {
		$prop_type = $ctx->prop_type;
		$enum = method_exists( $prop_type, 'get_enum' ) ? $prop_type->get_enum() : null;

		$base = $enum
			? [ 'enum' => $enum ]
			: [ 'type' => $prop_type->get_type() ];

		$regex = method_exists( $prop_type, 'get_regex' ) ? $prop_type->get_regex() : null;
		if ( $regex ) {
			$base['pattern'] = $regex;
		}

		return $base;
	}

	public static function to_dialect_value( Adapter_Context $ctx, $canonical ) {
		return $canonical['value'] ?? null;
	}

	public static function to_canonical_value( Adapter_Context $ctx, $value ) {
		return $ctx->prop_type::generate( $value );
	}
}
