<?php

namespace Elementor\Modules\DesignGuidelines\Documents;

use Elementor\Core\Base\Document;
use Elementor\Core\DocumentTypes\Page;
use Elementor\Modules\DesignGuidelines\PreviewElementHandlers\Colors_Handler;
use Elementor\Modules\DesignGuidelines\PreviewElementHandlers\Fonts_Handler;
use Elementor\Modules\DesignGuidelines\Utils\Elements_Data_Helper;
use Elementor\Plugin;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly
}

class Design_Guidelines extends Page {

	const TYPE = 'design-guidelines';

	public static function get_properties() {
		$properties = parent::get_properties();

		$properties['has_elements'] = true;
		//		$properties['is_editable'] = false;

		$properties['show_in_finder'] = false;
		$properties['show_on_admin_bar'] = false;
		$properties['edit_capability'] = 'edit_theme_options';
		$properties['support_wp_page_templates'] = true;

		return $properties;
	}

	public static function get_type() {
		return self::TYPE;
	}

	public function save( $data ) {
		//		return false; // TODO : POC! Change this.
		if ( isset( $data['settings']['post_status'] ) && Document::STATUS_AUTOSAVE === $data['settings']['post_status'] ) {
			return false;
		}

		return parent::save( $data );
	}

	public function get_elements_raw_data( $data = null, $with_html_content = false ) {

		return parent::get_elements_raw_data( $data, $with_html_content );
	}

	public function get_elements_data( $status = self::STATUS_PUBLISH ) {
		if ( ! isset( $_GET['active-document'] ) ) { // todo implement a better way to check if this is a request from the design guidelines module.
			//			wp_die('You are not allowed to access this page.');
		}

		$selectors = $this->get_selectors();

		$this->enqueue_scripts();
		// TODO : POC! Change this.
		$elements_data = parent::get_elements_data( $status );

		$helper = new Elements_Data_Helper();
		$colors_handler = new Colors_Handler( $helper, $selectors, $elements_data );
		$fonts_handler = new Fonts_Handler( $helper, $selectors, $elements_data );
		$kit = Plugin::$instance->kits_manager->get_active_kit();
		$settings = $kit->get_settings();

		$elements_data = Plugin::$instance->db->iterate_data( $elements_data, function( array $element_data ) use ( $colors_handler, $fonts_handler, $helper, $settings ) {
			$fonts_injection = $fonts_handler->get_injection_point_id();
			$colors_injection = $colors_handler->get_injection_point_id();

			$element_id = $helper->get_element_id( $element_data );
			if ( $element_id === $fonts_injection ) {
				$element_data['elements'] = array_merge( $element_data['elements'], $fonts_handler->create_elements_to_inject( $element_data, $settings['custom_typography'] ) );
			} else if ( $element_id === $colors_injection ) {
				$element_data['elements'] = array_merge( $element_data['elements'], $colors_handler->create_elements_to_inject( $element_data, $settings['custom_colors'] ) );
			}

			return $element_data;
		} );

		return $elements_data;
	}


	/**
	 * Enqueue scripts.
	 *
	 * @return void
	 */
	private function enqueue_scripts() {
		/** @var \Elementor\Modules\DesignGuidelines\Module $module */
		$module = Plugin::instance()->modules_manager->get_modules( 'design-guidelines' );

		if ( ! isset( $module ) ) {
			return;
		}
		$handle = 'design-guidelines';

		wp_enqueue_script(
			$handle,
			$module->get_script_url(),
			[ 'elementor-editor' ],
			ELEMENTOR_VERSION,
			true
		);

		// todo : should do this?
		$kit = Plugin::$instance->kits_manager->get_active_kit();
		$settings = $kit->get_settings();

		wp_localize_script( $handle, 'elementorDesignGuidelinesConfig', [
			//			'ajaxUrl' => admin_url( 'admin-ajax.php' ), todo
			//			'nonce' => wp_create_nonce( 'elementor_design_guidelines' ), todo
			'customColors' => $settings['custom_colors'],
			'systemColors' => $settings['system_colors'],
			'customFonts' => $settings['custom_typography'],
			'postId' => $this->get_main_id(),
			'selectors' => $this->get_selectors(),
		] );
	}

	public function get_selectors(): array {
		return [
			'default_title_container' => 'design-guidelines-default-title-container',
			'custom_colors_title' => 'design-guidelines-custom-colors-title',
			'empty_color_container' => 'design-guidelines-empty-color-container',
			'custom_colors_section' => 'design-guidelines-custom-colors-section',
			'color_title_widget' => 'design-guidelines-color-title-widget',
			'color_widget' => 'design-guidelines-color-widget',
			'color_container' => 'design-guidelines-color-container',
			'default_colors_section' => 'design-guidelines-default-colors-section',
			'default_colors_container' => 'design-guidelines-color-container__primary',
			'colors_injection_container' => 'design-guidelines-colors-injection-container',
			'custom_fonts_title' => 'design-guidelines-custom-fonts-title',
			'font_title_widget' => 'design-guidelines-font-title-widget',
			'font_widget' => 'design-guidelines-font-widget',
			'font_section' => 'design-guidelines-font-section',
			'default_fonts_section' => 'design-guidelines-font-section__primary',
			'fonts_injection_container' => 'design-guidelines-fonts-injection-container',

		];
	}
}