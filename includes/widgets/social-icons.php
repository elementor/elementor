<?php
namespace Elementor;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

/**
 * Elementor social icons widget.
 *
 * Elementor widget that displays icons to social pages like Facebook and Twitter.
 *
 * @since 1.0.0
 */
class Widget_Social_Icons extends Widget_Base {

	/**
	 * Get widget name.
	 *
	 * Retrieve social icons widget name.
	 *
	 * @since 1.0.0
	 * @access public
	 *
	 * @return string Widget name.
	 */
	public function get_name() {
		return 'social-icons';
	}

	/**
	 * Get widget title.
	 *
	 * Retrieve social icons widget title.
	 *
	 * @since 1.0.0
	 * @access public
	 *
	 * @return string Widget title.
	 */
	public function get_title() {
		return esc_html__( 'Social Icons', 'elementor' );
	}

	/**
	 * Get widget icon.
	 *
	 * Retrieve social icons widget icon.
	 *
	 * @since 1.0.0
	 * @access public
	 *
	 * @return string Widget icon.
	 */
	public function get_icon() {
		return 'eicon-social-icons';
	}

	/**
	 * Get widget keywords.
	 *
	 * Retrieve the list of keywords the widget belongs to.
	 *
	 * @since 2.1.0
	 * @access public
	 *
	 * @return array Widget keywords.
	 */
	public function get_keywords() {
		return array( 'social', 'icon', 'link' );
	}

	protected function is_dynamic_content(): bool {
		return false;
	}

	/**
	 * Get style dependencies.
	 *
	 * Retrieve the list of style dependencies the widget requires.
	 *
	 * @since 3.24.0
	 * @access public
	 *
	 * @return array Widget style dependencies.
	 */
	public function get_style_depends(): array {
		return array( 'widget-social-icons', 'e-apple-webkit' );
	}

	public function has_widget_inner_wrapper(): bool {
		return ! Plugin::$instance->experiments->is_feature_active( 'e_optimized_markup' );
	}

