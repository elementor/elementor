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
		$properties['library_close_title'] = esc_html__( 'Go To Dashboard', 'elementor' );
		$properties['publish_button_title'] = esc_html__( 'When published, this widget will be visible across the entire site', 'elementor' );

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

	public function filter_admin_row_actions( $actions ) {
		unset( $actions['edit'] );
		unset( $actions['inline hide-if-no-js'] );
		$built_with_elementor = parent::filter_admin_row_actions( [] );

		if ( isset( $actions['trash'] ) ) {
			$delete = $actions['trash'];
			unset( $actions['trash'] );
			$actions['trash'] = $delete;
		}

		return $built_with_elementor + $actions;
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

	public function get_edit_url() {
		$url = parent::get_edit_url();

		if ( ! $this->get_post()->post_content ) {
			$url .= '#library';
		}

		return $url;
	}

	protected function get_remote_library_config() {
		$config = [
			'type' => 'link_page',
			'default_route' => 'templates/contact-buttons',
			'autoImportSettings' => true,
		];

		return array_replace_recursive( parent::get_remote_library_config(), $config );
	}
}
