<?php

namespace Elementor\Modules\Variables;

use Elementor\Core\Isolation\Wordpress_Adapter_Interface;
use Elementor\Modules\Variables\Classes\CSS as Global_Variables_CSS;
use Elementor\Modules\Variables\Classes\Style_Schema;
use Elementor\Modules\Variables\Classes\Style_Transformers;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Hooks {
	private Wordpress_Adapter_Interface $wp_adapter;

	public function __construct( Wordpress_Adapter_Interface $wp_adapter ) {
		$this->wp_adapter = $wp_adapter;
	}

	public function register_styles_transformers() {
		add_action( 'elementor/atomic-widgets/styles/transformers/register', function ( $registry ) {
			( new Style_Transformers() )->append_to( $registry );
		} );

		return $this;
	}

	public function register() {
		$this->wp_adapter->add_action( 'elementor/css-file/post/parse', function ( $post ) {
			$this->inject_global_variables_css( $post );
		} );

		$this->wp_adapter->add_filter( 'elementor/atomic-widgets/styles/schema', function ( $schema ) {
			return $this->augment_style_schema( $schema );
		} );

		return $this;
	}

	private function augment_style_schema( array $schema ): array {
		return ( new Style_Schema() )->augment( $schema );
	}

	private function inject_global_variables_css( $post ): void {
		( new Global_Variables_CSS( $this->wp_adapter ) )->append_to( $post );
	}
}