	/**
	 * Register social icons widget controls.
	 *
	 * Adds different input fields to allow the user to change and customize the widget settings.
	 *
	 * @since 3.1.0
	 * @access protected
	 */
	protected function register_controls() {
		$this->start_controls_section(
			'section_social_icon',
			array(
				'label' => esc_html__( 'Social Icons', 'elementor' ),
			)
		);

		$repeater = new Repeater();

		$repeater->add_control(
			'social_icon',
			array(
				'label' => esc_html__( 'Icon', 'elementor' ),
				'type' => Controls_Manager::ICONS,
				'fa4compatibility' => 'social',
				'default' => array(
					'value' => 'fab fa-wordpress',
					'library' => 'fa-brands',
				),
				'recommended' => array(
					'fa-brands' => array(
						'android',
						'apple',
						'behance',
						'bitbucket',
						'codepen',
						'delicious',
						'deviantart',
						'digg',
						'dribbble',
						'elementor',
						'facebook',
						'flickr',
						'foursquare',
						'free-code-camp',
						'github',
						'gitlab',
						'globe',
						'houzz',
						'instagram',
						'jsfiddle',
						'linkedin',
						'medium',
						'meetup',
						'mix',
						'mixcloud',
						'odnoklassniki',
						'pinterest',
						'product-hunt',
						'reddit',
						'shopping-cart',
						'skype',
						'slideshare',
						'snapchat',
						'soundcloud',
						'spotify',
						'stack-overflow',
						'steam',
						'telegram',
						'thumb-tack',
						'threads',
						'tripadvisor',
						'tumblr',
						'twitch',
						'twitter',
						'viber',
						'vimeo',
						'vk',
						'weibo',
						'weixin',
						'whatsapp',
						'wordpress',
						'xing',
						'x-twitter',
						'yelp',
						'youtube',
						'500px',
					),
					'fa-solid' => array(
						'envelope',
						'link',
						'rss',
					),
				),
			)
		);

		$repeater->add_control(
			'link',
			array(
				'label' => esc_html__( 'Link', 'elementor' ),
				'type' => Controls_Manager::URL,
				'default' => array(
					'is_external' => 'true',
				),
				'dynamic' => array(
					'active' => true,
				),
			)
		);

		$repeater->add_control(
			'item_icon_color',
			array(
				'label' => esc_html__( 'Color', 'elementor' ),
				'type' => Controls_Manager::SELECT,
				'default' => 'default',
				'options' => array(
					'default' => esc_html__( 'Official Color', 'elementor' ),
					'custom' => esc_html__( 'Custom', 'elementor' ),
				),
			)
		);

		$repeater->add_control(
			'item_icon_primary_color',
			array(
				'label' => esc_html__( 'Primary Color', 'elementor' ),
				'type' => Controls_Manager::COLOR,
				'condition' => array(
					'item_icon_color' => 'custom',
				),
				'selectors' => array(
					'{{WRAPPER}} {{CURRENT_ITEM}}.elementor-social-icon' => 'background-color: {{VALUE}};',
				),
			)
		);

		$repeater->add_control(
			'item_icon_secondary_color',
			array(
				'label' => esc_html__( 'Secondary Color', 'elementor' ),
				'type' => Controls_Manager::COLOR,
				'condition' => array(
					'item_icon_color' => 'custom',
				),
				'selectors' => array(
					'{{WRAPPER}} {{CURRENT_ITEM}}.elementor-social-icon i' => 'color: {{VALUE}};',
					'{{WRAPPER}} {{CURRENT_ITEM}}.elementor-social-icon svg' => 'fill: {{VALUE}};',
				),
			)
		);

		$this->add_control(
			'social_icon_list',
			array(
				'label' => esc_html__( 'Social Icons', 'elementor' ),
				'type' => Controls_Manager::REPEATER,
				'fields' => $repeater->get_controls(),
				'default' => array(
					array(
						'social_icon' => array(
							'value' => 'fab fa-facebook',
							'library' => 'fa-brands',
						),
					),
					array(
						'social_icon' => array(
							'value' => 'fab fa-twitter',
							'library' => 'fa-brands',
						),
					),
					array(
						'social_icon' => array(
							'value' => 'fab fa-youtube',
							'library' => 'fa-brands',
						),
					),
				),
				'title_field' => '<# var migrated = "undefined" !== typeof __fa4_migrated, social = ( "undefined" === typeof social ) ? false : social; #>{{{ elementor.helpers.getSocialNetworkNameFromIcon( social_icon, social, true, migrated, true ) }}}',
			)
		);

		$this->add_control(
			'shape',
			array(
				'label' => esc_html__( 'Shape', 'elementor' ),
				'type' => Controls_Manager::SELECT,
				'default' => 'rounded',
				'options' => array(
					'square' => esc_html__( 'Square', 'elementor' ),
					'rounded' => esc_html__( 'Rounded', 'elementor' ),
					'circle' => esc_html__( 'Circle', 'elementor' ),
				),
				'prefix_class' => 'elementor-shape-',
			)
		);

		$this->add_responsive_control(
			'columns',
			array(
				'label' => esc_html__( 'Columns', 'elementor' ),
				'type' => Controls_Manager::SELECT,
				'default' => '0',
				'options' => array(
					'0' => esc_html__( 'Auto', 'elementor' ),
					'1' => '1',
					'2' => '2',
					'3' => '3',
					'4' => '4',
					'5' => '5',
					'6' => '6',
				),
				'prefix_class' => 'elementor-grid%s-',
				'selectors' => array(
					'{{WRAPPER}}' => '--grid-template-columns: repeat({{VALUE}}, auto);',
				),
			)
		);

		$start = is_rtl() ? 'end' : 'start';
		$end = is_rtl() ? 'start' : 'end';

		$align_selector = Plugin::$instance->experiments->is_feature_active( 'e_optimized_markup' ) && ! $this->has_widget_inner_wrapper()
			? '{{WRAPPER}}'
			: '{{WRAPPER}} .elementor-widget-container';

		$this->add_responsive_control(
			'align',
			array(
				'label' => esc_html__( 'Alignment', 'elementor' ),
				'type' => Controls_Manager::CHOOSE,
				'options' => array(
					'left'    => array(
						'title' => esc_html__( 'Left', 'elementor' ),
						'icon' => 'eicon-text-align-left',
					),
					'center' => array(
						'title' => esc_html__( 'Center', 'elementor' ),
						'icon' => 'eicon-text-align-center',
					),
					'right' => array(
						'title' => esc_html__( 'Right', 'elementor' ),
						'icon' => 'eicon-text-align-right',
					),
				),
				'prefix_class' => 'e-grid-align%s-',
				'default' => 'center',
				'selectors' => array(
					$align_selector => 'text-align: {{VALUE}}',
				),
			)
		);

		$this->end_controls_section();

		$this->start_controls_section(
			'section_social_style',
			array(
				'label' => esc_html__( 'Icon', 'elementor' ),
				'tab' => Controls_Manager::TAB_STYLE,
			)
		);

		$this->add_control(
			'icon_color',
			array(
				'label' => esc_html__( 'Color', 'elementor' ),
				'type' => Controls_Manager::SELECT,
				'default' => 'default',
				'options' => array(
					'default' => esc_html__( 'Official Color', 'elementor' ),
					'custom' => esc_html__( 'Custom', 'elementor' ),
				),
			)
		);

		$this->add_control(
			'icon_primary_color',
			array(
				'label' => esc_html__( 'Primary Color', 'elementor' ),
				'type' => Controls_Manager::COLOR,
				'condition' => array(
					'icon_color' => 'custom',
				),
				'selectors' => array(
					'{{WRAPPER}} .elementor-social-icon' => 'background-color: {{VALUE}};',
				),
			)
		);

		$this->add_control(
			'icon_secondary_color',
			array(
				'label' => esc_html__( 'Secondary Color', 'elementor' ),
				'type' => Controls_Manager::COLOR,
				'condition' => array(
					'icon_color' => 'custom',
				),
				'selectors' => array(
					'{{WRAPPER}} .elementor-social-icon i' => 'color: {{VALUE}};',
					'{{WRAPPER}} .elementor-social-icon svg' => 'fill: {{VALUE}};',
				),
			)
		);

		$this->add_responsive_control(
			'icon_size',
			array(
				'label' => esc_html__( 'Size', 'elementor' ),
				'type' => Controls_Manager::SLIDER,
				// The `%' and `em` units are not supported as the widget implements icons differently then other icons.
				'size_units' => array( 'px', 'rem', 'vw', 'custom' ),
				'range' => array(
					'px' => array(
						'min' => 6,
						'max' => 300,
					),
				),
				'selectors' => array(
					'{{WRAPPER}}' => '--icon-size: {{SIZE}}{{UNIT}}',
				),
			)
		);

		$this->add_responsive_control(
			'icon_padding',
			array(
				'label' => esc_html__( 'Padding', 'elementor' ),
				'type' => Controls_Manager::SLIDER,
				// The `%' unit is not supported.
				'size_units' => array( 'px', 'em', 'rem', 'custom' ),
				'selectors' => array(
					'{{WRAPPER}} .elementor-social-icon' => '--icon-padding: {{SIZE}}{{UNIT}}',
				),
				'default' => array(
					'unit' => 'em',
				),
				'tablet_default' => array(
					'unit' => 'em',
				),
				'mobile_default' => array(
					'unit' => 'em',
				),
				'range' => array(
					'px' => array(
						'max' => 50,
					),
					'em' => array(
						'min' => 0,
						'max' => 5,
					),
					'rem' => array(
						'min' => 0,
						'max' => 5,
					),
				),
			)
		);

		$this->add_responsive_control(
			'icon_spacing',
			array(
				'label' => esc_html__( 'Spacing', 'elementor' ),
				'type' => Controls_Manager::SLIDER,
				'size_units' => array( 'px', 'em', 'rem', 'custom' ),
				'range' => array(
					'px' => array(
						'max' => 100,
					),
					'em' => array(
						'min' => 0,
						'max' => 10,
					),
					'rem' => array(
						'min' => 0,
						'max' => 10,
					),
				),
				'default' => array(
					'size' => 5,
				),
				'selectors' => array(
					'{{WRAPPER}}' => '--grid-column-gap: {{SIZE}}{{UNIT}}',
				),
			)
		);

		$this->add_responsive_control(
			'row_gap',
			array(
				'label' => esc_html__( 'Rows Gap', 'elementor' ),
				'type' => Controls_Manager::SLIDER,
				'size_units' => array( 'px', 'em', 'rem', 'custom' ),
				'default' => array(
					'size' => 0,
				),
				'selectors' => array(
					'{{WRAPPER}}' => '--grid-row-gap: {{SIZE}}{{UNIT}}',
				),
			)
		);

		$this->add_group_control(
			Group_Control_Border::get_type(),
			array(
				'name' => 'image_border', // We know this mistake - TODO: 'icon_border' (for hover control condition also)
				'selector' => '{{WRAPPER}} .elementor-social-icon',
				'separator' => 'before',
			)
		);

		$this->add_responsive_control(
			'border_radius',
			array(
				'label' => esc_html__( 'Border Radius', 'elementor' ),
				'type' => Controls_Manager::DIMENSIONS,
				'size_units' => array( 'px', '%', 'em', 'rem', 'custom' ),
				'selectors' => array(
					'{{WRAPPER}} .elementor-icon' => 'border-radius: {{TOP}}{{UNIT}} {{RIGHT}}{{UNIT}} {{BOTTOM}}{{UNIT}} {{LEFT}}{{UNIT}};',
				),
			)
		);

		$this->end_controls_section();

		$this->start_controls_section(
			'section_social_hover',
			array(
				'label' => esc_html__( 'Icon Hover', 'elementor' ),
				'tab' => Controls_Manager::TAB_STYLE,
			)
		);

		$this->add_control(
			'hover_primary_color',
			array(
				'label' => esc_html__( 'Primary Color', 'elementor' ),
				'type' => Controls_Manager::COLOR,
				'default' => '',
				'condition' => array(
					'icon_color' => 'custom',
				),
				'selectors' => array(
					'{{WRAPPER}} .elementor-social-icon:hover' => 'background-color: {{VALUE}};',
				),
			)
		);

		$this->add_control(
			'hover_secondary_color',
			array(
				'label' => esc_html__( 'Secondary Color', 'elementor' ),
				'type' => Controls_Manager::COLOR,
				'default' => '',
				'condition' => array(
					'icon_color' => 'custom',
				),
				'selectors' => array(
					'{{WRAPPER}} .elementor-social-icon:hover i' => 'color: {{VALUE}};',
					'{{WRAPPER}} .elementor-social-icon:hover svg' => 'fill: {{VALUE}};',
				),
			)
		);

		$this->add_control(
			'hover_border_color',
			array(
				'label' => esc_html__( 'Border Color', 'elementor' ),
				'type' => Controls_Manager::COLOR,
				'default' => '',
				'condition' => array(
					'image_border_border!' => '',
				),
				'selectors' => array(
					'{{WRAPPER}} .elementor-social-icon:hover' => 'border-color: {{VALUE}};',
				),
			)
		);

		$this->add_control(
			'hover_animation',
			array(
				'label' => esc_html__( 'Hover Animation', 'elementor' ),
				'type' => Controls_Manager::HOVER_ANIMATION,
			)
		);

		$this->end_controls_section();
	}

