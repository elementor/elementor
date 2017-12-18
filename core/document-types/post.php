<?php
namespace Elementor\Core\DocumentTypes;

use Elementor\Core\Base\Document;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly
}

class Post extends Document {

	private static $properties = [
		'is_editable' => true,
		'show_in_library' => false,
		'library_view' => 'grid',
		'edit_area' => 'content',
	];

	public function get_name() {
		return 'post';
	}

	public static function get_type() {
		return 'post';
	}

	public function get_css_wrapper_selector() {
		return 'body.elementor-page-' . $this->get_id();
	}
}
