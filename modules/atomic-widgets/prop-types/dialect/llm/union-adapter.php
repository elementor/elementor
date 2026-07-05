<?php

namespace Elementor\Modules\AtomicWidgets\PropTypes\Dialect\Llm;

use Elementor\Modules\AtomicWidgets\PropTypes\Dialect\Adapter_Context;
use Elementor\Modules\AtomicWidgets\PropTypes\Dialect\Base_Dialect_Adapter;
use Elementor\Modules\AtomicWidgets\PropTypes\Dialect\Dialect_Utils;
use Elementor\Modules\AtomicWidgets\PropTypes\Union_Prop_Type;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Union_Adapter extends Base_Dialect_Adapter {
	public static function to_schema( Adapter_Context $ctx ) {
		$children = array_values( array_filter( $ctx->children, fn( $child ) => ! empty( $child ) ) );

		if ( empty( $children ) ) {
			return Dialect_Utils::omit();
		}

		if ( 1 === count( $children ) ) {
			return $children[0];
		}

		return [ 'anyOf' => $children ];
	}

	public static function to_dialect_value( Adapter_Context $ctx, $canonical ) {
		if ( ! is_array( $canonical ) || ! isset( $canonical['$$type'] ) ) {
			return $canonical;
		}

		/** @var Union_Prop_Type $union */
		$union = $ctx->prop_type;
		$member = $union->get_prop_type( $canonical['$$type'] );

		if ( ! $member ) {
			return $canonical;
		}

		$adapters = $member->get_dialect_adapters();
		$adapter_class = $adapters[ $ctx->dialect ] ?? Base_Dialect_Adapter::class;
		$member_ctx = new Adapter_Context( $member, [], null, null, $ctx->dialect );

		return $adapter_class::to_dialect_value( $member_ctx, $canonical );
	}
}
