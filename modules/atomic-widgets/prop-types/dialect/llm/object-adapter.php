<?php

namespace Elementor\Modules\AtomicWidgets\PropTypes\Dialect\Llm;

use Elementor\Modules\AtomicWidgets\PropTypes\Dialect\Adapter_Context;
use Elementor\Modules\AtomicWidgets\PropTypes\Dialect\Base_Dialect_Adapter;
use Elementor\Modules\AtomicWidgets\PropTypes\Dialect\Dialect_Utils;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Object_Adapter extends Base_Dialect_Adapter {
	public static function to_schema( Adapter_Context $ctx ) {
		if ( empty( $ctx->children ) ) {
			return Dialect_Utils::omit();
		}

		return [
			'type'       => 'object',
			'properties' => $ctx->children,
		];
	}

	public static function to_dialect_value( Adapter_Context $ctx, $canonical ) {
		$value = $canonical['value'] ?? null;

		return empty( $value ) ? null : $value;
	}

	public static function to_canonical_value( Adapter_Context $ctx, $value ) {
		if ( null === $value || ! is_array( $value ) ) {
			return null;
		}

		return $ctx->prop_type::generate( $value );
	}
}
