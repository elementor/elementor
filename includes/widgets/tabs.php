<?php
namespace Elementor;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

use Elementor\Core\Kits\Documents\Tabs\Global_Colors;
use Elementor\Core\Kits\Documents\Tabs\Global_Typography;

/**
 * Elementor tabs widget.
 *
 * Elementor widget that displays vertical or horizontal tabs with different
 * pieces of content.
 *
 * @since 1.0.0
 */
class Widget_Tabs extends Widget_Base {

	/**
	 * Get widget name.
	 *
	 * Retrieve tabs widget name.
	 *
	 * @since 1.0.0
	 * @access public
	 *
	 * @return string Widget name.
	 */
	public function get_name() {
		return 'tabs';
	}

	/**
	 * Get widget title.
	 *
	 * Retrieve tabs widget title.
	 *
	 * @since 1.0.0
	 * @access public
	 *
	 * @return string Widget title.
	 */
	public function get_title() {
		return esc_html__( 'Tabs', 'elementor' );
	}

	/**
	 * Get widget icon.
	 *
	 * Retrieve tabs widget icon.
	 *
	 * @since 1.0.0
	 * @access public
	 *
	 * @return string Widget icon.
	 */
	public function get_icon() {
		return 'eicon-tabs';
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
		return array( 'tabs', 'accordion', 'toggle' );
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
		return array( 'widget-tabs' );
	}

	public function show_in_panel(): bool {
		return ! Plugin::$instance->experiments->is_feature_active( 'nested-elements', true );
	}

	public function has_widget_inner_wrapper(): bool {
		return ! Plugin::$instance->experiments->is_feature_active( 'e_optimized_markup' );
	}