	/**
	 * Render social icons widget output on the frontend.
	 *
	 * Written in PHP and used to generate the final HTML.
	 *
	 * @since 1.0.0
	 * @access protected
	 */
	protected function render() {
		$settings = $this->get_settings_for_display();
		$fallback_defaults = array(
			'fa fa-facebook',
			'fa fa-twitter',
			'fa fa-google-plus',
		);

		$class_animation = '';

		if ( ! empty( $settings['hover_animation'] ) ) {
			$class_animation = ' elementor-animation-' . $settings['hover_animation'];
		}

		$migration_allowed = Icons_Manager::is_migration_allowed();

		?>
		<div class="elementor-social-icons-wrapper elementor-grid">
			<?php
			foreach ( $settings['social_icon_list'] as $index => $item ) {
				$migrated = isset( $item['__fa4_migrated']['social_icon'] );
				$is_new = empty( $item['social'] ) && $migration_allowed;
				$social = '';

				// add old default
				if ( empty( $item['social'] ) && ! $migration_allowed ) {
					$item['social'] = isset( $fallback_defaults[ $index ] ) ? $fallback_defaults[ $index ] : 'fa fa-wordpress';
				}

				if ( ! empty( $item['social'] ) ) {
					$social = str_replace( 'fa fa-', '', $item['social'] );
				}

				if ( ( $is_new || $migrated ) && 'svg' !== $item['social_icon']['library'] ) {
					$social = explode( ' ', $item['social_icon']['value'], 2 );
					if ( empty( $social[1] ) ) {
						$social = '';
					} else {
						$social = str_replace( 'fa-', '', $social[1] );
					}
				}
				if ( 'svg' === $item['social_icon']['library'] ) {
					$social = get_post_meta( $item['social_icon']['value']['id'], '_wp_attachment_image_alt', true );
				}

				$link_key = 'link_' . $index;

				$this->add_render_attribute( $link_key, 'class', array(
					'elementor-icon',
					'elementor-social-icon',
					'elementor-social-icon-' . $social . $class_animation,
					'elementor-repeater-item-' . $item['_id'],
				) );

				$this->add_link_attributes( $link_key, $item['link'] );

				?>
				<span class="elementor-grid-item">
					<a <?php $this->print_render_attribute_string( $link_key ); ?>>
						<span class="elementor-screen-only"><?php echo esc_html( ucwords( $social ) ); ?></span>
						<?php
						if ( $is_new || $migrated ) {
							Icons_Manager::render_icon( $item['social_icon'] );
						} else { ?>
							<i class="<?php echo esc_attr( $item['social'] ); ?>"></i>
						<?php } ?>
					</a>
				</span>
			<?php } ?>
		</div>
		<?php
	}

