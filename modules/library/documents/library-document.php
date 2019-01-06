<?php
namespace Elementor\Modules\Library\Documents;

use Elementor\Core\Base\Document;
use Elementor\TemplateLibrary\Source_Local;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly
}

/**
 * Elementor library document.
 *
 * Elementor library document handler class is responsible for handling
 * a document of the library type.
 *
 * @since 2.0.0
 */
abstract class Library_Document extends Document {

	/**
	 * The taxonomy type slug for the library document.
	 */
	const TAXONOMY_TYPE_SLUG = 'elementor_library_type';

	/**
	 * Get document properties.
	 *
	 * Retrieve the document properties.
	 *
	 * @since 2.0.0
	 * @access public
	 * @static
	 *
	 * @return array Document properties.
	 */
	public static function get_properties() {
		$properties = parent::get_properties();

		$properties['admin_tab_group'] = 'library';
		$properties['show_in_library'] = true;
		$properties['register_type'] = true;

		return $properties;
	}

	public function print_admin_column_type() {
		$admin_filter_url = admin_url( Source_Local::ADMIN_MENU_SLUG . '&elementor_library_type=' . $this->get_name() );

		printf( '<a href="%s">%s</a>', $admin_filter_url, $this->get_title() );
	}

	/**
	 * Save document type.
	 *
	 * Set new/updated document type.
	 *
	 * @since 2.0.0
	 * @access public
	 */
	public function save_template_type() {
		parent::save_template_type();

		wp_set_object_terms( $this->post->ID, $this->get_name(), self::TAXONOMY_TYPE_SLUG );
	}
}
