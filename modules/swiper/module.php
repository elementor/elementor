<?php
namespace Elementor\Modules\Swiper;

use Elementor\Settings;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly
}

class Module extends \Elementor\Core\Base\Module {

	/**
	 * Settings name
	 */
	const SWIPER_SETTINGS_OPTION_NAME = 'elementor_swiper_active_version';

	/**
	 * Swiper version 5.3.6
	 */
	const SWIPER_VERSION_5_3_6 = '5.3.6';

	/**
	 * Swiper version 8.4.5
	 */
	const SWIPER_VERSION_8_4_5 = '8.4.5';

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

	public static function swiper_active_version() {
		return get_option( self::SWIPER_SETTINGS_OPTION_NAME );
	}

	public static function swiper_css_class() {
		return self::SWIPER_VERSION_5_3_6 === self::swiper_active_version() ? 'swiper-container' : 'swiper';
	}

	/**
	 * Register_Admin Settings
	 *
	 * adds Swiper update admin settings
	 * @param Settings $settings
	 */
	public function register_admin_settings( Settings $settings ) {
		$settings->add_field(
			Settings::TAB_ADVANCED,
			Settings::TAB_ADVANCED,
			'swiper_active_version',
			[
				'label' => esc_html__( 'Swiper Library', 'elementor' ),
				'field_args' => [
					'type' => 'select',
					'std' => '',
					'options' => [
						self::SWIPER_VERSION_5_3_6 => esc_html__( '5.3.6', 'elementor' ),
						self::SWIPER_VERSION_8_4_5 => esc_html__( '8.4.5', 'elementor' ),
					],
					'desc' => sprintf( esc_html__(
						'Create pixel perfect layouts by placing elements in a customizable grid. Activate to add the CSS Grid option to container elements. %1$sLearn more%2$s',
						'elementor'
					), '<a target="_blank" href="https://go.elementor.com/wp-dash-grid-container/">', '</a>'),
				],
			]
		);
	}

	/**
	 * Convert Swiper experiment value to settings.
	 */
	public static function swiper_experiment_converter() {
		if ( get_option( self::SWIPER_SETTINGS_OPTION_NAME ) ) {
			return;
		}

		// Old swiper experiment value.
		$swiper_version = get_option( 'elementor_experiment-e_swiper_latest' );
		if ( 'active' === $swiper_version ) {
			add_option( self::SWIPER_SETTINGS_OPTION_NAME, self::SWIPER_VERSION_8_4_5 );
		} else {
			add_option( self::SWIPER_SETTINGS_OPTION_NAME, self::SWIPER_VERSION_5_3_6 );
		}
	}

	public function __construct() {
		parent::__construct();

		add_action( 'elementor/admin/after_create_settings/' . Settings::PAGE_ID, [ $this, 'register_admin_settings' ], 100 );
	}
}

