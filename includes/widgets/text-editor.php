<?php
namespace Elementor;

if ( ! defined( 'ABSPATH' ) ) exit; // Exit if accessed directly

class Widget_Text_Editor extends Widget_Base {

	public function get_name() {
		return 'text-editor';
	}

	public function get_title() {
		return __( 'Text Editor', 'elementor' );
	}

	public function get_icon() {
		return 'eicon-align-left';
	}

	protected function _register_controls() {
		$this->start_controls_section(
			'section_editor',
			[
				'label' => __( 'Text Editor', 'elementor' ),
			]
		);

		$this->add_control(
			'editor',
			[
				'label' => '',
				'type' => Controls_Manager::WYSIWYG,
				'default' => __( 'I am text block. Click edit button to change this text. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut elit tellus, luctus nec ullamcorper mattis, pulvinar dapibus leo.', 'elementor' ),
			]
		);

		$this->add_control(
			'drop_cap',[
				'label' => __( 'Drop Cap', 'elementor' ),
				'type' => Controls_Manager::SWITCHER,
				'label_off' => __( 'Off', 'elementor' ),
				'label_on' => __( 'On', 'elementor' ),
				'prefix_class' => 'elementor-drop-cap-',
				'frontend_available' => true,
			]
		);

		$this->end_controls_section();

		$this->start_controls_section(
			'section_style',
			[
				'label' => __( 'Text Editor', 'elementor' ),
				'tab' => Controls_Manager::TAB_STYLE,
			]
		);

		$this->add_responsive_control(
			'align',
			[
				'label' => __( 'Alignment', 'elementor' ),
				'type' => Controls_Manager::CHOOSE,
				'options' => [
					'left' => [
						'title' => __( 'Left', 'elementor' ),
						'icon' => 'fa fa-align-left',
					],
					'center' => [
						'title' => __( 'Center', 'elementor' ),
						'icon' => 'fa fa-align-center',
					],
					'right' => [
						'title' => __( 'Right', 'elementor' ),
						'icon' => 'fa fa-align-right',
					],
					'justify' => [
						'title' => __( 'Justified', 'elementor' ),
						'icon' => 'fa fa-align-justify',
					],
				],
				'selectors' => [
					'{{WRAPPER}} .elementor-text-editor' => 'text-align: {{VALUE}};',
				],
			]
		);

	    $this->add_control(
	        'text_color',
	        [
	            'label' => __( 'Text Color', 'elementor' ),
	            'type' => Controls_Manager::COLOR,
	            'default' => '',
	            'selectors' => [
	                '{{WRAPPER}}' => 'color: {{VALUE}};',
	            ],
	            'scheme' => [
		            'type' => Scheme_Color::get_type(),
		            'value' => Scheme_Color::COLOR_3,
	            ],
	        ]
	    );

		$this->add_group_control(
			Group_Control_Typography::get_type(),
			[
				'name' => 'typography',
				'scheme' => Scheme_Typography::TYPOGRAPHY_3,
			]
		);

		$this->end_controls_section();

		$this->start_controls_section(
			'section_drop_cap',
			[
				'label' => __( 'Drop Cap', 'elementor' ),
				'tab' => Controls_Manager::TAB_STYLE,
				'condition' => [
					'drop_cap' => 'yes',
				],
			]
		);

		$this->add_control(
			'drop_cap_view',
			[
				'label' => __( 'View', 'elementor' ),
				'type' => Controls_Manager::SELECT,
				'options' => [
					'default' => __( 'Default', 'elementor' ),
					'stacked' => __( 'Stacked', 'elementor' ),
					'framed' => __( 'Framed', 'elementor' ),
				],
				'default' => 'default',
				'prefix_class' => 'elementor-drop-cap-view-',
				'condition' => [
					'drop_cap' => 'yes',
				],
			]
		);

		$this->add_control(
			'drop_cap_primary_color',
			[
				'label' => __( 'Primary Color', 'elementor' ),
				'type' => Controls_Manager::COLOR,
				'selectors' => [
					'{{WRAPPER}}.elementor-drop-cap-view-stacked .elementor-drop-cap' => 'background-color: {{VALUE}};',
					'{{WRAPPER}}.elementor-drop-cap-view-framed .elementor-drop-cap, {{WRAPPER}}.elementor-drop-cap-view-default .elementor-drop-cap' => 'color: {{VALUE}}; border-color: {{VALUE}};',
				],
				'scheme' => [
					'type' => Scheme_Color::get_type(),
					'value' => Scheme_Color::COLOR_1,
				],
				'condition' => [
					'drop_cap' => 'yes',
				],
			]
		);

		$this->add_control(
			'drop_cap_secondary_color',
			[
				'label' => __( 'Secondary Color', 'elementor' ),
				'type' => Controls_Manager::COLOR,
				'selectors' => [
					'{{WRAPPER}}.elementor-drop-cap-view-framed .elementor-drop-cap' => 'background-color: {{VALUE}};',
					'{{WRAPPER}}.elementor-drop-cap-view-stacked .elementor-drop-cap' => 'color: {{VALUE}};',
				],
				'condition' => [
					'drop_cap_view!' => 'default',
				],
			]
		);

		$this->add_control(
			'drop_cap_size',
			[
				'label' => __( 'Size', 'elementor' ),
				'type' => Controls_Manager::SLIDER,
				'default' => [
					'size' => 5,
				],
				'range' => [
					'px' => [
						'max' => 30,
					],
				],
				'selectors' => [
					'{{WRAPPER}} .elementor-drop-cap' => 'padding: {{SIZE}}{{UNIT}};',
				],
				'condition' => [
					'drop_cap_view!' => 'default',
				],
			]
		);

		$this->add_control(
			'drop_cap_space',
			[
				'label' => __( 'Space', 'elementor' ),
				'type' => Controls_Manager::SLIDER,
				'default' => [
					'size' => 10,
				],
				'range' => [
					'px' => [
						'max' => 50,
					],
				],
				'selectors' => [
					'body:not(.rtl) {{WRAPPER}} .elementor-drop-cap' => 'margin-right: {{SIZE}}{{UNIT}};',
					'body.rtl {{WRAPPER}} .elementor-drop-cap' => 'margin-left: {{SIZE}}{{UNIT}};',
				],
			]
		);

		$this->add_control(
			'drop_cap_border_radius',
			[
				'label' => __( 'Border Radius', 'elementor' ),
				'type' => Controls_Manager::SLIDER,
				'size_units' => [ '%', 'px' ],
				'default' => [
					'unit' => '%',
				],
				'range' => [
					'%' => [
						'max' => 50,
					],
				],
				'selectors' => [
					'{{WRAPPER}} .elementor-drop-cap' => 'border-radius: {{SIZE}}{{UNIT}};',
				],
			]
		);

		$this->add_control(
			'drop_cap_border_width',[
				'label' => __( 'Border Width', 'elementor' ),
				'type' => Controls_Manager::DIMENSIONS,
				'selectors' => [
					'{{WRAPPER}} .elementor-drop-cap' => 'border-width: {{TOP}}{{UNIT}} {{RIGHT}}{{UNIT}} {{BOTTOM}}{{UNIT}} {{LEFT}}{{UNIT}};',
				],
				'condition' => [
					'drop_cap_view' => 'framed',
				],
			]
		);

		$this->add_group_control(
			Group_Control_Typography::get_type(),
			[
				'name' => 'drop_cap_typography',
				'selector' => '{{WRAPPER}} .elementor-drop-cap-letter',
				'exclude' => [
					'letter_spacing',
				],
				'condition' => [
					'drop_cap' => 'yes',
				],
			]
		);

		$this->end_controls_section();
	}

	protected function render() {
		$editor_content = $this->get_settings( 'editor' );

		$editor_content = $this->parse_text_editor( $editor_content );
		?>
		<div class="elementor-text-editor elementor-clearfix"><?php echo $editor_content; ?></div>
		<?php
	}

	public function render_plain_content() {
		// In plain mode, render without shortcode
		echo $this->get_settings( 'editor' );
	}

	protected function _content_template() {
		?>
		<div class="elementor-text-editor elementor-clearfix">{{{ settings.editor }}}</div>
		<?php
	}
}
