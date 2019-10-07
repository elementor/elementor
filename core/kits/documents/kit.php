<?php
namespace Elementor\Core\Kits\Documents;

use Elementor\Core\DocumentTypes\PageBase;
use Elementor\Group_Control_Typography;
use Elementor\Plugin;
use Elementor\Controls_Manager;
use Elementor\Scheme_Typography;
use Elementor\Utils;

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

	public function _get_initial_config() {
		$config = parent::_get_initial_config();

		$config['cssWrapperSelector'] = $this->get_css_wrapper_selector();
		$config['controls'] = $this->get_controls();
		$config['tabs'] = $this->get_tabs_controls();
		$config['settings'] = $this->get_settings();

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
		$this->start_controls_section(
			'section_typography',
			[
				'label' => __( 'Typography', 'elementor' ),
				'tab' => Controls_Manager::TAB_STYLE,
			]
		);

		$this->add_control(
			'default_generic_font',
			[
				'label' => __( 'Default Generic Fonts', 'elementor' ),
				'default' => 'Sans-serif',
				'selectors' => [
					'{{WRAPPER}}' => 'font-family: {{VALUE}};',
				],
			]
		);

		$this->add_group_control(
			Group_Control_Typography::get_type(),
			[
				'label' => __( 'Body', 'elementor' ),
				'name' => 'typography_body',
				'scheme' => Scheme_Typography::TYPOGRAPHY_1,
				'selector' => '{{WRAPPER}}',
			]
		);

		$this->add_group_control(
			Group_Control_Typography::get_type(),
			[
				'label' => __( 'H1', 'elementor' ),
				'name' => 'typography_h1',
				'scheme' => Scheme_Typography::TYPOGRAPHY_1,
				'selector' => '{{WRAPPER}} h1',
			]
		);

		$this->add_group_control(
			Group_Control_Typography::get_type(),
			[
				'label' => __( 'H2', 'elementor' ),
				'name' => 'typography_h2',
				'scheme' => Scheme_Typography::TYPOGRAPHY_1,
				'selector' => '{{WRAPPER}} h2',
			]
		);

		$this->add_group_control(
			Group_Control_Typography::get_type(),
			[
				'label' => __( 'H3', 'elementor' ),
				'name' => 'typography_h3',
				'scheme' => Scheme_Typography::TYPOGRAPHY_1,
				'selector' => '{{WRAPPER}} h3',
			]
		);

		$this->add_group_control(
			Group_Control_Typography::get_type(),
			[
				'label' => __( 'H4', 'elementor' ),
				'name' => 'typography_h4',
				'scheme' => Scheme_Typography::TYPOGRAPHY_1,
				'selector' => '{{WRAPPER}} h4',
			]
		);

		$this->add_group_control(
			Group_Control_Typography::get_type(),
			[
				'label' => __( 'H5', 'elementor' ),
				'name' => 'typography_h5',
				'scheme' => Scheme_Typography::TYPOGRAPHY_1,
				'selector' => '{{WRAPPER}} h5',
			]
		);

		$this->add_group_control(
			Group_Control_Typography::get_type(),
			[
				'label' => __( 'H6', 'elementor' ),
				'name' => 'typography_h6',
				'scheme' => Scheme_Typography::TYPOGRAPHY_1,
				'selector' => '{{WRAPPER}} h6',
			]
		);

		$this->end_controls_section();

		$this->start_controls_section(
			'section_colors',
			[
				'label' => __( 'Colors', 'elementor' ),
				'tab' => Controls_Manager::TAB_STYLE,
			]
		);

		$this->add_control(
			'color_1',
			[
				'label' => __( 'Primary', 'elementor' ),
				'type' => Controls_Manager::COLOR,
				'default' => '#6ec1e4',
			]
		);

		$this->add_control(
			'color_2',
			[
				'label' => __( 'Secondary', 'elementor' ),
				'type' => Controls_Manager::COLOR,
				'default' => '#54595f',
			]
		);

		$this->add_control(
			'color_3',
			[
				'label' => __( 'Text', 'elementor' ),
				'type' => Controls_Manager::COLOR,
				'default' => '#7a7a7a',
				'selectors' => [
					'{{WRAPPER}}' => 'color: {{VALUE}};',
				],
			]
		);

		$this->add_control(
			'color_4',
			[
				'label' => __( 'Accent', 'elementor' ),
				'type' => Controls_Manager::COLOR,
				'default' => '#61ce70',
				'selectors' => [
					'{{WRAPPER}} a:not(.elementor-button)' => 'color: {{VALUE}};',
				],
			]
		);

		$this->end_controls_section();



		//Links (Normal/Hover/Active) ???
		/*
		Layout
		Background
		Container Width
		Content Width
		Widgets Space
		Stretched Section Fit To
		Page Title Selectors
		Default Page Template
		Tablet Breakpoint
		Mobile Breakpoint

		Buttons
		Default / Primary
		Secondary
		Ghost / Transparent
		*/

		$this->add_theme_template_controls();

		Plugin::$instance->controls_manager->add_custom_css_controls( $this );
	}

	public function add_theme_template_controls() {
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
	}
}
