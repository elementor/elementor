<?php
namespace Elementor;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

/**
 * Elementor Transform control.
 *
 * A base control for applying transform. Displays sliders to define the
 * transform values including rotate, scale, translate and skew.
 *
 * @since 2.5.0
 */
class Group_Control_Transform extends Group_Control_Base {

	/**
	 * Prepare fields.
	 *
	 * Process transform control fields before adding them to `add_control()`.
	 *
	 * @since 2.5.0
	 * @access protected
	 */
	protected static $fields;

	/**
	 * Get transform control type.
	 *
	 * Retrieve the control type, in this case `transform`.
	 *
	 * @since 2.5.0
	 * @access public
	 * @static
	 *
	 * @return string Control type.
	 */
	public static function get_type() {
		return 'transform';
	}

	/**
	 * Init fields.
	 *
	 * Initialize transform control fields.
	 *
	 * @since 2.5.0
	 * @access protected
	 *
	 * @return array Control fields.
	 */
	protected function init_fields() {
		$controls = [];

		$controls['rotate'] = [
			'label' => _x( 'Rotate', 'Filter Control', 'elementor' ),
			'type' => Controls_Manager::SLIDER,
			'required' => 'true',
			'range' => [
				'deg' => [
					'min' => -360,
					'max' => 360,
					'step' => 1,
				],
			],
			'default' => [
				'size' => 0,
			],
			'selectors' => [
				'{{SELECTOR}}' => 'transform: rotate( {{rotate.SIZE}}deg ) scale( {{scale}} ) translateX( {{translatex.SIZE}}{{translatex.UNIT}} ) translateY( {{translatey.SIZE}}{{translatey.UNIT}} ) skewX( {{skewx.SIZE}}deg  ) skewY( {{skewy.SIZE}}deg  )',
			],
		];

		$controls['scale'] = [
			'label' => _x( 'Scale', 'Filter Control', 'elementor' ),
			'type' => Controls_Manager::SLIDER,
			'render_type' => 'ui',
			'required' => 'true',
			'range' => [
				'' => [
					'step' => 0.1,
				],
			],
			'default' => [
				'size' => 1,
			],
			'separator' => 'none',
		];

		$controls['translatex'] = [
			'label' => _x( 'Translate X', 'Filter Control', 'elementor' ),
			'type' => Controls_Manager::SLIDER,
			'render_type' => 'ui',
			'required' => 'true',
			'size_units' => [ 'px', '%' ],
			'separator' => 'none',
		];

		$controls['translatey'] = [
			'label' => _x( 'Translate Y', 'Filter Control', 'elementor' ),
			'type' => Controls_Manager::SLIDER,
			'render_type' => 'ui',
			'required' => 'true',
			'size_units' => [ 'px', '%' ],
			'separator' => 'none',
		];

		$controls['skewx'] = [
			'label' => _x( 'Skew X', 'Filter Control', 'elementor' ),
			'type' => Controls_Manager::SLIDER,
			'render_type' => 'ui',
			'required' => 'true',
			'range' => [
				'deg' => [
					'min' => -360,
					'max' => 360,
					'step' => 1,
				],
			],
			'default' => [
				'size' => 0,
			],
			'separator' => 'none',
		];

		$controls['skewy'] = [
			'label' => _x( 'Skew Y', 'Filter Control', 'elementor' ),
			'type' => Controls_Manager::SLIDER,
			'render_type' => 'ui',
			'required' => 'true',
			'range' => [
				'deg' => [
					'min' => -360,
					'max' => 360,
					'step' => 1,
				],
			],
			'default' => [
				'size' => 0,
			],
			'separator' => 'none',
		];

		return $controls;
	}

	/**
	 * Get default options.
	 *
	 * Retrieve the default options of the transform control. Used to return the
	 * default options while initializing the transform control.
	 *
	 * @since 2.5.0
	 * @access protected
	 *
	 * @return array Default box shadow control options.
	 */
	protected function get_default_options() {
		return [
			'popover' => [
				'starter_name' => 'transform',
				'starter_title' => _x( 'Transform', 'Transform Control', 'elementor' ),
				'settings' => [
					'render_type' => 'ui',
				],
			],
		];
	}
}
