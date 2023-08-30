<?php
namespace Elementor\Modules\NestedAccordion\Widgets;

use Elementor\Controls_Manager;
use Elementor\Group_Control_Background;
use Elementor\Group_Control_Border;
use Elementor\Group_Control_Text_Shadow;
use Elementor\Group_Control_Typography;
use Elementor\Icons_Manager;
use Elementor\Modules\NestedElements\Base\Widget_Nested_Base;
use Elementor\Modules\NestedElements\Controls\Control_Nested_Repeater;
use Elementor\Plugin;
use Elementor\Repeater;
use Elementor\Utils;
use Elementor\Group_Control_Text_Stroke;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly
}

/**
 * Elementor Nested Accordion widget.
 *
 * Elementor widget that displays a collapsible display of content in an
 * accordion style.
 *
 * @since 3.15.0
 */
class Nested_Accordion extends Widget_Nested_Base {

	public function get_name() {
		return 'nested-accordion';
	}

	public function get_title() {
		return esc_html__( 'Accordion', 'elementor' );
	}

	public function get_icon() {
		return 'eicon-accordion';
	}

	public function get_keywords() {
		return [ 'nested', 'tabs', 'accordion', 'toggle' ];
	}

	public function show_in_panel(): bool {
		return Plugin::$instance->experiments->is_feature_active( 'nested-elements' );
	}

	protected function item_content_container( int $index ) {
		return [
			'elType' => 'container',
			'settings' => [
				'_title' => sprintf( __( 'item #%s', 'elementor' ), $index ),
				'content_width' => 'full',
			],
		];
	}

	protected function get_default_children_elements() {
		return [
			$this->item_content_container( 1 ),
			$this->item_content_container( 2 ),
			$this->item_content_container( 3 ),
		];
	}

	protected function get_default_repeater_title_setting_key() {
		return 'item_title';
	}

	protected function get_default_children_title() {
		return esc_html__( 'Item #%d', 'elementor' );
	}

	protected function get_default_children_placeholder_selector() {
		return '.e-n-accordion';
	}

	protected function get_html_wrapper_class() {
		return 'elementor-widget-n-accordion';
	}

