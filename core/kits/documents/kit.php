<?php
namespace Elementor\Core\Kits\Documents;

use Elementor\Core\DocumentTypes\PageBase;
use Elementor\Group_Control_Background;
use Elementor\Group_Control_Border;
use Elementor\Group_Control_Box_Shadow;
use Elementor\Group_Control_Text_Shadow;
use Elementor\Group_Control_Typography;
use Elementor\Plugin;
use Elementor\Controls_Manager;
use Elementor\Core\Schemes\Typography;
use Elementor\Utils;
use Elementor\Core\Schemes;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly
}

class Kit extends PageBase {

	public static function get_properties() {
		$properties = parent::get_properties();

		$properties['has_elements'] = false;
		$properties['user_role'] = 'design';

		return $properties;
	}

	public function get_name() {
		return 'kit';
	}

	public static function get_title() {
		return __( 'Kit', 'elementor' );
	}

	public function get_preview_url() {
		$url = parent::get_preview_url();
		if ( isset( $_GET['elementor-location'] ) ) {
			$url = add_query_arg( 'elementor-location', $_GET['elementor-location'] , $url );
		}

		return $url;
	}

	public static function get_editor_panel_config() {
		$config = parent::get_editor_panel_config();
		$config['default_route'] = 'panel/global/style';
		$config['has_elements'] = self::get_property( 'has_elements' );

		return $config;
	}

	public function get_initial_config() {
		$config = parent::get_initial_config();

		unset( $config['elements'] );

		return $config;
	}

	public function get_css_wrapper_selector() {
		return 'body';//.elementor-kit-' . $this->get_main_id();
	}

	/**
	 * @since 2.0.0
	 * @access protected
	 */
	protected function _register_controls() {
		$this->register_document_controls();

		$this->add_body_section();
		$this->add_typography_section();
		$this->add_buttons_section();
		$this->add_form_fields_section();
		$this->add_theme_template_controls();

		Plugin::$instance->controls_manager->add_custom_css_controls( $this );
	}

	public function add_theme_template_controls() {
		Plugin::$instance->controls_manager->add_tab( 'theme_templates', __( 'Theme Template', 'elementor' ) );
		Plugin::$instance->controls_manager->add_tab( 'site_settings', __( 'Site Settings', 'elementor' ) );

		$this->start_controls_section(
			'section_theme_template_pro',
			[
				'label' => __( 'Theme Templates', 'elementor' ),
				'tab' => 'theme_templates',
			]
		);

		$this->add_control(
			'theme_template_pro',
			[
				'type' => Controls_Manager::RAW_HTML,
				'raw' => '<div class="elementor-nerd-box">' .
				         '<i class="elementor-nerd-box-icon eicon-hypster" aria-hidden="true"></i>' .
				         '<div class="elementor-nerd-box-title">' .
				         __( 'Meet Our Theme Builder', 'elementor' ) .
				         '</div>' .
				         '<div class="elementor-nerd-box-message">' .
				         __( 'Theme Builder allows you to build your own theme', 'elementor' ) .
				         '</div>' .
				         '<div class="elementor-nerd-box-message">' .
				         __( 'This feature is only available on Elementor Pro.', 'elementor' ) .
				         '</div>
							<a class="elementor-nerd-box-link elementor-button elementor-button-default elementor-go-pro" href="' . Utils::get_pro_link( 'https://elementor.com/pro/?utm_source=panel-theme-templates&utm_campaign=gopro&utm_medium=wp-dash' ) . '" target="_blank">' .
				         __( 'Go Pro', 'elementor' ) .
				         '</a>
							</div>',
			]
		);

		$this->end_controls_section();

		$this->start_controls_section(
			'section_site_settings',
			[
				'label' => __( 'Site Identity', 'elementor' ),
				'tab' => 'site_settings',
			]
		);

		$this->add_control(
			'site_name',
			[
				'label' => __( 'Site Name', 'elementor' ),
				'default' => get_option( 'blogname' ),
			]
		);

		$this->add_control(
			'site_description',
			[
				'label' => __( 'Site Description', 'elementor' ),
				'default' => get_option( 'blogdescription' ),
				'label_block' => true,
			]
		);

		$this->end_controls_section();
	}

	private function add_element_controls( $label, $prefix, $selector ) {
		$this->add_control(
			$prefix . '_heading',
			[
				'type' => Controls_Manager::HEADING,
				'label' => $label,
				'separator' => 'before',
			]
		);

		$this->add_control(
			$prefix . '_color',
			[
				'label' => __( 'Color', 'elementor' ),
				'type' => Controls_Manager::COLOR,
				'selectors' => [
					$selector => 'color: {{VALUE}};',
				],
			]
		);

		$this->add_group_control(
			Group_Control_Typography::get_type(),
			[
				'label' => __( 'Typography', 'elementor' ),
				'name' => $prefix . '_typography',
				'scheme' => Typography::TYPOGRAPHY_1,
				'selector' => $selector,
			]
		);
	}

