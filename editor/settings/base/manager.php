<?php
namespace Elementor\Editor\Settings\Base;

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

	protected static function get_model_class() {
		$called_class_parts = explode( '\\', get_called_class() );

		array_pop( $called_class_parts );

		$called_class_parts[] = 'Model';

		return implode( '\\', $called_class_parts );
	}

	public function __construct() {
		if ( Utils::is_ajax() ) {
			add_action( 'wp_ajax_elementor_save_' . static::get_name() . '_settings', [ get_called_class(), 'ajax_save_settings' ] );
		}
	}
}