	protected function register_controls() {
		$this->start_controls_section( 'section_items', [
			'label' => esc_html__( 'Layout', 'elementor' ),
		] );

		$repeater = new Repeater();

		$repeater->add_control(
			'item_title',
			[
				'label' => esc_html__( 'Title', 'elementor' ),
				'type' => Controls_Manager::TEXT,
				'default' => esc_html__( 'Item Title', 'elementor' ),
				'placeholder' => esc_html__( 'Item Title', 'elementor' ),
				'label_block' => true,
				'dynamic' => [
					'active' => true,
				],
			]
		);

		$repeater->add_control(
			'element_css_id',
			[
				'label' => esc_html__( 'CSS ID', 'elementor' ),
				'type' => Controls_Manager::TEXT,
				'default' => '',
				'dynamic' => [
					'active' => true,
				],
				'title' => esc_html__( 'Add your custom id WITHOUT the Pound key. e.g: my-id', 'elementor' ),
				'style_transfer' => false,
			]
		);

		$this->add_control(
			'items',
			[
				'label' => esc_html__( 'Items', 'elementor' ),
				'type' => Control_Nested_Repeater::CONTROL_TYPE,
				'fields' => $repeater->get_controls(),
				'default' => [
					[
						'item_title' => esc_html__( 'Item #1', 'elementor' ),
					],
					[
						'item_title' => esc_html__( 'Item #2', 'elementor' ),
					],
					[
						'item_title' => esc_html__( 'Item #3', 'elementor' ),
					],
				],
				'title_field' => '{{{ item_title }}}',
				'button_text' => 'Add Item',
			]
		);

		$this->add_responsive_control(
			'accordion_item_title_position_horizontal',
			[
				'label' => esc_html__( 'Item Position', 'elementor' ),
				'type' => Controls_Manager::CHOOSE,
				'separator' => 'before',
				'options' => [
					'start' => [
						'title' => esc_html__( 'Start', 'elementor' ),
						'icon' => 'eicon-flex eicon-align-start-h',
					],
					'center' => [
						'title' => esc_html__( 'Center', 'elementor' ),
						'icon' => 'eicon-h-align-center',
					],
					'end' => [
						'title' => esc_html__( 'End', 'elementor' ),
						'icon' => 'eicon-flex eicon-align-end-h',
					],
					'stretch' => [
						'title' => esc_html__( 'Stretch', 'elementor' ),
						'icon' => 'eicon-h-align-stretch',
					],
				],
				'selectors_dictionary' => [
					'start' => '--n-accordion-title-justify-content: initial; --n-accordion-title-flex-grow: initial;',
					'center' => '--n-accordion-title-justify-content: center; --n-accordion-title-flex-grow: initial;',
					'end' => '--n-accordion-title-justify-content: flex-end; --n-accordion-title-flex-grow: initial;',
					'stretch' => '--n-accordion-title-justify-content: space-between; --n-accordion-title-flex-grow: 1;',
				],
				'selectors' => [
					'{{WRAPPER}}' => '{{VALUE}}',
				],
			]
		);

		$this->add_control(
			'heading_accordion_item_title_icon',
			[
				'type' => Controls_Manager::HEADING,
				'label' => esc_html__( 'Icon', 'elementor' ),
				'separator' => 'before',
			]
		);

		$this->add_responsive_control(
			'accordion_item_title_icon_position',
			[
				'label' => esc_html__( 'Position', 'elementor' ),
				'type' => Controls_Manager::CHOOSE,
				'options' => [
					'start' => [
						'title' => esc_html__( 'Start', 'elementor' ),
						'icon' => 'eicon-h-align-left',
					],
					'end' => [
						'title' => esc_html__( 'End', 'elementor' ),
						'icon' => 'eicon-h-align-right',
					],
				],
				'selectors_dictionary' => [
					'start' => '--n-accordion-title-icon-order: -1;',
					'end' => '--n-accordion-title-icon-order: initial;',
				],
				'selectors' => [
					'{{WRAPPER}}' => '{{VALUE}}',
				],
			]
		);

		$this->add_control(
			'accordion_item_title_icon',
			[
				'label' => esc_html__( 'Expand', 'elementor' ),
				'type' => Controls_Manager::ICONS,
				'default' => [
					'value' => 'fas fa-plus',
					'library' => 'fa-solid',
				],
				'skin' => 'inline',
				'label_block' => false,
			]
		);

		$this->add_control(
			'accordion_item_title_icon_active',
			[
				'label' => esc_html__( 'Collapse', 'elementor' ),
				'type' => Controls_Manager::ICONS,
				'fa4compatibility' => 'icon_active',
				'default' => [
					'value' => 'fas fa-minus',
					'library' => 'fa-solid',
				],
				'condition' => [
					'accordion_item_title_icon[value]!' => '',
				],
				'skin' => 'inline',
				'label_block' => false,
			]
		);

		$this->add_control(
			'title_tag',
			[
				'label' => esc_html__( 'Title HTML Tag', 'elementor' ),
				'type' => Controls_Manager::SELECT,
				'options' => [
					'h1' => 'H1',
					'h2' => 'H2',
					'h3' => 'H3',
					'h4' => 'H4',
					'h5' => 'H5',
					'h6' => 'H6',
					'div' => 'div',
					'span' => 'span',
					'p' => 'p',
				],
				'selectors_dictionary' => [
					'h1' => '--n-accordion-title-font-size: 2.5rem;',
					'h2' => '--n-accordion-title-font-size: 2rem;',
					'h3' => '--n-accordion-title-font-size: 1,75rem;',
					'h4' => '--n-accordion-title-font-size: 1.5rem;',
					'h5' => '--n-accordion-title-font-size: 1rem;',
					'h6' => '--n-accordion-title-font-size: 1rem; ',
					'div' => '--n-accordion-title-font-size: 1rem;',
					'span' => '--n-accordion-title-font-size: 1rem; ',
					'p' => '--n-accordion-title-font-size: 1rem;',
				],
				'selectors' => [
					'{{WRAPPER}}' => '{{VALUE}}',
				],
				'default' => 'div',
				'separator' => 'before',
				'render_type' => 'template',

			]
		);
		$this->end_controls_section();

		$this->start_controls_section(
			'section_interactions',
			[
				'label' => esc_html__( 'Interactions', 'elementor' ),
			]
		);

		$this->add_control(
			'default_state',
			[
				'label' => esc_html__( 'Default State', 'elementor' ),
				'type' => Controls_Manager::SELECT,
				'options' => [
					'expanded' => esc_html__( 'First expanded', 'elementor' ),
					'all_collapsed' => esc_html__( 'All collapsed', 'elementor' ),
				],
				'default' => 'expanded',
				'frontend_available' => true,
			]
		);

		$this->add_control(
			'max_items_expended',
			[
				'label' => esc_html__( 'Max Items Expanded', 'elementor' ),
				'type' => Controls_Manager::SELECT,
				'options' => [
					'one' => esc_html__( 'One', 'elementor' ),
					'multiple' => esc_html__( 'Multiple', 'elementor' ),
				],
				'default' => 'one',
				'frontend_available' => true,
			]
		);

		$this->add_control(
			'n_accordion_animation_duration',
			[
				'label' => esc_html__( 'Animation Duration', 'elementor' ),
				'type' => Controls_Manager::SLIDER,
				'size_units' => [ 's', 'ms' ],
				'default' => [
					'unit' => 'ms',
					'size' => 400,
				],
				'frontend_available' => true,
			]
		);

		$this->end_controls_section();

		$this->add_style_tab();
	}

