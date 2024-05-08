<?php

namespace Elementor\Modules\ConversionCenter\Documents;

use Elementor\Core\DocumentTypes\PageBase;
use Elementor\Modules\Library\Traits\Library as Library_Trait;
use Elementor\Modules\ConversionCenter\Module as ConversionCenterModule;
use Elementor\Modules\PageTemplates\Module as Page_Templates_Module;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly
}

class Links_Page extends PageBase {

	use Library_Trait;

	public static function get_properties() {
		$properties = parent::get_properties();

		$properties['support_kit'] = false;
		$properties['show_in_library'] = false;
		$properties['cpt'] = [ ConversionCenterModule::CPT_LINKS_PAGES ];
		$properties['show_navigator'] = false;
		$properties['allow_adding_widgets'] = false;
		$properties['support_page_layout'] = false;

		return $properties;
	}

	public static function get_type() {
		return ConversionCenterModule::DOCUMENT_TYPE;
	}

	public static function register_post_fields_control( $document ) {}

	public static function register_hide_title_control( $document ) {}

	public function get_name() {
		return ConversionCenterModule::DOCUMENT_TYPE;
	}

	public static function get_title() {
		return esc_html__( 'Links Page', 'elementor' );
	}
	public static function get_plural_title() {
		return esc_html__( 'Links Pages', 'elementor' );
	}

	public static function get_create_url() {
		return parent::get_create_url() . '#library';
	}

	public function save( $data ) {
		if ( empty( $data['settings']['template'] ) ) {
			$data['settings']['template'] = Page_Templates_Module::TEMPLATE_CANVAS;
		}

		return parent::save( $data );
	}

	public function admin_columns_content( $column_name ) {
		if ( 'elementor_library_type' === $column_name ) {
			$this->print_admin_column_type();
		}
	}

	protected function get_remote_library_config() {
		$config = [
			'type' => static::get_type(),
			'default_route' => 'templates/links-pages',
			'autoImportSettings' => true,
		];

		return array_replace_recursive( parent::get_remote_library_config(), $config );
	}
}
