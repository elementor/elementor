<?php

namespace Elementor\Modules\AtomicWidgets\PropTypes\Dialect;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Base_Dialect_Adapter {

	public static function to_schema( Adapter_Context $ctx ) {
		return $ctx->children;
	}

	public static function to_dialect_value( Adapter_Context $ctx, $canonical ) {
		return $canonical;
	}

	public static function to_canonical_value( Adapter_Context $ctx, $value ) {
		return $value;
	}
}
