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
			'social_icon_list',
			[
				'label' => __( 'Social Icons', 'elementor' ),
				'type' => Controls_Manager::REPEATER,
				'default' => [
					[
						'social' => 'fa fa-facebook',
					],
					[
						'social' => 'fa fa-twitter',
					],
					[
						'social' => 'fa fa-google-plus',
					],
				],
				'section' => 'section_social_icon',
				'fields' => [
					[
						'name' => 'social',
						'label' => __( 'Icon', 'elementor' ),
						'type' => Controls_Manager::ICON,
						'label_block' => true,
						'default' => 'fa fa-wordpress',
						'include' => [
							'fa fa-behance',
							'fa fa-bitbucket',
							'fa fa-codepen',
							'fa fa-delicious',
							'fa fa-digg',
							'fa fa-dribbble',
							'fa fa-facebook',
							'fa fa-flickr',
							'fa fa-foursquare',
							'fa fa-github',
							'fa fa-google-plus',
							'fa fa-instagram',
							'fa fa-jsfiddle',
							'fa fa-linkedin',
							'fa fa-medium',
							'fa fa-pinterest',
							'fa fa-product-hunt',
							'fa fa-reddit',
							'fa fa-snapchat',
							'fa fa-soundcloud',
							'fa fa-stack-overflow',
							'fa fa-tumblr',
							'fa fa-twitter',
							'fa fa-vimeo',
							'fa fa-wordpress',
							'fa fa-youtube',
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
				'title_field' => 'social',
			]
		);

		$this->add_control(
			'shape',
			[
				'label' => __( 'Shape', 'elementor' ),
				'type' => Controls_Manager::SELECT,
				'section' => 'section_social_icon',
				'default' => 'rounded',
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
				'label' => __( 'Icon', 'elementor' ),
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
				'default' => 'default',
				'options' => [
					'default' => __( 'Official Color', 'elementor' ),
					'custom' => __( 'Custom', 'elementor' ),
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
					'{{WRAPPER}} .elementor-social-icon' => 'background-color: {{VALUE}};',
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
					'{{WRAPPER}} .elementor-social-icon' => 'color: {{VALUE}};',
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
					'{{WRAPPER}} .elementor-social-icon i' => 'font-size: {{SIZE}}{{UNIT}};',
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
					'{{WRAPPER}} .elementor-social-icon' => 'padding: {{SIZE}}{{UNIT}};',
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

		$icon_spacing = is_rtl() ? 'margin-left: {{SIZE}}{{UNIT}};' : 'margin-right: {{SIZE}}{{UNIT}};';

		$this->add_control(
			'icon_spacing',
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
					'{{WRAPPER}} .elementor-social-icon:not(:last-child)' => $icon_spacing,
				],
			]
		);

		$this->add_group_control(
			Group_Control_Border::get_type(),
			[
				'name' => 'image_border',
				'tab' => self::TAB_STYLE,
				'section' => 'section_social_style',
				'selector' => '{{WRAPPER}} .elementor-social-icon',
			]
		);

		$this->add_control(
			'border_radius',
			[
				'label' => __( 'Border Radius', 'elementor' ),
				'type' => Controls_Manager::DIMENSIONS,
				'size_units' => [ 'px', '%' ],
				'tab' => self::TAB_STYLE,
				'section' => 'section_social_style',
				'selectors' => [
					'{{WRAPPER}} .elementor-icon' => 'border-radius: {{TOP}}{{UNIT}} {{RIGHT}}{{UNIT}} {{BOTTOM}}{{UNIT}} {{LEFT}}{{UNIT}};',
				],
			]
		);
	}

	protected function render( $instance = [] ) {
		?>
		<div class="elementor-social-icons-wrapper">
			<?php foreach ( $instance['social_icon_list'] as $item ) :
				$social = str_replace( 'fa fa-', '', $item['social'] );
				$target = $item['link']['is_external'] ? ' target="_blank"' : '';
				?>
				<a class="elementor-icon elementor-social-icon elementor-social-icon-<?php echo esc_attr( $social ); ?>" href="<?php echo esc_attr( $item['link']['url'] ); ?>"<?php echo $target; ?>>
					<i class="<?php echo $item['social']; ?>"></i>
				</a>
			<?php endforeach; ?>
		</div>
		<?php
	}

	protected function content_template() {
		?>
		<div class="elementor-social-icons-wrapper">
			<% _.each( settings.social_icon_list, function( item ) {
				var link = item.link ? item.link.url : '',
					social = item.social.replace( 'fa fa-', '' ); %>
				<a class="elementor-icon elementor-social-icon elementor-social-icon-<%- social %>" href="<%- link %>">
					<i class="<%- item.social %>"></i>
				</a>
			<% } ); %>
		</div>
		<?php
	}
}
