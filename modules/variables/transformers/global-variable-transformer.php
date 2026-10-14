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
	const STATE_VARIABLE_PATTERN = '/^e-state-[a-z_][a-z0-9_]*$/';

	public function transform( $value, Props_Resolver_Context $context ) {
		if ( 1 === preg_match( self::STATE_VARIABLE_PATTERN, (string) $value ) ) {
			return "var(--{$value})";
		}

		$variable = Variables::by_id( $value );

		if ( ! $variable ) {
			return null;
		}

		if ( Grid_Track_Renderer::is_grid_track_property( $context->get_key() ) ) {
			$count = (int) trim( $variable['value'] ?? '' );

			return Grid_Track_Renderer::format_repeat( $count );
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
