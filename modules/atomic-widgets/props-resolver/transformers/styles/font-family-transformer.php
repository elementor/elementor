<?php

namespace Elementor\Modules\AtomicWidgets\PropsResolver\Transformers\Styles;

use Elementor\Modules\AtomicWidgets\PropTypes\Font_Family_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropsResolver\Props_Resolver_Context;
use Elementor\Modules\AtomicWidgets\PropsResolver\Transformer_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Font_Family_Transformer extends Transformer_Base {
	public function transform( $value, Props_Resolver_Context $context ) {
		$prop_type = $context->get_prop_type();

		if ( $prop_type instanceof Font_Family_Prop_Type ) {
			return $prop_type->format_for_css( $value );
		}

		return $value;
	}
}
