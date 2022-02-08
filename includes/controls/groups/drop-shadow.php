<?php
namespace Elementor;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

/**
 * Elementor drop shadow control.
 *
 * A base control for creating drop shadow control. Displays input fields to define
 * the drop shadow including the horizontal shadow, vertical shadow, shadow blur and shadow color.
 *
 * @since 3.7.0
 */
class Group_Control_Drop_Shadow extends Group_Control_Base {

	/**
	 * Fields.
	 *
	 * Holds all the drop shadow control fields.
	 *
	 * @since 3.7.0
	 * @access protected
	 * @static
	 *
	 * @var array drop shadow control fields.
	 */
	protected static $fields;

	/**
	 * Get drop shadow control type.
	 *
	 * Retrieve the control type, in this case `box-shadow`.
	 *
	 * @since 3.7.0
	 * @access public
	 * @static
	 *
	 * @return string Control type.
	 */
	public static function get_type() {
		return 'drop-shadow';
	}

	/**
	 * Init fields.
	 *
	 * Initialize drop shadow control fields.
	 *
	 * @since 3.7.0
	 * @access protected
	 *
	 * @return array Control fields.
	 */
	protected function init_fields() {
		$controls = [];

		$controls['drop_shadow'] = [
			'label' => _x( 'Drop Shadow', 'Drop Shadow Control', 'elementor' ),
			'type' => Controls_Manager::DROP_SHADOW,
			'selectors' => [
				'{{SELECTOR}}' => 'filter: drop-shadow({{HORIZONTAL}}px {{VERTICAL}}px {{BLUR}}px {{COLOR}});',
			],
		];

		return $controls;
	}

	/**
	 * Get default options.
	 *
	 * Retrieve the default options of the drop shadow control. Used to return the
	 * default options while initializing the drop shadow control.
	 *
	 * @since 3.7.0
	 * @access protected
	 *
	 * @return array Default drop shadow control options.
	 */
	protected function get_default_options() {
		return [
			'popover' => [
				'starter_title' => _x( 'Drop Shadow', 'Drop Shadow Control', 'elementor' ),
				'starter_name' => 'drop_shadow_type',
				'starter_value' => 'yes',
				'settings' => [
					'render_type' => 'ui',
				],
			],
		];
	}
}
