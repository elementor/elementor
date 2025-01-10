<?php
namespace Elementor;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

use Elementor\Core\Kits\Documents\Tabs\Global_Colors;
use Elementor\Core\Kits\Documents\Tabs\Global_Typography;

/**
 * Elementor icon list widget.
 *
 * Elementor widget that displays a bullet list with any chosen icons and texts.
 *
 * @since 1.0.0
 */
class Widget_Icon_List extends Widget_Base {

	/**
	 * Get widget name.
	 *
	 * Retrieve icon list widget name.
	 *
	 * @since 1.0.0
	 * @access public
	 *
	 * @return string Widget name.
	 */
	public function get_name() {
		return 'icon-list';
	}

	/**
	 * Get widget title.
	 *
	 * Retrieve icon list widget title.
	 *
	 * @since 1.0.0
	 * @access public
	 *
	 * @return string Widget title.
	 */
	public function get_title() {
		return esc_html__( 'Icon List', 'elementor' );
	}

	/**
	 * Get widget icon.
	 *
	 * Retrieve icon list widget icon.
	 *
	 * @since 1.0.0
	 * @access public
	 *
	 * @return string Widget icon.
	 */
	public function get_icon() {
		return 'eicon-bullet-list';
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
		return array( 'icon list', 'icon', 'list' );
	}

	protected function is_dynamic_content(): bool {
		return false;
	}

	public function has_widget_inner_wrapper(): bool {
		return ! Plugin::$instance->experiments->is_feature_active( 'e_optimized_markup' );
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
		return array( 'widget-icon-list' );
	}

