<?php

namespace Elementor\Modules\ConversionCenter\Documents;

use Elementor\Core\DocumentTypes\PageBase;
use Elementor\Modules\Library\Traits\Library;
use Elementor\Modules\ConversionCenter\Module as ConversionCenterModule;
use Elementor\Modules\PageTemplates\Module as Page_Templates_Module;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly
}

class Link_In_Bio  extends PageBase {
	// Library Document Trait
	use Library;

	public static function get_properties() {
		$properties = parent::get_properties();

		$properties['support_kit'] = true;
		$properties['show_in_library'] = true;
		$properties['cpt'] = [ ConversionCenterModule::CPT_LIB ];

		return $properties;
	}

	public static function get_type() {
		return ConversionCenterModule::DOCUMENT_TYPE;
	}

	/**
	 * @access public
	 */
	public function get_name() {
		return ConversionCenterModule::DOCUMENT_TYPE;
	}

	/**
	 * @access public
	 * @static
	 */
	public static function get_title() {
		return esc_html__( 'Link In Bio', 'elementor' );
	}

	/**
	 * @access public
	 * @static
	 */
	public static function get_plural_title() {
		return esc_html__( 'Links In Bio', 'elementor' );
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

	/**
	 * Admin Columns Content
	 *
	 * @since 3.1.0
	 *
	 * @param $column_name
	 * @access public
	 */
	public function admin_columns_content( $column_name ) {
		if ( 'elementor_library_type' === $column_name ) {
			$this->print_admin_column_type();
		}
	}

	protected function get_remote_library_config() {
		$config = [
			'type' => 'lib',
			'default_route' => 'templates/link-in-bios',
			'autoImportSettings' => true,
		];

		return array_replace_recursive( parent::get_remote_library_config(), $config );
	}
}
