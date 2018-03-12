<?php
namespace Elementor\Modules\Library\Documents;

use Elementor\Core\DocumentTypes\Post;

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

	protected function _register_controls() {
		parent::_register_controls();

		Post::register_hide_title_control( $this );

		Post::register_style_controls( $this );
	}
}
