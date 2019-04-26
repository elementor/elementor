<?php
namespace Elementor;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

/**
 * Elementor color picker scheme.
 *
 * Elementor color picker scheme class is responsible for initializing a scheme
 * for color pickers.
 *
 * @since 1.0.0
 */
class Scheme_Color_Picker extends Scheme_Color {

	/**
	 * 5th color scheme.
	 */
	const COLOR_5 = '5';

	/**
	 * 6th color scheme.
	 */
	const COLOR_6 = '6';

	/**
	 * 7th color scheme.
	 */
	const COLOR_7 = '7';

	/**
	 * 9th color scheme.
	 */
	const COLOR_8 = '8';

	/**
	 * Get color picker scheme type.
	 *
	 * Retrieve the color picker scheme type.
	 *
	 * @since 1.0.0
	 * @access public
	 * @static
	 *
	 * @return string Color picker scheme type.
	 */
	public static function get_type() {
		return 'color-picker';
	}

	/**
	 * Get color picker scheme description.
	 *
	 * Retrieve the color picker scheme description.
	 *
	 * @since 1.0.0
	 * @access public
	 * @static
	 *
	 * @return string Color picker scheme description.
	 */

	public static function get_description() {
		return __( 'Choose which colors appear in the editor\'s color picker. This makes accessing the colors you chose for the site much easier.', 'elementor' );
	}

	/**
	 * Get default color picker scheme.
	 *
	 * Retrieve the default color picker scheme.
	 *
	 * @since 1.0.0
	 * @access public
	 *
	 * @return array Default color picker scheme.
	 */
	public function get_default_scheme() {
		return array_replace(
			parent::get_default_scheme(), [
				self::COLOR_5 => '#4054b2',
				self::COLOR_6 => '#23a455',
				self::COLOR_7 => '#000',
				self::COLOR_8 => '#fff',
			]
		);
	}

	/**
	 * Get color picker scheme titles.
	 *
	 * Retrieve the color picker scheme titles.
	 *
	 * @since 1.0.0
	 * @access public
	 *
	 * @return array Color picker scheme titles.
	 */
	public function get_scheme_titles() {
		return [];
	}

	/**
	 * Init system color picker schemes.
	 *
	 * Initialize the system color picker schemes.
	 *
	 * @since 1.0.0
	 * @access protected
	 *
	 * @return array System color picker schemes.
	 */
	protected function _init_system_schemes() {
		$schemes = parent::_init_system_schemes();

		$additional_schemes = [
			'joker' => [
				'items' => [
					self::COLOR_5 => '#4b4646',
					self::COLOR_6 => '#e2e2e2',
				],
			],
			'ocean' => [
				'items' => [
					self::COLOR_5 => '#154d80',
					self::COLOR_6 => '#8c8c8c',
				],
			],
			'royal' => [
				'items' => [
					self::COLOR_5 => '#ac8e4d',
					self::COLOR_6 => '#e2cea1',
				],
			],
			'violet' => [
				'items' => [
					self::COLOR_5 => '#9c9ea6',
					self::COLOR_6 => '#c184d0',
				],
			],
			'sweet' => [
				'items' => [
					self::COLOR_5 => '#41aab9',
					self::COLOR_6 => '#ffc72f',
				],
			],
			'urban' => [
				'items' => [
					self::COLOR_5 => '#aa4039',
					self::COLOR_6 => '#94dbaf',
				],
			],
			'earth' => [
				'items' => [
					self::COLOR_5 => '#aa6666',
					self::COLOR_6 => '#efe5d9',
				],
			],
			'river' => [
				'items' => [
					self::COLOR_5 => '#7b8c93',
					self::COLOR_6 => '#eb6d65',
				],
			],
			'pastel' => [
				'items' => [
					self::COLOR_5 => '#f5a46c',
					self::COLOR_6 => '#6e6f71',
				],
			],
		];

		$schemes = array_replace_recursive( $schemes, $additional_schemes );

		foreach ( $schemes as & $scheme ) {
			$scheme['items'] += [
				self::COLOR_7 => '#000',
				self::COLOR_8 => '#fff',
			];
		}

		return $schemes;
	}

	/**
	 * Get system color picker schemes to print.
	 *
	 * Retrieve the system color picker schemes
	 *
	 * @since 1.0.0
	 * @access protected
	 *
	 * @return string The system color picker schemes.
	 */
	protected function _get_system_schemes_to_print() {
		$schemes = $this->get_system_schemes();

		$items_to_print = [
			self::COLOR_1,
			self::COLOR_5,
			self::COLOR_2,
			self::COLOR_3,
			self::COLOR_6,
			self::COLOR_4,
		];

		$items_to_print = array_flip( $items_to_print );

		foreach ( $schemes as $scheme_key => $scheme ) {
			$schemes[ $scheme_key ]['items'] = array_replace( $items_to_print, array_intersect_key( $scheme['items'], $items_to_print ) );
		}

		return $schemes;
	}

	/**
	 * Get current color picker scheme title.
	 *
	 * Retrieve the current color picker scheme title.
	 *
	 * @since 1.0.0
	 * @access protected
	 *
	 * @return string The current color picker scheme title.
	 */
	protected function _get_current_scheme_title() {
		return __( 'Color Picker', 'elementor' );
	}
}
