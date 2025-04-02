<?php

namespace Elementor\Modules\Variables;

use Elementor\Modules\Variables\Classes\Style_Schema;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Hooks {
	public function register() {
		add_action( 'elementor/atomic-widgets/styles/transformers/register', function ( $transformers ) {
			$this->register_style_transformers( $transformers );
		} );

		return $this;
	}

	private function register_style_transformers( $transformers ) {
		( new Style_Schema() )->append_to( $transformers );
	}
}
