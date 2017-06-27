<?php
namespace Elementor\Editor\Settings\Base;

use Elementor\CSS_File;
use Elementor\Utils;

if ( ! defined( 'ABSPATH' ) ) exit; // Exit if accessed directly

abstract class Manager implements ManagerInterface {

	/**
	 * @param string|int $id
	 * @param array      $settings
	 *
	 * @return Model
	 */
	final public static function get_model( $id, $settings = [] ) {
		if ( ! $settings ) {
			$settings = static::get_saved_settings( $id );
		}

		/** @var Model $model_class */
		$model_class = static::get_model_class();

		return new $model_class( [
			'id' => $id,
			'settings' => $settings,
		] );
	}

	public static function add_settings_css_rules( CSS_File $css_file ) {
		$model = static::get_model_for_css_file( $css_file );

		$css_file->add_controls_stack_style_rules(
			$model,
			$model->get_style_controls(),
			$model->get_settings(),
			[ '{{WRAPPER}}' ],
			[ $model->get_css_wrapper_selector() ]
		);
	}

	protected static function get_model_class() {
		$called_class_parts = explode( '\\', get_called_class() );

		array_pop( $called_class_parts );

		$called_class_parts[] = 'Model';

		return implode( '\\', $called_class_parts );
	}

	public static function run() {
		if ( Utils::is_ajax() ) {
			add_action( 'wp_ajax_elementor_save_' . static::get_name() . '_settings', [ get_called_class(), 'ajax_save_settings' ] );
		}

		add_action( 'elementor/' . static::get_css_file_name() . '-css-file/parse', [ get_called_class(), 'add_settings_css_rules' ] );
	}
}