	private function add_style_tab() {
		$this->add_accordion_style_section();
		$this->add_header_style_section();
		$this->add_content_style_section();
	}

	private function add_accordion_style_section() {
		$this->start_controls_section(
			'section_accordion_style',
			[
				'label' => esc_html__( 'Accordion', 'elementor' ),
				'tab' => Controls_Manager::TAB_STYLE,
			]
		);

		$this->add_responsive_control(
			'accordion_item_title_space_between',
			[
				'label' => esc_html__( 'Space between Items', 'elementor' ),
				'type' => Controls_Manager::SLIDER,
				'size_units' => [ 'px' ],
				'range' => [
					'px' => [
						'min' => 0,
						'max' => 200,
					],
				],
				'default' => [
					'size' => 0,
				],
				'selectors' => [
					'{{WRAPPER}}' => '--n-accordion-item-title-space-between: {{SIZE}}{{UNIT}}',
				],
			]
		);

		$this->add_responsive_control(
			'accordion_item_title_distance_from_content',
			[
				'label' => esc_html__( 'Distance from content', 'elementor' ),
				'type' => Controls_Manager::SLIDER,
				'size_units' => [ 'px' ],
				'range' => [
					'px' => [
						'min' => 0,
						'max' => 200,
					],
				],
				'default' => [
					'size' => 0,
				],
				'selectors' => [
					'{{WRAPPER}}' => '--n-accordion-item-title-distance-from-content: {{SIZE}}{{UNIT}}',
				],
			]
		);

		$this->start_controls_tabs( 'accordion_border_and_background' );

		foreach ( [ 'normal', 'hover', 'active' ] as $state ) {
			$this->add_border_and_radius_style( $state );
		}

		$this->end_controls_tabs();

		$this->add_responsive_control(
			'accordion_border_radius',
			[
				'label' => esc_html__( 'Border Radius', 'elementor' ),
				'type' => Controls_Manager::DIMENSIONS,
				'size_units' => [ 'px', '%', 'em', 'rem', 'vw', 'custom' ],
				'selectors' => [
					'{{WRAPPER}}' => '--n-accordion-border-radius: {{TOP}}{{UNIT}} {{RIGHT}}{{UNIT}} {{BOTTOM}}{{UNIT}} {{LEFT}}{{UNIT}};',
				],
				'separator' => 'before',
			]
		);

		$this->add_responsive_control(
			'accordion_padding',
			[
				'label' => esc_html__( 'Padding', 'elementor' ),
				'type' => Controls_Manager::DIMENSIONS,
				'size_units' => [ 'px', '%', 'em', 'rem', 'custom' ],
				'selectors' => [
					'{{WRAPPER}} ' => '--n-accordion-padding: {{TOP}}{{UNIT}} {{RIGHT}}{{UNIT}} {{BOTTOM}}{{UNIT}} {{LEFT}}{{UNIT}};',
				],
			]
		);

		$this->end_controls_section();
	}

