<?php
namespace Elementor;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

/**
 * Elementor text stroke control.
 *
 * A group control for creating a stroke effect on text. Displays input fields to define
 * the text stroke and color stroke.
 *
 * @since 3.5.0
 */
class Group_Control_Text_Stroke extends Group_Control_Base {

	/**
	 * Fields.
	 *
	 * Holds all the text stroke control fields.
	 *
	 * @since 3.5.0
	 * @access protected
	 * @static
	 *
	 * @var array Text Stroke control fields.
	 */
	protected static $fields;

	/**
	 * Get text stroke control type.
	 *
	 * Retrieve the control type, in this case `text-stroke`.
	 *
	 * @since 3.5.0
	 * @access public
	 * @static
	 *
	 * @return string Control type.
	 */
	public static function get_type() {
		return 'text-stroke';
	}

	/**
	 * Init fields.
	 *
	 * Initialize text stroke control fields.
	 *
	 * @since 3.5.0
	 * @access protected
	 *
	 * @return array Control fields.
	 */
	protected function init_fields() {
		$controls = array();

		$controls['text_stroke'] = array(
			'label' => esc_html__( 'Text Stroke', 'elementor' ),
			'type' => Controls_Manager::SLIDER,
			'size_units' => array( 'px', 'em', 'rem', 'custom' ),
			'range' => array(
				'px' => array(
					'min' => 0,
					'max' => 10,
				),
				'em' => array(
					'min' => 0,
					'max' => 1,
				),
				'rem' => array(
					'min' => 0,
					'max' => 1,
				),
			),
			'responsive' => true,
			'selector' => '{{WRAPPER}}',
			'selectors' => array(
				'{{SELECTOR}}' => '-webkit-text-stroke-width: {{SIZE}}{{UNIT}}; stroke-width: {{SIZE}}{{UNIT}};',
			),
		);

		$controls['stroke_color'] = array(
			'label' => esc_html__( 'Stroke Color', 'elementor' ),
			'type' => Controls_Manager::COLOR,
			'default' => '#000',
			'selector' => '{{WRAPPER}}',
			'selectors' => array(
				'{{SELECTOR}}' => '-webkit-text-stroke-color: {{VALUE}}; stroke: {{VALUE}};',
			),
		);

		return $controls;
	}

	/**
	 * Get default options.
	 *
	 * Retrieve the default options of the text stroke control. Used to return the
	 * default options while initializing the text stroke control.
	 *
	 * @since 3.5.0
	 * @access protected
	 *
	 * @return array Default text stroke control options.
	 */
	protected function get_default_options() {
		return array(
			'popover' => array(
				'starter_title' => esc_html__( 'Text Stroke', 'elementor' ),
				'starter_name' => 'text_stroke_type',
				'starter_value' => 'yes',
				'settings' => array(
					'render_type' => 'ui',
				),
			),
		);
	}
}
