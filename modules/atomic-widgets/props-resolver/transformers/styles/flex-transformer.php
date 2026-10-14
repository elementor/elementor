<?php

namespace Elementor\Modules\AtomicWidgets\PropsResolver\Transformers\Styles;

use Elementor\Modules\AtomicWidgets\PropsResolver\Props_Resolver_Context;
use Elementor\Modules\AtomicWidgets\PropsResolver\Transformer_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Flex_Transformer extends Transformer_Base {
	const DEFAULT_FLEX_GROW = 0;
	const DEFAULT_FLEX_SHRINK = 1;
	const DEFAULT_FLEX_BASIS = 'auto';

	public function transform( $value, Props_Resolver_Context $context ) {
		$grow = $value['flexGrow'] ?? null;
		$shrink = $value['flexShrink'] ?? null;
		$basis = $value['flexBasis'] ?? null;

		$has_grow = null !== $grow && '' !== $grow;
		$has_shrink = null !== $shrink && '' !== $shrink;
		$has_basis = null !== $basis && '' !== $basis;

		if ( ! $has_grow && ! $has_shrink && ! $has_basis ) {
			return null;
		}

		$grow_out = $has_grow ? $grow : self::DEFAULT_FLEX_GROW;
		$shrink_out = $has_shrink ? $shrink : self::DEFAULT_FLEX_SHRINK;
		$basis_out = $has_basis ? $this->transform_basis_value( $basis ) : self::DEFAULT_FLEX_BASIS;

		return "{$grow_out} {$shrink_out} {$basis_out}";
	}

	private function transform_basis_value( $basis ) {
		if ( is_array( $basis ) && isset( $basis['size'] ) ) {
			$unit = $basis['unit'] ?? '';
			return $basis['size'] . $unit;
		}

		return (string) $basis;
	}
}