	/**
	 * Register icon list widget controls.
	 *
	 * Adds different input fields to allow the user to change and customize the widget settings.
	 *
	 * @since 3.1.0
	 * @access protected
	 */
	protected function register_controls() {
		$this->start_controls_section(
			'section_icon',
			array(
				'label' => esc_html__( 'Icon List', 'elementor' ),
			)
		);

		$this->add_control(
			'view',
			array(
				'label' => esc_html__( 'Layout', 'elementor' ),
				'type' => Controls_Manager::CHOOSE,
				'default' => 'traditional',
				'options' => array(
					'traditional' => array(
						'title' => esc_html__( 'Default', 'elementor' ),
						'icon' => 'eicon-editor-list-ul',
					),
					'inline' => array(
						'title' => esc_html__( 'Inline', 'elementor' ),
						'icon' => 'eicon-ellipsis-h',
					),
				),
				'render_type' => 'template',
				'classes' => 'elementor-control-start-end',
				'style_transfer' => true,
				'prefix_class' => 'elementor-icon-list--layout-',
			)
		);

		$repeater = new Repeater();

		$repeater->add_control(
			'text',
			array(
				'label' => esc_html__( 'Text', 'elementor' ),
				'type' => Controls_Manager::TEXT,
				'label_block' => true,
				'placeholder' => esc_html__( 'List Item', 'elementor' ),
				'default' => esc_html__( 'List Item', 'elementor' ),
				'dynamic' => array(
					'active' => true,
				),
			)
		);

		$repeater->add_control(
			'selected_icon',
			array(
				'label' => esc_html__( 'Icon', 'elementor' ),
				'type' => Controls_Manager::ICONS,
				'default' => array(
					'value' => 'fas fa-check',
					'library' => 'fa-solid',
				),
				'fa4compatibility' => 'icon',
			)
		);

		$repeater->add_control(
			'link',
			array(
				'label' => esc_html__( 'Link', 'elementor' ),
				'type' => Controls_Manager::URL,
				'dynamic' => array(
					'active' => true,
				),
			)
		);

		$this->add_control(
			'icon_list',
			array(
				'label' => esc_html__( 'Items', 'elementor' ),
				'type' => Controls_Manager::REPEATER,
				'fields' => $repeater->get_controls(),
				'default' => array(
					array(
						'text' => esc_html__( 'List Item #1', 'elementor' ),
						'selected_icon' => array(
							'value' => 'fas fa-check',
							'library' => 'fa-solid',
						),
					),
					array(
						'text' => esc_html__( 'List Item #2', 'elementor' ),
						'selected_icon' => array(
							'value' => 'fas fa-times',
							'library' => 'fa-solid',
						),
					),
					array(
						'text' => esc_html__( 'List Item #3', 'elementor' ),
						'selected_icon' => array(
							'value' => 'fas fa-dot-circle',
							'library' => 'fa-solid',
						),
					),
				),
				'title_field' => '{{{ elementor.helpers.renderIcon( this, selected_icon, {}, "i", "panel" ) || \'<i class="{{ icon }}" aria-hidden="true"></i>\' }}} {{{ text }}}',
			)
		);

		$this->add_control(
			'link_click',
			array(
				'label' => esc_html__( 'Apply Link On', 'elementor' ),
				'type' => Controls_Manager::SELECT,
				'options' => array(
					'full_width' => esc_html__( 'Full Width', 'elementor' ),
					'inline' => esc_html__( 'Inline', 'elementor' ),
				),
				'default' => 'full_width',
				'separator' => 'before',
				'prefix_class' => 'elementor-list-item-link-',
			)
		);

		$this->end_controls_section();

		$this->start_controls_section(
			'section_icon_list',
			array(
				'label' => esc_html__( 'List', 'elementor' ),
				'tab' => Controls_Manager::TAB_STYLE,
			)
		);

		$this->add_responsive_control(
			'space_between',
			array(
				'label' => esc_html__( 'Space Between', 'elementor' ),
				'type' => Controls_Manager::SLIDER,
				'size_units' => array( 'px', 'em', 'rem', 'custom' ),
				'range' => array(
					'px' => array(
						'max' => 50,
					),
				),
				'selectors' => array(
					'{{WRAPPER}} .elementor-icon-list-items:not(.elementor-inline-items) .elementor-icon-list-item:not(:last-child)' => 'padding-bottom: calc({{SIZE}}{{UNIT}}/2)',
					'{{WRAPPER}} .elementor-icon-list-items:not(.elementor-inline-items) .elementor-icon-list-item:not(:first-child)' => 'margin-top: calc({{SIZE}}{{UNIT}}/2)',
					'{{WRAPPER}} .elementor-icon-list-items.elementor-inline-items .elementor-icon-list-item' => 'margin-right: calc({{SIZE}}{{UNIT}}/2); margin-left: calc({{SIZE}}{{UNIT}}/2)',
					'{{WRAPPER}} .elementor-icon-list-items.elementor-inline-items' => 'margin-right: calc(-{{SIZE}}{{UNIT}}/2); margin-left: calc(-{{SIZE}}{{UNIT}}/2)',
					'body.rtl {{WRAPPER}} .elementor-icon-list-items.elementor-inline-items .elementor-icon-list-item:after' => 'left: calc(-{{SIZE}}{{UNIT}}/2)',
					'body:not(.rtl) {{WRAPPER}} .elementor-icon-list-items.elementor-inline-items .elementor-icon-list-item:after' => 'right: calc(-{{SIZE}}{{UNIT}}/2)',
				),
			)
		);

		$this->add_responsive_control(
			'icon_align',
			array(
				'label' => esc_html__( 'Alignment', 'elementor' ),
				'type' => Controls_Manager::CHOOSE,
				'options' => array(
					'left' => array(
						'title' => esc_html__( 'Left', 'elementor' ),
						'icon' => 'eicon-h-align-left',
					),
					'center' => array(
						'title' => esc_html__( 'Center', 'elementor' ),
						'icon' => 'eicon-h-align-center',
					),
					'right' => array(
						'title' => esc_html__( 'Right', 'elementor' ),
						'icon' => 'eicon-h-align-right',
					),
				),
				'prefix_class' => 'elementor%s-align-',
			)
		);

		$this->add_control(
			'divider',
			array(
				'label' => esc_html__( 'Divider', 'elementor' ),
				'type' => Controls_Manager::SWITCHER,
				'label_off' => esc_html__( 'Off', 'elementor' ),
				'label_on' => esc_html__( 'On', 'elementor' ),
				'selectors' => array(
					'{{WRAPPER}} .elementor-icon-list-item:not(:last-child):after' => 'content: ""',
				),
				'separator' => 'before',
			)
		);

		$this->add_control(
			'divider_style',
			array(
				'label' => esc_html__( 'Style', 'elementor' ),
				'type' => Controls_Manager::SELECT,
				'options' => array(
					'solid' => esc_html__( 'Solid', 'elementor' ),
					'double' => esc_html__( 'Double', 'elementor' ),
					'dotted' => esc_html__( 'Dotted', 'elementor' ),
					'dashed' => esc_html__( 'Dashed', 'elementor' ),
				),
				'default' => 'solid',
				'condition' => array(
					'divider' => 'yes',
				),
				'selectors' => array(
					'{{WRAPPER}} .elementor-icon-list-items:not(.elementor-inline-items) .elementor-icon-list-item:not(:last-child):after' => 'border-top-style: {{VALUE}}',
					'{{WRAPPER}} .elementor-icon-list-items.elementor-inline-items .elementor-icon-list-item:not(:last-child):after' => 'border-left-style: {{VALUE}}',
				),
			)
		);

		$this->add_control(
			'divider_weight',
			array(
				'label' => esc_html__( 'Weight', 'elementor' ),
				'type' => Controls_Manager::SLIDER,
				'size_units' => array( 'px', 'em', 'rem', 'custom' ),
				'default' => array(
					'size' => 1,
				),
				'range' => array(
					'px' => array(
						'min' => 1,
						'max' => 20,
					),
				),
				'condition' => array(
					'divider' => 'yes',
				),
				'selectors' => array(
					'{{WRAPPER}} .elementor-icon-list-items:not(.elementor-inline-items) .elementor-icon-list-item:not(:last-child):after' => 'border-top-width: {{SIZE}}{{UNIT}}',
					'{{WRAPPER}} .elementor-inline-items .elementor-icon-list-item:not(:last-child):after' => 'border-left-width: {{SIZE}}{{UNIT}}',
				),
			)
		);

		$this->add_control(
			'divider_width',
			array(
				'label' => esc_html__( 'Width', 'elementor' ),
				'type' => Controls_Manager::SLIDER,
				'size_units' => array( 'px', '%', 'em', 'rem', 'vw', 'custom' ),
				'default' => array(
					'unit' => '%',
				),
				'condition' => array(
					'divider' => 'yes',
					'view!' => 'inline',
				),
				'selectors' => array(
					'{{WRAPPER}} .elementor-icon-list-item:not(:last-child):after' => 'width: {{SIZE}}{{UNIT}}',
				),
			)
		);

		$this->add_control(
			'divider_height',
			array(
				'label' => esc_html__( 'Height', 'elementor' ),
				'type' => Controls_Manager::SLIDER,
				'size_units' => array( 'px', '%', 'em', 'rem', 'vh', 'custom' ),
				'default' => array(
					'unit' => '%',
				),
				'range' => array(
					'px' => array(
						'min' => 1,
						'max' => 100,
					),
					'%' => array(
						'min' => 1,
						'max' => 100,
					),
					'vh' => array(
						'min' => 1,
						'max' => 100,
					),
				),
				'condition' => array(
					'divider' => 'yes',
					'view' => 'inline',
				),
				'selectors' => array(
					'{{WRAPPER}} .elementor-icon-list-item:not(:last-child):after' => 'height: {{SIZE}}{{UNIT}}',
				),
			)
		);

		$this->add_control(
			'divider_color',
			array(
				'label' => esc_html__( 'Color', 'elementor' ),
				'type' => Controls_Manager::COLOR,
				'default' => '#ddd',
				'global' => array(
					'default' => Global_Colors::COLOR_TEXT,
				),
				'condition' => array(
					'divider' => 'yes',
				),
				'selectors' => array(
					'{{WRAPPER}} .elementor-icon-list-item:not(:last-child):after' => 'border-color: {{VALUE}}',
				),
			)
		);

		$this->end_controls_section();

		$this->start_controls_section(
			'section_icon_style',
			array(
				'label' => esc_html__( 'Icon', 'elementor' ),
				'tab' => Controls_Manager::TAB_STYLE,
			)
		);

		$this->start_controls_tabs( 'icon_colors' );

		$this->start_controls_tab(
			'icon_colors_normal',
			array(
				'label' => esc_html__( 'Normal', 'elementor' ),
			)
		);

		$this->add_control(
			'icon_color',
			array(
				'label' => esc_html__( 'Color', 'elementor' ),
				'type' => Controls_Manager::COLOR,
				'default' => '',
				'selectors' => array(
					'{{WRAPPER}} .elementor-icon-list-icon i' => 'color: {{VALUE}};',
					'{{WRAPPER}} .elementor-icon-list-icon svg' => 'fill: {{VALUE}};',
				),
				'global' => array(
					'default' => Global_Colors::COLOR_PRIMARY,
				),
			)
		);

		$this->end_controls_tab();

		$this->start_controls_tab(
			'icon_colors_hover',
			array(
				'label' => esc_html__( 'Hover', 'elementor' ),
			)
		);

		$this->add_control(
			'icon_color_hover',
			array(
				'label' => esc_html__( 'Color', 'elementor' ),
				'type' => Controls_Manager::COLOR,
				'default' => '',
				'selectors' => array(
					'{{WRAPPER}} .elementor-icon-list-item:hover .elementor-icon-list-icon i' => 'color: {{VALUE}};',
					'{{WRAPPER}} .elementor-icon-list-item:hover .elementor-icon-list-icon svg' => 'fill: {{VALUE}};',
				),
			)
		);

		$this->add_control(
			'icon_color_hover_transition',
			array(
				'label' => esc_html__( 'Transition Duration', 'elementor' ),
				'type' => Controls_Manager::SLIDER,
				'size_units' => array( 's', 'ms', 'custom' ),
				'default' => array(
					'unit' => 's',
					'size' => 0.3,
				),
				'selectors' => array(
					'{{WRAPPER}} .elementor-icon-list-icon i' => 'transition: color {{SIZE}}{{UNIT}}',
					'{{WRAPPER}} .elementor-icon-list-icon svg' => 'transition: fill {{SIZE}}{{UNIT}}',
				),
			)
		);

		$this->end_controls_tab();

		$this->end_controls_tabs();

		$this->add_responsive_control(
			'icon_size',
			array(
				'label' => esc_html__( 'Size', 'elementor' ),
				'type' => Controls_Manager::SLIDER,
				'size_units' => array( 'px', '%', 'em', 'rem', 'vw', 'custom' ),
				'default' => array(
					'size' => 14,
				),
				'range' => array(
					'px' => array(
						'min' => 6,
					),
					'%' => array(
						'min' => 6,
					),
					'vw' => array(
						'min' => 6,
					),
				),
				'separator' => 'before',
				'selectors' => array(
					'{{WRAPPER}}' => '--e-icon-list-icon-size: {{SIZE}}{{UNIT}};',
				),
			)
		);

		$this->add_control(
			'text_indent',
			array(
				'label' => esc_html__( 'Gap', 'elementor' ),
				'type' => Controls_Manager::SLIDER,
				'size_units' => array( 'px', '%', 'em', 'rem', 'vw', 'custom' ),
				'range' => array(
					'px' => array(
						'max' => 50,
					),
				),
				'separator' => 'after',
				'selectors' => array(
					'{{WRAPPER}} .elementor-icon-list-icon' => is_rtl() ? 'padding-left: {{SIZE}}{{UNIT}};' : 'padding-right: {{SIZE}}{{UNIT}};',
				),
			)
		);

		$e_icon_list_icon_css_var = 'var(--e-icon-list-icon-size, 1em)';
		$e_icon_list_icon_align_left = sprintf( '0 calc(%s * 0.25) 0 0', $e_icon_list_icon_css_var );
		$e_icon_list_icon_align_center = sprintf( '0 calc(%s * 0.125)', $e_icon_list_icon_css_var );
		$e_icon_list_icon_align_right = sprintf( '0 0 0 calc(%s * 0.25)', $e_icon_list_icon_css_var );

		$this->add_responsive_control(
			'icon_self_align',
			array(
				'label' => esc_html__( 'Horizontal Alignment', 'elementor' ),
				'type' => Controls_Manager::CHOOSE,
				'options' => array(
					'left' => array(
						'title' => esc_html__( 'Left', 'elementor' ),
						'icon' => 'eicon-h-align-left',
					),
					'center' => array(
						'title' => esc_html__( 'Center', 'elementor' ),
						'icon' => 'eicon-h-align-center',
					),
					'right' => array(
						'title' => esc_html__( 'Right', 'elementor' ),
						'icon' => 'eicon-h-align-right',
					),
				),
				'default' => '',
				'selectors_dictionary' => array(
					'left' => sprintf( '--e-icon-list-icon-align: left; --e-icon-list-icon-margin: %s;', $e_icon_list_icon_align_left ),
					'center' => sprintf( '--e-icon-list-icon-align: center; --e-icon-list-icon-margin: %s;', $e_icon_list_icon_align_center ),
					'right' => sprintf( '--e-icon-list-icon-align: right; --e-icon-list-icon-margin: %s;', $e_icon_list_icon_align_right ),
				),
				'selectors' => array(
					'{{WRAPPER}}' => '{{VALUE}}',
				),
			)
		);

		$this->add_responsive_control(
			'icon_self_vertical_align',
			array(
				'label' => esc_html__( 'Vertical Alignment', 'elementor' ),
				'type' => Controls_Manager::CHOOSE,
				'options' => array(
					'flex-start' => array(
						'title' => esc_html__( 'Start', 'elementor' ),
						'icon' => 'eicon-v-align-top',
					),
					'center' => array(
						'title' => esc_html__( 'Center', 'elementor' ),
						'icon' => 'eicon-v-align-middle',
					),
					'flex-end' => array(
						'title' => esc_html__( 'End', 'elementor' ),
						'icon' => 'eicon-v-align-bottom',
					),
				),
				'default' => '',
				'selectors' => array(
					'{{WRAPPER}}' => '--icon-vertical-align: {{VALUE}};',
				),
			)
		);

		$this->add_responsive_control(
			'icon_vertical_offset',
			array(
				'label' => esc_html__( 'Adjust Vertical Position', 'elementor' ),
				'type' => Controls_Manager::SLIDER,
				'size_units' => array( 'px', 'em', 'rem', 'custom' ),
				'default' => array(
					'size' => 0,
				),
				'range' => array(
					'px' => array(
						'min' => -15,
						'max' => 15,
					),
					'em' => array(
						'min' => -1,
						'max' => 1,
					),
				),
				'selectors' => array(
					'{{WRAPPER}}' => '--icon-vertical-offset: {{SIZE}}{{UNIT}};',
				),
			)
		);

		$this->end_controls_section();

		$this->start_controls_section(
			'section_text_style',
			array(
				'label' => esc_html__( 'Text', 'elementor' ),
				'tab' => Controls_Manager::TAB_STYLE,
			)
		);

		$this->add_group_control(
			Group_Control_Typography::get_type(),
			array(
				'name' => 'icon_typography',
				'selector' => '{{WRAPPER}} .elementor-icon-list-item > .elementor-icon-list-text, {{WRAPPER}} .elementor-icon-list-item > a',
				'global' => array(
					'default' => Global_Typography::TYPOGRAPHY_TEXT,
				),
			)
		);

		$this->add_group_control(
			Group_Control_Text_Shadow::get_type(),
			array(
				'name' => 'text_shadow',
				'selector' => '{{WRAPPER}} .elementor-icon-list-text',
			)
		);

		$this->start_controls_tabs( 'text_colors' );

		$this->start_controls_tab(
			'text_colors_normal',
			array(
				'label' => esc_html__( 'Normal', 'elementor' ),
			)
		);

		$this->add_control(
			'text_color',
			array(
				'label' => esc_html__( 'Color', 'elementor' ),
				'type' => Controls_Manager::COLOR,
				'default' => '',
				'selectors' => array(
					'{{WRAPPER}} .elementor-icon-list-text' => 'color: {{VALUE}};',
				),
				'global' => array(
					'default' => Global_Colors::COLOR_SECONDARY,
				),
			)
		);

		$this->end_controls_tab();

		$this->start_controls_tab(
			'text_colors_hover',
			array(
				'label' => esc_html__( 'Hover', 'elementor' ),
			)
		);

		$this->add_control(
			'text_color_hover',
			array(
				'label' => esc_html__( 'Color', 'elementor' ),
				'type' => Controls_Manager::COLOR,
				'default' => '',
				'selectors' => array(
					'{{WRAPPER}} .elementor-icon-list-item:hover .elementor-icon-list-text' => 'color: {{VALUE}};',
				),
			)
		);

		$this->add_control(
			'text_color_hover_transition',
			array(
				'label' => esc_html__( 'Transition Duration', 'elementor' ),
				'type' => Controls_Manager::SLIDER,
				'size_units' => array( 's', 'ms', 'custom' ),
				'default' => array(
					'unit' => 's',
					'size' => 0.3,
				),
				'selectors' => array(
					'{{WRAPPER}} .elementor-icon-list-text' => 'transition: color {{SIZE}}{{UNIT}}',
				),
			)
		);

		$this->end_controls_tab();

		$this->end_controls_tabs();

		$this->end_controls_section();
	}

