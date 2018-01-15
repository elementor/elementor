<?php
namespace Elementor;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

/**
 * Elementor text shadow control.
 *
 * A base control for creating text shadow control. Displays input fields to define
 * the text shadow.
 *
 * Creating new control in the editor (inside `Widget_Base::_register_controls()`
 * method):
 *
 *    $this->add_group_control(
 *    	Group_Control_Text_Shadow::get_type(),
 *    	[
 *    		'name' => 'text_shadow',
 *    		'selector' => '{{WRAPPER}} .wrapper',
 *    		'separator' => 'before',
 *    	]
 *    );
 *
 * @since 1.6.0
 *
 * @param string $name        The field name.
 * @param string $separator   Optional. Set the position of the control separator.
 *                            Available values are 'default', 'before', 'after'
 *                            and 'none'. 'default' will position the separator
 *                            depending on the control type. 'before' / 'after'
 *                            will position the separator before/after the
 *                            control. 'none' will hide the separator. Default
 *                            is 'default'.
 */
class Group_Control_Text_Shadow extends Group_Control_Base {

	/**
	 * Fields.
	 *
	 * Holds all the text shadow control fields.
	 *
	 * @since 1.6.0
	 * @access protected
	 * @static
	 *
	 * @var array Text shadow control fields.
	 */
	protected static $fields;

	/**
	 * Retrieve type.
	 *
	 * Get text shadow control type.
	 *
	 * @since 1.6.0
	 * @access public
	 * @static
	 *
	 * @return string Control type.
	 */
	public static function get_type() {
		return 'text-shadow';
	}

	/**
	 * Init fields.
	 *
	 * Initialize text shadow control fields.
	 *
	 * @since 1.6.0
	 * @access protected
	 *
	 * @return array Control fields.
	 */
	protected function init_fields() {
		$controls = [];

		$controls['text_shadow'] = [
			'label' => _x( 'Text Shadow', 'Text Shadow Control', 'elementor' ),
			'type' => Controls_Manager::TEXT_SHADOW,
			'condition' => [
				'text_shadow_type!' => '',
			],
			'selectors' => [
				'{{SELECTOR}}' => 'text-shadow: {{HORIZONTAL}}px {{VERTICAL}}px {{BLUR}}px {{COLOR}};',
			],
		];

		return $controls;
	}

	/**
	 * @since 1.9.0
	 * @access protected
	 */
	protected function get_default_options() {
		return [
			'popover' => [
				'starter_title' => _x( 'Text Shadow', 'Text Shadow Control', 'elementor' ),
				'starter_name' => 'text_shadow_type',
				'starter_value' => 'yes',
			],
		];
	}
}