	private function add_link_style_controls() {
		$this->add_control(
			'link_heading',
			[
				'type' => Controls_Manager::HEADING,
				'label' => __( 'Link', 'elementor' ),
				'separator' => 'before',
			]
		);

		$this->start_controls_tabs( 'tabs_link_style' );

		$this->start_controls_tab(
			'tab_link_normal',
			[
				'label' => __( 'Normal', 'elementor' ),
			]
		);

		$this->add_control(
			'link_normal_color',
			[
				'label' => __( 'Color', 'elementor' ),
				'type' => Controls_Manager::COLOR,
				'selectors' => [
					'{{WRAPPER}} a' => 'color: {{VALUE}};',
				],
			]
		);

		$this->add_group_control(
			Group_Control_Typography::get_type(),
			[
				'label' => __( 'Typography', 'elementor' ),
				'name' => 'link_normal_typography',
				'scheme' => Typography::TYPOGRAPHY_1,
				'selector' => '{{WRAPPER}} a',
			]
		);

		$this->end_controls_tab();

		$this->start_controls_tab(
			'tab_link_hover',
			[
				'label' => __( 'Hover', 'elementor' ),
			]
		);

		$this->add_control(
			'link_hover_color',
			[
				'label' => __( 'Color', 'elementor' ),
				'type' => Controls_Manager::COLOR,
				'selectors' => [
					'{{WRAPPER}} a:hover' => 'color: {{VALUE}};',
				],
			]
		);

		$this->add_group_control(
			Group_Control_Typography::get_type(),
			[
				'label' => __( 'Typography', 'elementor' ),
				'name' => 'link_hover_typography',
				'scheme' => Typography::TYPOGRAPHY_1,
				'selector' => '{{WRAPPER}} a:hover',
			]
		);

		$this->end_controls_tab();

		$this->end_controls_tabs();
	}

	private function add_body_section() {
		$this->start_controls_section(
			'section_body',
			[
				'label' => __( 'Body', 'elementor' ),
				'tab' => Controls_Manager::TAB_STYLE,
			]
		);

		$this->add_group_control(
			Group_Control_Background::get_type(),
			[
				'name' => 'body_background',
				'types' => [ 'classic', 'gradient' ],
				'fields_options' => [
					'background' => [
						'frontend_available' => true,
					],
				],
			]
		);

		$this->end_controls_section();
	}

