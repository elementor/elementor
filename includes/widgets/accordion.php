<?php
namespace Elementor;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

/**
 * Accordion Widget.
 *
 * Elementor widget that displays a collapsible display of content in an
 * accordion style, showing only one item at a time.
 *
 * @since 1.0.0
 */
class Widget_Accordion extends Widget_Base {

	/**
	 * Get widget name.
	 *
	 * Retrieve accordion widget name.
	 *
	 * @since 1.0.0
	 * @access public
	 *
	 * @return string Widget name.
	 */
	public function get_name() {
		return 'accordion';
	}

	/**
	 * Get widget title.
	 *
	 * Retrieve accordion widget title.
	 *
	 * @since 1.0.0
	 * @access public
	 *
	 * @return string Widget title.
	 */
	public function get_title() {
		return __( 'Accordion', 'elementor' );
	}

	/**
	 * Get widget icon.
	 *
	 * Retrieve accordion widget icon.
	 *
	 * @since 1.0.0
	 * @access public
	 *
	 * @return string Widget icon.
	 */
	public function get_icon() {
		return 'eicon-accordion';
	}

	/**
	 * Get widget categories.
	 *
	 * Retrieve the list of categories the accordion widget belongs to.
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
	 * Get arrow icons.
	 *
	 * Retrieve all the arrow icons used by the accordion widget.
	 *
	 * @since 1.9.0
	 * @access public
	 *
	 * @return array Arrow icons.
	 */
	public function get_arrow_icons() {
		return [
			'fa fa-plus',
			'fa fa-minus',
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
		];
	}