	private function add_content_style_section() {

		$low_specificity_accordion_item_selector = ':where( {{WRAPPER}} > .elementor-widget-container > .e-n-accordion > .e-n-accordion-item ) > .e-con';

		$this->start_controls_section(
			'section_content_style',
			[
				'label' => esc_html__( 'Content', 'elementor' ),
				'tab' => Controls_Manager::TAB_STYLE,
			]
		);

		$this->add_group_control(
			Group_Control_Background::get_type(),
			[
				'name' => 'content_background',
				'types' => [ 'classic', 'gradient' ],
				'exclude' => [ 'image' ],
				'selector' => $low_specificity_accordion_item_selector,
			]
		);

		$this->add_group_control(
			Group_Control_Border::get_type(),
			[
				'name' => 'content_border',
				'selector' => $low_specificity_accordion_item_selector,
				'fields_options' => [
					'color' => [
						'label' => esc_html__( 'Border Color', 'elementor' ),
					],
					'width' => [
						'label' => esc_html__( 'Border Width', 'elementor' ),
					],
				],
			]
		);

		$this->add_responsive_control(
			'content_border_radius',
			[
				'label' => esc_html__( 'Border Radius', 'elementor' ),
				'type' => Controls_Manager::DIMENSIONS,
				'size_units' => [ 'px', '%', 'em', 'rem', 'vw', 'custom' ],
				'selectors' => [
					$low_specificity_accordion_item_selector  => '--border-radius: {{TOP}}{{UNIT}} {{RIGHT}}{{UNIT}} {{BOTTOM}}{{UNIT}} {{LEFT}}{{UNIT}};',
				],
			]
		);

		$logical_dimensions_inline_start = is_rtl() ? '{{RIGHT}}{{UNIT}}' : '{{LEFT}}{{UNIT}}';
		$logical_dimensions_inline_end = is_rtl() ? '{{LEFT}}{{UNIT}}' : '{{RIGHT}}{{UNIT}}';

		$this->add_responsive_control(
			'content_padding',
			[
				'label' => esc_html__( 'Padding', 'elementor' ),
				'type' => Controls_Manager::DIMENSIONS,
				'size_units' => [ 'px', '%', 'em', 'rem', 'custom' ],
				'selectors' => [
					$low_specificity_accordion_item_selector => "--padding-block-start: {{TOP}}{{UNIT}}; --padding-inline-end: $logical_dimensions_inline_end; --padding-block-end: {{BOTTOM}}{{UNIT}}; --padding-inline-start: $logical_dimensions_inline_start;",
				],
			]
		);

		$this->end_controls_section();
	}

