<?php
namespace Elementor;

if ( ! defined( 'ABSPATH' ) ) exit; // Exit if accessed directly

class Widget_person extends Widget_Base {
	private $_carusel_options = [];

	public function get_id() {
		return 'person';
	}

	public function get_title() {
		return __( 'Person', 'elementor' );
	}

	public function get_icon() {
		return 'blockquote';
	}

	protected function _register_controls() {
		$this->add_control(
			'section_person',
			[
				'label' => __( 'Person', 'elementor' ),
				'type' => Controls_Manager::SECTION,
			]
		);

		$this->add_control(
			'person_image',
			[
				'label' => __( 'Add Image', 'elementor' ),
				'type' => Controls_Manager::MEDIA,
				'default' => [
					'url' => Utils::get_placeholder_image_src(),
				],
				'section' => 'section_person',
			]
		);

		$this->add_control(
			'person_full_name',
			[
				'label' => __( 'Full Name', 'elementor' ),
				'type' => Controls_Manager::TEXT,
				'default' => 'John Doe',
				'section' => 'section_person',
			]
		);

		$this->add_control(
			'person_job_title',
			[
				'label' => __( 'Job Title', 'elementor' ),
				'type' => Controls_Manager::TEXT,
				'default' => 'Elementor Lover',
				'section' => 'section_person',
			]
		);

		$this->add_control(
			'person_text',
			[
				'label' => __( 'Person Text', 'elementor' ),
				'type' => Controls_Manager::TEXTAREA,
				'default' => 'Click edit button to change this text. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut elit tellus, luctus nec ullamcorper mattis, pulvinar dapibus leo..',
				'section' => 'section_person',
			]
		);

		$this->add_control(
			'person_text_position',
			[
				'label' => __( 'Details Position', 'elementor' ),
				'type' => Controls_Manager::CHOOSE,
				'default' => 'center',
				'section' => 'section_person',
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
			'section_style_person_image',
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
				'section' => 'section_style_person_image',
				'selector' => '{{WRAPPER}} .elementor-person-wrapper .elementor-person-image img',
			]
		);

		$this->add_control(
			'image_border_radius',
			[
				'label' => __( 'Border Radius', 'elementor' ),
				'type' => Controls_Manager::DIMENSIONS,
				'size_units' => [ 'px', '%' ],
				'tab' => self::TAB_STYLE,
				'section' => 'section_style_person_image',
				'selectors' => [
					'{{WRAPPER}} .elementor-person-wrapper .elementor-person-image img' => 'border-radius: {{TOP}}{{UNIT}} {{RIGHT}}{{UNIT}} {{BOTTOM}}{{UNIT}} {{LEFT}}{{UNIT}};',
				],
			]
		);

		// Name
		$this->add_control(
			'section_style_person_name',
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
				'section' => 'section_style_person_name',
				'default' => '',
				'selectors' => [
					'{{WRAPPER}} .elementor-person-name' => 'color: {{VALUE}};',
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
				'section' => 'section_style_person_name',
				'selector' => '{{WRAPPER}} .elementor-person-name',
			]
		);

		$this->add_control(
			'section_style_person_text',
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
				'section' => 'section_style_person_text',
				'default' => '',
				'selectors' => [
					'{{WRAPPER}} .elementor-person-text' => 'color: {{VALUE}};',
				],
			]
		);

		$this->add_group_control(
			Group_Control_Typography::get_type(),
			[
				'name' => 'content_typography',
				'label' => __( 'Typography', 'elementor' ),
				'tab' => self::TAB_STYLE,
				'section' => 'section_style_person_text',
				'selector' => '{{WRAPPER}} .elementor-person-text',
			]
		);
	}

	protected function render( $instance = [] ) {
		if ( empty( $instance['person_full_name'] ) || empty( $instance['person_text'] ) )
			return;

		$has_image = false;
		if ( '' !== $instance['person_image']['url'] ) {
			$image_url = $instance['person_image']['url'];
			$has_image = ' elementor-has-image';
		}

		$person_text_position = $instance['person_text_position'] ? ' elementor-person-text-align-' . $instance['person_text_position'] : '';
		?>
		<div class="elementor-person-wrapper<?php echo $person_text_position; ?>">

			<div class="person_description">

				<?php if ( isset( $image_url ) ) : ?>
					<div class="elementor-person-image">
						<figure>
							<img src="<?php echo esc_attr( $image_url ); ?>" alt="person" />
						</figure>
					</div>
				<?php endif; ?>

				<div class="person-detailes<?php if ( $has_image ) echo $has_image; ?>">
					<?php if ( ! empty( $instance['person_full_name'] ) ) : ?>
						<div class="elementor-person-name">
							<?php echo $instance['person_full_name']; ?>
						</div>
					<?php endif; ?>

					<?php if ( ! empty( $instance['person_job_title'] ) ) : ?>
						<span class="elementor-person-job-title">
							<?php echo $instance['person_job_title']; ?>
						</span>
					<?php endif; ?>

					<?php if ( ! empty( $instance['person_text'] ) ) : ?>
						<div class="elementor-person-text">
							<?php echo $instance['person_text']; ?>
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
		if ( '' !== settings.person_image.url ) {
		imageUrl = settings.person_image.url;
		hasImage = ' elementor-has-image';
		}

		var person_text_position = settings.person_text_position ? ' elementor-person-text-align-' + settings.person_text_position : '';
		%>
		<div class="elementor-person-wrapper<%- person_text_position %>">

			<div class="person_description">

				<% if ( imageUrl ) { %>
				<div class="elementor-person-image">
					<figure>
						<img src="<%- imageUrl %>" alt="person" />
					</figure>
				</div>
				<% } %>

				<div class="person-detailes<%- hasImage %>">

					<% if ( '' !== settings.person_full_name ) { %>
					<div class="elementor-person-name">
						<%= settings.person_full_name %>
					</div>
					<% } %>

					<% if ( '' !== settings.person_job_title ) { %>
						<span class="elementor-person-job-title">
							<%= settings.person_job_title %>
						</span>
					<% } %>

					<% if ( '' !== settings.person_text ) { %>
					<div class="elementor-person-text">
						<%= settings.person_text %>
					</div>
					<% } %>

				</div>
			</div>
		</div>
		<?php
	}
}
