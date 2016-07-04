<?php
namespace Elementor;

if ( ! defined( 'ABSPATH' ) ) exit; // Exit if accessed directly

class Widget_Person extends Widget_Base {

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
			'social_icon_list',
			[
				'label' => 'Social Icons',
				'type' => Controls_Manager::REPEATER,
				'default' => [
					[
						'social' => 'fa fa-facebook',
					],
					[
						'social' => 'fa fa-twitter',
					],
					[
						'social' => 'fa fa-instagram',
					],
				],
				'section' => 'section_person',
				'fields' => [
					[
						'name' => 'social',
						'label' => __( 'Select Social Media', 'elementor' ),
						'type' => Controls_Manager::ICON,
						'label_block' => true,
						'icons' => [
							'fa fa-behance' => __( 'Behance', 'elementor' ),
							'fa fa-bitbucket' => __( 'Bitbucket', 'elementor' ),
							'fa fa-codepen' => __( 'Codepen', 'elementor' ),
							'fa fa-delicious' => __( 'Delicious', 'elementor' ),
							'fa fa-digg' => __( 'Digg', 'elementor' ),
							'fa fa-dribbble' => __( 'Dribbble', 'elementor' ),
							'fa fa-facebook' => __( 'Facebook', 'elementor' ),
							'fa fa-flickr' => __( 'Flickr', 'elementor' ),
							'fa fa-foursquare' => __( 'Foursquare', 'elementor' ),
							'fa fa-github' => __( 'Github', 'elementor' ),
							'fa fa-google-plus' => __( 'Google Plus', 'elementor' ),
							'fa fa-instagram' => __( 'Instagram', 'elementor' ),
							'fa fa-jsfiddle' => __( 'JSFiddle', 'elementor' ),
							'fa fa-linkedin' => __( 'Linkedin', 'elementor' ),
							'fa fa-medium' => __( 'Medium', 'elementor' ),
							'fa fa-pinterest' => __( 'Pinterest', 'elementor' ),
							'fa fa-product-hunt' => __( 'Product Hunt', 'elementor' ),
							'fa fa-reddit' => __( 'reddit', 'elementor' ),
							'fa fa-snapchat' => __( 'Snapchat', 'elementor' ),
							'fa fa-soundcloud' => __( 'SoundCloud', 'elementor' ),
							'fa fa-stack-exchange' => __( 'Stack Exchange', 'elementor' ),
							'fa fa-stack-overflow' => __( 'Stack Overflow', 'elementor' ),
							'fa fa-tumblr' => __( 'Tumblr', 'elementor' ),
							'fa fa-twitter' => __( 'Twitter', 'elementor' ),
							'fa fa-vimeo' => __( 'Vimeo', 'elementor' ),
							'fa fa-wordpress' => __( 'WordPress', 'elementor' ),
							'fa fa-youtube' => __( 'YouTube', 'elementor' ),
						],
					],
					[
						'name' => 'link',
						'label' => __( 'Link', 'elementor' ),
						'type' => Controls_Manager::URL,
						'label_block' => true,
						'default' => [
							'url' => '',
							'is_external' => 'true',
						],
						'placeholder' => __( 'http://your-link.com', 'elementor' ),
					],
				],
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

		$this->add_control(
			'image_overlay_color',
			[
				'label' => __( 'Overlay Color', 'elementor' ),
				'type' => Controls_Manager::COLOR,
				'alpha' => true,
				'tab' => self::TAB_STYLE,
				'section' => 'section_style_person_image',
				'selectors' => [
					'{{WRAPPER}} .elementor-person-wrapper:hover > .elementor-person-content .elementor-person-detailes' => 'background-color: {{VALUE}};',
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

		// Job
		$this->add_control(
			'section_style_person_job',
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
				'section' => 'section_style_person_job',
				'default' => '',
				'selectors' => [
					'{{WRAPPER}} .elementor-person-job-title' => 'color: {{VALUE}};',
				],
			]
		);

		$this->add_group_control(
			Group_Control_Typography::get_type(),
			[
				'name' => 'job_typography',
				'label' => __( 'Typography', 'elementor' ),
				'scheme' => Scheme_Typography::TYPOGRAPHY_4,
				'tab' => self::TAB_STYLE,
				'section' => 'section_style_person_job',
				'selector' => '{{WRAPPER}} .elementor-person-job-title',
			]
		);

		// Content
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

		$this->add_control(
			'section_social_style',
			[
				'label' => __( 'Social Icon Style', 'elementor' ),
				'type' => Controls_Manager::SECTION,
				'tab' => self::TAB_STYLE,
			]
		);

		$this->add_control(
			'icon_color',
			[
				'label' => __( 'Icon Color', 'elementor' ),
				'type' => Controls_Manager::SELECT,
				'tab' => self::TAB_STYLE,
				'section' => 'section_social_style',
				'default' => 'official',
				'options' => [
					'official' => __( 'Official Color', 'elementor' ),
					'custom' => __( 'Custom Color', 'elementor' ),
				],
			]
		);

		$this->add_control(
			'icon_primary_color',
			[
				'label' => __( 'Primary Color', 'elementor' ),
				'type' => Controls_Manager::COLOR,
				'tab' => self::TAB_STYLE,
				'section' => 'section_social_style',
				'condition' => [
					'icon_color' => 'custom',
				],
				'selectors' => [
					'{{WRAPPER}} .elementor-person-social-icons .elementor-person-social-icon' => 'background-color: {{VALUE}};',
				],
			]
		);

		$this->add_control(
			'icon_secondary_color',
			[
				'label' => __( 'Secondary Color', 'elementor' ),
				'type' => Controls_Manager::COLOR,
				'tab' => self::TAB_STYLE,
				'section' => 'section_social_style',
				'condition' => [
					'icon_color' => 'custom',
				],
				'selectors' => [
					'{{WRAPPER}} .elementor-person-social-icons .elementor-person-social-icon' => 'color: {{VALUE}};',
				],
			]
		);

		$this->add_control(
			'icon_size',
			[
				'label' => __( 'Icon Size', 'elementor' ),
				'type' => Controls_Manager::SLIDER,
				'tab' => self::TAB_STYLE,
				'section' => 'section_social_style',
				'range' => [
					'px' => [
						'min' => 6,
						'max' => 300,
					],
				],
				'selectors' => [
					'{{WRAPPER}} .elementor-person-social-icons .elementor-person-social-icon i' => 'font-size: {{SIZE}}{{UNIT}};',
				],
			]
		);

		$this->add_control(
			'icon_padding',
			[
				'label' => __( 'Icon Padding', 'elementor' ),
				'type' => Controls_Manager::SLIDER,
				'tab' => self::TAB_STYLE,
				'section' => 'section_social_style',
				'selectors' => [
					'{{WRAPPER}} .elementor-person-social-icons .elementor-person-social-icon' => 'padding: {{SIZE}}{{UNIT}};',
				],
				'default' => [
					'unit' => 'em',
				],
				'range' => [
					'em' => [
						'min' => 0,
					],
				],
			]
		);

		$this->add_control(
			'icon_space',
			[
				'label' => __( 'Icon Spacing', 'elementor' ),
				'type' => Controls_Manager::SLIDER,
				'tab' => self::TAB_STYLE,
				'section' => 'section_social_style',
				'range' => [
					'px' => [
						'min' => 0,
						'max' => 100,
					],
				],
				'selectors' => [
					'{{WRAPPER}} .elementor-person-social-icons .elementor-person-social-icon' => 'margin-right: {{SIZE}}{{UNIT}};',
				],
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

			<div class="elementor-person-content">

				<?php if ( isset( $image_url ) ) : ?>
					<div class="elementor-person-image">
						<figure>
							<img src="<?php echo esc_attr( $image_url ); ?>" alt="person" />
						</figure>
					</div>
				<?php endif; ?>

				<div class="elementor-person-detailes<?php if ( $has_image ) echo $has_image; ?>">
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

					<div class="elementor-person-social-icons">
						<?php foreach ( $instance['social_icon_list'] as $item ) : ?>
							<div class="elementor-person-social-icon">
								<?php if ( '' !== $item['link']['url'] ) : ?>
									<a href="<?php echo esc_url( $item['link']['url'] ); ?>">
								<?php endif; ?>
									<i class="<?php echo $item['social']; ?>"></i>
								<?php if ( '' !== $item['link']['url'] ) : ?>
									</a>
								<?php endif; ?>
							</div>
						<?php endforeach; ?>
					</div>

				</div>

			</div>
		</div>
		<?php
	}

	protected function content_template() {
		?>
		<%
		if ( '' !== settings.person_full_name || '' !== settings.person_text )
			return;

		var has_image = '',
			image_url = '';

		if ( '' !== settings.person_image.url ) {
			image_url = settings.person_image.url;
			has_image = ' elementor-has-image';
		}

		var person_text_position = settings.person_text_position ? ' elementor-person-text-align-' + settings.person_text_position : '';
		%>
		<div class="elementor-person-wrapper<%- person_text_position %>">

			<div class="elementor-person-content">

				<% if ( '' !== image_url ) { %>
					<div class="elementor-person-image">
						<figure>
							<img src="<%- image_url %>" alt="person" />
						</figure>
					</div>
				<% } %>

				<div class="elementor-person-detailes<%- has_image %>">
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

					<div class="elementor-person-social-icons">
						<% _.each( settings.social_icon_list, function( item ) { %>
							<div class="elementor-person-social-icon">
								<% if ( '' !== item.link.url ) { %>
									<a href="<%- item.link.url %>">
								<% } %>
									<i class="<%- item.social %>"></i>
								<% if ( '' !== item.link.url ) { %>
									</a>
								<% } %>
							</div>
						<% } ); %>
					</div>

				</div>

			</div>
		</div>
		<?php
	}
}
