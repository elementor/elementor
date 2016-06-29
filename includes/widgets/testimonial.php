<?php
namespace Elementor;

if ( ! defined( 'ABSPATH' ) ) exit; // Exit if accessed directly

class Widget_testimonial extends Widget_Base {

	public function get_id() {
		return 'testimonial';
	}

	public function get_title() {
		return __( 'Testimonial', 'elementor' );
	}

	public function get_icon() {
		return 'blockquote';
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
			'testimonial_text',
			[
				'label' => __( 'Content', 'elementor' ),
				'type' => Controls_Manager::WYSIWYG,
				'default' => 'Click edit button to change this text. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut elit tellus, luctus nec ullamcorper mattis, pulvinar dapibus leo.',
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
			'testimonial_job_url',
			[
				'label' => __( 'URL', 'elementor' ),
				'type' => Controls_Manager::URL,
				'placeholder' => 'http://your-link.com',
				'default' => [
					'url' => '#',
				],
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
			'testimonial_image_position',
			[
				'label' => __( 'Image Position', 'elementor' ),
				'type' => Controls_Manager::CHOOSE,
				'default' => 'left',
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
				'condition' => [
					'testimonial_image[url]!' => '',
				],
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

		// Image
		$this->add_control(
			'section_style_testimonial_image',
			[
				'label' => __( 'Image', 'elementor' ),
				'type' => Controls_Manager::SECTION,
				'tab' => self::TAB_STYLE,
			]
		);

		$this->add_group_control(
			Group_Control_Border::get_type(),
			[
				'name' => 'image_border',
				'tab' => self::TAB_STYLE,
				'section' => 'section_style_testimonial_image',
				'selector' => '{{WRAPPER}} .elementor-testimonial-wrapper .elementor-testimonial-image img',
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
				'scheme' => Scheme_Typography::TYPOGRAPHY_4,
				'tab' => self::TAB_STYLE,
				'section' => 'section_style_testimonial_name',
				'selector' => '{{WRAPPER}} .elementor-testimonial-name',
			]
		);

		// details
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
				'tab' => self::TAB_STYLE,
				'section' => 'section_style_testimonial_job',
				'default' => '',
				'selectors' => [
					'{{WRAPPER}} .elementor-testimonial-job' => 'color: {{VALUE}};',
					'{{WRAPPER}} .elementor-testimonial-job a' => 'color: {{VALUE}};',
				],
			]
		);

		$this->add_group_control(
			Group_Control_Typography::get_type(),
			[
				'name' => 'job_typography',
				'label' => __( 'Typography', 'elementor' ),
				'tab' => self::TAB_STYLE,
				'section' => 'section_style_testimonial_job',
				'selector' => '{{WRAPPER}} .elementor-testimonial-job, {{WRAPPER}} .elementor-testimonial-job a',
			]
		);

		$this->add_control(
			'section_style_testimonial_text',
			[
				'label' => __( 'Content', 'elementor' ),
				'type' => Controls_Manager::SECTION,
				'tab' => self::TAB_STYLE,
			]
		);

		$this->add_control(
			'content_text_color',
			[
				'label' => __( 'Text Color', 'elementor' ),
				'type' => Controls_Manager::COLOR,
				'tab' => self::TAB_STYLE,
				'section' => 'section_style_testimonial_text',
				'default' => '',
				'selectors' => [
					'{{WRAPPER}} .elementor-testimonial-text' => 'color: {{VALUE}};',
				],
			]
		);

		$this->add_group_control(
			Group_Control_Typography::get_type(),
			[
				'name' => 'content_typography',
				'label' => __( 'Typography', 'elementor' ),
				'tab' => self::TAB_STYLE,
				'section' => 'section_style_testimonial_text',
				'selector' => '{{WRAPPER}} .elementor-testimonial-text',
			]
		);
	}

	protected function render( $instance = [] ) {
		if ( empty( $instance['testimonial_name'] ) || empty( $instance['testimonial_text'] ) )
			return;

		$has_image = false;
		if ( '' !== $instance['testimonial_image']['url'] ) {
			$image_url = $instance['testimonial_image']['url'];
			$has_image = ' elementor-has-image';
		}

		$testimonial_alignment = $instance['testimonial_alignment'] ? ' elementor-testimonial-text-align-' . $instance['testimonial_alignment'] : '';
		$testimonial_image_position = $instance['testimonial_image_position'] ? ' elementor-testimonial-image-align-' . $instance['testimonial_image_position'] : '';
		?>
		<div class="elementor-testimonial-wrapper<?php echo $testimonial_alignment; ?>">

			<?php if ( ! empty( $instance['testimonial_text'] ) ) : ?>
				<div class="elementor-testimonial-text">
						<?php echo $instance['testimonial_text']; ?>
				</div>
			<?php endif; ?>

			<div class="testimonial_description<?php echo $testimonial_image_position; ?>">

				<?php if ( isset( $image_url ) ) : ?>
					<div class="elementor-testimonial-image">
						<figure>
							<img src="<?php echo esc_attr( $image_url ); ?>" alt="testimonial" />
						</figure>
					</div>
				<?php endif; ?>

				<div class="testimonial-details<?php if ( $has_image ) echo $has_image; ?>">
					<?php if ( ! empty( $instance['testimonial_name'] ) ) : ?>
						<div class="elementor-testimonial-name">
							<?php echo $instance['testimonial_name']; ?>
						</div>
					<?php endif; ?>

					<?php if ( ! empty( $instance['testimonial_job'] ) ) : ?>
						<div class="elementor-testimonial-job">
							-
							<?php if ( ! empty( $instance['testimonial_job_url']['url'] ) ) : ?>
								<a href="<?php echo esc_url( $instance['testimonial_job_url']['url'] ); ?>" class="elementor-testimonial-job-url">
							<?php endif; ?>
								<?php echo $instance['testimonial_job']; ?>
							<?php if ( ! empty( $instance['testimonial_job_url'] ) ) : ?>
								</a>
							<?php endif; ?>
						</div>
					<?php endif; ?>
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
		var testimonial_image_position = settings.testimonial_image_position ? ' elementor-testimonial-image-align-' + settings.testimonial_image_position : '';
		%>
		<div class="elementor-testimonial-wrapper<%- testimonial_alignment %>">

			<% if ( '' !== settings.testimonial_text ) { %>
				<div class="elementor-testimonial-text">
					<%= settings.testimonial_text %>
				</div>
		    <% } %>

			<div class="testimonial_description<%- testimonial_image_position %>">

				<% if ( imageUrl ) { %>
					<div class="elementor-testimonial-image">
						<figure>
							<img src="<%- imageUrl %>" alt="testimonial" />
						</figure>
					</div>
				<% } %>

				<div class="testimonial-details<%- hasImage %>">

					<% if ( '' !== settings.testimonial_name ) { %>
						<div class="elementor-testimonial-name">
							<%= settings.testimonial_name %>
						</div>
					<% } %>

					<% if ( '' !== settings.testimonial_job ) { %>
						<div class="elementor-testimonial-job">

							<% if ( '' !== settings.testimonial_job_url.url ) { %>
								<a href="<%- settings.testimonial_job_url.url %>" class="elementor-testimonial-job-url">
							<% } %>

								<%= settings.testimonial_job %>

							<% if ( '' !== settings.testimonial_job_url.url ) { %>
								</a>
							<% } %>

						</div>
					<% } %>

				</div>
			</div>
		</div>
	<?php
	}
}
