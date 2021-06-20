<?php
namespace Elementor\Modules\Presets\Documents;

use Elementor\Core\Base\Document;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly
}

class Preset extends Document {
	const TYPE = 'preset';
	const ELEMENT_TYPE_META_KEY = '_elementor_element_type';
	const WIDGET_TYPE_META_KEY = '_elementor_widget_type';
	const SETTINGS_META_KEY = '_elementor_settings';
	const DEFAULT_META_KEY = '_elementor_is_default';

	/**
	 * @return array
	 */
	public static function get_properties() {
		$properties = parent::get_properties();

		$properties['support_kit'] = true;

		return $properties;
	}

	/**
	 * @return string
	 */
	public static function get_type() {
		return static::TYPE;
	}

	/**
	 * @return string|void
	 */
	public static function get_title() {
		return __( 'Preset', 'elementor' );
	}

	/**
	 * @return string|void
	 */
	public static function get_plural_title() {
		return __( 'Presets', 'elementor' );
	}

	/**
	 * @return array
	 */
	protected function get_remote_library_config() {
		$config = parent::get_remote_library_config();

		$config['type'] = 'preset';
		$config['default_route'] = 'templates/presets';

		return $config;
	}
}
