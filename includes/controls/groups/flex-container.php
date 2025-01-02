<?php
namespace Elementor;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Group_Control_Flex_Container extends Group_Control_Base {

	protected static $fields;

	public static function get_type() {
		return 'flex-container';
	}

	protected function init_fields() {
		$start = is_rtl() ? 'right' : 'left';
		$end = is_rtl() ? 'left' : 'right';

		$fields = array();

		$fields['items'] = array(
			'type' => Controls_Manager::HEADING,
			'label' => esc_html__( 'Items', 'elementor' ),
			'separator' => 'before',
		);

		$fields['direction'] = array(
			'label' => esc_html__( 'Direction', 'elementor' ),
			'type' => Controls_Manager::CHOOSE,
			'options' => array(
				'row' => array(
					'title' => esc_html__( 'Row - horizontal', 'elementor' ),
					'icon' => 'eicon-arrow-' . $end,
				),
				'column' => array(
					'title' => esc_html__( 'Column - vertical', 'elementor' ),
					'icon' => 'eicon-arrow-down',
				),
				'row-reverse' => array(
					'title' => esc_html__( 'Row - reversed', 'elementor' ),
					'icon' => 'eicon-arrow-' . $start,
				),
				'column-reverse' => array(
					'title' => esc_html__( 'Column - reversed', 'elementor' ),
					'icon' => 'eicon-arrow-up',
				),
			),
			'default' => '',
			// The `--container-widget-width` CSS variable is used for handling widgets that get an undefined width in column mode.
			// The `--container-widget-flex-grow` CSS variable is used to give certain widgets a default `flex-grow: 1` value for the `flex row` combination.
			'selectors_dictionary' => array(
				'row' => '--flex-direction: row; --container-widget-width: initial; --container-widget-height: 100%; --container-widget-flex-grow: 1; --container-widget-align-self: stretch; --flex-wrap-mobile: wrap;',
				'column' => '--flex-direction: column; --container-widget-width: 100%; --container-widget-height: initial; --container-widget-flex-grow: 0; --container-widget-align-self: initial; --flex-wrap-mobile: wrap;',
				'row-reverse' => '--flex-direction: row-reverse; --container-widget-width: initial; --container-widget-height: 100%; --container-widget-flex-grow: 1; --container-widget-align-self: stretch; --flex-wrap-mobile: wrap-reverse;',
				'column-reverse' => '--flex-direction: column-reverse; --container-widget-width: 100%; --container-widget-height: initial; --container-widget-flex-grow: 0; --container-widget-align-self: initial; --flex-wrap-mobile: wrap;',
			),
			'selectors' => array(
				'{{SELECTOR}}' => '{{VALUE}};',
			),
			'responsive' => true,
		);

		// Only use the flex direction prefix class inside the editor.
		$flex_direction_prefix_class = Plugin::$instance->editor->is_edit_mode() ? array( 'prefix_class' => 'e-con--' ) : array();

		$fields['_is_row'] = array_merge( $flex_direction_prefix_class, array(
			'type' => Controls_Manager::HIDDEN,
			'default' => 'row',
			'condition' => array(
				'direction' => array(
					'row',
					'row-reverse',
				),
			),
		) );

		$fields['_is_column'] = array_merge( $flex_direction_prefix_class, array(
			'type' => Controls_Manager::HIDDEN,
			'default' => 'column',
			'condition' => array(
				'direction' => array(
					'',
					'column',
					'column-reverse',
				),
			),
		) );

		$fields['justify_content'] = array(
			'label' => esc_html__( 'Justify Content', 'elementor' ),
			'type' => Controls_Manager::CHOOSE,
			'label_block' => true,
			'default' => '',
			'options' => array(
				'flex-start' => array(
					'title' => esc_html__( 'Start', 'elementor' ),
					'icon' => 'eicon-flex eicon-justify-start-h',
				),
				'center' => array(
					'title' => esc_html__( 'Center', 'elementor' ),
					'icon' => 'eicon-flex eicon-justify-center-h',
				),
				'flex-end' => array(
					'title' => esc_html__( 'End', 'elementor' ),
					'icon' => 'eicon-flex eicon-justify-end-h',
				),
				'space-between' => array(
					'title' => esc_html__( 'Space Between', 'elementor' ),
					'icon' => 'eicon-flex eicon-justify-space-between-h',
				),
				'space-around' => array(
					'title' => esc_html__( 'Space Around', 'elementor' ),
					'icon' => 'eicon-flex eicon-justify-space-around-h',
				),
				'space-evenly' => array(
					'title' => esc_html__( 'Space Evenly', 'elementor' ),
					'icon' => 'eicon-flex eicon-justify-space-evenly-h',
				),
			),
			'selectors' => array(
				'{{SELECTOR}}' => '--justify-content: {{VALUE}};',
			),
			'responsive' => true,
		);

		$fields['align_items'] = array(
			'label' => esc_html__( 'Align Items', 'elementor' ),
			'type' => Controls_Manager::CHOOSE,
			'default' => '',
			'options' => array(
				'flex-start' => array(
					'title' => esc_html__( 'Start', 'elementor' ),
					'icon' => 'eicon-flex eicon-align-start-v',
				),
				'center' => array(
					'title' => esc_html__( 'Center', 'elementor' ),
					'icon' => 'eicon-flex eicon-align-center-v',
				),
				'flex-end' => array(
					'title' => esc_html__( 'End', 'elementor' ),
					'icon' => 'eicon-flex eicon-align-end-v',
				),
				'stretch' => array(
					'title' => esc_html__( 'Stretch', 'elementor' ),
					'icon' => 'eicon-flex eicon-align-stretch-v',
				),
			),
			'selectors' => array(
				'{{SELECTOR}}' => '--align-items: {{VALUE}}; --container-widget-width: calc( ( 1 - var( --container-widget-flex-grow ) ) * 100% );',
			),
			'responsive' => true,
		);

		$fields['gap'] = array(
			'label' => esc_html__( 'Gaps', 'elementor' ),
			'type' => Controls_Manager::GAPS,
			'size_units' => array( 'px', '%', 'em', 'rem', 'vw', 'custom' ),
			'default' => array(
				'unit' => 'px',
			),
			'separator' => 'before',
			'selectors' => array(
				'{{SELECTOR}}' => '--gap: {{ROW}}{{UNIT}} {{COLUMN}}{{UNIT}};--row-gap: {{ROW}}{{UNIT}};--column-gap: {{COLUMN}}{{UNIT}};',
			),
			'responsive' => true,
			'conversion_map' => array(
				'old_key' => 'size',
				'new_key' => 'column',
			),
			'upgrade_conversion_map' => array(
				'old_key' => 'size',
				'new_keys' => array( 'column', 'row' ),
			),
			'validators' => array(
				'Number' => array(
					'min' => 0,
				),
			),
		);

		$fields['wrap'] = array(
			'label' => esc_html__( 'Wrap', 'elementor' ),
			'type' => Controls_Manager::CHOOSE,
			'options' => array(
				'nowrap' => array(
					'title' => esc_html__( 'No Wrap', 'elementor' ),
					'icon' => 'eicon-flex eicon-nowrap',
				),
				'wrap' => array(
					'title' => esc_html__( 'Wrap', 'elementor' ),
					'icon' => 'eicon-flex eicon-wrap',
				),
			),
			'description' => esc_html__( 'Items within the container can stay in a single line (No wrap), or break into multiple lines (Wrap).', 'elementor' ),
			'default' => '',
			'selectors' => array(
				'{{SELECTOR}}' => '--flex-wrap: {{VALUE}};',
			),
			'responsive' => true,
		);

		$fields['align_content'] = array(
			'label' => esc_html__( 'Align Content', 'elementor' ),
			'type' => Controls_Manager::CHOOSE,
			'label_block' => true,
			'default' => '',
			'options' => array(
				'flex-start' => array(
					'title' => esc_html__( 'Start', 'elementor' ),
					'icon' => 'eicon-justify-start-v',
				),
				'center' => array(
					'title' => esc_html__( 'Middle', 'elementor' ),
					'icon' => 'eicon-justify-center-v',
				),
				'flex-end' => array(
					'title' => esc_html__( 'End', 'elementor' ),
					'icon' => 'eicon-justify-end-v',
				),
				'space-between' => array(
					'title' => esc_html__( 'Space Between', 'elementor' ),
					'icon' => 'eicon-justify-space-between-v',
				),
				'space-around' => array(
					'title' => esc_html__( 'Space Around', 'elementor' ),
					'icon' => 'eicon-justify-space-around-v',
				),
				'space-evenly' => array(
					'title' => esc_html__( 'Space Evenly', 'elementor' ),
					'icon' => 'eicon-justify-space-evenly-v',
				),
			),
			'selectors' => array(
				'{{SELECTOR}}' => '--align-content: {{VALUE}};',
			),
			'condition' => array(
				'wrap' => 'wrap',
			),
			'responsive' => true,
		);

		return $fields;
	}

	protected function get_default_options() {
		return array(
			'popover' => false,
		);
	}
}
