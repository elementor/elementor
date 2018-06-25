<?php
namespace Elementor;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

/**
 * Elementor CSS Filter control.
 *
 * A base control for applying css filters. Displays sliders to define
 * the values of different css filters including blur, brightens, contrast, saturation, .
 *
 * @since 2.1.0
 */
class Group_Control_Css_Filter extends Group_Control_Base {

	/**
	 * Prepare fields.
	 *
	 * Process css_filter control fields before adding them to `add_control()`.
	 *
	 * @since 2.1.0
	 * @access protected
	 *
	 * @param array $fields CSS Filter control fields.
	 *
	 * @return array Processed fields.
	 */
	protected static $fields;

	/**
	 * Get CSS filter control type.
	 *
	 * Retrieve the control type, in this case `css-filter`.
	 *
	 * @since 1.0.0
	 * @access public
	 * @static
	 *
	 * @return string Control type.
	 */
	public static function get_type() {
		return 'css-filter';
	}

	/**
	 * Init fields.
	 *
	 * Initialize CSS filter control fields.
	 *
	 * @since 2.1.0
	 * @access protected
	 *
	 * @return array Control fields.
	 */

	protected function init_fields() {
		$controls = [];

		$controls['filter_type'] = [
			'type' => Controls_Manager::HIDDEN,
			'default' => 'custom',
		];

		$controls['blur'] = [
			'label' => _x( 'Blur', 'Filter Control', 'elementor' ),
			'type' => Controls_Manager::SLIDER,
			'render_type' => 'template',
			'required' => 'true',
			'range' => [
				'px' => [
					'min' => 0,
					'max' => 10,
					'step' => 0.1,
				],
			],
			'default' => [
				'size' => 0,
			],
			'selectors' => [
				'{{SELECTOR}}' => 'filter: brightness( {{brightness.SIZE}}% ) contrast( {{contrast.SIZE}}% ) saturate( {{saturate.SIZE}}% ) blur( {{blur.SIZE}}px )',
			],
			'condition' => [
				'filter_type' => 'custom',
			],
		];

		$controls['brightness'] = [
			'label' => _x( 'Brightness', 'Filter Control', 'elementor' ),
			'type' => Controls_Manager::SLIDER,
			'render_type' => 'template',
			'required' => 'true',
			'default' => [
				'size' => 100,
			],
			'range' => [
				'px' => [
					'min' => 0,
					'max' => 200,
				],
			],
			'separator' => 'none',
			'condition' => [
				'filter_type' => 'custom',
			],
		];

		$controls['contrast'] = [
			'label' => _x( 'Contrast', 'Filter Control', 'elementor' ),
			'type' => Controls_Manager::SLIDER,
			'render_type' => 'template',
			'required' => 'true',
			'default' => [
				'size' => 100,
			],
			'range' => [
				'px' => [
					'min' => 0,
					'max' => 200,
				],
			],
			'separator' => 'none',
			'condition' => [
				'filter_type' => 'custom',
			],
		];

		$controls['saturate'] = [
			'label' => _x( 'Saturation', 'Filter Control', 'elementor' ),
			'type' => Controls_Manager::SLIDER,
			'render_type' => 'template',
			'required' => 'true',
			'default' => [
				'size' => 100,
			],
			'range' => [
				'px' => [
					'min' => 0,
					'max' => 200,
				],
			],
			'separator' => 'none',
			'condition' => [
				'filter_type' => 'custom',
			],
		];

		return $controls;
	}


	protected function prepare_fields( $fields ) {
		array_walk( $fields, function ( &$field, $field_name ) {
			if ( in_array( $field_name, [ 'css_filter', 'popover_toggle' ] ) ) {
				return;
			}

			$field['condition'] = [
				'css_filter' => 'custom',
			];
		} );

		return parent::prepare_fields( $fields );
	}

	/**
	 * Get default options.
	 *
	 * Retrieve the default options of the CSS filter control. Used to return the
	 * default options while initializing the CSS filter control.
	 *
	 * @since 2.1.0
	 * @access protected
	 *
	 * @return array Default box shadow control options.
	 */
	protected function get_default_options() {
		return [
			'popover' => [
				'starter_name' => 'css_filter',
				'starter_title' => _x( 'CSS Filters', 'Filter Control', 'elementor' ),
			],
		];
	}
}
