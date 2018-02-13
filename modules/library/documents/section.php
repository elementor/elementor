<?php
namespace Elementor\Modules\Library\Documents;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly
}

class Section extends Library_Document {

	public static function get_properties() {
		$properties = parent::get_properties();

		$properties['library_view'] = 'list';
		$properties['group'] = 'blocks';

		return $properties;
	}

	public function get_name() {
		return 'section';
	}

	public static function get_title() {
		return __( 'Section', 'elementor' );
	}
}
