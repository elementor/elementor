<?php

namespace Elementor\Modules\AtomicWidgets\PropTypes\Dialect\Llm;

use Elementor\Modules\AtomicWidgets\PropTypes\Dialect\Adapter_Context;
use Elementor\Modules\AtomicWidgets\PropTypes\Dialect\Base_Dialect_Adapter;
use Elementor\Modules\AtomicWidgets\PropTypes\Dialect\Dialect_Utils;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Array_Adapter extends Base_Dialect_Adapter {
	public static function to_schema( Adapter_Context $ctx ) {
		$items = $ctx->children[0] ?? null;

		if ( null === $items ) {
			return Dialect_Utils::omit();
		}

		return [
			'type'  => 'array',
			'items' => $items,
		];
	}

	public static function to_dialect_value( Adapter_Context $ctx, $canonical ) {
		return $canonical['value'] ?? null;
	}
}
