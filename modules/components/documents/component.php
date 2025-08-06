<?php
namespace Elementor\Modules\Components\Documents;

use Elementor\Core\Base\Document;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly
}

class Component extends Document {

	public static function get_properties() {
		$properties = parent::get_properties();

		$properties['cpt'] = [ 'component' ];

		//?
		$properties['admin_tab_group'] = '';
		$properties['has_elements'] = true;
		$properties['is_editable'] = true;
		$properties['show_in_library'] = false;
		$properties['show_on_admin_bar'] = false;
		$properties['show_in_finder'] = false;
		$properties['register_type'] = true;
		$properties['support_conditions'] = false;
		$properties['support_page_layout'] = false;


		$properties['support_wp_page_templates'] = true;
		$properties['support_kit'] = true;

		return $properties;
	}

	public static function get_type() {
		return 'component';
	}

	public static function get_title() {
		return esc_html__( 'Component', 'elementor' );
	}

	public static function get_plural_title() {
		return esc_html__( 'Components', 'elementor' );
	}
    

	// public function save( $data ) {
	// 	// Since the method of 'modules/usage::before_document_save' will remove from global if new_status is the same as old.
	// 	$data['settings'] = [ 'post_status' => Document::STATUS_PUBLISH ];

	// 	return parent::save( $data );
	// }
}
