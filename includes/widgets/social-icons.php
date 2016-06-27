<?php
namespace Elementor;

if ( ! defined( 'ABSPATH' ) ) exit; // Exit if accessed directly

class Widget_Social_Icons extends Widget_Base {

	public function get_id() {
		return 'social-icons';
	}

	public function get_title() {
		return __( 'Social Icons', 'elementor' );
	}

	public function get_icon() {
		return 'social-icons';
	}

	protected function _register_controls() {
		$this->add_control(
			'section_social_icon',
			[
				'label' => __( 'Social Icons', 'elementor' ),
				'type' => Controls_Manager::SECTION,
			]
		);

		$this->add_control(
			'shape',
			[
				'label' => __( 'Shape', 'Elementor' ),
				'type' => Controls_Manager::SELECT,
				'section' => 'section_social_icon',
				'default' => 'square',
				'options' => [
					'rounded' => __( 'Rounded', 'elementor' ),
					'square' => __( 'Square', 'elementor' ),
					'circle' => __( 'Circle', 'elementor' ),
				],
				'prefix_class' => 'elementor-shape-',
			]
		);

		$this->add_control(
			'align',
			[
				'label' => __( 'Alignment', 'elementor' ),
				'type' => Controls_Manager::CHOOSE,
				'section' => 'section_social_icon',
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
				'default' => 'center',
				'prefix_class' => 'elementor-align-',
			]
		);

		$this->add_control(
			'social_icon_list',
			[
				'label' => '',
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
				'section' => 'section_social_icon',
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
			'view',
			[
				'label' => __( 'View', 'elementor' ),
				'type' => Controls_Manager::HIDDEN,
				'default' => 'traditional',
				'section' => 'section_icon',
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
			'icon_custom_color',
			[
				'label' => __( 'Primary Color', 'elementor' ),
				'type' => Controls_Manager::COLOR,
				'tab' => self::TAB_STYLE,
				'section' => 'section_social_style',
				'condition' => [
					'icon_color' => 'custom',
				],
				'selectors' => [
					'{{WRAPPER}} .elementor-icon i' => 'color: {{VALUE}};',
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
				'default' => [
					'size' => 20,
				],
				'range' => [
					'px' => [
						'min' => 6,
					],
				],
				'selectors' => [
					'{{WRAPPER}} .elementor-icon i' => 'font-size: {{SIZE}}{{UNIT}};',
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
					'{{WRAPPER}} .elementor-icon' => 'padding: {{SIZE}}{{UNIT}};',
				],
				'default' => [
					'size' => 0,
				],
				'range' => [
					'px' => [
						'min' => 0,
					],
				],
				'condition' => [
					'view!' => 'default',
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
				'default' => [
					'size' => 14,
				],
				'range' => [
					'px' => [
						'min' => 6,
					],
				],
				'selectors' => [
					'{{WRAPPER}} .elementor-icon' => 'margin-right: {{SIZE}}{{UNIT}};',
				],
			]
		);

		$this->add_group_control(
			Group_Control_Border::get_type(),
			[
				'name' => 'image_border',
				'tab' => self::TAB_STYLE,
				'section' => 'section_social_style',
				'selector' => '{{WRAPPER}} .elementor-icon',
			]
		);
	}


	protected function render( $instance = [] ) {
		?>
		<div class="elementor-icon-wrapper">
			<?php foreach ( $instance['social_icon_list'] as $item ) :

				if ( ! empty( $item['link']['url'] ) ) : ?>
					<a class="elementor-icon-link" href="<?php echo $item['link']['url']; ?>">
				<?php endif;?>
				<div class="elementor-icon">
					<i class="<?php echo $item['social']; ?>"></i>
				</div>
				<?php if ( ! empty( $instance['link']['url'] ) ) : ?>
					</a>
				<?php endif; ?>

			<?php endforeach; ?>
		</div>
		<?php
	}

	protected function content_template() {
		?>
		<div class="elementor-icon-wrapper">
			<%
			_.each( settings.social_icon_list, function( item ) {

				var hasLink = item.link && item.link.url;

				if ( hasLink ) { %>
					<a class="elementor-icon-link" href="<%- item.link.url %>">
				<% } %>
				<div class="elementor-icon">
					<i class="<%- item.social %>"></i>
				</div>
				<% if ( hasLink ) { %>
					</a>
				<% }

			} );
			%>
		</div>
		<?php
	}
}