	/**
	 * Render social icons widget output in the editor.
	 *
	 * Written as a Backbone JavaScript template and used to generate the live preview.
	 *
	 * @since 2.9.0
	 * @access protected
	 */
	protected function content_template() {
		?>
		<# var iconsHTML = {}; #>
		<div class="elementor-social-icons-wrapper elementor-grid">
			<# _.each( settings.social_icon_list, function( item, index ) {
				var link = item.link ? item.link.url : '',
					migrated = elementor.helpers.isIconMigrated( item, 'social_icon' );
					social = elementor.helpers.getSocialNetworkNameFromIcon( item.social_icon, item.social, false, migrated );
				#>
				<span class="elementor-grid-item">
					<a class="elementor-icon elementor-social-icon elementor-social-icon-{{ social }} elementor-animation-{{ settings.hover_animation }} elementor-repeater-item-{{item._id}}" href="{{ elementor.helpers.sanitizeUrl( link ) }}">
						<span class="elementor-screen-only">{{{ social }}}</span>
						<#
							iconsHTML[ index ] = elementor.helpers.renderIcon( view, item.social_icon, {}, 'i', 'object' );
							if ( ( ! item.social || migrated ) && iconsHTML[ index ] && iconsHTML[ index ].rendered ) { #>
								{{{ iconsHTML[ index ].value }}}
							<# } else { #>
								<i class="{{ item.social }}"></i>
							<# }
						#>
					</a>
				</span>
			<# } ); #>
		</div>
		<?php
	}
}
