<?php
namespace Elementor\Core\DocumentTypes;

use Elementor\Controls_Manager;
use Elementor\Modules\LandingPages\Module as Landing_Pages_Module;
use Elementor\Plugin;
use Elementor\TemplateLibrary\Source_Local;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly
}

class Page extends PageBase {

	/**
	 * Get Properties
	 *
	 * Return Document Configuration Properties.
	 *
	 * @return array $properties
	 */
	public static function get_properties() {
		$properties = parent::get_properties();

		$properties['cpt'] = [ 'page' ];
		$properties['support_kit'] = true;

		return $properties;
	}

	/**
	 * Get Name
	 *
	 * @access public
	 */
	public function get_name() {
		return 'wp-page';
	}

	/**
	 * Get Title
	 *
	 * @access public
	 * @static
	 */
	public static function get_title() {
		return __( 'Page', 'elementor' );
	}

	/**
	 * Register Controls
	 *
	 * When the 'Landing Pages' experiment is active, register The 'page_type' control.
	 *
	 * @since 3.1.0
	 */
	protected function _register_controls() {
		parent::_register_controls();

		if ( ! Plugin::$instance->experiments->is_feature_active( 'landing-pages' ) ) {
			return;
		}

		$this->start_injection( [
			'of' => 'hide_title',
			'fallback' => [
				'of' => 'post_title',
			],
		] );

		$this->add_control(
			'page_type',
			[
				'label' => __( 'Type', 'elementor' ),
				'type' => Controls_Manager::SELECT,
				'default' => $this->get_name(),
				'options' => [
					'wp-page' => __( 'Page', 'elementor' ),
					'landing-page' => __( 'Landing Page', 'elementor' ),
				],
			]
		);

		$this->end_injection();
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

		// If the selected page type is 'Landing Page', convert the document into a Landing Page.
		if ( isset( $page_data['page_type'] ) && Landing_Pages_Module::DOCUMENT_TYPE === $page_data['page_type'] ) {
			// Associate the post with the 'elementor_library_type' taxonomy.
			wp_set_object_terms( $this->get_id(), Landing_Pages_Module::DOCUMENT_TYPE, Source_Local::TAXONOMY_TYPE_SLUG );

			// Set the '_elementor_template_type' meta field value to 'landing-page'.
			return $this->update_main_meta( self::TYPE_META_KEY, Landing_Pages_Module::DOCUMENT_TYPE );
		}

		// If the selected page type is 'Page'.
		return parent::save_template_type();
	}
}
