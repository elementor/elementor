<?php
namespace Elementor;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

/**
 * Toggle Widget.
 *
 * Elementor widget that displays a collapsible display of content in an toggle
 * style, allowing the user to open multiple items.
 *
 * @since 1.0.0
 */
class Widget_Toggle extends Widget_Base {

	/**
	 * Get widget name.
	 *
	 * Retrieve toggle widget name.
	 *
	 * @since 1.0.0
	 * @access public
	 *
	 * @return string Widget name.
	 */
	public function get_name() {
		return 'toggle';
	}

	/**
	 * Get widget title.
	 *
	 * Retrieve toggle widget title.
	 *
	 * @since 1.0.0
	 * @access public
	 *
	 * @return string Widget title.
	 */
	public function get_title() {
		return __( 'Toggle', 'elementor' );
	}

	/**
	 * Get widget icon.
	 *
	 * Retrieve toggle widget icon.
	 *
	 * @since 1.0.0
	 * @access public
	 *
	 * @return string Widget icon.
	 */
	public function get_icon() {
		return 'eicon-toggle';
	}

	/**
	 * Get widget categories.
	 *
	 * Retrieve the list of categories the toggle widget belongs to.
	 *
	 * Used to determine where to display the widget in the editor.
	 *
	 * @since 1.0.0
	 * @access public
	 *
	 * @return array Widget categories.
	 */
	public function get_categories() {
		return [ 'general-elements' ];
	}

	/**
	 * Get icons.
	 *
	 * Retrieve all the icons used by the toggle widget.
	 *
	 * @since 1.9.0
	 * @access public
	 *
	 * @return array Widget icons.
	 */
	public function get_icons() {
		return [
			'fa fa-angle-double-down',
			'fa fa-angle-double-left',
			'fa fa-angle-double-right',
			'fa fa-angle-double-up',
			'fa fa-angle-down',
			'fa fa-angle-left',
			'fa fa-angle-right',
			'fa fa-angle-up',
			'fa fa-arrow-circle-down',
			'fa fa-arrow-circle-left',
			'fa fa-arrow-circle-o-down',
			'fa fa-arrow-circle-o-left',
			'fa fa-arrow-circle-o-right',
			'fa fa-arrow-circle-o-up',
			'fa fa-arrow-circle-right',
			'fa fa-arrow-circle-up',
			'fa fa-arrow-down',
			'fa fa-arrow-left',
			'fa fa-arrow-right',
			'fa fa-arrow-up',
			'fa fa-arrows',
			'fa fa-arrows-alt',
			'fa fa-arrows-h',
			'fa fa-arrows-v',
			'fa fa-exchange',
			'fa fa-caret-down',
			'fa fa-caret-left',
			'fa fa-caret-right',
			'fa fa-caret-square-o-down',
			'fa fa-caret-square-o-left',
			'fa fa-caret-square-o-right',
			'fa fa-caret-square-o-up',
			'fa fa-caret-up',
			'fa fa-chevron-circle-down',
			'fa fa-chevron-circle-left',
			'fa fa-chevron-circle-right',
			'fa fa-chevron-circle-up',
			'fa fa-chevron-down',
			'fa fa-chevron-left',
			'fa fa-chevron-right',
			'fa fa-chevron-up',
			'fa fa-hand-o-down',
			'fa fa-hand-o-left',
			'fa fa-hand-o-right',
			'fa fa-hand-o-up',
			'fa fa-long-arrow-down',
			'fa fa-long-arrow-left',
			'fa fa-long-arrow-right',
			'fa fa-long-arrow-up',
			'fa fa-caret-square-o-down',
			'fa fa-caret-square-o-left',
			'fa fa-caret-square-o-right',
			'fa fa-caret-square-o-up',
			'fa fa-plus',
			'fa fa-minus',
			'fa fa-plus-circle',
			'fa fa-minus-circle',
			'fa fa-plus-square',
			'fa fa-minus-square',
			'fa fa-plus-square-o',
			'fa fa-minus-square-o',
			'fa fa-check',
			'fa fa-times',
			'fa fa-check-circle',
			'fa fa-times-circle',
			'fa fa-quora',
			'fa fa-font',
			'fa fa-question',
			'fa fa-info',
			'fa fa-question-circle',
			'fa fa-info-circle',
			'fa fa-exclamation',
			'fa fa-exclamation-circle',
			'fa fa-exclamation-triangle',
			'fa fa-ellipsis-v',
			'fa fa-ellipsis-h',
			'fa fa-folder',
			'fa fa-folder-open',
			'fa fa-folder-o',
			'fa fa-folder-open-o',
			'fa fa-flag',
			'fa fa-flag-checkered',
			'fa fa-flag-o',
			'fa fa-bookmark',
			'fa fa-bookmark-o',
			'fa fa-envelope',
			'fa fa-envelope-open',
			'fa fa-envelope-o',
			'fa fa-envelope-open-o',
			'fa fa-bell',
			'fa fa-bell-o',
			'fa fa-heart',
			'fa fa-heart-o',
			'fa fa-life-ring',
			'fa fa-lightbulb-o',
			'fa fa-diamond',
			'fa fa-cog',
			'fa fa-bug',
			'fa fa-music',
			'fa fa-graduation-cap',
			'fa fa-cutlery',
			'fa fa-coffee',
			'fa fa-car',
			'fa fa-camera',
		];
	}

