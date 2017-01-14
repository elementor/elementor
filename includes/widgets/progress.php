<?php
namespace Elementor;

if ( ! defined( 'ABSPATH' ) ) exit; // Exit if accessed directly

class Widget_Progress extends Widget_Base {

	public function get_name() {
		return 'progress';
	}

	public function get_title() {
		return __( 'Progress Bar', 'elementor' );
	}

	public function get_icon() {
		return 'eicon-skill-bar';
	}

	public function get_categories() {
		return [ 'general-elements' ];
	}

	protected function _register_controls() {
		$this->start_controls_section(
			'section_progress',
			[
				'label' => __( 'Progress Bar', 'elementor' ),
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
			]
		);

		$this->add_control(
			'progress_type',
			[
				'label' => __( 'Type', 'elementor' ),
				'type' => Controls_Manager::SELECT,
				'default' => '',
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
			]
		);

	    $this->add_control(
	        'display_percentage',
	        [
	            'label' => __( 'Display Percentage', 'elementor' ),
	            'type' => Controls_Manager::SELECT,
	            'default' => 'show',
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
			]
		);

		$this->add_control(
			'view',
			[
				'label' => __( 'View', 'elementor' ),
				'type' => Controls_Manager::HIDDEN,
				'default' => 'traditional',
			]
		);

		$this->end_controls_section();

		$this->start_controls_section(
			'section_progress_style',
			[
				'label' => __( 'Progress Bar', 'elementor' ),
				'tab' => Controls_Manager::TAB_STYLE,
			]
		);

		$this->add_control(
			'bar_color',
			[
				'label' => __( 'Color', 'elementor' ),
				'type' => Controls_Manager::COLOR,
				'scheme' => [
					'type' => Scheme_Color::get_type(),
					'value' => Scheme_Color::COLOR_1,
				],
				'selectors' => [
					'{{WRAPPER}} .elementor-progress-wrapper .elementor-progress-bar' => 'background-color: {{VALUE}};',
				],
			]
		);

		$this->add_control(
			'bar_bg_color',
			[
				'label' => __( 'Background Color', 'elementor' ),
				'type' => Controls_Manager::COLOR,
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
				'selectors' => [
					'{{WRAPPER}} .elementor-progress-bar' => 'color: {{VALUE}};',
				],
			]
		);

		$this->end_controls_section();

		$this->start_controls_section(
			'section_title',
			[
				'label' => __( 'Title Style', 'elementor' ),
				'tab' => Controls_Manager::TAB_STYLE,
			]
		);

		$this->add_control(
			'title_color',
			[
				'label' => __( 'Text Color', 'elementor' ),
				'type' => Controls_Manager::COLOR,
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
				'selector' => '{{WRAPPER}} .elementor-title',
				'scheme' => Scheme_Typography::TYPOGRAPHY_3,
			]
		);

		$this->end_controls_section();
	}

	protected function render() {
		$settings = $this->get_settings();

		$this->add_render_attribute( 'wrapper', 'class', 'elementor-progress-wrapper' );

		if ( ! empty( $settings['progress_type'] ) ) {
			$this->add_render_attribute( 'wrapper', 'class', 'progress-' . $settings['progress_type'] );
		}

		$this->add_render_attribute( 'progress-bar', [
			'class' => 'elementor-progress-bar',
			'data-max' => $settings['percent']['size'],
		] );

		if ( ! empty( $settings['title'] ) ) { ?>
			<span class="elementor-title"><?php echo $settings['title']; ?></span>
		<?php } ?>

		<div <?php echo $this->get_render_attribute_string( 'wrapper' ); ?> role="timer">
			<div <?php echo $this->get_render_attribute_string( 'progress-bar' ); ?>>
				<span class="elementor-progress-text"><?php echo $settings['inner_text']; ?></span>
				<?php if ( 'hide' !== $settings['display_percentage'] ) { ?>
					<span class="elementor-progress-percentage"><?php echo $settings['percent']['size']; ?>%</span>
				<?php } ?>
			</div>
		</div>
	<?php }

	protected function _content_template() {
		?>
		<# if ( settings.title ) { #>
		<span class="elementor-title">{{{ settings.title }}}</span><#
		} #>
		<div class="elementor-progress-wrapper progress-{{ settings.progress_type }}" role="timer">
			<div class="elementor-progress-bar" data-max="{{ settings.percent.size }}">
				<span class="elementor-progress-text">{{{ settings.inner_text }}}</span>
			<# if ( 'hide' !== settings.display_percentage ) { #>
				<span class="elementor-progress-percentage">{{{ settings.percent.size }}}%</span>
			<# } #>
			</div>
		</div>
		<?php
	}
}
