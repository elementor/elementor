<?php

namespace Elementor\Testing\Includes\Mocks;

use Elementor\Core\Base\Document;

class Extended_Library_Document extends Document {

	public static function get_properties() {
		$properties = parent::get_properties();
		$properties['show_in_library'] = false;

		$properties['cpt'] = [ 'elementor_library' ];

		return $properties;
	}

	public function get_name() {
		return 'extended-library-document';
	}

	public static function get_type() {
		return 'extended-library-document';
	}

	public static function get_title() {
		return esc_html__( 'Extended Library Document', 'elementor' );
	}

	public static function get_plural_title() {
		return esc_html__( 'Extended Library Documents', 'elementor' );
	}
}
