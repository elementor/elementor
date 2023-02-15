<?php

namespace Elementor\Modules\DesignGuidelines\Documents;

use Elementor\Core\Base\Document;
use Elementor\Core\DocumentTypes\Page;
use Elementor\Plugin;
use Elementor\Utils;

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
		return false; // TODO : POC! Change this.
		if ( isset( $data['settings']['post_status'] ) && Document::STATUS_AUTOSAVE === $data['settings']['post_status'] ) {
			return false;
		}

		return parent::save( $data );
	}

	public function get_elements_data( $status = self::STATUS_PUBLISH ) {
		if ( ! isset( $_GET['active-document'] ) ) { // todo implement a better way to check if this is a request from the design guidelines module.
			//			wp_die('You are not allowed to access this page.');
		}

		$this->enqueue_scripts();
		// TODO : POC! Change this.
		$elements_data = parent::get_elements_data( $status );

		//
		//		foreach ( $settings['custom_colors'] as $color ) {
		//			$color_element = $this->get_color_element( $color['_id'], $color['title'] );
		//			$elements_data[0]['elements'][] = $color_element;
		//		}

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

		$kit = Plugin::$instance->kits_manager->get_active_kit();
		$settings = $kit->get_settings();

		wp_localize_script( $handle, 'elementorDesignGuidelinesConfig', [
			//			'ajaxUrl' => admin_url( 'admin-ajax.php' ), todo
			//			'nonce' => wp_create_nonce( 'elementor_design_guidelines' ), todo
			'customColors' => $settings['custom_colors'],
			'systemColors' => $settings['system_colors'],
			'customFonts' => $settings['custom_typography'],
			'postId' => $this->get_main_id(),
		] );


	}

	public function get_color_element( $global_name, $title ) {
		$random_id = Utils::generate_random_string();

		return [
			'id' => $random_id,
			'elType' => 'column',
			'settings' =>
				[
					'_column_size' => 25,
					'_inline_size' => null,
					'background_background' => 'classic',
					'__globals__' =>
						[
							'background_color' => "globals/colors?id=$global_name",
						],
				],
			'elements' =>
				[
					0 =>
						[
							'id' => 'cb9273d',
							'elType' => 'widget',
							'settings' =>
								[
									'title' => $title,
									'title_color' => '#FFFFFF',
								],
							'elements' =>
								[
								],
							'widgetType' => 'heading',
						],
				],
			'isInner' => false,
		];
	}

	public function get_elements_skeleton() {
		return [
			0 =>
				[
					'id' => '10dac3d',
					'elType' => 'section',
					'settings' =>
						[
							'structure' => '40',
						],
					'elements' =>
						[
							0 =>
								[
									'id' => '3c53c6a',
									'elType' => 'column',
									'settings' =>
										[
											'_column_size' => 25,
											'_inline_size' => null,
											'background_background' => 'classic',
											'__globals__' =>
												[
													'background_color' => 'globals/colors?id=primary',
												],
										],
									'elements' =>
										[
											0 =>
												[
													'id' => 'cb9273d',
													'elType' => 'widget',
													'settings' =>
														[
															'title' => 'Primary',
															'title_color' => '#FFFFFF',
														],
													'elements' =>
														[
														],
													'widgetType' => 'heading',
												],
										],
									'isInner' => false,
								],
							1 =>
								[
									'id' => 'cda2a51',
									'elType' => 'column',
									'settings' =>
										[
											'_column_size' => 25,
											'_inline_size' => null,
											'background_background' => 'classic',
											'__globals__' =>
												[
													'background_color' => 'globals/colors?id=secondary',
												],
										],
									'elements' =>
										[
											0 =>
												[
													'id' => '7e89a0f',
													'elType' => 'widget',
													'settings' =>
														[
															'title' => 'Secondary',
															'title_color' => '#FFFFFF',
														],
													'elements' =>
														[
														],
													'widgetType' => 'heading',
												],
										],
									'isInner' => false,
								],
							2 =>
								[
									'id' => 'e0b2a61',
									'elType' => 'column',
									'settings' =>
										[
											'_column_size' => 25,
											'_inline_size' => null,
											'background_background' => 'classic',
											'__globals__' =>
												[
													'background_color' => 'globals/colors?id=text',
												],
										],
									'elements' =>
										[
											0 =>
												[
													'id' => '89e3840',
													'elType' => 'widget',
													'settings' =>
														[
															'title' => 'Body text',
															'title_color' => '#FFFFFF',
														],
													'elements' =>
														[
														],
													'widgetType' => 'heading',
												],
										],
									'isInner' => false,
								],
							3 =>
								[
									'id' => '2366871',
									'elType' => 'column',
									'settings' =>
										[
											'_column_size' => 25,
											'_inline_size' => null,
											'background_background' => 'classic',
											'__globals__' =>
												[
													'background_color' => 'globals/colors?id=accent',
												],
										],
									'elements' =>
										[
											0 =>
												[
													'id' => 'd821ddd',
													'elType' => 'widget',
													'settings' =>
														[
															'title' => 'Accent',
															'title_color' => '#FFFFFF',
														],
													'elements' =>
														[
														],
													'widgetType' => 'heading',
												],
										],
									'isInner' => false,
								],
						],
					'isInner' => false,
				],
		];
	}

}