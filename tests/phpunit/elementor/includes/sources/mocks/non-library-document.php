<?php

namespace Elementor\Testing\Includes\Mocks;

use Elementor\Core\Base\Document;

class Non_Library_Document extends Document {

	public static function get_properties() {
		$properties = parent::get_properties();

		$properties['cpt'] = [ 'non_library_document' ];

		return $properties;
	}

	public function get_name() {
		return 'non-library-document';
	}

	public static function get_type() {
		return 'non-library-document';
	}

	public static function get_title() {
		return esc_html__( 'Non Library Document', 'elementor' );
	}

	public static function get_plural_title() {
		return esc_html__( 'Non Library Documents', 'elementor' );
	}
}