	private function add_header_style_section() {
		$this->start_controls_section(
			'section_header_style',
			[
				'label' => esc_html__( 'Header', 'elementor' ),
				'tab' => Controls_Manager::TAB_STYLE,
			]
		);

		$this->add_control(
			'heading_header_style_title',
			[
				'type' => Controls_Manager::HEADING,
				'label' => esc_html__( 'Title', 'elementor' ),

			]
		);

		$this->add_group_control(
			Group_Control_Typography::get_type(),
			[
				'name' => 'title_typography',
				'selector' => ':where( {{WRAPPER}} > .elementor-widget-container > .e-n-accordion > .e-n-accordion-item > .e-n-accordion-item-title > .e-n-accordion-item-title-header ) > .e-n-accordion-item-title-text',
				'fields_options' => [
					'font_size' => [
						'selectors' => [
							'{{WRAPPER}}' => '--n-accordion-title-font-size: {{SIZE}}{{UNIT}}',
						],
					],
				],
			]
		);

		$this->start_controls_tabs( 'header_title_color_style' );

		foreach ( [ 'normal', 'hover', 'active' ] as $state ) {
			$this->add_header_style( $state, 'title' );
		}

		$this->end_controls_tabs();

		$this->add_control(
			'header_section_divider',
			[
				'type' => Controls_Manager::DIVIDER,
			]
		);

		$this->add_control(
			'heading_icon_style_title',
			[
				'type' => Controls_Manager::HEADING,
				'label' => esc_html__( 'Icon', 'elementor' ),

			]
		);

		$this->add_responsive_control(
			'icon_size',
			[
				'label' => esc_html__( 'Size', 'elementor' ),
				'type' => Controls_Manager::SLIDER,
				'range' => [
					'em' => [
						'min' => 0,
						'max' => 10,
						'step' => 0.1,
					],
					'rem' => [
						'min' => 0,
						'max' => 10,
						'step' => 0.1,
					],
				],
				'default' => [
					'unit' => 'px',
					'size' => 15,
				],
				'size_units' => [ 'px', '%', 'em', 'rem', 'vw', 'custom' ],
				'selectors' => [
					'{{WRAPPER}}' => '--n-accordion-icon-size: {{SIZE}}{{UNIT}}',
				],
			]
		);

		$this->add_responsive_control(
			'icon_spacing',
			[
				'label' => esc_html__( 'Spacing', 'elementor' ),
				'type' => Controls_Manager::SLIDER,
				'range' => [
					'px' => [
						'min' => 0,
						'max' => 400,
					],
					'vw' => [
						'min' => 0,
						'max' => 50,
						'step' => 0.1,
					],
				],
				'size_units' => [ 'px', '%', 'em', 'rem', 'vw', 'custom' ],
				'selectors' => [
					'{{WRAPPER}}' => '--n-accordion-icon-gap: {{SIZE}}{{UNIT}}',
				],
				'condition' => [
					'accordion_item_title_position_horizontal!' => 'stretch',
				],
			]
		);

		$this->start_controls_tabs( 'header_icon_color_style' );

		foreach ( [ 'normal', 'hover', 'active' ] as $state ) {
			$this->add_header_style( $state, 'icon' );
		}

		$this->end_controls_tabs();
		$this->end_controls_section();
	}

	private function add_header_style( $state, $context ) {
		$variable = '--n-accordion-' . $context . '-' . $state . '-color';

		switch ( $state ) {
			case 'hover':
				$translated_tab_text = esc_html__( 'Hover', 'elementor' );
				$translated_tab_css_selector = ':where( {{WRAPPER}} > .elementor-widget-container > .e-n-accordion > .e-n-accordion-item:not([open]) > .e-n-accordion-item-title:hover > .e-n-accordion-item-title-header ) > .e-n-accordion-item-title-text';
				break;
			case 'active':
				$translated_tab_text = esc_html__( 'Active', 'elementor' );
				$translated_tab_css_selector = ':where( {{WRAPPER}} > .elementor-widget-container > .e-n-accordion > .e-n-accordion-item[open] > .e-n-accordion-item-title > .e-n-accordion-item-title-header ) > .e-n-accordion-item-title-text';
				break;
			default:
				$translated_tab_text = esc_html__( 'Normal', 'elementor' );
				$translated_tab_css_selector = ':where( {{WRAPPER}} > .elementor-widget-container > .e-n-accordion > .e-n-accordion-item:not([open]) > .e-n-accordion-item-title:not(hover) > .e-n-accordion-item-title-header ) > .e-n-accordion-item-title-text';
				break;
		}

		$this->start_controls_tab(
			'header_' . $state . '_' . $context,
			[
				'label' => $translated_tab_text,
			]
		);

		$this->add_control(
			$state . '_' . $context . '_color',
			[
				'label' => esc_html__( 'Color', 'elementor' ),
				'type' => Controls_Manager::COLOR,
				'selectors' => [
					'{{WRAPPER}}' => $variable . ': {{VALUE}};',
				],
			]
		);

		if ( 'title' === $context ) {
			$this->add_group_control(
				Group_Control_Text_Shadow::get_type(),
				[
					'name' => $context . '_' . $state . '_text_shadow',
					'selector' => '{{WRAPPER}} ' . $translated_tab_css_selector,
					'fields_options' => [
						'text_shadow_type' => [
							'label' => esc_html_x( 'Shadow', 'Text Shadow Control', 'elementor' ),
						],
					],
				]
			);

			$this->add_group_control(
				Group_Control_Text_Stroke::get_type(),
				[
					'name' => $context . '_' . $state . '_stroke',
					'selector' => '{{WRAPPER}} ' . $translated_tab_css_selector,
				]
			);
		}

		$this->end_controls_tab();
	}