	/**
	 * Register accordion widget controls.
	 *
	 * Adds different input fields to allow the user to change and customize the widget settings.
	 *
	 * @since 1.0.0
	 * @access protected
	 */
	protected function _register_controls() {
		$this->start_controls_section(
			'section_title',
			[
				'label' => __( 'Accordion', 'elementor' ),
			]
		);

		$this->add_control(
			'tabs',
			[
				'label' => __( 'Accordion Items', 'elementor' ),
				'type' => Controls_Manager::REPEATER,
				'default' => [
					[
						'tab_title' => __( 'Accordion #1', 'elementor' ),
						'tab_content' => __( 'I am item content. Click edit button to change this text. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut elit tellus, luctus nec ullamcorper mattis, pulvinar dapibus leo.', 'elementor' ),
					],
					[
						'tab_title' => __( 'Accordion #2', 'elementor' ),
						'tab_content' => __( 'I am item content. Click edit button to change this text. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut elit tellus, luctus nec ullamcorper mattis, pulvinar dapibus leo.', 'elementor' ),
					],
				],
				'fields' => [
					[
						'name' => 'tab_title',
						'label' => __( 'Title & Content', 'elementor' ),
						'type' => Controls_Manager::TEXT,
						'default' => __( 'Accordion Title' , 'elementor' ),
						'label_block' => true,
					],
					[
						'name' => 'tab_content',
						'label' => __( 'Content', 'elementor' ),
						'type' => Controls_Manager::WYSIWYG,
						'default' => __( 'Accordion Content', 'elementor' ),
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

		$this->end_controls_section();

		$this->start_controls_section(
			'section_title_style',
			[
				'label' => __( 'Accordion', 'elementor' ),
				'tab' => Controls_Manager::TAB_STYLE,
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
					'{{WRAPPER}} .elementor-accordion .elementor-accordion-item' => 'border-width: {{SIZE}}{{UNIT}};',
					'{{WRAPPER}} .elementor-accordion .elementor-tab-content' => 'border-width: {{SIZE}}{{UNIT}};',
					'{{WRAPPER}} .elementor-accordion .elementor-accordion-wrapper .elementor-tab-title.elementor-active > span' => 'border-width: {{SIZE}}{{UNIT}};',
				],
			]
		);

		$this->add_control(
			'border_color',
			[
				'label' => __( 'Border Color', 'elementor' ),
				'type' => Controls_Manager::COLOR,
				'selectors' => [
					'{{WRAPPER}} .elementor-accordion .elementor-accordion-item' => 'border-color: {{VALUE}};',
					'{{WRAPPER}} .elementor-accordion .elementor-tab-content' => 'border-top-color: {{VALUE}};',
					'{{WRAPPER}} .elementor-accordion .elementor-accordion-wrapper .elementor-tab-title.elementor-active > span' => 'border-bottom-color: {{VALUE}};',
				],
			]
		);

		$this->add_control(
			'heading_icon',
			[
				'label' => __( 'Icon', 'elementor' ),
				'type' => Controls_Manager::HEADING,
				'separator' => 'before',
			]
		);

		$this->add_control(
			'icon_align',
			[
				'label' => __( 'Alignment', 'elementor' ),
				'type' => Controls_Manager::SELECT,
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
			]
		);

		$this->add_control(
			'icon_color',
			[
				'label' => __( 'Color', 'elementor' ),
				'type' => Controls_Manager::COLOR,
				'selectors' => [
					'{{WRAPPER}} .elementor-accordion .elementor-tab-title .elementor-accordion-icon .fa:before' => 'color: {{VALUE}};',
				],
			]
		);

		$this->add_control(
			'icon',
			[
				'label' => __( 'Icon', 'elementor' ),
				'type' => Controls_Manager::ICON,
				'include' => self::get_arrow_icons(),
				'default' => 'fa fa-plus',
				'label_block' => true,
			]
		);

		$this->add_control(
			'icon_active',
			[
				'label' => __( 'Active Icon', 'elementor' ),
				'type' => Controls_Manager::ICON,
				'include' => self::get_arrow_icons(),
				'default' => 'fa fa-minus',
				'label_block' => true,
			]
		);

		$this->add_control(
			'heading_title',
			[
				'label' => __( 'Title', 'elementor' ),
				'type' => Controls_Manager::HEADING,
				'separator' => 'before',
			]
		);

		$this->add_control(
			'title_background',
			[
				'label' => __( 'Background', 'elementor' ),
				'type' => Controls_Manager::COLOR,
				'selectors' => [
					'{{WRAPPER}} .elementor-accordion .elementor-tab-title' => 'background-color: {{VALUE}};',
				],
			]
		);

		$this->add_control(
			'title_color',
			[
				'label' => __( 'Color', 'elementor' ),
				'type' => Controls_Manager::COLOR,
				'selectors' => [
					'{{WRAPPER}} .elementor-accordion .elementor-tab-title' => 'color: {{VALUE}};',
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
					'{{WRAPPER}} .elementor-accordion .elementor-tab-title.elementor-active' => 'color: {{VALUE}};',
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
				'selector' => '{{WRAPPER}} .elementor-accordion .elementor-tab-title',
				'scheme' => Scheme_Typography::TYPOGRAPHY_1,
			]
		);

		$this->add_control(
			'heading_content',
			[
				'label' => __( 'Content', 'elementor' ),
				'type' => Controls_Manager::HEADING,
				'separator' => 'before',
			]
		);

		$this->add_control(
			'content_background_color',
			[
				'label' => __( 'Background', 'elementor' ),
				'type' => Controls_Manager::COLOR,
				'selectors' => [
					'{{WRAPPER}} .elementor-accordion .elementor-tab-content' => 'background-color: {{VALUE}};',
				],
			]
		);

		$this->add_control(
			'content_color',
			[
				'label' => __( 'Color', 'elementor' ),
				'type' => Controls_Manager::COLOR,
				'selectors' => [
					'{{WRAPPER}} .elementor-accordion .elementor-tab-content' => 'color: {{VALUE}};',
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
				'selector' => '{{WRAPPER}} .elementor-accordion .elementor-tab-content',
				'scheme' => Scheme_Typography::TYPOGRAPHY_3,
			]
		);

		$this->end_controls_section();
	}

	/**
	 * Render accordion widget output on the frontend.
	 *
	 * Written in PHP and used to generate the final HTML.
	 *
	 * @since 1.0.0
	 * @access protected
	 */
	protected function render() {
		$settings = $this->get_settings();

		$id_int = substr( $this->get_id_int(), 0, 3 );

		// Backwards Compitability
		if ( ! isset( $settings['icon'] ) ) {
			$settings['icon'] = 'fa fa-plus';
		}
		if ( ! isset( $settings['icon_active'] ) ) {
			$settings['icon_active'] = 'fa fa-minus';
		}
		?>
		<div class="elementor-accordion" role="tablist">
			<?php foreach ( $settings['tabs'] as $index => $item ) :
				$tab_count = $index + 1;

				$tab_content_setting_key = $this->get_repeater_setting_key( 'tab_content', 'tabs', $index );

				$this->add_render_attribute( $tab_content_setting_key, [
					'class' => [ 'elementor-tab-content', 'elementor-clearfix' ],
					'data-tab' => $tab_count,
					'role' => 'tabpanel',
				] );

				$this->add_inline_editing_attributes( $tab_content_setting_key, 'advanced' );
				?>
				<div class="elementor-accordion-item">
					<div class="elementor-tab-title" tabindex="<?php echo $id_int . $tab_count; ?>" data-tab="<?php echo $tab_count; ?>" role="tab">
						<span class="elementor-accordion-icon elementor-accordion-icon-<?php echo $settings['icon_align']; ?>" aria-hidden="true">
							<i class="elementor-accordion-icon-closed <?php echo $settings['icon']; ?>"></i>
							<i class="elementor-accordion-icon-opened <?php echo $settings['icon_active']; ?>"></i>
						</span>
						<?php echo $item['tab_title']; ?>
					</div>
					<div <?php echo $this->get_render_attribute_string( $tab_content_setting_key ); ?>><?php echo $this->parse_text_editor( $item['tab_content'] ); ?></div>
				</div>
			<?php endforeach; ?>
		</div>
		<?php
	}

	/**
	 * Render accordion widget output in the editor.
	 *
	 * Written as a Backbone JavaScript template and used to generate the live preview.
	 *
	 * @since 1.0.0
	 * @access protected
	 */
	protected function _content_template() {
		?>
		<div class="elementor-accordion" role="tablist">
			<#
			// Backwards Compitability
			if ( '' === settings.icon ) {
				settings.icon = 'fa fa-plus';
			}
			if ( '' === settings.icon_active ) {
				settings.icon_active = 'fa fa-minus';
			}

			if ( settings.tabs ) {
				var tabindex = view.getIDInt().toString().substr( 0, 3 );

				_.each( settings.tabs, function( item, index ) {
					var tabCount = index + 1,
						tabContentKey = view.getRepeaterSettingKey( 'tab_content', 'tabs', index );

					view.addRenderAttribute( tabContentKey, {
						'class': [ 'elementor-tab-content', 'elementor-clearfix' ],
						'data-tab': tabCount,
						'role': 'tabpanel'
					} );

					view.addInlineEditingAttributes( tabContentKey, 'advanced' );
					#>
					<div class="elementor-accordion-item">
						<div class="elementor-tab-title" tabindex="{{ tabindex + tabCount }}" data-tab="{{ tabCount }}" role="tab">
							<span class="elementor-accordion-icon elementor-accordion-icon-{{ settings.icon_align }}" aria-hidden="true">
								<i class="elementor-accordion-icon-closed {{ settings.icon }}"></i>
								<i class="elementor-accordion-icon-opened {{ settings.icon_active }}"></i>
							</span>
							{{{ item.tab_title }}}
						</div>
						<div {{{ view.getRenderAttributeString( tabContentKey ) }}}>{{{ item.tab_content }}}</div>
					</div>
				<#
				} );
			} #>
		</div>
		<?php
	}
}
