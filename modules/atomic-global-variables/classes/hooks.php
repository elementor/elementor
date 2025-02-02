<?php

namespace Elementor\Modules\AtomicGlobalVariables\Classes;

use Elementor\Core\Isolation\Wordpress_Adapter_Interface;
use Elementor\Modules\AtomicGlobalVariables\PropTypes\Color_Variable_Prop_Type;
use Elementor\Modules\AtomicGlobalVariables\Transformers\Global_Variable as Global_Variable_Transformer;
use Elementor\Modules\AtomicWidgets\PropsResolver\Transformers_Registry;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Hooks {
	private Wordpress_Adapter_Interface $wp_kernel;

	public function __construct( Wordpress_Adapter_Interface $wp_kernel ) {
		$this->wp_kernel = $wp_kernel;
	}

	public function register() {
		$this->wp_kernel->add_action( 'elementor/atomic-widgets/styles/transformers/register', function ( $transformers ) {
			$this->register_style_transformers( $transformers );
		} );

		$this->wp_kernel->add_filter( 'elementor/atomic-widgets/styles/schema', function ( $schema ) {
			return $this->filter_style_schema( $schema );
		} );

		return $this;
	}

	private function register_style_transformers( Transformers_Registry $transformers ) {
		$transformers->register( Color_Variable_Prop_Type::get_key(), new Global_Variable_Transformer() );
	}

	private function filter_style_schema( array $schema ): array {
		return ( new Style_Schema() )->append( $schema );
	}
}
