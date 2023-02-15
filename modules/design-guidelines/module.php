<?php

namespace Elementor\Modules\DesignGuidelines;

use Elementor\Core\Documents_Manager;
use Elementor\Modules\DesignGuidelines\Components\Design_Guidelines_Post;
use Elementor\Modules\DesignGuidelines\documents\Design_Guidelines;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly
}

class Module extends \Elementor\Core\Base\Module {

	/**
	 * Initialize the Container-Converter module.
	 *
	 * @return void
	 */
	public function __construct() {
		add_action( 'elementor/documents/register', [ $this, 'register_document' ] );

//		add_filter('update_post_metadata', function($check, $object_id, $meta_key, $meta_value, $prev_value) {
//			if ($meta_key === '_wp_page_template'){
//				var_dump('update_post_metadata');
//			}
//			return $check;
//		}, 10, 5);

		new Design_Guidelines_Post();
	}

	public function get_script_url() {
		return $this->get_js_assets_url( 'design-guidelines' );
	}

	public function get_style_url() {
		return $this->get_css_assets_url( 'modules/design-guidelines/module' );
	}

	/**
	 * Retrieve the module name.
	 *
	 * @return string
	 */
	public function get_name() {
		return 'design-guidelines';
	}

	/**
	 * Determine whether the module is active.
	 *
	 * @return bool
	 */
	public static function is_active() {
		return true;
		//		return Plugin::$instance->experiments->is_feature_active( 'container' );// TODO 06/02/2023 : Add check for design guidelines experiment.
	}

	public static function get_experimental_data() {
		return false; //todo
	}

	/**
	 * @param Documents_Manager $documents_manager
	 */
	public function register_document( $documents_manager ) {
		$documents_manager->register_document_type( Design_Guidelines::TYPE, Design_Guidelines::get_class_full_name() );
	}


}
