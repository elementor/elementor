<?php

namespace Elementor\Modules\Components\Transformers;

use Elementor\Modules\AtomicWidgets\PropsResolver\Props_Resolver_Context;
use Elementor\Modules\AtomicWidgets\PropsResolver\Transformer_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Component_Overridable_Transformer extends Transformer_Base {
	public function transform( $value, Props_Resolver_Context $context ) {
		// todo: render component overrides
		return $value['origin_value'];
	}
}
