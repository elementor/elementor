<?php
namespace Elementor\Modules\LandingPages\Documents;

use Elementor\Core\DocumentTypes\Page;
use Elementor\Modules\LandingPages\Module;
use Elementor\Modules\LandingPages\Module as Landing_Pages_Module;
use Elementor\Modules\PageTemplates\Module as PageTemplatesModule;
use Elementor\TemplateLibrary\Source_Local;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly
}

class Landing_Page extends Page {

	public static function get_properties() {
		$properties = parent::get_properties();

		$properties['support_kit'] = true;
		$properties['show_in_library'] = true;

		unset( $properties['cpt'] );

		return $properties;
	}

	/**
	 * @access public
	 */
	public function get_name() {
		return Module::DOCUMENT_TYPE;
	}

	/**
	 * @access public
	 * @static
	 */
	public static function get_title() {
		return __( 'Landing Page', 'elementor' );
	}

	public function save( $data ) {
		// Load a new Landing Page with Canvas as the default page template.
		if ( empty( $data['settings']['template'] ) ) {
			$data['settings']['template'] = PageTemplatesModule::TEMPLATE_CANVAS;
		}

		parent::save( $data );
	}

	/**
	 * Save Template type.
	 *
	 * Set new/updated document type (Page/landing Page). This method is called whenever a page is saved.
	 *
	 * @since 3.1.0
	 * @access public
	 */
	public function save_template_type() {
		$page_data = $this->data_to_be_saved['settings'];

		if ( isset( $page_data['page_type'] ) ) {
			$post_id = $this->get_id();
			$page_type_wp_page = parent::get_name();

			// If 'Page' was selected by the user, since the document is currently a Landing Page - change it to a regular page.
			if ( $page_type_wp_page === $page_data['page_type'] ) {
				// Remove the association to the library taxonomy as a 'landing-page'.
				wp_remove_object_terms( $post_id, Module::DOCUMENT_TYPE, Source_Local::TAXONOMY_TYPE_SLUG );

				// Change the Template Type to 'Page'.
				return $this->update_main_meta( self::TYPE_META_KEY, $page_type_wp_page );
			}
		}

		/**
		 * If the selected page is a Landing Page.
		 */
		// Make sure it is saved as a Landing Page in the Elementor Library Taxonomy.
		wp_set_object_terms( $this->get_id(), Landing_Pages_Module::DOCUMENT_TYPE, Source_Local::TAXONOMY_TYPE_SLUG );

		// Make sure it is saved as a Landing Page Elementor Template Type Meta.
		return $this->update_main_meta( self::TYPE_META_KEY, $this->get_name() );
	}

	protected function get_remote_library_config() {
		$config = [
			'type' => 'lp',
			'default_route' => 'templates/landing-pages',
			'autoImportSettings' => true,
		];

		return array_replace_recursive( parent::get_remote_library_config(), $config );
	}
}
