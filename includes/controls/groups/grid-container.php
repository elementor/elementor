<?php
namespace Elementor;

use Elementor\Plugin;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Group_Control_Grid_Container extends Group_Control_Base {

	protected static $fields;

	public static function get_type() {
		return 'grid-container';
	}

	protected function init_fields() {
		$icon_start = is_rtl() ? 'end' : 'start';
		$icon_end = is_rtl() ? 'start' : 'end';

		$fields = array();

		$fields['items_grid'] = array(
			'type' => Controls_Manager::HEADING,
			'label' => esc_html__( 'Items', 'elementor' ),
			'separator' => 'before',
		);

		$fields['outline'] = array(
			'label' => esc_html__( 'Grid Outline', 'elementor' ),
			'type' => Controls_Manager::SWITCHER,
			'label_on' => esc_html__( 'Show', 'elementor' ),
			'label_off' => esc_html__( 'Hide', 'elementor' ),
			'default' => 'yes',
			'editor_available' => true,
		);

		$responsive_unit_defaults = $this->get_responsive_unit_defaults();

		$fields['columns_grid'] = array(
			'label' => esc_html__( 'Columns', 'elementor' ),
			'type' => Controls_Manager::SLIDER,
			'range' => array(
				'fr' => array(
					'min' => 1,
					'max' => 12,
					'step' => 1,
				),
			),
			'size_units' => array( 'fr', 'custom' ),
			'unit_selectors_dictionary' => array(
				'custom' => '--e-con-grid-template-columns: {{SIZE}}',
			),
			'default' => array(
				'unit' => 'fr',
				'size' => 3,
			),
			'mobile_default' => array(
				'unit' => 'fr',
				'size' => 1,
			),
			'selectors' => array(
				'{{SELECTOR}}' => '--e-con-grid-template-columns: repeat({{SIZE}}, 1fr)',
			),
			'responsive' => true,
			'editor_available' => true,
		) + $responsive_unit_defaults;

		$fields['rows_grid'] = array(
			'label' => esc_html__( 'Rows', 'elementor' ),
			'type' => Controls_Manager::SLIDER,
			'range' => array(
				'fr' => array(
					'min' => 1,
					'max' => 12,
					'step' => 1,
				),
			),
			'size_units' => array( 'fr', 'custom' ),
			'unit_selectors_dictionary' => array(
				'custom' => '--e-con-grid-template-rows: {{SIZE}}',
			),
			'default' => array(
				'unit' => 'fr',
				'size' => 2,
			),
			'selectors' => array(
				'{{SELECTOR}}' => '--e-con-grid-template-rows: repeat({{SIZE}}, 1fr)',
			),
			'responsive' => true,
			'editor_available' => true,
		) + $responsive_unit_defaults;

		$fields['gaps'] = array(
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
			'validators' => array(
				'Number' => array(
					'min' => 0,
				),
			),
		);

		$fields['auto_flow'] = array(
			'label' => esc_html__( 'Auto Flow', 'elementor' ),
			'type' => Controls_Manager::SELECT,
			'options' => array(
				'row' => esc_html__( 'Row', 'elementor' ),
				'column' => esc_html__( 'Column', 'elementor' ),
			),
			'default' => 'row',
			'separator' => 'before',
			'selectors' => array(
				'{{SELECTOR}}' => '--grid-auto-flow: {{VALUE}}',
			),
			'responsive' => true,
			'editor_available' => true,
		) + $this->get_responsive_autoflow_defaults();

		$fields['justify_items'] = array(
			'label' => esc_html__( 'Justify Items', 'elementor' ),
			'type' => Controls_Manager::CHOOSE,
			'options' => array(
				'start' => array(
					'title' => esc_html__( 'Start', 'elementor' ),
					'icon' => 'eicon-align-' . $icon_start . '-h',
				),
				'center' => array(
					'title' => esc_html__( 'Center', 'elementor' ),
					'icon' => 'eicon-align-center-h',
				),
				'end' => array(
					'title' => esc_html__( 'End', 'elementor' ),
					'icon' => 'eicon-align-' . $icon_end . '-h',
				),
				'stretch' => array(
					'title' => esc_html__( 'Stretch', 'elementor' ),
					'icon' => 'eicon-align-stretch-h',
				),
			),
			'default' => '',
			'selectors' => array(
				'{{SELECTOR}}' => '--justify-items: {{VALUE}};',
			),
			'responsive' => true,
		);

		$fields['align_items'] = array(
			'label' => esc_html__( 'Align Items', 'elementor' ),
			'type' => Controls_Manager::CHOOSE,
			'options' => array(
				'start' => array(
					'title' => esc_html__( 'Start', 'elementor' ),
					'icon' => 'eicon-align-start-v',
				),
				'center' => array(
					'title' => esc_html__( 'Center', 'elementor' ),
					'icon' => 'eicon-align-center-v',
				),
				'end' => array(
					'title' => esc_html__( 'End', 'elementor' ),
					'icon' => 'eicon-align-end-v',
				),
				'stretch' => array(
					'title' => esc_html__( 'Stretch', 'elementor' ),
					'icon' => 'eicon-align-stretch-v',
				),
			),
			'selectors' => array(
				'{{SELECTOR}}' => '--align-items: {{VALUE}};',
			),
			'responsive' => true,
		);

		$fields['justify_content'] = array(
			'label' => esc_html__( 'Justify Content', 'elementor' ),
			'type' => Controls_Manager::CHOOSE,
			'label_block' => true,
			'default' => '',
			'options' => array(
				'start' => array(
					'title' => esc_html__( 'Start', 'elementor' ),
					'icon' => 'eicon-justify-start-h',
				),
				'center' => array(
					'title' => esc_html__( 'Middle', 'elementor' ),
					'icon' => 'eicon-justify-center-h',
				),
				'end' => array(
					'title' => esc_html__( 'End', 'elementor' ),
					'icon' => 'eicon-justify-end-h',
				),
				'space-between' => array(
					'title' => esc_html__( 'Space Between', 'elementor' ),
					'icon' => 'eicon-justify-space-between-h',
				),
				'space-around' => array(
					'title' => esc_html__( 'Space Around', 'elementor' ),
					'icon' => 'eicon-justify-space-around-h',
				),
				'space-evenly' => array(
					'title' => esc_html__( 'Space Evenly', 'elementor' ),
					'icon' => 'eicon-justify-space-evenly-h',
				),
			),
			'selectors' => array(
				'{{SELECTOR}}' => '--grid-justify-content: {{VALUE}};',
			),
			'condition' => array(
				'columns_grid[unit]' => 'custom',
			),
			'responsive' => true,
		);

		$fields['align_content'] = array(
			'label' => esc_html__( 'Align Content', 'elementor' ),
			'type' => Controls_Manager::CHOOSE,
			'label_block' => true,
			'default' => '',
			'options' => array(
				'start' => array(
					'title' => esc_html__( 'Start', 'elementor' ),
					'icon' => 'eicon-justify-start-v',
				),
				'center' => array(
					'title' => esc_html__( 'Middle', 'elementor' ),
					'icon' => 'eicon-justify-center-v',
				),
				'end' => array(
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
				'{{SELECTOR}}' => '--grid-align-content: {{VALUE}};',
			),
			'condition' => array(
				'rows_grid[unit]' => 'custom',
			),
			'responsive' => true,
		);

		// Only use the auto flow prefix class inside the editor.
		$auto_flow_prefix_class = Plugin::$instance->editor->is_edit_mode() ? array( 'prefix_class' => 'e-con--' ) : array();

		$fields['_is_row'] = array_merge( $auto_flow_prefix_class, array(
			'type' => Controls_Manager::HIDDEN,
			'default' => 'row',
			'condition' => array(
				'auto_flow' => array(
					'row',
				),
			),
		) );

		$fields['_is_column'] = array_merge( $auto_flow_prefix_class, array(
			'type' => Controls_Manager::HIDDEN,
			'default' => 'column',
			'condition' => array(
				'auto_flow' => array(
					'column',
				),
			),
		) );

		return $fields;
	}

	protected function get_responsive_unit_defaults() {
		$responsive_unit_defaults = array();
		$active_breakpoints = Plugin::$instance->breakpoints->get_active_breakpoints();

		foreach ( $active_breakpoints as $breakpoint_name => $breakpoint ) {
			$responsive_unit_defaults[ $breakpoint_name . '_default' ] = array(
				'unit' => 'fr',
			);
		}

		return $responsive_unit_defaults;
	}

	protected function get_responsive_autoflow_defaults() {
		$responsive_autoflow_defaults = array();
		$active_breakpoints = Plugin::$instance->breakpoints->get_active_breakpoints();

		foreach ( $active_breakpoints as $breakpoint_name => $breakpoint ) {
			$responsive_autoflow_defaults[ $breakpoint_name . '_default' ] = 'row';
		}

		return $responsive_autoflow_defaults;
	}

	protected function get_default_options() {
		return array(
			'popover' => false,
		);
	}
}
