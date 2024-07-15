<?php

namespace Elementor\Modules\FloatingButtons\Documents;

use Elementor\Core\DocumentTypes\PageBase;
use Elementor\Modules\Library\Traits\Library as Library_Trait;
use Elementor\Modules\FloatingButtons\Module as Floating_Buttons_Module;
use Elementor\Modules\PageTemplates\Module as Page_Templates_Module;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly
}

class Floating_Buttons extends PageBase {
	use Library_Trait;

	public static function get_properties() {
		$properties = parent::get_properties();

		$properties['support_kit'] = true;
		$properties['support_site_editor'] = false;
		$properties['cpt'] = [ Floating_Buttons_Module::CPT_FLOATING_BUTTONS ];
		$properties['show_navigator'] = false;
		$properties['allow_adding_widgets'] = false;
		$properties['support_page_layout'] = false;
		$properties['library_close_title'] = esc_html__( 'Go To Dashboard', 'elementor' );
		$properties['publish_button_title'] = esc_html__( 'After publishing this widget, you will be able to set it as visible on the entire site in the Admin Table.', 'elementor' );
		$properties['allow_closing_remote_library'] = false;

		return $properties;
	}

	public function print_content() {
		$plugin = \Elementor\Plugin::$instance;

		if ( $plugin->preview->is_preview_mode( $this->get_main_id() ) ) {
			// PHPCS - the method builder_wrapper is safe.
			echo $plugin->preview->builder_wrapper( '' ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
		} else {
			// PHPCS - the method get_content is safe.
			echo $this->get_content(); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
		}
	}

	public function get_location() {
		return self::get_property( 'location' );
	}

	public static function get_type() {
		return Floating_Buttons_Module::FLOATING_BUTTONS_DOCUMENT_TYPE;
	}

	public static function register_post_fields_control( $document ) {}

	public static function register_hide_title_control( $document ) {}

	public function get_name() {
		return Floating_Buttons_Module::FLOATING_BUTTONS_DOCUMENT_TYPE;
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

		if ( 'publish' === $this->get_post()->post_status ) {
			$actions = $this->set_as_entire_site( $actions );
		}

		return $built_with_elementor + $actions;
	}

	public function set_as_entire_site( $actions ) {
		if ( get_post_meta( $this->get_post()->ID, '_elementor_conditions', true ) ) {
			$actions['set_as_entire_site'] = sprintf(
				'<a style="color:red;" href="?post=%s&action=remove_from_entire_site&_wpnonce=%s">%s</a>',
				$this->get_post()->ID,
				wp_create_nonce( 'remove_from_entire_site_' . $this->get_post()->ID ),
				esc_html__( 'Remove From Entire Site', 'elementor' )
			);
		} else {
			$actions['set_as_entire_site'] = sprintf(
				'<a href="?post=%s&action=set_as_entire_site&_wpnonce=%s">%s</a>',
				$this->get_post()->ID,
				wp_create_nonce( 'set_as_entire_site_' . $this->get_post()->ID ),
				esc_html__( 'Set as Entire Site', 'elementor' )
			);
		}

		return $actions;
	}

	public static function get_title() {
		return esc_html__( 'Floating Button', 'elementor' );
	}

	public static function get_plural_title() {
		return esc_html__( 'Floating Buttons', 'elementor' );
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
			'type' => 'floating_button',
			'default_route' => 'templates/floating-buttons',
			'autoImportSettings' => true,
		];

		return array_replace_recursive( parent::get_remote_library_config(), $config );
	}
}
