<?php

namespace Elementor\Modules\AtomicWidgets\DynamicTags;

use Elementor\Modules\AtomicWidgets\PropsResolver\Props_Resolver_Context;
use Elementor\Modules\AtomicWidgets\PropsResolver\Transformer_Base;
use Elementor\Modules\AtomicWidgets\Styles\Dynamic_Styles_Manager;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Styles_Dynamic_Transformer extends Transformer_Base {

	public function transform( $value, Props_Resolver_Context $context ) {
		if ( ! is_array( $value ) ) {
			return null;
		}

		$dynamic_node = Dynamic_Prop_Type::generate( $value );
		$var_name = Dynamic_Styles_Manager::instance()->register( $dynamic_node );

		if ( '' === $var_name ) {
			return null;
		}

		return 'var(' . $var_name . ')';
	}
}
