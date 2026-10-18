<?php

namespace Elementor\Modules\Variables\Transformers;

use Elementor\Modules\AtomicWidgets\PropsResolver\Props_Resolver_Context;
use Elementor\Modules\AtomicWidgets\PropsResolver\Transformer_Base;
use Elementor\Modules\AtomicWidgets\Styles\Grid_Track_Renderer;
use Elementor\Modules\Variables\Classes\Variables;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Global_Variable_Transformer extends Transformer_Base {
	public function transform( $value, Props_Resolver_Context $context ) {
		$variable = Variables::by_id( $value );

		if ( ! $variable ) {
			return null;
		}

		if ( Grid_Track_Renderer::is_grid_track_property( $context->get_key() ) ) {
			$track_value = trim( $variable['value'] ?? '' );

			// Only a plain count like "3" or "3fr" becomes repeat(), other values are full track lists.
			if ( preg_match( '/^\d+(\.\d+)?\s*(fr)?$/i', $track_value ) ) {
				return Grid_Track_Renderer::format_repeat( (int) $track_value );
			}
		}

		if ( array_key_exists( 'deleted', $variable ) && $variable['deleted'] ) {
			return "var(--{$value})";
		}

		$identifier = trim( $variable['label'] ?? '' );

		if ( '' === $identifier ) {
			return null;
		}

		return "var(--{$identifier})";
	}
}
