<?php
namespace Elementor;

if ( ! defined( 'ABSPATH' ) ) exit; // Exit if accessed directly

class Widget_Testimonial extends Widget_Base {

	public function get_id() {
		return 'testimonial';
	}

	public function get_title() {
		return __( 'Testimonial', 'elementor' );
	}

	public function get_icon() {
		return 'testimonial';
	}

	protected function _register_controls() {
		$this->add_control(
			'section_testimonial',
			[
				'label' => __( 'Testimonial', 'elementor' ),
				'type' => Controls_Manager::SECTION,
			]
		);

		$this->add_control(
			'testimonial_content',
			[
				'label' => __( 'Content', 'elementor' ),
				'type' => Controls_Manager::TEXTAREA,
				'rows' => '10',
				'default' => 'Click edit button to change this text. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut elit tellus, luctus nec ullamcorper mattis, pulvinar dapibus leo.',
				'section' => 'section_testimonial',
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
				'section' => 'section_testimonial',
			]
		);

		$this->add_control(
			'testimonial_name',
			[
				'label' => __( 'Name', 'elementor' ),
				'type' => Controls_Manager::TEXT,
				'default' => 'John Doe',
				'section' => 'section_testimonial',
			]
		);

		$this->add_control(
			'testimonial_job',
			[
				'label' => __( 'Job', 'elementor' ),
				'type' => Controls_Manager::TEXT,
				'default' => 'Designer',
				'section' => 'section_testimonial',
			]
		);

		$this->add_control(
			'testimonial_image_position',
			[
				'label' => __( 'Image Position', 'elementor' ),
				'type' => Controls_Manager::SELECT,
				'default' => 'aside',
				'section' => 'section_testimonial',
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
				'section' => 'section_testimonial',
				'options' => [
					'left'    => [
						'title' => __( 'Left', 'elementor' ),
						'icon' => 'align-left',
					],
					'center' => [
						'title' => __( 'Center', 'elementor' ),
						'icon' => 'align-center',
					],
					'right' => [
						'title' => __( 'Right', 'elementor' ),
						'icon' => 'align-right',
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
				'section' => 'section_image_carousel',
			]
		);

		// Content
		$this->add_control(
			'section_style_testimonial_content',
			[
				'label' => __( 'Content', 'elementor' ),
				'type' => Controls_Manager::SECTION,
				'tab' => self::TAB_STYLE,
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
				'tab' => self::TAB_STYLE,
				'section' => 'section_style_testimonial_content',
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
				'tab' => self::TAB_STYLE,
				'section' => 'section_style_testimonial_content',
				'selector' => '{{WRAPPER}} .elementor-testimonial-content',
			]
		);

		// Image
		$this->add_control(
			'section_style_testimonial_image',
			[
				'label' => __( 'Image', 'elementor' ),
				'type' => Controls_Manager::SECTION,
				'tab' => self::TAB_STYLE,
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
				'section' => 'section_style_testimonial_image',
				'tab' => self::TAB_STYLE,
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
				'tab' => self::TAB_STYLE,
				'section' => 'section_style_testimonial_image',
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
				'tab' => self::TAB_STYLE,
				'section' => 'section_style_testimonial_image',
				'selectors' => [
					'{{WRAPPER}} .elementor-testimonial-wrapper .elementor-testimonial-image img' => 'border-radius: {{TOP}}{{UNIT}} {{RIGHT}}{{UNIT}} {{BOTTOM}}{{UNIT}} {{LEFT}}{{UNIT}};',
				],
				'condition' => [
					'testimonial_image[url]!' => '',
				],
			]
		);

		// Name
		$this->add_control(
			'section_style_testimonial_name',
			[
				'label' => __( 'Name', 'elementor' ),
				'type' => Controls_Manager::SECTION,
				'tab' => self::TAB_STYLE,
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
				'tab' => self::TAB_STYLE,
				'section' => 'section_style_testimonial_name',
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
				'tab' => self::TAB_STYLE,
				'section' => 'section_style_testimonial_name',
				'selector' => '{{WRAPPER}} .elementor-testimonial-name',
			]
		);

		// Job
		$this->add_control(
			'section_style_testimonial_job',
			[
				'label' => __( 'Job', 'elementor' ),
				'type' => Controls_Manager::SECTION,
				'tab' => self::TAB_STYLE,
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
				'tab' => self::TAB_STYLE,
				'section' => 'section_style_testimonial_job',
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
				'tab' => self::TAB_STYLE,
				'section' => 'section_style_testimonial_job',
				'selector' => '{{WRAPPER}} .elementor-testimonial-job',
			]
		);
	}

	protected function render( $instance = [] ) {
		if ( empty( $instance['testimonial_name'] ) || empty( $instance['testimonial_content'] ) )
			return;

		$has_image = false;
		if ( '' !== $instance['testimonial_image']['url'] ) {
			$image_url = $instance['testimonial_image']['url'];
			$has_image = ' elementor-has-image';
		}

		$testimonial_alignment = $instance['testimonial_alignment'] ? ' elementor-testimonial-text-align-' . $instance['testimonial_alignment'] : '';
		$testimonial_image_position = $instance['testimonial_image_position'] ? ' elementor-testimonial-image-position-' . $instance['testimonial_image_position'] : '';
		?>
		<div class="elementor-testimonial-wrapper<?php echo $testimonial_alignment; ?>">

			<?php if ( ! empty( $instance['testimonial_content'] ) ) : ?>
				<div class="elementor-testimonial-content">
						<?php echo $instance['testimonial_content']; ?>
				</div>
			<?php endif; ?>

			<div class="elementor-testimonial-meta<?php if ( $has_image ) echo $has_image; ?><?php echo $testimonial_image_position; ?>">
				<div class="elementor-testimonial-meta-inner">
					<?php if ( isset( $image_url ) ) : ?>
						<div class="elementor-testimonial-image">
							<img src="<?php echo esc_attr( $image_url ); ?>" alt="<?php echo esc_attr( Control_Media::get_image_alt( $instance['testimonial_image'] ) ); ?>" />
						</div>
					<?php endif; ?>

					<div class="elementor-testimonial-details">
						<?php if ( ! empty( $instance['testimonial_name'] ) ) : ?>
							<div class="elementor-testimonial-name">
								<?php echo $instance['testimonial_name']; ?>
							</div>
						<?php endif; ?>

						<?php if ( ! empty( $instance['testimonial_job'] ) ) : ?>
							<div class="elementor-testimonial-job">
								<?php echo $instance['testimonial_job']; ?>
							</div>
						<?php endif; ?>
					</div>
				</div>
			</div>
		</div>
	<?php
	}

	protected function content_template() {
		?>
		<%
		var imageUrl = false, hasImage = '';
		if ( '' !== settings.testimonial_image.url ) {
			imageUrl = settings.testimonial_image.url;
			hasImage = ' elementor-has-image';
		}

		var testimonial_alignment = settings.testimonial_alignment ? ' elementor-testimonial-text-align-' + settings.testimonial_alignment : '';
		var testimonial_image_position = settings.testimonial_image_position ? ' elementor-testimonial-image-position-' + settings.testimonial_image_position : '';
		%>
		<div class="elementor-testimonial-wrapper<%- testimonial_alignment %>">

			<% if ( '' !== settings.testimonial_content ) { %>
				<div class="elementor-testimonial-content">
					<%= settings.testimonial_content %>
				</div>
		    <% } %>

			<div class="elementor-testimonial-meta<%- hasImage %><%- testimonial_image_position %>">
				<div class="elementor-testimonial-meta-inner">
					<% if ( imageUrl ) { %>
					<div class="elementor-testimonial-image">
						<img src="<%- imageUrl %>" alt="testimonial" />
					</div>
					<% } %>

					<div class="elementor-testimonial-details">

						<% if ( '' !== settings.testimonial_name ) { %>
						<div class="elementor-testimonial-name">
							<%= settings.testimonial_name %>
						</div>
						<% } %>

						<% if ( '' !== settings.testimonial_job ) { %>
						<div class="elementor-testimonial-job">
							<%= settings.testimonial_job %>
						</div>
						<% } %>

					</div>
				</div>
			</div>
		</div>
	<?php
	}
}
