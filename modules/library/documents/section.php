<?php
namespace Elementor\Modules\Library\Documents;

use Elementor\Core\Base\Document;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly
}

class Section extends Document {

	private static $properties = [
		'is_editable' => true,
		'show_in_library' => true,
		'library_view' => 'list',
		'edit_area' => 'content',
	];

	public function get_name() {
		return 'section';
	}

	public function get_title() {
		return __( 'Section', 'elementor' );
	}

	public static function get_type() {
		return 'section';
	}
}
