<?php

namespace Elementor\Modules\Variables;

use Elementor\Modules\Variables\Classes\Style_Schema;
use Elementor\Modules\Variables\Classes\Style_Transformers;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}
 
class Hooks {
	const PACKAGES = [
		'editor-global-variables'
	];

	public function register_packages() {
		add_filter( 'elementor/editor/v2/packages', function ( $packages ) {
			if ( ! current_user_can( 'manage_options' ) ) {
				return $packages;
			}

			return array_merge( $packages, self::PACKAGES );
		} );
		
		return $this;
	}

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
}