	/**
	 * Render icon list widget output on the frontend.
	 *
	 * Written in PHP and used to generate the final HTML.
	 *
	 * @since 1.0.0
	 * @access protected
	 */
	protected function render() {
		$settings = $this->get_settings_for_display();
		$fallback_defaults = array(
			'fa fa-check',
			'fa fa-times',
			'fa fa-dot-circle-o',
		);

		$this->add_render_attribute( 'icon_list', 'class', 'elementor-icon-list-items' );
		$this->add_render_attribute( 'list_item', 'class', 'elementor-icon-list-item' );

		if ( 'inline' === $settings['view'] ) {
			$this->add_render_attribute( 'icon_list', 'class', 'elementor-inline-items' );
			$this->add_render_attribute( 'list_item', 'class', 'elementor-inline-item' );
		}
		?>
		<ul <?php $this->print_render_attribute_string( 'icon_list' ); ?>>
			<?php
			foreach ( $settings['icon_list'] as $index => $item ) :
				$repeater_setting_key = $this->get_repeater_setting_key( 'text', 'icon_list', $index );

				$this->add_render_attribute( $repeater_setting_key, 'class', 'elementor-icon-list-text' );

				$this->add_inline_editing_attributes( $repeater_setting_key );
				$migration_allowed = Icons_Manager::is_migration_allowed();
				?>
				<li <?php $this->print_render_attribute_string( 'list_item' ); ?>>
					<?php
					if ( ! empty( $item['link']['url'] ) ) {
						$link_key = 'link_' . $index;

						$this->add_link_attributes( $link_key, $item['link'] );
						?>
						<a <?php $this->print_render_attribute_string( $link_key ); ?>>

						<?php
					}

					// add old default
					if ( ! isset( $item['icon'] ) && ! $migration_allowed ) {
						$item['icon'] = isset( $fallback_defaults[ $index ] ) ? $fallback_defaults[ $index ] : 'fa fa-check';
					}

					$migrated = isset( $item['__fa4_migrated']['selected_icon'] );
					$is_new = ! isset( $item['icon'] ) && $migration_allowed;
					if ( ! empty( $item['icon'] ) || ( ! empty( $item['selected_icon']['value'] ) && $is_new ) ) :
						?>
						<span class="elementor-icon-list-icon">
							<?php
							if ( $is_new || $migrated ) {
								Icons_Manager::render_icon( $item['selected_icon'], array( 'aria-hidden' => 'true' ) );
							} else { ?>
									<i class="<?php echo esc_attr( $item['icon'] ); ?>" aria-hidden="true"></i>
							<?php } ?>
						</span>
					<?php endif; ?>
					<span <?php $this->print_render_attribute_string( $repeater_setting_key ); ?>><?php $this->print_unescaped_setting( 'text', 'icon_list', $index ); ?></span>
					<?php if ( ! empty( $item['link']['url'] ) ) : ?>
						</a>
					<?php endif; ?>
				</li>
				<?php
			endforeach;
			?>
		</ul>
		<?php
	}

