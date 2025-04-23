<?php

namespace Elementor\Modules\Variables;

use Elementor\Modules\Variables\Classes\CSS as Global_Variables_CSS;
use Elementor\Modules\Variables\Classes\Style_Schema;
use Elementor\Modules\Variables\Classes\Style_Transformers;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Hooks {
	public function register_styles_transformers() {
		add_action( 'elementor/atomic-widgets/styles/transformers/register', function ( $registry ) {
			( new Style_Transformers() )->append_to( $registry );
		} );

		return $this;
	}

	public function filter_for_style_schema() {
		add_filter( 'elementor/atomic-widgets/styles/schema', function ( array $schema ) {
			return ( new Style_Schema() )->augment( $schema );
		} );

		return $this;
	}

	public function register_css_renderer() {
		add_action( 'elementor/css-file/post/parse', function ( $post ) {
			( new Global_Variables_CSS() )->append_to( $post );
		} );

		return $this;
	}
}
