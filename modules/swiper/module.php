<?php
namespace Elementor\Modules\Swiper;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly
}

class Module extends \Elementor\Core\Base\Module {

	/**
	 * Settings name
	 */
	const SWIPER_ACTIVE_VERSION = 'elementor_e_swiper_active_version';

	/**
	 * Swiper version 5.3.6
	 */
	const SWIPER_VERSION_5_3_6 = '5.3.6';

	/**
	 * Get name.
	 *
	 * Retrieve the module name.
	 *
	 * @since 2.0.0
	 * @access public
	 *
	 * @return string Module name.
	 */
	public function get_name() {
		return 'swiper';
	}

	/**
	 * Get widgets.
	 *
	 * Retrieve the list of widgets of the module.
	 *
	 * @since 2.0.0
	 * @access public
	 *
	 * @return array Widget list.
	 */
	public function get_widgets() {
		return [
			'Swiper',
		];
	}

	static function get_active_class() {
		return get_option( self::SWIPER_ACTIVE_VERSION );
	}

	static function swiper_active_version() {
		return self::SWIPER_VERSION_5_3_6 === static::swiper_class() ? 'swiper-container' : 'swiper';
	}

