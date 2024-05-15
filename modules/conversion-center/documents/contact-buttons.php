<?php

namespace Elementor\Modules\ConversionCenter\Documents;

use Elementor\Core\DocumentTypes\PageBase;
use Elementor\Modules\Library\Traits\Library as Library_Trait;
use Elementor\Modules\ConversionCenter\Module as ConversionCenterModule;
use Elementor\Modules\PageTemplates\Module as Page_Templates_Module;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly
}

class Contact_Buttons extends PageBase {
	use Library_Trait;

	public static function get_properties() {
		$properties = parent::get_properties();

		$properties['support_kit'] = false;
		$properties['show_in_library'] = false;
		$properties['cpt'] = [ ConversionCenterModule::CPT_CONTACT_PAGES ];
		$properties['show_navigator'] = false;
		$properties['allow_adding_widgets'] = false;
		$properties['support_page_layout'] = false;
		$properties['show_copy_and_share'] = true;
		$properties['library_close_title'] = esc_html__( 'Go To Dashboard', 'elementor' );

		return $properties;
	}

	public static function get_type() {
		return ConversionCenterModule::CONTACT_PAGE_DOCUMENT_TYPE;
	}

	public static function register_post_fields_control( $document ) {}

	public static function register_hide_title_control( $document ) {}

	public function get_name() {
		return ConversionCenterModule::CONTACT_PAGE_DOCUMENT_TYPE;
	}

	public static function get_title() {
		return esc_html__( 'Contact Button', 'elementor' );
	}
	public static function get_plural_title() {
		return esc_html__( 'Contact Buttons', 'elementor' );
	}

	public static function get_create_url() {
		return parent::get_create_url() . '#library';
	}
}
