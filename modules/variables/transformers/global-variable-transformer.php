<?php

namespace Elementor\Modules\Variables\Transformers;

use Elementor\Modules\AtomicWidgets\PropsResolver\Props_Resolver_Context;
use Elementor\Modules\AtomicWidgets\PropsResolver\Transformer_Base;
use Elementor\Modules\Variables\Classes\Variables;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Global_Variable_Transformer extends Transformer_Base {
	private const GRID_TRACK_PROPERTIES = [ 'grid-template-columns', 'grid-template-rows' ];
	private const GRID_TRACK_VALUE_PATTERN = '/^(\d+)(?:fr)?$/';

	public function transform( $value, Props_Resolver_Context $context ) {
		$variable = Variables::by_id( $value );

		if ( ! $variable ) {
			return null;
		}

		$stored_value = $variable['value'] ?? '';
		$grid_track_count = $this->resolve_grid_track_count( $stored_value, $context );

		if ( null !== $grid_track_count ) {
			return "repeat({$grid_track_count}, 1fr)";
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

	private function resolve_grid_track_count( string $stored_value, Props_Resolver_Context $context ): ?int {
		if ( ! in_array( $context->get_key(), self::GRID_TRACK_PROPERTIES, true ) ) {
			return null;
		}

		if ( ! preg_match( self::GRID_TRACK_VALUE_PATTERN, trim( $stored_value ), $matches ) ) {
			return null;
		}

		$count = (int) $matches[1];

		return $count >= 1 ? $count : null;
	}
}