	private function add_buttons_section() {

		$this->start_controls_section(
			'section_buttons',
			[
				'label' => __( 'Buttons', 'elementor' ),
				'tab' => Controls_Manager::TAB_STYLE,
			]
		);

		$this->add_group_control(
			Group_Control_Typography::get_type(),
			[
				'label' => __( 'Typography', 'elementor' ),
				'name' => 'button_typography',
				'scheme' => Typography::TYPOGRAPHY_1,
				'selector' => '{{WRAPPER}} button',
			]
		);

		$this->add_group_control(
			Group_Control_Text_Shadow::get_type(),
			[
				'name' => 'button_text_shadow',
				'selector' => '{{WRAPPER}} button',
			]
		);

		$this->start_controls_tabs( 'tabs_button_style' );

		$this->start_controls_tab(
			'tab_button_normal',
			[
				'label' => __( 'Normal', 'elementor' ),
			]
		);

		$this->add_control(
			'button_text_color',
			[
				'label' => __( 'Text Color', 'elementor' ),
				'type' => Controls_Manager::COLOR,
				'selectors' => [
					'{{WRAPPER}} button' => 'color: {{VALUE}};',
				],
			]
		);

		$this->add_control(
			'button_background_color',
			[
				'label' => __( 'Background Color', 'elementor' ),
				'type' => Controls_Manager::COLOR,
				'scheme' => [
					'type' => Schemes\Color::get_type(),
					'value' => Schemes\Color::COLOR_4,
				],
				'selectors' => [
					'{{WRAPPER}} button' => 'background-color: {{VALUE}};',
				],
			]
		);

		$this->add_group_control(
			Group_Control_Border::get_type(),
			[
				'name' => 'button_border',
				'selector' => '{{WRAPPER}} button',
				'separator' => 'before',
			]
		);

		$this->add_group_control(
			Group_Control_Box_Shadow::get_type(),
			[
				'name' => 'button_box_shadow',
				'selector' => '{{WRAPPER}} button',
			]
		);

		$this->end_controls_tab();

		$this->start_controls_tab(
			'tab_button_hover',
			[
				'label' => __( 'Hover', 'elementor' ),
			]
		);

		$this->add_control(
			'button_hover_text_color',
			[
				'label' => __( 'Text Color', 'elementor' ),
				'type' => Controls_Manager::COLOR,
				'selectors' => [
					'{{WRAPPER}} button:hover, {{WRAPPER}} button:focus' => 'color: {{VALUE}};',
				],
			]
		);

		$this->add_control(
			'button_hover_background_color',
			[
				'label' => __( 'Background Color', 'elementor' ),
				'type' => Controls_Manager::COLOR,
				'scheme' => [
					'type' => Schemes\Color::get_type(),
					'value' => Schemes\Color::COLOR_4,
				],
				'selectors' => [
					'{{WRAPPER}} button:hover, {{WRAPPER}} button:focus' => 'background-color: {{VALUE}};',
				],
			]
		);

		$this->add_group_control(
			Group_Control_Border::get_type(),
			[
				'name' => 'button_hover_border',
				'selector' => '{{WRAPPER}} button:hover, {{WRAPPER}} button:focus',
				'separator' => 'before',
			]
		);

		$this->add_group_control(
			Group_Control_Box_Shadow::get_type(),
			[
				'name' => 'button_hover_box_shadow',
				'selector' => '{{WRAPPER}} button:hover, {{WRAPPER}} button:focus',
			]
		);

		$this->end_controls_tab();

		$this->add_control(
			'button_border_radius',
			[
				'label' => __( 'Border Radius', 'elementor' ),
				'type' => Controls_Manager::DIMENSIONS,
				'size_units' => [ 'px', '%' ],
				'selectors' => [
					'{{WRAPPER}} button' => 'border-radius: {{TOP}}{{UNIT}} {{RIGHT}}{{UNIT}} {{BOTTOM}}{{UNIT}} {{LEFT}}{{UNIT}};',
				],
			]
		);

		$this->add_responsive_control(
			'button_padding',
			[
				'label' => __( 'Padding', 'elementor' ),
				'type' => Controls_Manager::DIMENSIONS,
				'size_units' => [ 'px', 'em', '%' ],
				'selectors' => [
					'{{WRAPPER}} button' => 'padding: {{TOP}}{{UNIT}} {{RIGHT}}{{UNIT}} {{BOTTOM}}{{UNIT}} {{LEFT}}{{UNIT}};',
				],
				'separator' => 'before',
			]
		);

		$this->end_controls_section();
	}

	private function add_typography_section() {
		$this->start_controls_section(
			'section_typography',
			[
				'label' => __( 'Typography', 'elementor' ),
				'tab' => Controls_Manager::TAB_STYLE,
			]
		);

		$this->add_control(
			'section_typography_notice',
			[
				'type' => Controls_Manager::RAW_HTML,
				'raw' => __( 'This action will reset typography elements that their source is external to Elementor', 'elementor' ),
				'content_classes' => 'elementor-panel-alert elementor-panel-alert-warning',
			]
		);

		$this->add_element_controls( __( 'Body', 'elementor' ), 'body', '{{WRAPPER}}' );

		$this->add_control(
			'paragraph_spacing',
			[
				'label' => __( 'Paragraph Spacing', 'elementor' ),
				'type' => Controls_Manager::SLIDER,
				'selectors' => [
					'{{WRAPPER}} p' => 'margin-bottom: {{SIZE}}{{UNIT}}',
				],
				'range' => [
					'px' => [
						'min' => 0,
						'max' => 100,
					],
				],
			]
		);

		// Links.
		$this->add_link_style_controls();

		// Headings.
		$this->add_element_controls( __( 'H1', 'elementor' ), 'h1', '{{WRAPPER}} h1' );
		$this->add_element_controls( __( 'H2', 'elementor' ), 'h2', '{{WRAPPER}} h2' );
		$this->add_element_controls( __( 'H3', 'elementor' ), 'h3', '{{WRAPPER}} h3' );
		$this->add_element_controls( __( 'H4', 'elementor' ), 'h4', '{{WRAPPER}} h4' );
		$this->add_element_controls( __( 'H5', 'elementor' ), 'h5', '{{WRAPPER}} h5' );
		$this->add_element_controls( __( 'H6', 'elementor' ), 'h6', '{{WRAPPER}} h6' );

		$this->end_controls_section();
	}

	private function add_form_fields_section() {
		$this->start_controls_section(
			'section_form_fields',
			[
				'label' => __( 'Form Fields', 'elementor' ),
				'tab' => Controls_Manager::TAB_STYLE,
			]
		);

		$this->add_control(
			'section_form_fields_notice',
			[
				'type' => Controls_Manager::RAW_HTML,
				'raw' => __( 'Coming Soon', 'elementor' ),
				'content_classes' => 'elementor-panel-alert elementor-panel-alert-warning',
			]
		);

		$this->end_controls_section();
	}
}
