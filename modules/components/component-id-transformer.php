<?php

namespace Elementor\Modules\Components;

use Elementor\Modules\AtomicWidgets\PropsResolver\Props_Resolver_Context;
use Elementor\Modules\AtomicWidgets\PropsResolver\Transformer_Base;
use Elementor\Plugin;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Component_Id_Transformer extends Transformer_Base {
	public function transform( $value, Props_Resolver_Context $context ) {
		if ( ! $value ) {
			return '';
		}

		return Plugin::$instance->frontend->get_builder_content( $value );
	}
}
