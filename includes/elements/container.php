<?php
namespace Elementor\Includes\Elements;

use Elementor\Controls_Manager;
use Elementor\Element_Base;
use Elementor\Group_Control_Background;
use Elementor\Group_Control_Flex_Container;
use Elementor\Group_Control_Flex_Item;
use Elementor\Plugin;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Container extends Element_Base {

	public static function get_type() {
		return 'container';
	}

	public function get_name() {
		return 'container';
	}

	public function get_title() {
		return __( 'Container', 'elementor' );
	}

	public function get_icon() {
		return 'eicon-gallery-justified';
	}

	protected function add_render_attributes() {
		parent::add_render_attributes();

		$this->add_render_attribute( '_wrapper', [
			'class' => [
				'e-container',
			],
		] );
	}

	protected function get_initial_config() {
		$config = parent::get_initial_config();

		$config['controls'] = $this->get_controls();
		$config['tabs_controls'] = $this->get_tabs_controls();
		$config['show_in_panel'] = true;
		$config['categories'] = [ 'basic' ];

		return $config;
	}

	protected function content_template() {
		// Print empty string in order to render a JS template anyway.
		echo ' ';
	}

	public function before_render() {
		?>
		<div <?php $this->print_render_attribute_string( '_wrapper' ); ?>>
		<?php
	}

	public function after_render() {
		?>
		</div>
		<?php
	}

	protected function _get_default_child_type( array $element_data ) {
		if ( 'container' === $element_data['elType'] ) {
			return Plugin::$instance->elements_manager->get_element_types( 'container' );
		}

		return Plugin::$instance->widgets_manager->get_widget_types( $element_data['widgetType'] );
	}

	/**
	 * Register content controls under content tab.
	 */
	protected function register_content_tab() {
		/**
		 * Flex container.
		 */
		$this->start_controls_section(
			'section_content_container',
			[
				'label' => __( 'Container', 'elementor' ),
				'tab' => Controls_Manager::TAB_CONTENT,
			]
		);

		$this->add_control(
			'container_type',
			[
				'type' => Controls_Manager::HIDDEN,
				'default' => 'flex',
				'selectors' => [
					'{{WRAPPER}}' => 'display: {{VALUE}}',
				],
			]
		);

		$this->add_group_control(
			Group_Control_Flex_Container::get_type(),
			[
				'name' => 'container',
				'selector' => '{{WRAPPER}}',
				'condition' => [
					'container_type' => 'flex',
				],
			]
		);

		$this->end_controls_section();

		/**
		 * Flex items.
		 */
		$this->start_controls_section(
			'section_content_items',
			[
				'label' => __( 'Items', 'elementor' ),
				'tab' => Controls_Manager::TAB_CONTENT,
			]
		);

		$this->add_group_control(
			Group_Control_Flex_Item::get_type(),
			[
				'name' => 'items',
				'selector' => '{{WRAPPER}} > *',
			]
		);

		$this->end_controls_section();
	}

	/**
	 * Register style controls under style tab.
	 */
	protected function register_style_tab() {
		$this->start_controls_section(
			'section_style',
			[
				'label' => __( 'Container', 'elementor' ),
				'tab' => Controls_Manager::TAB_STYLE,
			]
		);

		$this->add_group_control(
			Group_Control_Background::get_type(),
			[
				'name' => 'background',
				'types' => [ 'classic', 'gradient', 'slideshow' ],
				'selector' => '{{WRAPPER}}',
				'fields_options' => [
					'background' => [
						'frontend_available' => true,
					],
				],
			]
		);

		$this->add_control(
			'padding',
			[
				'label' => __( 'Padding', 'elementor' ),
				'type' => Controls_Manager::DIMENSIONS,
				'size_units' => [ 'px', 'em', '%', 'rem' ],
				'selectors' => [
					'{{WRAPPER}}' => 'padding: {{TOP}}{{UNIT}} {{RIGHT}}{{UNIT}} {{BOTTOM}}{{UNIT}} {{LEFT}}{{UNIT}};',
				],
			]
		);

		$this->end_controls_section();
	}

	/**
	 * Register style controls under advanced tab.
	 */
	protected function register_advanced_tab() {
		// Section Flex.
		$this->start_controls_section(
			'section_flex',
			[
				'label' => __( 'Flex', 'elementor' ),
				'type' => Controls_Manager::SECTION,
				'tab' => Controls_Manager::TAB_ADVANCED,
			]
		);

		$this->add_group_control(
			Group_Control_Flex_Item::get_type(),
			[
				'name' => '_flex',
				'selector' => '{{WRAPPER}}',
			]
		);

		$this->end_controls_section();
	}

	protected function register_controls() {
		$this->register_content_tab();
		$this->register_style_tab();
		$this->register_advanced_tab();
	}
}