	/**
	 * @string $state
	 */
	private function add_border_and_radius_style( $state ) {
		$selector = '{{WRAPPER}} > .elementor-widget-container > .e-n-accordion > .e-n-accordion-item > .e-n-accordion-item-title';
		$translated_tab_text = esc_html__( 'Normal', 'elementor' );

		switch ( $state ) {
			case 'hover':
				$selector .= ':hover';
				$translated_tab_text = esc_html__( 'Hover', 'elementor' );
				break;
			case 'active':
				$selector = '{{WRAPPER}} > .elementor-widget-container > .e-n-accordion > .e-n-accordion-item[open] > .e-n-accordion-item-title';
				$translated_tab_text = esc_html__( 'Active', 'elementor' );
				break;
		}

		$this->start_controls_tab(
			'accordion_' . $state . '_border_and_background',
			[
				'label' => $translated_tab_text,
			]
		);

		$this->add_group_control(
			Group_Control_Background::get_type(),
			[
				'name' => 'accordion_background_' . $state,
				'types' => [ 'classic', 'gradient' ],
				'exclude' => [ 'image' ],
				'fields_options' => [
					'color' => [
						'label' => esc_html__( 'Color', 'elementor' ),
					],
				],
				'selector' => $selector,
			]
		);

		$this->add_group_control(
			Group_Control_Border::get_type(),
			[
				'name' => 'accordion_border_' . $state,
				'selector' => $selector,
			]
		);

		$this->end_controls_tab();
	}

	private function is_active_icon_exist( $settings ):bool {
		return array_key_exists( 'accordion_item_title_icon_active', $settings ) && ! empty( $settings['accordion_item_title_icon_active'] ) && ! empty( $settings['accordion_item_title_icon_active']['value'] );
	}

	private function render_accordion_icons( $settings ) {
		$icon_html = Icons_Manager::try_get_icon_html( $settings['accordion_item_title_icon'], [ 'aria-hidden' => 'true' ] );
		$icon_active_html = $this->is_active_icon_exist( $settings )
			? Icons_Manager::try_get_icon_html( $settings['accordion_item_title_icon_active'], [ 'aria-hidden' => 'true' ] )
			: $icon_html;

		ob_start();
		?>
		<span class='e-n-accordion-item-title-icon'>
			<span class='e-opened' ><?php echo $icon_active_html; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?></span>
			<span class='e-closed'><?php echo $icon_html; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?></span>
		</span>

		<?php
		return ob_get_clean();
	}

