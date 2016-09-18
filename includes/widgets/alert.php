<?php
namespace Elementor;

if ( ! defined( 'ABSPATH' ) ) exit; // Exit if accessed directly

class Widget_Alert extends Widget_Base {

	public static function get_name() {
		return 'alert';
	}

	public static function get_title() {
		return __( 'Alert', 'elementor' );
	}

	public static function get_icon() {
		return 'alert';
	}

	protected static function _register_controls() {
		self::add_control(
			'section_alert',
			[
				'label' => __( 'Alert', 'elementor' ),
				'type' => Controls_Manager::SECTION,
			]
		);

		self::add_control(
			'alert_type',
			[
				'label' => __( 'Type', 'elementor' ),
				'type' => Controls_Manager::SELECT,
				'default' => 'info',
				'section' => 'section_alert',
				'options' => [
					'info' => __( 'Info', 'elementor' ),
					'success' => __( 'Success', 'elementor' ),
					'warning' => __( 'Warning', 'elementor' ),
					'danger' => __( 'Danger', 'elementor' ),
				],
			]
		);

		self::add_control(
			'alert_title',
			[
				'label' => __( 'Title & Description', 'elementor' ),
				'type' => Controls_Manager::TEXT,
				'placeholder' => __( 'Your Title', 'elementor' ),
				'default' => __( 'This is Alert', 'elementor' ),
				'label_block' => true,
				'section' => 'section_alert',
			]
		);

		self::add_control(
			'alert_description',
			[
				'label' => __( 'Content', 'elementor' ),
				'type' => Controls_Manager::TEXTAREA,
				'placeholder' => __( 'Your Description', 'elementor' ),
				'default' => __( 'I am description. Click edit button to change this text.', 'elementor' ),
				'separator' => 'none',
				'section' => 'section_alert',
				'show_label' => false,
			]
		);

		self::add_control(
			'show_dismiss',
			[
				'label' => __( 'Dismiss Button', 'elementor' ),
				'type' => Controls_Manager::SELECT,
				'default' => 'show',
				'section' => 'section_alert',
				'options' => [
					'show' => __( 'Show', 'elementor' ),
					'hide' => __( 'Hide', 'elementor' ),
				],
			]
		);

		self::add_control(
			'view',
			[
				'label' => __( 'View', 'elementor' ),
				'type' => Controls_Manager::HIDDEN,
				'default' => 'traditional',
				'section' => 'section_alert',
			]
		);

		self::add_control(
			'section_type',
			[
				'label' => __( 'Alert Type', 'elementor' ),
				'type' => Controls_Manager::SECTION,
				'tab' => Controls_Manager::TAB_STYLE,
			]
		);

		self::add_control(
			'background',
			[
				'label' => __( 'Background Color', 'elementor' ),
				'type' => Controls_Manager::COLOR,
				'tab' => Controls_Manager::TAB_STYLE,
				'section' => 'section_type',
				'selectors' => [
					'{{WRAPPER}} .elementor-alert' => 'background-color: {{VALUE}};',
				],
			]
		);

		self::add_control(
			'border_color',
			[
				'label' => __( 'Border Color', 'elementor' ),
				'type' => Controls_Manager::COLOR,
				'tab' => Controls_Manager::TAB_STYLE,
				'section' => 'section_type',
				'selectors' => [
					'{{WRAPPER}} .elementor-alert' => 'border-color: {{VALUE}};',
				],
			]
		);

		self::add_control(
			'border_left-width',
			[
				'label' => __( 'Left Border Width', 'elementor' ),
				'type' => Controls_Manager::SLIDER,
				'tab' => Controls_Manager::TAB_STYLE,
				'section' => 'section_type',
				'range' => [
					'px' => [
						'min' => 0,
						'max' => 100,
					],
				],
				'selectors' => [
					'{{WRAPPER}} .elementor-alert' => 'border-left-width: {{SIZE}}{{UNIT}};',
				],
			]
		);

		self::add_control(
			'section_title',
			[
				'label' => __( 'Title', 'elementor' ),
				'type' => Controls_Manager::SECTION,
				'tab' => Controls_Manager::TAB_STYLE,
			]
		);

		self::add_control(
			'title_color',
			[
				'label' => __( 'Text Color', 'elementor' ),
				'type' => Controls_Manager::COLOR,
				'tab' => Controls_Manager::TAB_STYLE,
				'section' => 'section_title',
				'selectors' => [
					'{{WRAPPER}} .elementor-alert-title' => 'color: {{VALUE}};',
				],
			]
		);

		self::add_group_control(
			Group_Control_Typography::get_type(),
			[
				'name' => 'alert_title',
				'tab' => Controls_Manager::TAB_STYLE,
				'section' => 'section_title',
				'selector' => '{{WRAPPER}} .elementor-alert-title',
				'scheme' => Scheme_Typography::TYPOGRAPHY_1,
			]
		);

		self::add_control(
			'section_description',
			[
				'label' => __( 'Description', 'elementor' ),
				'type' => Controls_Manager::SECTION,
				'tab' => Controls_Manager::TAB_STYLE,
			]
		);

		self::add_control(
			'description_color',
			[
				'label' => __( 'Text Color', 'elementor' ),
				'type' => Controls_Manager::COLOR,
				'tab' => Controls_Manager::TAB_STYLE,
				'section' => 'section_description',
				'selectors' => [
					'{{WRAPPER}} .elementor-alert-description' => 'color: {{VALUE}};',
				],
			]
		);

		self::add_group_control(
			Group_Control_Typography::get_type(),
			[
				'name' => 'alert_description',
				'tab' => Controls_Manager::TAB_STYLE,
				'section' => 'section_description',
				'selector' => '{{WRAPPER}} .elementor-alert-description',
				'scheme' => Scheme_Typography::TYPOGRAPHY_3,
			]
		);

	}

	protected function render() {
		$settings = $this->get_settings();

		if ( empty( $settings['alert_title'] ) ) {
			return;
		}

		if ( ! empty( $settings['alert_type'] ) ) {
			$this->add_render_attribute( 'wrapper', 'class', 'elementor-alert elementor-alert-' . $settings['alert_type'] );
		}

		echo '<div ' . $this->get_render_attribute_string( 'wrapper' ) . ' role="alert">';
		$html = sprintf( '<span class="elementor-alert-title">%1$s</span>', $settings['alert_title'] );

		if ( ! empty( $settings['alert_description'] ) ) {
			$html .= sprintf( '<span class="elementor-alert-description">%s</span>', $settings['alert_description'] );
		}

		if ( ! empty( $settings['show_dismiss'] ) && 'show' === $settings['show_dismiss'] ) {
			$html .= '<button type="button" class="elementor-alert-dismiss">X</button></div>';
		}

		echo $html;
	}

	protected static function _content_template() {
		?>
		<#
		var html = '<div class="elementor-alert elementor-alert-' + settings.alert_type + '" role="alert">';
		if ( '' !== settings.title ) {
			html += '<span class="elementor-alert-title">' + settings.alert_title + '</span>';

			if ( '' !== settings.description ) {
				html += '<span class="elementor-alert-description">' + settings.alert_description + '</span>';
			}

			if ( 'show' === settings.show_dismiss ) {
				html += '<button type="button" class="elementor-alert-dismiss">X</button></div>';
			}

			print( html );
		}
		#>
		<?php
	}
}