	/**
	 * Register tabs widget controls.
	 *
	 * Adds different input fields to allow the user to change and customize the widget settings.
	 *
	 * @since 3.1.0
	 * @access protected
	 */
	protected function register_controls() {
		$start = is_rtl() ? 'end' : 'start';
		$end = is_rtl() ? 'start' : 'end';

		$this->start_controls_section(
			'section_tabs',
			array(
				'label' => esc_html__( 'Tabs', 'elementor' ),
			)
		);

		$repeater = new Repeater();

		$repeater->add_control(
			'tab_title',
			array(
				'label' => esc_html__( 'Title', 'elementor' ),
				'type' => Controls_Manager::TEXT,
				'default' => esc_html__( 'Tab Title', 'elementor' ),
				'placeholder' => esc_html__( 'Tab Title', 'elementor' ),
				'label_block' => true,
				'dynamic' => array(
					'active' => true,
				),
			)
		);

		$repeater->add_control(
			'tab_content',
			array(
				'label' => esc_html__( 'Content', 'elementor' ),
				'default' => esc_html__( 'Tab Content', 'elementor' ),
				'placeholder' => esc_html__( 'Tab Content', 'elementor' ),
				'type' => Controls_Manager::WYSIWYG,
			)
		);

		$is_nested_tabs_active = Plugin::$instance->widgets_manager->get_widget_types( 'nested-tabs' );

		if ( $is_nested_tabs_active ) {
			$this->add_deprecation_message(
				'3.8.0',
				esc_html__(
					'You are currently editing a Tabs Widget in its old version. Any new tabs widget dragged into the canvas will be the new Tab widget, with the improved Nested capabilities.',
					'elementor'
				),
				'nested-tabs'
			);
		}

		$this->add_control(
			'tabs',
			array(
				'label' => esc_html__( 'Tabs Items', 'elementor' ),
				'type' => Controls_Manager::REPEATER,
				'fields' => $repeater->get_controls(),
				'default' => array(
					array(
						'tab_title' => esc_html__( 'Tab #1', 'elementor' ),
						'tab_content' => esc_html__( 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut elit tellus, luctus nec ullamcorper mattis, pulvinar dapibus leo.', 'elementor' ),
					),
					array(
						'tab_title' => esc_html__( 'Tab #2', 'elementor' ),
						'tab_content' => esc_html__( 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut elit tellus, luctus nec ullamcorper mattis, pulvinar dapibus leo.', 'elementor' ),
					),
				),
				'title_field' => '{{{ tab_title }}}',
			)
		);

		$this->add_control(
			'type',
			array(
				'label' => esc_html__( 'Position', 'elementor' ),
				'type' => Controls_Manager::CHOOSE,
				'default' => 'horizontal',
				'options' => array(
					'vertical' => array(
						'title' => esc_html__( 'Vertical', 'elementor' ),
						'icon' => 'eicon-h-align-' . ( is_rtl() ? 'right' : 'left' ),
					),
					'horizontal' => array(
						'title' => esc_html__( 'Horizontal', 'elementor' ),
						'icon' => 'eicon-v-align-top',
					),
				),
				'prefix_class' => 'elementor-tabs-view-',
				'separator' => 'before',
			)
		);

		$this->add_control(
			'tabs_align_horizontal',
			array(
				'label' => esc_html__( 'Alignment', 'elementor' ),
				'type' => Controls_Manager::CHOOSE,
				'options' => array(
					'' => array(
						'title' => esc_html__( 'Start', 'elementor' ),
						'icon' => "eicon-align-$start-h",
					),
					'center' => array(
						'title' => esc_html__( 'Center', 'elementor' ),
						'icon' => 'eicon-align-center-h',
					),
					'end' => array(
						'title' => esc_html__( 'End', 'elementor' ),
						'icon' => "eicon-align-$end-h",
					),
					'stretch' => array(
						'title' => esc_html__( 'Stretch', 'elementor' ),
						'icon' => 'eicon-align-stretch-h',
					),
				),
				'prefix_class' => 'elementor-tabs-alignment-',
				'condition' => array(
					'type' => 'horizontal',
				),
			)
		);

		$this->add_control(
			'tabs_align_vertical',
			array(
				'label' => esc_html__( 'Alignment', 'elementor' ),
				'type' => Controls_Manager::CHOOSE,
				'options' => array(
					'' => array(
						'title' => esc_html__( 'Start', 'elementor' ),
						'icon' => 'eicon-align-start-v',
					),
					'center' => array(
						'title' => esc_html__( 'Center', 'elementor' ),
						'icon' => 'eicon-align-center-v',
					),
					'end' => array(
						'title' => esc_html__( 'End', 'elementor' ),
						'icon' => 'eicon-align-end-v',
					),
					'stretch' => array(
						'title' => esc_html__( 'Stretch', 'elementor' ),
						'icon' => 'eicon-align-stretch-v',
					),
				),
				'prefix_class' => 'elementor-tabs-alignment-',
				'condition' => array(
					'type' => 'vertical',
				),
			)
		);

		$this->end_controls_section();

		$this->start_controls_section(
			'section_tabs_style',
			array(
				'label' => esc_html__( 'Tabs', 'elementor' ),
				'tab' => Controls_Manager::TAB_STYLE,
			)
		);

		$this->add_control(
			'navigation_width',
			array(
				'label' => esc_html__( 'Navigation Width', 'elementor' ),
				'type' => Controls_Manager::SLIDER,
				'size_units' => array( 'px', '%', 'em', 'rem', 'custom' ),
				'default' => array(
					'unit' => '%',
				),
				'range' => array(
					'px' => array(
						'min' => 10,
						'max' => 500,
					),
					'%' => array(
						'min' => 10,
						'max' => 50,
					),
					'em' => array(
						'min' => 1,
						'max' => 50,
					),
					'rem' => array(
						'min' => 1,
						'max' => 50,
					),
				),
				'selectors' => array(
					'{{WRAPPER}} .elementor-tabs-wrapper' => 'width: {{SIZE}}{{UNIT}}',
				),
				'condition' => array(
					'type' => 'vertical',
				),
			)
		);

		$this->add_control(
			'border_width',
			array(
				'label' => esc_html__( 'Border Width', 'elementor' ),
				'type' => Controls_Manager::SLIDER,
				'size_units' => array( 'px', '%', 'em', 'rem', 'vw', 'custom' ),
				'default' => array(
					'size' => 1,
				),
				'range' => array(
					'px' => array(
						'max' => 20,
					),
					'em' => array(
						'max' => 2,
					),
				),
				'selectors' => array(
					'{{WRAPPER}} .elementor-tab-title, {{WRAPPER}} .elementor-tab-title:before, {{WRAPPER}} .elementor-tab-title:after, {{WRAPPER}} .elementor-tab-content, {{WRAPPER}} .elementor-tabs-content-wrapper' => 'border-width: {{SIZE}}{{UNIT}};',
				),
			)
		);

		$this->add_control(
			'border_color',
			array(
				'label' => esc_html__( 'Border Color', 'elementor' ),
				'type' => Controls_Manager::COLOR,
				'selectors' => array(
					'{{WRAPPER}} .elementor-tab-mobile-title, {{WRAPPER}} .elementor-tab-desktop-title.elementor-active, {{WRAPPER}} .elementor-tab-title:before, {{WRAPPER}} .elementor-tab-title:after, {{WRAPPER}} .elementor-tab-content, {{WRAPPER}} .elementor-tabs-content-wrapper' => 'border-color: {{VALUE}};',
				),
			)
		);

		$this->add_control(
			'background_color',
			array(
				'label' => esc_html__( 'Background Color', 'elementor' ),
				'type' => Controls_Manager::COLOR,
				'selectors' => array(
					'{{WRAPPER}} .elementor-tab-desktop-title.elementor-active' => 'background-color: {{VALUE}};',
					'{{WRAPPER}} .elementor-tabs-content-wrapper' => 'background-color: {{VALUE}};',
				),
			)
		);

		$this->add_control(
			'heading_title',
			array(
				'label' => esc_html__( 'Title', 'elementor' ),
				'type' => Controls_Manager::HEADING,
				'separator' => 'before',
			)
		);

		$this->add_control(
			'tab_color',
			array(
				'label' => esc_html__( 'Color', 'elementor' ),
				'type' => Controls_Manager::COLOR,
				'selectors' => array(
					'{{WRAPPER}} .elementor-tab-title, {{WRAPPER}} .elementor-tab-title a' => 'color: {{VALUE}}',
				),
				'global' => array(
					'default' => Global_Colors::COLOR_PRIMARY,
				),
			)
		);

		$this->add_control(
			'tab_active_color',
			array(
				'label' => esc_html__( 'Active Color', 'elementor' ),
				'type' => Controls_Manager::COLOR,
				'selectors' => array(
					'{{WRAPPER}} .elementor-tab-title.elementor-active,
					 {{WRAPPER}} .elementor-tab-title.elementor-active a' => 'color: {{VALUE}}',
				),
				'global' => array(
					'default' => Global_Colors::COLOR_ACCENT,
				),
			)
		);

		$this->add_group_control(
			Group_Control_Typography::get_type(),
			array(
				'name' => 'tab_typography',
				'selector' => '{{WRAPPER}} .elementor-tab-title',
				'global' => array(
					'default' => Global_Typography::TYPOGRAPHY_PRIMARY,
				),
			)
		);

		$this->add_group_control(
			Group_Control_Text_Stroke::get_type(),
			array(
				'name' => 'text_stroke',
				'selector' => '{{WRAPPER}} .elementor-tab-title',
			)
		);

		$this->add_group_control(
			Group_Control_Text_Shadow::get_type(),
			array(
				'name' => 'title_shadow',
				'selector' => '{{WRAPPER}} .elementor-tab-title',
			)
		);

		$this->add_control(
			'title_align',
			array(
				'label' => esc_html__( 'Alignment', 'elementor' ),
				'type' => Controls_Manager::CHOOSE,
				'options' => array(
					'left' => array(
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
				'selectors' => array(
					'{{WRAPPER}} .elementor-tab-title' => 'text-align: {{VALUE}};',
				),
				'condition' => array(
					'tabs_align' => 'stretch',
				),
			)
		);

		$this->add_control(
			'heading_content',
			array(
				'label' => esc_html__( 'Content', 'elementor' ),
				'type' => Controls_Manager::HEADING,
				'separator' => 'before',
			)
		);

		$this->add_control(
			'content_color',
			array(
				'label' => esc_html__( 'Color', 'elementor' ),
				'type' => Controls_Manager::COLOR,
				'selectors' => array(
					'{{WRAPPER}} .elementor-tab-content' => 'color: {{VALUE}};',
				),
				'global' => array(
					'default' => Global_Colors::COLOR_TEXT,
				),
			)
		);

		$this->add_group_control(
			Group_Control_Typography::get_type(),
			array(
				'name' => 'content_typography',
				'selector' => '{{WRAPPER}} .elementor-tab-content',
				'global' => array(
					'default' => Global_Typography::TYPOGRAPHY_TEXT,
				),
			)
		);

		$this->add_group_control(
			Group_Control_Text_Shadow::get_type(),
			array(
				'name' => 'content_shadow',
				'selector' => '{{WRAPPER}} .elementor-tab-content',
			)
		);

		$this->end_controls_section();
	}

	/**
	 * Render tabs widget output on the frontend.
	 *
	 * Written in PHP and used to generate the final HTML.
	 *
	 * @since 1.0.0
	 * @access protected
	 */
	protected function render() {
		$tabs = $this->get_settings_for_display( 'tabs' );

		$id_int = substr( $this->get_id_int(), 0, 3 );

		$this->add_render_attribute( 'elementor-tabs', 'class', 'elementor-tabs' );

		?>
		<div <?php $this->print_render_attribute_string( 'elementor-tabs' ); ?>>
			<div class="elementor-tabs-wrapper" role="tablist" >
				<?php
				foreach ( $tabs as $index => $item ) :
					$tab_count = $index + 1;
					$tab_title_setting_key = $this->get_repeater_setting_key( 'tab_title', 'tabs', $index );

					$this->add_render_attribute( $tab_title_setting_key, array(
						'id' => 'elementor-tab-title-' . $id_int . $tab_count,
						'class' => array( 'elementor-tab-title', 'elementor-tab-desktop-title' ),
						'aria-selected' => 1 === $tab_count ? 'true' : 'false',
						'data-tab' => $tab_count,
						'role' => 'tab',
						'tabindex' => 1 === $tab_count ? '0' : '-1',
						'aria-controls' => 'elementor-tab-content-' . $id_int . $tab_count,
						'aria-expanded' => 'false',
					) );
					?>
					<div <?php $this->print_render_attribute_string( $tab_title_setting_key ); ?>><?php
						// PHPCS - the main text of a widget should not be escaped.
						echo $item['tab_title']; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
					?></div>
				<?php endforeach; ?>
			</div>
			<div class="elementor-tabs-content-wrapper" role="tablist" aria-orientation="vertical">
				<?php
				foreach ( $tabs as $index => $item ) :
					$tab_count = $index + 1;
					$hidden = 1 === $tab_count ? 'false' : 'hidden';
					$tab_content_setting_key = $this->get_repeater_setting_key( 'tab_content', 'tabs', $index );

					$tab_title_mobile_setting_key = $this->get_repeater_setting_key( 'tab_title_mobile', 'tabs', $tab_count );

					$this->add_render_attribute( $tab_content_setting_key, array(
						'id' => 'elementor-tab-content-' . $id_int . $tab_count,
						'class' => array( 'elementor-tab-content', 'elementor-clearfix' ),
						'data-tab' => $tab_count,
						'role' => 'tabpanel',
						'aria-labelledby' => 'elementor-tab-title-' . $id_int . $tab_count,
						'tabindex' => '0',
						'hidden' => $hidden,
					) );

					$this->add_render_attribute( $tab_title_mobile_setting_key, array(
						'class' => array( 'elementor-tab-title', 'elementor-tab-mobile-title' ),
						'aria-selected' => 1 === $tab_count ? 'true' : 'false',
						'data-tab' => $tab_count,
						'role' => 'tab',
						'tabindex' => 1 === $tab_count ? '0' : '-1',
						'aria-controls' => 'elementor-tab-content-' . $id_int . $tab_count,
						'aria-expanded' => 'false',
					) );

					$this->add_inline_editing_attributes( $tab_content_setting_key, 'advanced' );
					?>
					<div <?php $this->print_render_attribute_string( $tab_title_mobile_setting_key ); ?>><?php
						$this->print_unescaped_setting( 'tab_title', 'tabs', $index );
					?></div>
					<div <?php $this->print_render_attribute_string( $tab_content_setting_key ); ?>><?php
						$this->print_text_editor( $item['tab_content'] );
					?></div>
				<?php endforeach; ?>
			</div>
		</div>
		<?php
	}

	/**
	 * Render tabs widget output in the editor.
	 *
	 * Written as a Backbone JavaScript template and used to generate the live preview.
	 *
	 * @since 2.9.0
	 * @access protected
	 */
	protected function content_template() {
		?>
		<div class="elementor-tabs" role="tablist" aria-orientation="vertical">
			<# if ( settings.tabs ) {
				var elementUid = view.getIDInt().toString().substr( 0, 3 ); #>
				<div class="elementor-tabs-wrapper" role="tablist">
					<# _.each( settings.tabs, function( item, index ) {
						var tabCount = index + 1,
							tabUid = elementUid + tabCount,
							tabTitleKey = 'tab-title-' + tabUid;

					view.addRenderAttribute( tabTitleKey, {
						'id': 'elementor-tab-title-' + tabUid,
						'class': [ 'elementor-tab-title','elementor-tab-desktop-title' ],
						'data-tab': tabCount,
						'role': 'tab',
						'tabindex': 1 === tabCount ? '0' : '-1',
						'aria-controls': 'elementor-tab-content-' + tabUid,
						'aria-expanded': 'false',
						} );
					#>
						<div {{{ view.getRenderAttributeString( tabTitleKey ) }}}>{{{ item.tab_title }}}</div>
					<# } ); #>
				</div>
				<div class="elementor-tabs-content-wrapper">
					<# _.each( settings.tabs, function( item, index ) {
						var tabCount = index + 1,
							tabContentKey = view.getRepeaterSettingKey( 'tab_content', 'tabs',index );

						view.addRenderAttribute( tabContentKey, {
							'id': 'elementor-tab-content-' + elementUid + tabCount,
							'class': [ 'elementor-tab-content', 'elementor-clearfix', 'elementor-repeater-item-' + item._id ],
							'data-tab': tabCount,
							'role' : 'tabpanel',
							'aria-labelledby' : 'elementor-tab-title-' + elementUid + tabCount
						} );

						view.addInlineEditingAttributes( tabContentKey, 'advanced' ); #>
						<div class="elementor-tab-title elementor-tab-mobile-title" data-tab="{{ tabCount }}" role="tab">{{{ item.tab_title }}}</div>
						<div {{{ view.getRenderAttributeString( tabContentKey ) }}}>{{{ item.tab_content }}}</div>
					<# } ); #>
				</div>
			<# } #>
		</div>
		<?php
	}
}
