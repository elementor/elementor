<?php
namespace Elementor\Modules\CloudLibrary\Documents;

use Elementor\Core\Base\Document;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

/**
 * Elementor section library document.
 *
 * Elementor section library document handler class is responsible for
 * handling a document of a section type.
 *
 * @since 2.0.0
 */
class Folder extends Document {

	public static function get_properties()
	{
		$properties =  parent::get_properties();

		$properties['admin_tab_group'] = '';
		$properties['has_elements'] = false;
		$properties['is_editable'] = false;
		$properties['show_in_library'] = false;
		$properties['show_on_admin_bar'] = false;
		$properties['show_in_finder'] = false;
		$properties['register_type'] = true;

		return $properties;
	}

	public static function get_type(): string {
		return 'folder';
	}

	public static function get_title(): string {
		return esc_html__( 'Folder', 'elementor' );
	}

	public static function get_plural_title(): string {
		return esc_html__( 'Folders', 'elementor' );
	}
}
