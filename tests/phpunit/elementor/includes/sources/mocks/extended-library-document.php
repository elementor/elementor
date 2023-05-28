<?php

namespace Elementor\Testing\Includes\Mocks;

use Elementor\Modules\Library\Documents\Library_Document;

class Extended_Library_Document extends Library_Document {

	public static function get_properties() {
		$properties = parent::get_properties();
		$properties['show_in_library'] = false;

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