	protected function render() {
		$settings = $this->get_settings_for_display();
		$items = $settings['items'];
		$id_int = substr( $this->get_id_int(), 0, 3 );
		$items_title_html = '';
		$icons_content = $this->render_accordion_icons( $settings );
		$this->add_render_attribute( 'elementor-accordion', 'class', 'e-n-accordion' );
		$default_state = $settings['default_state'];
		$title_html_tag = Utils::validate_html_tag( $settings['title_tag'] );

		foreach ( $items as $index => $item ) {
			$item_setting_key = $this->get_repeater_setting_key( 'item_title', 'items', $index );
			$item_classes = [ 'e-n-accordion-item', 'e-normal' ];
			$item_id = empty( $item['element_css_id'] ) ? 'e-n-accordion-item-' . $id_int . $index : $item['element_css_id'];
			$item_title = $item['item_title'];
			$is_open = 'expanded' === $default_state && 0 === $index ? 'open' : '';

			$this->add_render_attribute( $item_setting_key, [
				'id' => $item_id,
				'class' => $item_classes,
			] );

			$title_render_attributes = $this->get_render_attribute_string( $item_setting_key );
			$title_render_attributes = $title_render_attributes . ' ' . $is_open;

			// items content.
			ob_start();
			$this->print_child( $index );
			$item_content = ob_get_clean();

			ob_start();
			?>
			<details <?php echo wp_kses_post( $title_render_attributes ); ?>>
				<summary class='e-n-accordion-item-title'>
					<span class='e-n-accordion-item-title-header'><?php echo wp_kses_post( "<$title_html_tag class=\"e-n-accordion-item-title-text\"> $item_title </$title_html_tag>" ); ?></span>
					<?php if ( ! empty( $settings['accordion_item_title_icon']['value'] ) ) {
						echo $icons_content; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
					} ?>
				</summary>
				<?php echo $item_content; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>
			</details>
			<?php
			$items_title_html .= ob_get_clean();
		}

		?>
		<div <?php $this->print_render_attribute_string( 'elementor-accordion' ); ?>>
			<?php echo $items_title_html; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>
		</div>
		<?php
	}

	protected function content_template() {
		?>
		<div class="e-n-accordion" role="tablist" aria-orientation="vertical">
			<# if ( settings['items'] ) {
			const elementUid = view.getIDInt().toString().substring( 0, 3 ),
				titleHTMLTag = elementor.helpers.validateHTMLTag( settings.title_tag ),
				itemTitleText = 'item-title-text-' + elementUid,
				defaultState = settings.default_state,
				itemTitleIcon = elementor.helpers.renderIcon( view, settings['accordion_item_title_icon'], { 'aria-hidden': true }, 'i', 'object' ) ?? '',
				itemTitleIconActive = '' === settings.accordion_item_title_icon_active.value
					? itemTitleIcon
					: elementor.helpers.renderIcon( view, settings['accordion_item_title_icon_active'], { 'aria-hidden': true }, 'i', 'object' );
			#>

				<# _.each( settings['items'], function( item, index ) {
				const itemCount = index + 1,
					itemUid = elementUid + itemCount,
					itemWrapperKey = itemUid,
					itemTitleKey = 'item-' + itemUid;

					if ( '' !== item.element_css_id ) {
						itemId = item.element_css_id;
					} else {
						itemId = 'e-n-accordion-item-' + itemUid;
					}

					const itemWrapperAttributes = {
						'id': itemId,
						'class': [ 'e-n-accordion-item', 'e-normal' ],
					};

					if ( defaultState === 'expanded' && index === 0) {
						itemWrapperAttributes['open'] = true;
					}

					view.addRenderAttribute( itemWrapperKey, itemWrapperAttributes );

					view.addRenderAttribute( itemTitleKey, {
						'class': ['e-n-accordion-item-title'],
					});

					view.addRenderAttribute( itemTitleText, {
						'class': ['e-n-accordion-item-title-text'],
						'data-binding-type': 'repeater-item',
						'data-binding-repeater-name': 'items',
						'data-binding-setting': ['item_title'],
						'data-binding-index': itemCount,
					});
				#>

			<details {{{ view.getRenderAttributeString( itemWrapperKey ) }}}>
				<summary {{{ view.getRenderAttributeString( itemTitleKey ) }}}>
					<span class="e-n-accordion-item-title-header">
						<{{{ titleHTMLTag }}} {{{ view.getRenderAttributeString( itemTitleText ) }}}>
							{{{ item.item_title }}}
						</{{{ titleHTMLTag }}}>
					</span>
					<# if (settings.accordion_item_title_icon.value) { #>
					<span class="e-n-accordion-item-title-icon">
						<span class="e-opened">{{{ itemTitleIconActive.value }}}</span>
						<span class="e-closed">{{{ itemTitleIcon.value }}}</span>
					</span>
					<# } #>
				</summary>
			</details>
			<# } ); #>
		<# } #>
		</div>
		<?php
	}
}