	/**
	 * Render icon list widget output in the editor.
	 *
	 * Written as a Backbone JavaScript template and used to generate the live preview.
	 *
	 * @since 2.9.0
	 * @access protected
	 */
	protected function content_template() {
		?>
		<#
			view.addRenderAttribute( 'icon_list', 'class', 'elementor-icon-list-items' );
			view.addRenderAttribute( 'list_item', 'class', 'elementor-icon-list-item' );

			if ( 'inline' == settings.view ) {
				view.addRenderAttribute( 'icon_list', 'class', 'elementor-inline-items' );
				view.addRenderAttribute( 'list_item', 'class', 'elementor-inline-item' );
			}
			var iconsHTML = {},
				migrated = {};
		#>
		<# if ( settings.icon_list ) { #>
			<ul {{{ view.getRenderAttributeString( 'icon_list' ) }}}>
			<# _.each( settings.icon_list, function( item, index ) {

					var iconTextKey = view.getRepeaterSettingKey( 'text', 'icon_list', index );

					view.addRenderAttribute( iconTextKey, 'class', 'elementor-icon-list-text' );

					view.addInlineEditingAttributes( iconTextKey ); #>

					<li {{{ view.getRenderAttributeString( 'list_item' ) }}}>
						<# if ( item.link && item.link.url ) { #>
							<a href="{{ elementor.helpers.sanitizeUrl( item.link.url ) }}">
						<# } #>
						<# if ( item.icon || item.selected_icon.value ) { #>
						<span class="elementor-icon-list-icon">
							<#
								iconsHTML[ index ] = elementor.helpers.renderIcon( view, item.selected_icon, { 'aria-hidden': true }, 'i', 'object' );
								migrated[ index ] = elementor.helpers.isIconMigrated( item, 'selected_icon' );
								if ( iconsHTML[ index ] && iconsHTML[ index ].rendered && ( ! item.icon || migrated[ index ] ) ) { #>
									{{{ iconsHTML[ index ].value }}}
								<# } else { #>
									<i class="{{ item.icon }}" aria-hidden="true"></i>
								<# }
							#>
						</span>
						<# } #>
						<span {{{ view.getRenderAttributeString( iconTextKey ) }}}>{{{ item.text }}}</span>
						<# if ( item.link && item.link.url ) { #>
							</a>
						<# } #>
					</li>
				<#
				} ); #>
			</ul>
		<#	} #>

		<?php
	}

	public function on_import( $element ) {
		return Icons_Manager::on_import_migration( $element, 'icon', 'selected_icon', true );
	}
}
