<?php
namespace Elementor\Modules\LandingPages\Documents;

use Elementor\Core\DocumentTypes\PageBase;
use Elementor\Modules\LandingPages\Module as Landing_Pages_Module;
use Elementor\Modules\PageTemplates\Module as Page_Templates_Module;
use Elementor\TemplateLibrary\Source_Local;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly
}

class Landing_Page extends PageBase {

	public static function get_properties() {
		$properties = parent::get_properties();

		$properties['support_kit'] = true;
		$properties['show_in_library'] = true;
		$properties['cpt'] = [ Landing_Pages_Module::CPT ];

		return $properties;
	}

	/**
	 * @access public
	 */
	public function get_name() {
		return Landing_Pages_Module::DOCUMENT_TYPE;
	}

	/**
	 * @access public
	 * @static
	 */
	public static function get_title() {
		return __( 'Landing Page', 'elementor' );
	}

	/**
	 * Save Document.
	 *
	 * Save an Elementor document.
	 *
	 * @since 3.1.0
	 * @access public
	 *
	 * @param $data
	 *
	 * @return bool
	 */
	public function save( $data ) {
		// This is for the first time a Landing Page is created. It is done in order to load a new Landing Page with
		// 'Canvas' as the default page template.
		if ( empty( $data['settings']['template'] ) ) {
			$data['settings']['template'] = Page_Templates_Module::TEMPLATE_CANVAS;
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
