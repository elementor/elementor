<?php
namespace Elementor;

if ( ! defined( 'ABSPATH' ) ) exit; // Exit if accessed directly

class Widget_Testimonial extends Widget_Base {

	public function get_name() {
		return 'testimonial';
	}

	public function get_title() {
		return __( 'Testimonial', 'elementor' );
	}

	public function get_icon() {
		return 'eicon-testimonial';
	}

	public function get_categories() {
		return [ 'general-elements' ];
	}

	protected function _register_controls() {
		$this->start_controls_section(
			'section_testimonial',
			[
				'label' => __( 'Testimonial', 'elementor' ),
			]
		);

		$this->add_control(
			'testimonial_content',
			[
				'label' => __( 'Content', 'elementor' ),
				'type' => Controls_Manager::TEXTAREA,
				'rows' => '10',
				'default' => 'Click edit button to change this text. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut elit tellus, luctus nec ullamcorper mattis, pulvinar dapibus leo.',
			]
		);

		$this->add_control(
			'testimonial_image',
			[
				'label' => __( 'Add Image', 'elementor' ),
				'type' => Controls_Manager::MEDIA,
				'default' => [
					'url' => Utils::get_placeholder_image_src(),
				],
			]
		);

		$this->add_control(
			'testimonial_name',
			[
				'label' => __( 'Name', 'elementor' ),
				'type' => Controls_Manager::TEXT,
				'default' => 'John Doe',
			]
		);

		$this->add_control(
			'testimonial_job',
			[
				'label' => __( 'Job', 'elementor' ),
				'type' => Controls_Manager::TEXT,
				'default' => 'Designer',
			]
		);

		$this->add_control(
			'testimonial_image_position',
			[
				'label' => __( 'Image Position', 'elementor' ),
				'type' => Controls_Manager::SELECT,
				'default' => 'aside',
				'options' => [
					'aside' => __( 'Aside', 'elementor' ),
					'top' => __( 'Top', 'elementor' ),
				],
				'condition' => [
					'testimonial_image[url]!' => '',
				],
				'separator' => 'before',
			]
		);

		$this->add_control(
			'testimonial_alignment',
			[
				'label' => __( 'Alignment', 'elementor' ),
				'type' => Controls_Manager::CHOOSE,
				'default' => 'center',
				'options' => [
					'left'    => [
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
				],
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

		// Content
		$this->start_controls_section(
			'section_style_testimonial_content',
			[
				'label' => __( 'Content', 'elementor' ),
				'tab' => Controls_Manager::TAB_STYLE,
			]
		);

		$this->add_control(
			'content_content_color',
			[
				'label' => __( 'Content Color', 'elementor' ),
				'type' => Controls_Manager::COLOR,
				'scheme' => [
					'type' => Scheme_Color::get_type(),
					'value' => Scheme_Color::COLOR_3,
				],
				'default' => '',
				'selectors' => [
					'{{WRAPPER}} .elementor-testimonial-content' => 'color: {{VALUE}};',
				],
			]
		);

		$this->add_group_control(
			Group_Control_Typography::get_type(),
			[
				'name' => 'content_typography',
				'label' => __( 'Typography', 'elementor' ),
				'scheme' => Scheme_Typography::TYPOGRAPHY_3,
				'selector' => '{{WRAPPER}} .elementor-testimonial-content',
			]
		);

		$this->end_controls_section();

		// Image
		$this->start_controls_section(
			'section_style_testimonial_image',
			[
				'label' => __( 'Image', 'elementor' ),
				'tab' => Controls_Manager::TAB_STYLE,
				'condition' => [
					'testimonial_image[url]!' => '',
				],
			]
		);

		$this->add_control(
			'image_size',
			[
				'label' => __( 'Image Size', 'elementor' ),
				'type' => Controls_Manager::SLIDER,
				'size_units' => [ 'px' ],
				'range' => [
					'px' => [
						'min' => 20,
						'max' => 200,
					],
				],
				'selectors' => [
					'{{WRAPPER}} .elementor-testimonial-wrapper .elementor-testimonial-image img' => 'width: {{SIZE}}{{UNIT}};height: {{SIZE}}{{UNIT}};',
				],
				'condition' => [
					'testimonial_image[url]!' => '',
				],
			]
		);

		$this->add_group_control(
			Group_Control_Border::get_type(),
			[
				'name' => 'image_border',
				'selector' => '{{WRAPPER}} .elementor-testimonial-wrapper .elementor-testimonial-image img',
				'condition' => [
					'testimonial_image[url]!' => '',
				],
			]
		);

		$this->add_control(
			'image_border_radius',
			[
				'label' => __( 'Border Radius', 'elementor' ),
				'type' => Controls_Manager::DIMENSIONS,
				'size_units' => [ 'px', '%' ],
				'selectors' => [
					'{{WRAPPER}} .elementor-testimonial-wrapper .elementor-testimonial-image img' => 'border-radius: {{TOP}}{{UNIT}} {{RIGHT}}{{UNIT}} {{BOTTOM}}{{UNIT}} {{LEFT}}{{UNIT}};',
				],
				'condition' => [
					'testimonial_image[url]!' => '',
				],
			]
		);

		$this->end_controls_section();

		// Name
		$this->start_controls_section(
			'section_style_testimonial_name',
			[
				'label' => __( 'Name', 'elementor' ),
				'tab' => Controls_Manager::TAB_STYLE,
			]
		);

		$this->add_control(
			'name_text_color',
			[
				'label' => __( 'Text Color', 'elementor' ),
				'type' => Controls_Manager::COLOR,
				'scheme' => [
					'type' => Scheme_Color::get_type(),
					'value' => Scheme_Color::COLOR_1,
				],
				'default' => '',
				'selectors' => [
					'{{WRAPPER}} .elementor-testimonial-name' => 'color: {{VALUE}};',
				],
			]
		);

		$this->add_group_control(
			Group_Control_Typography::get_type(),
			[
				'name' => 'name_typography',
				'label' => __( 'Typography', 'elementor' ),
				'scheme' => Scheme_Typography::TYPOGRAPHY_1,
				'selector' => '{{WRAPPER}} .elementor-testimonial-name',
			]
		);

		$this->end_controls_section();

		// Job
		$this->start_controls_section(
			'section_style_testimonial_job',
			[
				'label' => __( 'Job', 'elementor' ),
				'tab' => Controls_Manager::TAB_STYLE,
			]
		);

		$this->add_control(
			'job_text_color',
			[
				'label' => __( 'Text Color', 'elementor' ),
				'type' => Controls_Manager::COLOR,
				'scheme' => [
					'type' => Scheme_Color::get_type(),
					'value' => Scheme_Color::COLOR_2,
				],
				'default' => '',
				'selectors' => [
					'{{WRAPPER}} .elementor-testimonial-job' => 'color: {{VALUE}};',
				],
			]
		);

		$this->add_group_control(
			Group_Control_Typography::get_type(),
			[
				'name' => 'job_typography',
				'label' => __( 'Typography', 'elementor' ),
				'scheme' => Scheme_Typography::TYPOGRAPHY_2,
				'selector' => '{{WRAPPER}} .elementor-testimonial-job',
			]
		);

		$this->end_controls_section();
	}

	protected function render() {
		$settings = $this->get_settings();

		if ( empty( $settings['testimonial_name'] ) || empty( $settings['testimonial_content'] ) )
			return;

		$has_image = false;
		if ( '' !== $settings['testimonial_image']['url'] ) {
			$image_url = $settings['testimonial_image']['url'];
			$has_image = ' elementor-has-image';
		}

		$testimonial_alignment = $settings['testimonial_alignment'] ? ' elementor-testimonial-text-align-' . $settings['testimonial_alignment'] : '';
		$testimonial_image_position = $settings['testimonial_image_position'] ? ' elementor-testimonial-image-position-' . $settings['testimonial_image_position'] : '';
		?>
		<div class="elementor-testimonial-wrapper<?php echo $testimonial_alignment; ?>">

			<?php if ( ! empty( $settings['testimonial_content'] ) ) : ?>
				<div class="elementor-testimonial-content">
						<?php echo $settings['testimonial_content']; ?>
				</div>
			<?php endif; ?>

			<div class="elementor-testimonial-meta<?php if ( $has_image ) echo $has_image; ?><?php echo $testimonial_image_position; ?>">
				<div class="elementor-testimonial-meta-inner">
					<?php if ( isset( $image_url ) ) : ?>
						<div class="elementor-testimonial-image">
							<img src="<?php echo esc_attr( $image_url ); ?>" alt="<?php echo esc_attr( Control_Media::get_image_alt( $settings['testimonial_image'] ) ); ?>" />
						</div>
					<?php endif; ?>

					<div class="elementor-testimonial-details">
						<?php if ( ! empty( $settings['testimonial_name'] ) ) : ?>
							<div class="elementor-testimonial-name">
								<?php echo $settings['testimonial_name']; ?>
							</div>
						<?php endif; ?>

						<?php if ( ! empty( $settings['testimonial_job'] ) ) : ?>
							<div class="elementor-testimonial-job">
								<?php echo $settings['testimonial_job']; ?>
							</div>
						<?php endif; ?>
					</div>
				</div>
			</div>
		</div>
	<?php
	}

	protected function _content_template() {
		?>
		<#
		var imageUrl = false, hasImage = '';
		if ( '' !== settings.testimonial_image.url ) {
			imageUrl = settings.testimonial_image.url;
			hasImage = ' elementor-has-image';
		}

		var testimonial_alignment = settings.testimonial_alignment ? ' elementor-testimonial-text-align-' + settings.testimonial_alignment : '';
		var testimonial_image_position = settings.testimonial_image_position ? ' elementor-testimonial-image-position-' + settings.testimonial_image_position : '';
		#>
		<div class="elementor-testimonial-wrapper{{ testimonial_alignment }}">

			<# if ( '' !== settings.testimonial_content ) { #>
				<div class="elementor-testimonial-content">
					{{{ settings.testimonial_content }}}
				</div>
		    <# } #>

			<div class="elementor-testimonial-meta{{ hasImage }}{{ testimonial_image_position }}">
				<div class="elementor-testimonial-meta-inner">
					<# if ( imageUrl ) { #>
					<div class="elementor-testimonial-image">
						<img src="{{ imageUrl }}" alt="testimonial" />
					</div>
					<# } #>

					<div class="elementor-testimonial-details">

						<# if ( '' !== settings.testimonial_name ) { #>
						<div class="elementor-testimonial-name">
							{{{ settings.testimonial_name }}}
						</div>
						<# } #>

						<# if ( '' !== settings.testimonial_job ) { #>
						<div class="elementor-testimonial-job">
							{{{ settings.testimonial_job }}}
						</div>
						<# } #>

					</div>
				</div>
			</div>
		</div>
	<?php
	}
}
