<?php
namespace Elementor;

if ( ! defined( 'ABSPATH' ) ) exit; // Exit if accessed directly

class Widget_Progress extends Widget_Base {

	public function get_id() {
		return 'progress';
	}

	public function get_title() {
		return __( 'Progress Bar', 'elementor' );
	}

	public function get_icon() {
		return 'skill-bar';
	}

	protected function _register_controls() {
		$this->add_control(
			'section_progress',
			[
				'label' => __( 'Progress Bar', 'elementor' ),
				'type' => Controls_Manager::SECTION,
			]
		);

		$this->add_control(
			'title',
			[
				'label' => __( 'Title', 'elementor' ),
				'type' => Controls_Manager::TEXT,
				'placeholder' => __( 'Enter your title', 'elementor' ),
				'default' => __( 'My Skill', 'elementor' ),
				'label_block' => true,
				'section' => 'section_progress',
			]
		);

		$this->add_control(
			'progress_type',
			[
				'label' => __( 'Type', 'elementor' ),
				'type' => Controls_Manager::SELECT,
				'default' => '',
				'section' => 'section_progress',
				'options' => [
					'' => __( 'Default', 'elementor' ),
					'info' => __( 'Info', 'elementor' ),
					'success' => __( 'Success', 'elementor' ),
					'warning' => __( 'Warning', 'elementor' ),
					'danger' => __( 'Danger', 'elementor' ),
				],
			]
		);

		$this->add_control(
			'percent',
			[
				'label' => __( 'Percentage', 'elementor' ),
				'type' => Controls_Manager::SLIDER,
				'default' => [
					'size' => 50,
					'unit' => '%',
				],
				'label_block' => true,
				'section' => 'section_progress',
			]
		);

	    $this->add_control(
	        'display_percentage',
	        [
	            'label' => __( 'Display Percentage', 'elementor' ),
	            'type' => Controls_Manager::SELECT,
	            'default' => 'show',
	            'section' => 'section_progress',
	            'options' => [
	                'show' => __( 'Show', 'elementor' ),
	                'hide' => __( 'Hide', 'elementor' ),
	            ],
	        ]
	    );

		$this->add_control(
			'inner_text',
			[
				'label' => __( 'Inner Text', 'elementor' ),
				'type' => Controls_Manager::TEXT,
				'placeholder' => __( 'e.g. Web Designer', 'elementor' ),
				'default' => __( 'Web Designer', 'elementor' ),
				'label_block' => true,
				'section' => 'section_progress',
			]
		);

		$this->add_control(
			'view',
			[
				'label' => __( 'View', 'elementor' ),
				'type' => Controls_Manager::HIDDEN,
				'default' => 'traditional',
				'section' => 'section_progress',
			]
		);

		$this->add_control(
			'section_progress_style',
			[
				'label' => __( 'Progress Bar', 'elementor' ),
				'type' => Controls_Manager::SECTION,
				'tab' => self::TAB_STYLE,
			]
		);

		$this->add_control(
			'bar_color',
			[
				'label' => __( 'Bar Color', 'elementor' ),
				'type' => Controls_Manager::COLOR,
				'tab' => self::TAB_STYLE,
				'scheme' => [
					'type' => Scheme_Color::get_type(),
					'value' => Scheme_Color::COLOR_1,
				],
				'section' => 'section_progress_style',
				'selectors' => [
					'{{WRAPPER}} .elementor-progress-wrapper .elementor-progress-bar' => 'background-color: {{VALUE}};',
				],
			]
		);

		$this->add_control(
			'bar_bg_color',
			[
				'label' => __( 'Bar Background Color', 'elementor' ),
				'type' => Controls_Manager::COLOR,
				'tab' => self::TAB_STYLE,
				'section' => 'section_progress_style',
				'selectors' => [
					'{{WRAPPER}} .elementor-progress-wrapper' => 'background-color: {{VALUE}};',
				],
			]
		);

		$this->add_control(
			'bar_inline_color',
			[
				'label' => __( 'Inner Text Color', 'elementor' ),
				'type' => Controls_Manager::COLOR,
				'tab' => self::TAB_STYLE,
				'section' => 'section_progress_style',
				'selectors' => [
					'{{WRAPPER}} .elementor-progress-wrapper .elementor-progress-inner-text' => 'color: {{VALUE}};',
				],
			]
		);

		$this->add_control(
			'section_title',
			[
				'label' => __( 'Title Style', 'elementor' ),
				'type' => Controls_Manager::SECTION,
				'tab' => self::TAB_STYLE,
			]
		);

		$this->add_control(
			'title_color',
			[
				'label' => __( 'Text Color', 'elementor' ),
				'type' => Controls_Manager::COLOR,
				'tab' => self::TAB_STYLE,
				'section' => 'section_title',
				'selectors' => [
					'{{WRAPPER}} .elementor-title' => 'color: {{VALUE}};',
				],
				'scheme' => [
					'type' => Scheme_Color::get_type(),
					'value' => Scheme_Color::COLOR_1,
				],
			]
		);

		$this->add_group_control(
			Group_Control_Typography::get_type(),
			[
				'name' => 'typography',
				'tab' => self::TAB_STYLE,
				'section' => 'section_title',
				'selector' => '{{WRAPPER}} .elementor-title',
				'scheme' => Scheme_Typography::TYPOGRAPHY_3,
			]
		);
	}

	protected function render( $instance = [] ) {
		$html = '';

		$this->add_render_attribute( 'wrapper', 'class', 'elementor-progress-wrapper' );

		if ( ! empty( $instance['progress_type'] ) ) {
			$this->add_render_attribute( 'wrapper', 'class', 'progress-' . $instance['progress_type'] );
		}

		if ( ! empty( $instance['title'] ) ) {
			$html .= '<span class="elementor-title">' . $instance['title'] . '</span>';
		}

		$html .= '<div ' . $this->get_render_attribute_string( 'wrapper' ) . ' role="timer">';

		$html .= '<span class="elementor-progress-bar" data-max="' . $instance['percent']['size'] . '"></span>';

		if ( ! empty( $instance['inner_text'] ) ) {
			$data_inner = ' data-inner="' . $instance['inner_text'] . '"';
		} else {
			$data_inner = '';
		}

		$html .= '<span class="elementor-progress-inner-text"' . $data_inner . '>';

		$html .= '<span class="elementor-progress-text"></span>';

		if ( 'hide' !== $instance['display_percentage'] ) {
			$html .= '<span class="elementor-progress-percentage"></span>';
		}

		$html .= '</span></div>';

		echo $html;
	}

	protected function content_template() {
		?>
		<%
		var html = '';

		if ( '' !== settings.title ) {
			html += '<span class="elementor-title">' + settings.title + '</span>';
		}

		html += '<div class="elementor-progress-wrapper progress-' + settings.progress_type + '" role="timer">';

		html += '<span class="elementor-progress-bar" data-max="' + settings.percent.size + '"></span>';

		if ( '' !== settings.sub_title ) {
			var data_inner = ' data-inner="' + settings.inner_text + '"';
		} else {
			var data_inner = '';
		}

		html += '<span class="elementor-progress-inner-text"' + data_inner + '>';
		html += '<span class="elementor-progress-text"></span>';

		if ( 'hide' !== settings.display_percentage ) {
			html += '<span class="elementor-progress-percentage"></span>';
		}

		html += '</span></div>';

		print( html );
		%>
		<?php
	}
}
