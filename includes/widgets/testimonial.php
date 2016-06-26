<?php
namespace Elementor;

if ( ! defined( 'ABSPATH' ) ) exit; // Exit if accessed directly

class Widget_testimonial extends Widget_Base {
	private $_carusel_options = [];

	public function get_id() {
		return 'testimonial';
	}

	public function get_title() {
		return __( 'testimonial', 'elementor' );
	}

	public function get_icon() {
		return 'settings';
	}

	protected function _register_controls() {
		$this->add_control(
			'section_testimonial',
			[
				'label' => __( 'testimonial', 'elementor' ),
				'type' => Controls_Manager::SECTION,
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

		$this->add_group_control(
			Group_Control_Image_size::get_type(),
			[
				'name' => 'thumbnail',
				'section' => 'section_testimonial',
			]
		);

		$this->add_control(
			'testimonial_text',
			[
				'label' => __( 'Testimonial Text', 'elementor' ),
				'type' => Controls_Manager::TEXTAREA,
				'default' => 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec sed magna in purus luctus ornare sit amet eu risus. Ut tincidunt nec velit at fringilla. Fusce sodales vestibulum leo vel faucibus. Ut convallis vel elit et aliquam. Morbi dolor arcu, egestas quis justo at, pharetra dignissim justo.',
				'section' => 'section_testimonial',
			]
		);

		$this->add_control(
			'testimonial_full_name',
			[
				'label' => __( 'Full Name', 'elementor' ),
				'type' => Controls_Manager::TEXT,
				'default' => 'John Doe',
				'section' => 'section_testimonial',
			]
		);

		$this->add_control(
			'testimonial_job_title',
			[
				'label' => __( 'Job Title', 'elementor' ),
				'type' => Controls_Manager::TEXT,
				'default' => 'Elementor Lover',
				'section' => 'section_testimonial',
			]
		);

		$this->add_control(
			'testimonial_company',
			[
				'label' => __( 'Job Company', 'elementor' ),
				'type' => Controls_Manager::TEXT,
				'default' => 'Elementor',
				'section' => 'section_testimonial',
			]
		);

		$this->add_control(
			'testimonial_company_url',
			[
				'label' => __( 'Job Company URL', 'elementor' ),
				'type' => Controls_Manager::URL,
				'placeholder' => 'http://your-link.com',
				'default' => [
					'url' => '#',
				],
				'section' => 'section_testimonial',
			]
		);

		$this->add_control(
			'testimonial_detailes_position',
			[
				'label' => __( 'Testimonial Details Position', 'elementor' ),
				'type' => Controls_Manager::CHOOSE,
				'default' => 'Elementor',
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
					'justify' => [
						'title' => __( 'Justified', 'elementor' ),
						'icon' => 'align-justify',
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
				'tab' => self::TAB_STYLE,
				'section' => 'section_style_testimonial_job',
				'default' => '',
				'selectors' => [
					'{{WRAPPER}} .elementor-testimonial-job-title' => 'color: {{VALUE}};',
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
				'selector' => '{{WRAPPER}} .elementor-testimonial-job-title',
			]
		);

		// Company
		$this->add_control(
			'section_style_testimonial_company',
			[
				'label' => __( 'Company', 'elementor' ),
				'type' => Controls_Manager::SECTION,
				'tab' => self::TAB_STYLE,
			]
		);

		$this->add_control(
			'company_text_color',
			[
				'label' => __( 'Text Color', 'elementor' ),
				'type' => Controls_Manager::COLOR,
				'tab' => self::TAB_STYLE,
				'section' => 'section_style_testimonial_company',
				'default' => '',
				'selectors' => [
					'{{WRAPPER}} .elementor-testimonial-company' => 'color: {{VALUE}};',
				],
			]
		);

		$this->add_group_control(
			Group_Control_Typography::get_type(),
			[
				'name' => 'company_typography',
				'label' => __( 'Typography', 'elementor' ),
				'tab' => self::TAB_STYLE,
				'section' => 'section_style_testimonial_company',
				'selector' => '{{WRAPPER}} .elementor-testimonial-company',
			]
		);

		$this->add_control(
			'section_style_testimonial_text',
			[
				'label' => __( 'Text', 'elementor' ),
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
		if ( empty( $instance['testimonial_full_name'] ) || empty( $instance['testimonial_text'] ) )
			return;

		$has_image = false;
		if ( '' !== $instance['testimonial_image']['id'] ) {
			$image_url = Group_Control_Image_size::get_attachment_image_src( $instance['testimonial_image']['id'], 'thumbnail', $instance );
			$has_image = ' elementor-has-image';
		}

		$testimonial_detailes_position = $instance['testimonial_detailes_position'] ? ' elementor-testimonial-detailes-align-' . $instance['testimonial_detailes_position'] : '';
		?>
		<div class="elementor-testimonial-wrapper">

			<?php if ( ! empty( $instance['testimonial_text'] ) ) : ?>
				<div class="elementor-testimonial-text<?php echo $testimonial_detailes_position; ?>">
						<?php echo $instance['testimonial_text']; ?>
				</div>
			<?php endif; ?>

			<div class="testimonial_description<?php echo $testimonial_detailes_position; ?>">

				<?php if ( isset( $image_url ) ) : ?>
					<div class="elementor-testimonial-image">
						<figure>
							<img src="<?php echo esc_attr( $image_url ); ?>" alt="testimonial" />
						</figure>
					</div>
				<?php endif; ?>

				<div class="testimonial-detailes<?php if ( $has_image ) echo $has_image; ?>">
					<?php if ( ! empty( $instance['testimonial_full_name'] ) ) : ?>
						<div class="elementor-testimonial-name">
							<?php echo $instance['testimonial_full_name']; ?>
						</div>
					<?php endif; ?>

					<?php if ( ! empty( $instance['testimonial_job_title'] ) ) : ?>
						<span class="elementor-testimonial-job-title">
							<?php echo $instance['testimonial_job_title']; ?>
						</span>
					<?php endif; ?>

					<?php if ( ! empty( $instance['testimonial_company'] ) ) : ?>
						<span class="elementor-testimonial-company">
							-
							<?php if ( ! empty( $instance['testimonial_company_url']['url'] ) ) : ?>
								<a href="<?php echo esc_url( $instance['testimonial_company_url']['url'] ); ?>" class="elementor-testimonial-company-url">
							<?php endif; ?>
								<?php echo $instance['testimonial_company']; ?>
							<?php if ( ! empty( $instance['testimonial_company_url'] ) ) : ?>
								</a>
							<?php endif; ?>
						</span>
					<?php endif; ?>
				</div>
			</div>
		</div>
	<?php
	}

	protected function content_template() {}
}