	/**
	 * Register toggle widget controls.
	 *
	 * Adds different input fields to allow the user to change and customize the widget settings.
	 *
	 * @since 1.0.0
	 * @access protected
	 */
	protected function _register_controls() {
		$this->start_controls_section(
			'section_toggle',
			[
				'label' => __( 'Toggle', 'elementor' ),
			]
		);

		$this->add_control(
			'tabs',
			[
				'label' => __( 'Toggle Items', 'elementor' ),
				'type' => Controls_Manager::REPEATER,
				'default' => [
					[
						'tab_title' => __( 'Toggle #1', 'elementor' ),
						'tab_content' => __( 'I am item content. Click edit button to change this text. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut elit tellus, luctus nec ullamcorper mattis, pulvinar dapibus leo.', 'elementor' ),
					],
					[
						'tab_title' => __( 'Toggle #2', 'elementor' ),
						'tab_content' => __( 'I am item content. Click edit button to change this text. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut elit tellus, luctus nec ullamcorper mattis, pulvinar dapibus leo.', 'elementor' ),
					],
				],
				'fields' => [
					[
						'name' => 'tab_title',
						'label' => __( 'Title & Content', 'elementor' ),
						'type' => Controls_Manager::TEXT,
						'default' => __( 'Toggle Title' , 'elementor' ),
						'label_block' => true,
					],
					[
						'name' => 'tab_content',
						'label' => __( 'Content', 'elementor' ),
						'type' => Controls_Manager::WYSIWYG,
						'default' => __( 'Toggle Content', 'elementor' ),
						'show_label' => false,
					],
				],
				'title_field' => '{{{ tab_title }}}',
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

		$this->add_control(
			'title_html_tag',
			[
				'label' => __( 'Title HTML Tag', 'elementor' ),
				'type' => Controls_Manager::SELECT,
				'options' => [
					'h1' => __( 'H1', 'elementor' ),
					'h2' => __( 'H2', 'elementor' ),
					'h3' => __( 'H3', 'elementor' ),
					'h4' => __( 'H4', 'elementor' ),
					'h5' => __( 'H5', 'elementor' ),
					'h6' => __( 'H6', 'elementor' ),
					'div' => __( 'div', 'elementor' ),
				],
				'default' => 'div',
				'separator' => 'before',
			]
		);

		$this->add_control(
			'icon',
			[
				'label' => __( 'Icon', 'elementor' ),
				'type' => Controls_Manager::ICON,
				'include' => self::get_icons(),
				'default' => is_rtl() ? 'fa fa-caret-left' : 'fa fa-caret-right',
				'label_block' => true,
			]
		);

		$this->add_control(
			'icon_active',
			[
				'label' => __( 'Active Icon', 'elementor' ),
				'type' => Controls_Manager::ICON,
				'include' => self::get_icons(),
				'default' => 'fa fa-caret-up',
				'label_block' => true,
				'condition' => [
					'icon!' => '',
				]
			]
		);

		$this->end_controls_section();

		$this->start_controls_section(
			'section_toggle_style',
			[
				'label' => __( 'Toggle', 'elementor' ),
				'tab' => Controls_Manager::TAB_STYLE,
			]
		);

		$this->add_control(
			'space_between',
			[
				'label' => __( 'Space Between', 'elementor' ),
				'type' => Controls_Manager::SLIDER,
				'range' => [
					'px' => [
						'max' => 50,
					],
				],
				'selectors' => [
					'{{WRAPPER}} .elementor-toggle .elementor-toggle-item:not(:last-child)' => 'margin-bottom: {{SIZE}}{{UNIT}}',
				],
			]
		);

		$this->add_group_control(
			Group_Control_Box_Shadow::get_type(),
			[
				'name' => 'box_shadow',
				'selector' => '{{WRAPPER}} .elementor-toggle .elementor-toggle-item',
			]
		);

		$this->add_control(
			'border_width',
			[
				'label' => __( 'Border Width', 'elementor' ),
				'type' => Controls_Manager::SLIDER,
				'default' => [
					'size' => 1,
				],
				'range' => [
					'px' => [
						'min' => 0,
						'max' => 10,
					],
				],
				'selectors' => [
					'{{WRAPPER}} .elementor-toggle .elementor-tab-title' => 'border-width: {{SIZE}}{{UNIT}};',
					'{{WRAPPER}} .elementor-toggle .elementor-tab-content' => 'border-width: {{SIZE}}{{UNIT}};',
				],
			]
		);

		$this->add_control(
			'border_color',
			[
				'label' => __( 'Border Color', 'elementor' ),
				'type' => Controls_Manager::COLOR,
				'selectors' => [
					'{{WRAPPER}} .elementor-toggle .elementor-tab-content' => 'border-bottom-color: {{VALUE}};',
					'{{WRAPPER}} .elementor-toggle .elementor-tab-title' => 'border-color: {{VALUE}};',
				],
			]
		);

		$this->end_controls_section();

		$this->start_controls_section(
			'section_toggle_style_title',
			[
				'label' => __( 'Title', 'elementor' ),
				'tab' => Controls_Manager::TAB_STYLE,
			]
		);

		$this->add_control(
			'title_background',
			[
				'label' => __( 'Background', 'elementor' ),
				'type' => Controls_Manager::COLOR,
				'selectors' => [
					'{{WRAPPER}} .elementor-toggle .elementor-tab-title' => 'background-color: {{VALUE}};',
				],
			]
		);

		$this->add_control(
			'title_color',
			[
				'label' => __( 'Color', 'elementor' ),
				'type' => Controls_Manager::COLOR,
				'selectors' => [
					'{{WRAPPER}} .elementor-toggle .elementor-tab-title' => 'color: {{VALUE}};',
				],
				'scheme' => [
					'type' => Scheme_Color::get_type(),
					'value' => Scheme_Color::COLOR_1,
				],
			]
		);

		$this->add_control(
			'tab_active_color',
			[
				'label' => __( 'Active Color', 'elementor' ),
				'type' => Controls_Manager::COLOR,
				'selectors' => [
					'{{WRAPPER}} .elementor-toggle .elementor-tab-title.elementor-active' => 'color: {{VALUE}};',
				],
				'scheme' => [
					'type' => Scheme_Color::get_type(),
					'value' => Scheme_Color::COLOR_4,
				],
			]
		);

		$this->add_group_control(
			Group_Control_Typography::get_type(),
			[
				'name' => 'title_typography',
				'selector' => '{{WRAPPER}} .elementor-toggle .elementor-tab-title',
				'scheme' => Scheme_Typography::TYPOGRAPHY_1,
			]
		);

		$this->add_responsive_control(
			'title_padding',
			[
				'label' => __( 'Padding', 'elementor' ),
				'type' => Controls_Manager::DIMENSIONS,
				'size_units' => [ 'px', 'em', '%' ],
				'selectors' => [
					'{{WRAPPER}} .elementor-toggle .elementor-tab-title' => 'padding: {{TOP}}{{UNIT}} {{RIGHT}}{{UNIT}} {{BOTTOM}}{{UNIT}} {{LEFT}}{{UNIT}};',
				],
			]
		);

		$this->end_controls_section();

		$this->start_controls_section(
			'section_toggle_style_icon',
			[
				'label' => __( 'Icon', 'elementor' ),
				'tab' => Controls_Manager::TAB_STYLE,
				'condition' => [
					'icon!' => '',
				]
			]
		);

		$this->add_control(
			'icon_align',
			[
				'label' => __( 'Alignment', 'elementor' ),
				'type' => Controls_Manager::CHOOSE,
				'options' => [
					'left' => [
						'title' => __( 'Left', 'elementor' ),
						'icon' => 'fa fa-align-left',
					],
					'right' => [
						'title' => __( 'Right', 'elementor' ),
						'icon' => 'fa fa-align-right',
					],
				],
				'default' => is_rtl() ? 'right' : 'left',
				'toggle' => false,
				'label_block' => false,
				'condition' => [
					'icon!' => '',
				]
			]
		);

		$this->add_control(
			'icon_color',
			[
				'label' => __( 'Color', 'elementor' ),
				'type' => Controls_Manager::COLOR,
				'selectors' => [
					'{{WRAPPER}} .elementor-toggle .elementor-tab-title .elementor-toggle-icon .fa:before' => 'color: {{VALUE}};',
				],
				'condition' => [
					'icon!' => '',
				]
			]
		);

		$this->add_control(
			'icon_active_color',
			[
				'label' => __( 'Active Color', 'elementor' ),
				'type' => Controls_Manager::COLOR,
				'selectors' => [
					'{{WRAPPER}} .elementor-toggle .elementor-tab-title.elementor-active .elementor-toggle-icon .fa:before' => 'color: {{VALUE}};',
				],
				'condition' => [
					'icon!' => '',
				]
			]
		);

		$this->add_responsive_control(
			'icon_space',
			[
				'label' => __( 'Spacing', 'elementor' ),
				'type' => Controls_Manager::SLIDER,
				'range' => [
					'px' => [
						'min' => 0,
						'max' => 100,
					],
				],
				'selectors' => [
					'{{WRAPPER}} .elementor-toggle .elementor-toggle-icon.elementor-toggle-icon-left' => 'margin-right: {{SIZE}}{{UNIT}};',
					'{{WRAPPER}} .elementor-toggle .elementor-toggle-icon.elementor-toggle-icon-right' => 'margin-left: {{SIZE}}{{UNIT}};',
				],
				'condition' => [
					'icon!' => '',
				]
			]
		);

		$this->end_controls_section();

		$this->start_controls_section(
			'section_toggle_style_content',
			[
				'label' => __( 'Content', 'elementor' ),
				'tab' => Controls_Manager::TAB_STYLE,
				'condition' => [
					'icon!' => '',
				]
			]
		);

		$this->add_control(
			'content_background_color',
			[
				'label' => __( 'Background', 'elementor' ),
				'type' => Controls_Manager::COLOR,
				'selectors' => [
					'{{WRAPPER}} .elementor-toggle .elementor-tab-content' => 'background-color: {{VALUE}};',
				],
			]
		);

		$this->add_control(
			'content_color',
			[
				'label' => __( 'Color', 'elementor' ),
				'type' => Controls_Manager::COLOR,
				'selectors' => [
					'{{WRAPPER}} .elementor-toggle .elementor-tab-content' => 'color: {{VALUE}};',
				],
				'scheme' => [
					'type' => Scheme_Color::get_type(),
					'value' => Scheme_Color::COLOR_3,
				],
			]
		);

		$this->add_group_control(
			Group_Control_Typography::get_type(),
			[
				'name' => 'content_typography',
				'selector' => '{{WRAPPER}} .elementor-toggle .elementor-tab-content',
				'scheme' => Scheme_Typography::TYPOGRAPHY_3,
			]
		);

		$this->add_responsive_control(
			'content_padding',
			[
				'label' => __( 'Padding', 'elementor' ),
				'type' => Controls_Manager::DIMENSIONS,
				'size_units' => [ 'px', 'em', '%' ],
				'selectors' => [
					'{{WRAPPER}} .elementor-toggle .elementor-tab-content' => 'padding: {{TOP}}{{UNIT}} {{RIGHT}}{{UNIT}} {{BOTTOM}}{{UNIT}} {{LEFT}}{{UNIT}};',
				],
			]
		);

		$this->end_controls_section();
	}

	/**
	 * Render toggle widget output on the frontend.
	 *
	 * Written in PHP and used to generate the final HTML.
	 *
	 * @since 1.0.0
	 * @access protected
	 */
	protected function render() {
		$settings = $this->get_settings();

		$id_int = substr( $this->get_id_int(), 0, 3 );
		?>
		<div class="elementor-toggle" role="tablist">
			<?php foreach ( $settings['tabs'] as $index => $item ) :
				$tab_count = $index + 1;

				$tab_title_setting_key = $this->get_repeater_setting_key( 'tab_title', 'tabs', $index );

				$tab_content_setting_key = $this->get_repeater_setting_key( 'tab_content', 'tabs', $index );

				$this->add_render_attribute( $tab_title_setting_key, [
					'id' => 'elementor-tab-title-' . $id_int . $tab_count,
					'class' => [ 'elementor-tab-title' ],
					'tabindex' => $id_int . $tab_count,
					'data-tab' => $tab_count,
					'role' => 'tab',
					'aria-controls' => 'elementor-tab-content-' . $id_int . $tab_count,
				] );

				$this->add_render_attribute( $tab_content_setting_key, [
					'id' => 'elementor-tab-content-' . $id_int . $tab_count,
					'class' => [ 'elementor-tab-content', 'elementor-clearfix' ],
					'data-tab' => $tab_count,
					'role' => 'tabpanel',
					'aria-labelledby' => 'elementor-tab-title-' . $id_int . $tab_count,
				] );

				$this->add_inline_editing_attributes( $tab_content_setting_key, 'advanced' );
				?>
				<div class="elementor-toggle-item">
					<<?php echo $settings['title_html_tag']; ?> <?php echo $this->get_render_attribute_string( $tab_title_setting_key ); ?>>
						<?php if ( $settings['icon'] ) : ?>
						<span class="elementor-toggle-icon elementor-toggle-icon-<?php echo $settings['icon_align']; ?>" aria-hidden="true">
							<i class="elementor-toggle-icon-closed <?php echo $settings['icon']; ?>"></i>
							<i class="elementor-toggle-icon-opened <?php echo $settings['icon_active']; ?>"></i>
						</span>
						<?php endif; ?>
						<?php echo $item['tab_title']; ?>
					</<?php echo $settings['title_html_tag']; ?>>
					<div <?php echo $this->get_render_attribute_string( $tab_content_setting_key ); ?>><?php echo $this->parse_text_editor( $item['tab_content'] ); ?></div>
				</div>
			<?php endforeach; ?>
		</div>
		<?php
	}

	/**
	 * Render toggle widget output in the editor.
	 *
	 * Written as a Backbone JavaScript template and used to generate the live preview.
	 *
	 * @since 1.0.0
	 * @access protected
	 */
	protected function _content_template() {
		?>
		<div class="elementor-toggle" role="tablist">
			<#
			if ( settings.tabs ) {
				var tabindex = view.getIDInt().toString().substr( 0, 3 );

				_.each( settings.tabs, function( item, index ) {
					var tabCount = index + 1,
						tabTitleKey = view.getRepeaterSettingKey( 'tab_title', 'tabs', index ),
						tabContentKey = view.getRepeaterSettingKey( 'tab_content', 'tabs', index );

					view.addRenderAttribute( tabTitleKey, {
						'id': 'elementor-tab-title-' + tabindex + tabCount,
						'class': [ 'elementor-tab-title' ],
						'tabindex': tabindex + tabCount,
						'data-tab': tabCount,
						'role': 'tab',
						'aria-controls': 'elementor-tab-content-' + tabindex + tabCount
					} );

					view.addRenderAttribute( tabContentKey, {
						'id': 'elementor-tab-content-' + tabindex + tabCount,
						'class': [ 'elementor-tab-content', 'elementor-clearfix' ],
						'data-tab': tabCount,
						'role': 'tabpanel',
						'aria-labelledby': 'elementor-tab-title-' + tabindex + tabCount
					} );

					view.addInlineEditingAttributes( tabContentKey, 'advanced' );
					#>
					<div class="elementor-toggle-item">
						<{{{ settings.title_html_tag }}} {{{ view.getRenderAttributeString( tabTitleKey ) }}}>
							<# if ( settings.icon ) { #>
							<span class="elementor-toggle-icon elementor-toggle-icon-{{ settings.icon_align }}" aria-hidden="true">
								<i class="elementor-toggle-icon-closed {{ settings.icon }}"></i>
								<i class="elementor-toggle-icon-opened {{ settings.icon_active }}"></i>
							</span>
							<# } #>
							{{{ item.tab_title }}}
						</{{{ settings.title_html_tag }}}>
						<div {{{ view.getRenderAttributeString( tabContentKey ) }}}>{{{ item.tab_content }}}</div>
					</div>
					<#
				} );
			} #>
		</div>
		<?php
	}
}
