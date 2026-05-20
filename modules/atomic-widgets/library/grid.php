<?php
namespace Elementor\Modules\AtomicWidgets\Library;

use Elementor\Modules\Library\Documents\Library_Document;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

/**
 * Elementor Grid library document.
 *
 * Elementor grid library document handler class is responsible for
 * handling a document of a grid container type.
 *
 * @since 3.34.0
 */
class Grid extends Library_Document {

	public static function get_properties() {
		$properties = parent::get_properties();

		$properties['support_kit'] = true;

		return $properties;
	}

	public function get_name() {
		return 'e-grid';
	}

	public static function get_title() {
		return esc_html__( 'Grid', 'elementor' );
	}

	public static function get_type() {
		return 'e-grid';
	}
}
