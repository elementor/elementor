<?php

namespace Elementor\Modules\AtomicGlobalVariables\Classes;

use Elementor\Core\Isolation\Wordpress_Adapter_Interface;
use Elementor\Modules\AtomicGlobalVariables\PropTypes\Color_Variable_Prop_Type;
use Elementor\Modules\AtomicGlobalVariables\Transformers\Global_Variable as Global_Variable_Transformer;
use Elementor\Modules\AtomicWidgets\PropsResolver\Transformers_Registry;
use Elementor\Modules\AtomicGlobalVariables\Classes\CSS as Global_Variables_CSS;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Hooks {
	private Wordpress_Adapter_Interface $wp_adapter;

	public function __construct( Wordpress_Adapter_Interface $wp_adapter ) {
		$this->wp_adapter = $wp_adapter;
	}

	public function register() {
		$this->wp_adapter->add_action( 'elementor/atomic-widgets/styles/transformers/register', function ( $transformers ) {
			$this->register_style_transformers( $transformers );
		} );

		$this->wp_adapter->add_filter( 'elementor/atomic-widgets/styles/schema', function ( $schema ) {
			return $this->augment_style_schema( $schema );
		} );

		$this->wp_adapter->add_action( 'elementor/css-file/post/parse', function ( $post ) {
			$this->inject_global_variables_css( $post );
		} );

		return $this;
	}

	private function register_style_transformers( Transformers_Registry $transformers ) {
		$transformers->register( Color_Variable_Prop_Type::get_key(), new Global_Variable_Transformer() );
	}

	private function augment_style_schema( array $schema ): array {
		return ( new Style_Schema() )->augment( $schema );
	}

	private function inject_global_variables_css( $post ): void {
		( new Global_Variables_CSS() )->append_to( $post );
	}
}
