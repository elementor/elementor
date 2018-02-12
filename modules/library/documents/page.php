<?php
namespace Elementor\Modules\Library\Documents;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly
}

class Page extends Library_Document {

	public static function get_properties() {
		$properties = parent::get_properties();

		$properties['group'] = 'pages';
		return $properties;
	}

	public function get_name() {
		return 'page';
	}

	public static function get_title() {
		return __( 'Page', 'elementor' );
	}
}
