<?php
namespace Elementor\Modules\TabsV2\Widgets;

use Elementor\Controls_Manager;
use Elementor\Core\Kits\Documents\Tabs\Global_Colors;
use Elementor\Core\Kits\Documents\Tabs\Global_Typography;
use Elementor\Group_Control_Text_Shadow;
use Elementor\Group_Control_Typography;
use Elementor\Modules\NestedElements\Base\Widget_Nested_Base;
use Elementor\Modules\NestedElements\Controls\Control_Nested_Repeater;
use Elementor\Plugin;
use Elementor\Repeater;
use Elementor\Modules\DynamicTags\Module as TagsModule;
use Elementor\Utils;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly
}

class TabsV2 extends Widget_Nested_Base {

	public function get_name() {
		return 'tabs-v2';
	}

	public function get_title() {
		return esc_html_x( 'Nested Tabs', 'Nested Tabs Control', 'elementor' );
	}

	public function get_icon() {
		return 'eicon-tabs';
	}

	public function get_keywords() {
		return [ 'nested', 'tabs', 'accordion', 'toggle' ];
	}

	protected function get_default_children_elements() {
		return [
			[
				'elType' => 'container',
				'settings' => [
					'_title' => __( 'Tab #1', 'elementor' ),
				],
			],
			[
				'elType' => 'container',
				'settings' => [
					'_title' => __( 'Tab #2', 'elementor' ),
				],
			],
		];
	}

	protected function get_default_repeater_title_setting_key() {
		return 'tab_title';
	}

	protected function get_default_children_title() {
		return esc_html_x( 'Tab #%d', 'Nested Tabs Control', 'elementor' );
	}

	protected function get_default_children_placeholder_selector() {
		return '.elementor-tabs-content-wrapper';
	}

	protected function get_html_wrapper_class() {
		return 'elementor-widget-tabs-v2';
	}

	protected function register_controls() {

		$start = is_rtl() ? 'right' : 'left';
		$end = is_rtl() ? 'left' : 'right';

		$this->start_controls_section( 'section_tabs', [
			'label' => esc_html_x( 'Tabs', 'Nested Tabs Control', 'elementor' ),
		] );

		$repeater = new Repeater();

		$repeater->add_control( 'tab_title', [
			'label' => esc_html_x( 'Title', 'Nested Tabs Control', 'elementor' ),
			'type' => Controls_Manager::TEXT,
			'default' => esc_html_x( 'Tab Title', 'Nested Tabs Control', 'elementor' ),
			'placeholder' => esc_html_x( 'Tab Title', 'Nested Tabs Control', 'elementor' ),
			'label_block' => true,
			'dynamic' => [
				'active' => true,
			],
		] );

		$this->add_control( 'tabs', [
			'label' => esc_html_x( 'Tabs Items', 'Nested Tabs Control', 'elementor' ),
			'type' => Control_Nested_Repeater::CONTROL_TYPE,
			'fields' => $repeater->get_controls(),
			'default' => [
				[
					'tab_title' => esc_html_x( 'Tab #1', 'Nested Tabs Control', 'elementor' ),
				],
				[
					'tab_title' => esc_html_x( 'Tab #2', 'Nested Tabs Control', 'elementor' ),
				],
				[
					'tab_title' => esc_html_x( 'Tab #3', 'Nested Tabs Control', 'elementor' ),
				],
			],
			'title_field' => '{{{ tab_title }}}',
		] );

		$this->add_responsive_control( 'tabs_position', [
			'label' => esc_html_x( 'Position', 'Nested Tabs Control', 'elementor' ),
			'type' => Controls_Manager::CHOOSE,
			'options' => [
				'top' => [
					'title' => esc_html_x( 'Top', 'Nested Tabs Control', 'elementor' ),
					'icon' => 'eicon-v-align-top',
				],
				'bottom' => [
					'title' => esc_html_x( 'Bottom', 'Nested Tabs Control', 'elementor' ),
					'icon' => 'eicon-v-align-bottom',
				],
				'end' => [
					'title' => esc_html_x( 'Right', 'Nested Tabs Control', 'elementor' ),
					'icon' => 'eicon-h-align-' . $end,
				],
				'start' => [
					'title' => esc_html_x( 'Left', 'Nested Tabs Control', 'elementor' ),
					'icon' => 'eicon-h-align-' . $start,
				],
			],
			'separator' => 'before',
			'selectors_dictionary' => [
				'top' => '--tabs-v2-direction: column; --tabs-v2-tabs-wrapper-direction: row; --tabs-v2-tabs-wrapper-width: initial;',
				'bottom' => '--tabs-v2-direction: column-reverse; --tabs-v2-tabs-wrapper-direction: row; --tabs-v2-tabs-wrapper-width: initial;',
				'end' => '--tabs-v2-direction: row-reverse; --tabs-v2-tabs-wrapper-direction: column; --tabs-v2-title-grow: initial; --tabs-v2-tabs-wrapper-width: 240px;',
				'start' => '--tabs-v2-direction: row; --tabs-v2-tabs-wrapper-direction: column; --tabs-v2-title-grow: initial; --tabs-v2-tabs-wrapper-width: 240px;',
			],
			'selectors' => [
				'{{WRAPPER}}' => '{{VALUE}}',
			],
		] );

		$this->add_responsive_control( 'tabs_location_horizontal', [
			'label' => esc_html_x( 'Tabs Location', 'Nested Tabs Control', 'elementor' ),
			'type' => Controls_Manager::CHOOSE,
			'options' => [
				'start' => [
					'title' => esc_html_x( 'Start', 'Nested Tabs Control', 'elementor' ),
					'icon' => 'eicon-flex eicon-align-start-h',
				],
				'center' => [
					'title' => esc_html_x( 'Center', 'Nested Tabs Control', 'elementor' ),
					'icon' => 'eicon-h-align-center',
				],
				'end' => [
					'title' => esc_html_x( 'End', 'Nested Tabs Control', 'elementor' ),
					'icon' => 'eicon-flex eicon-align-end-h',
				],
				'stretch' => [
					'title' => esc_html_x( 'Justified', 'Nested Tabs Control', 'elementor' ),
					'icon' => 'eicon-h-align-stretch',
				],
			],
			'selectors_dictionary' => [
				'start' => '--tabs-v2-tabs-wrapper-justify-content: flex-start; --tabs-v2-title-grow: initial;',
				'center' => '--tabs-v2-tabs-wrapper-justify-content: center; --tabs-v2-title-grow: initial;',
				'end' => '--tabs-v2-tabs-wrapper-justify-content: flex-end; --tabs-v2-title-grow: initial;',
				'stretch' => '--tabs-v2-tabs-wrapper-justify-content: flex-start; --tabs-v2-title-grow: 1;',
			],
			'selectors' => [
				'{{WRAPPER}}' => '{{VALUE}}',
			],
			'condition' => [
				'tabs_position' => [
					'',
					'top',
					'bottom',
				],
			],
		] );

		$this->add_responsive_control( 'tabs_location_vertical', [
			'label' => esc_html_x( 'Tabs Location', 'Nested Tabs Control', 'elementor' ),
			'type' => Controls_Manager::CHOOSE,
			'options' => [
				'start' => [
					'title' => esc_html_x( 'Start', 'Nested Tabs Control', 'elementor' ),
					'icon' => 'eicon-flex eicon-align-start-v',
				],
				'center' => [
					'title' => esc_html_x( 'Center', 'Nested Tabs Control', 'elementor' ),
					'icon' => 'eicon-v-align-middle',
				],
				'end' => [
					'title' => esc_html_x( 'End', 'Nested Tabs Control', 'elementor' ),
					'icon' => 'eicon-flex eicon-align-end-v',
				],
				'stretch' => [
					'title' => esc_html_x( 'Justified', 'Nested Tabs Control', 'elementor' ),
					'icon' => 'eicon-v-align-stretch',
				],
			],
			'selectors_dictionary' => [
				'start' => '--tabs-v2-tabs-wrapper-justify-content: flex-start; --tabs-v2-title-grow: initial;',
				'center' => '--tabs-v2-tabs-wrapper-justify-content: center; --tabs-v2-title-grow: initial;',
				'end' => '--tabs-v2-tabs-wrapper-justify-content: flex-end; --tabs-v2-title-grow: initial;',
				'stretch' => '--tabs-v2-tabs-wrapper-justify-content: flex-start; --tabs-v2-title-grow: 1;',
			],
			'selectors' => [
				'{{WRAPPER}}' => '{{VALUE}}',
			],
			'condition' => [
				'tabs_position' => [
					'start',
					'end',
				],
			],
		] );

		$this->add_responsive_control( 'tabs_width', [
			'label' => esc_html_x( 'Tabs Width', 'Nested Tabs Control', 'elementor' ),
			'type' => Controls_Manager::SLIDER,
			'range' => [
				'%' => [
					'min' => 10,
					'max' => 50,
				],
				'px' => [
					'min' => 20,
					'max' => 600,
				],
			],
			'default' => [
				'unit' => '%',
			],
			'size_units' => [ '%', 'px' ],
			'selectors' => [
				'{{WRAPPER}}' => '--tabs-v2-tabs-wrapper-width: {{SIZE}}{{UNIT}}',
			],
			'condition' => [
				'tabs_position' => [
					'start',
					'end',
				],
			],
		] );

		$this->add_responsive_control( 'title_alignment', [
			'label' => esc_html_x( 'Title Alignment', 'Nested Tabs Control', 'elementor' ),
			'type' => Controls_Manager::CHOOSE,
			'options' => [
				'start' => [
					'title' => esc_html_x( 'Left', 'Nested Tabs Control', 'elementor' ),
					'icon' => 'eicon-text-align-left',
				],
				'center' => [
					'title' => esc_html_x( 'Center', 'Nested Tabs Control', 'elementor' ),
					'icon' => 'eicon-text-align-center',
				],
				'end' => [
					'title' => esc_html_x( 'Right', 'Nested Tabs Control', 'elementor' ),
					'icon' => 'eicon-text-align-right',
				],
			],
			'selectors_dictionary' => [
				'start' => '--tabs-v2-title-alignment: ' . $start . ';',
				'center' => '--tabs-v2-title-alignment: center;',
				'end' => '--tabs-v2-title-alignment: ' . $end . ';',
			],
			'selectors' => [
				'{{WRAPPER}}' => '{{VALUE}}',
			],
		] );

		$this->add_control( 'box_height', [
			'label' => esc_html_x( 'Box Height', 'Nested Tabs Control', 'elementor' ),
			'type' => Controls_Manager::SELECT,
			'default' => 'fit',
			'options' => [
				'fit' => esc_html_x( 'Fit to content', 'Nested Tabs Control', 'elementor' ),
				'height' => esc_html_x( 'Height', 'Nested Tabs Control', 'elementor' ),
			],
		] );

		$this->add_responsive_control( 'tabs_height', [
			'label' => esc_html_x( 'Height', 'Nested Tabs Control', 'elementor' ),
			'type' => Controls_Manager::SLIDER,
			'range' => [
				'px' => [
					'min' => 0,
					'max' => 1000,
				],
				'vh' => [
					'min' => 0,
					'max' => 100,
				],
			],
			'default' => [
				'unit' => 'px',
			],
			'size_units' => [ 'px', 'vh' ],
			'selectors' => [
				'{{WRAPPER}}' => '--tabs-v2-content-height: {{SIZE}}{{UNIT}}',
			],
			'condition' => [
				'box_height' => 'height',
			],
		] );

		$this->add_control( 'active_item', [
			'label' => esc_html_x( 'Active Item', 'Nested Tabs Control', 'elementor' ),
			'type' => Controls_Manager::NUMBER,
			'description' => 'You can decide which tab will active as default.',
		] );

		$possible_tags = [
			'div' => 'div',
			'header' => 'header',
			'footer' => 'footer',
			'main' => 'main',
			'article' => 'article',
			'section' => 'section',
			'aside' => 'aside',
			'nav' => 'nav',
			'a' => 'a',
		];

		$this->add_control(
			'html_tag',
			[
				'label' => esc_html_x( 'HTML Tag', 'Nested Tabs Control', 'elementor' ),
				'type' => Controls_Manager::SELECT,
				'separator' => 'before',
				'default' => 'div',
				'options' => $possible_tags,
			]
		);

		$this->add_control(
			'link',
			[
				'label' => esc_html__( 'Link', 'elementor' ),
				'type' => Controls_Manager::URL,
				'dynamic' => [
					'active' => true,
				],
				'placeholder' => esc_html__( 'https://your-link.com', 'elementor' ),
				'condition' => [
					'html_tag' => 'a',
				],
			]
		);

		$this->end_controls_section();

		$this->start_controls_section( 'section_tabs_style', [
			'label' => esc_html_x( 'Tabs', 'Nested Tabs Control', 'elementor' ),
			'tab' => Controls_Manager::TAB_STYLE,
		] );

		$this->add_control( 'border_width', [
			'label' => esc_html_x( 'Border Width', 'Nested Tabs Control', 'elementor' ),
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
				'{{WRAPPER}}' => '--tabs-v2-border-width: {{SIZE}}{{UNIT}};',
			],
		] );

		$this->add_control( 'border_color', [
			'label' => esc_html_x( 'Border Color', 'Nested Tabs Control', 'elementor' ),
			'type' => Controls_Manager::COLOR,
			'selectors' => [
				'{{WRAPPER}}' => '--tabs-v2-border-color: {{VALUE}};',
			],
		] );

		$this->add_control( 'background_color', [
			'label' => esc_html_x( 'Background Color', 'Nested Tabs Control', 'elementor' ),
			'type' => Controls_Manager::COLOR,
			'selectors' => [
				'{{WRAPPER}}' => '--tabs-v2-background-color: {{VALUE}};',
			],
		] );

		$this->add_control( 'heading_title', [
			'label' => esc_html_x( 'Title', 'Nested Tabs Control', 'elementor' ),
			'type' => Controls_Manager::HEADING,
			'separator' => 'before',
		] );

		$this->add_control( 'tab_color', [
			'label' => esc_html_x( 'Color', 'Nested Tabs Control', 'elementor' ),
			'type' => Controls_Manager::COLOR,
			'selectors' => [
				'{{WRAPPER}}' => '--tabs-v2-title-color: {{VALUE}};',
			],
		] );

		$this->add_control( 'tab_active_color', [
			'label' => esc_html_x( 'Active Color', 'Nested Tabs Control', 'elementor' ),
			'type' => Controls_Manager::COLOR,
			'selectors' => [
				'{{WRAPPER}}' => '--tabs-v2-title-active-color: {{VALUE}};',
			],
		] );

		$this->add_group_control( Group_Control_Typography::get_type(), [
			'name' => 'tab_typography',
			'fields_options' => [
				'font_family' => [
					'selectors' => [
						'{{WRAPPER}}' => '--tabs-v2-title-typography-font-family: "{{VALUE}}";',
					],
				],
				'font_size' => [
					'selectors' => [
						'{{WRAPPER}}' => '--tabs-v2-title-typography-font-size: {{SIZE}}{{UNIT}};',
					],
				],
				'font_weight' => [
					'selectors' => [
						'{{WRAPPER}}' => '--tabs-v2-title-typography-font-weight: {{VALUE}};',
					],
				],
				'text_transform' => [
					'selectors' => [
						'{{WRAPPER}}' => '--tabs-v2-title-typography-text-transform: {{VALUE}};',
					],
				],
				'font_style' => [
					'selectors' => [
						'{{WRAPPER}}' => '--tabs-v2-title-typography-font-style: {{VALUE}};',
					],
				],
				'text_decoration' => [
					'selectors' => [
						'{{WRAPPER}}' => '--tabs-v2-title-typography-text-decoration: {{VALUE}};',
					],
				],
				'line_height' => [
					'selectors' => [
						'{{WRAPPER}}' => '--tabs-v2-title-typography-line-height: {{SIZE}}{{UNIT}};',
					],
				],
				'letter_spacing' => [
					'selectors' => [
						'{{WRAPPER}}' => '--tabs-v2-title-typography-letter-spacing: {{SIZE}}{{UNIT}};',
					],
				],
				'word_spacing' => [
					'selectors' => [
						'{{WRAPPER}}' => '--tabs-v2-title-typography-word-spacing: {{SIZE}}{{UNIT}};',
					],
				],
			],
		] );

		$this->add_group_control( Group_Control_Text_Shadow::get_type(), [
			'name' => 'title_shadow',
			'fields_options' => [
				'text_shadow' => [
					'selectors' => [
						'{{WRAPPER}}' => '--tabs-v2-title-shadow: {{HORIZONTAL}}px {{VERTICAL}}px {{BLUR}}px {{COLOR}};',
					],
				],
			],
		] );

		$this->end_controls_section();
	}

	/**
	 * Print safe HTML tag for the element based on the element settings.
	 *
	 * @return void
	 */
	private function print_html_tag() {
		$html_tag = $this->get_settings( 'html_tag' );

		if ( empty( $html_tag ) ) {
			$html_tag = 'div';
		}

		Utils::print_validated_html_tag( $html_tag );
	}

	/**
	 * Before rendering the container content. (Print the opening tag, etc.)
	 *
	 * @return void
	 */
	public function before_render() {
		$settings = $this->get_settings_for_display();
		$link = $settings['link'];

		if ( ! empty( $link['url'] ) ) {
			$this->add_link_attributes( '_wrapper', $link );
		}

		?><<?php $this->print_html_tag(); ?> <?php $this->print_render_attribute_string( '_wrapper' ); ?>><?php
	}

	protected function render() {
		// Copied from tabs.php
		$tabs = $this->get_settings_for_display( 'tabs' );

		$id_int = substr( $this->get_id_int(), 0, 3 );

		$a11y_improvements_experiment = Plugin::$instance->experiments->is_feature_active( 'a11y_improvements' );

		$this->add_render_attribute( 'elementor-tabs', 'class', 'elementor-tabs' );

		$tabs_title_html = '';
		$tabs_content_html = '';

		foreach ( $tabs as $index => $item ) {
			// Tabs title.
			$tab_count = $index + 1;
			$tab_title_setting_key = $this->get_repeater_setting_key( 'tab_title', 'tabs', $index );
			$tab_title = $a11y_improvements_experiment ? $item['tab_title'] : '<a href="">' . $item['tab_title'] . '</a>';
			$tab_title_mobile_setting_key = $this->get_repeater_setting_key( 'tab_title_mobile', 'tabs', $tab_count );

			$this->add_render_attribute( $tab_title_setting_key, [
				'id' => 'elementor-tab-title-' . $id_int . $tab_count,
				'class' => [ 'elementor-tab-title', 'elementor-tab-desktop-title' ],
				'aria-selected' => 1 === $tab_count ? 'true' : 'false',
				'data-tab' => $tab_count,
				'role' => 'tab',
				'tabindex' => 1 === $tab_count ? '0' : '-1',
				'aria-controls' => 'elementor-tab-content-' . $id_int . $tab_count,
				'aria-expanded' => 'false',
			] );

			$this->add_render_attribute( $tab_title_mobile_setting_key, [
				'class' => [ 'elementor-tab-title', 'elementor-tab-mobile-title' ],
				'aria-selected' => 1 === $tab_count ? 'true' : 'false',
				'data-tab' => $tab_count,
				'role' => 'tab',
				'tabindex' => 1 === $tab_count ? '0' : '-1',
				'aria-controls' => 'elementor-tab-content-' . $id_int . $tab_count,
				'aria-expanded' => 'false',
			] );

			$title_render_attributes = $this->get_render_attribute_string( $tab_title_setting_key );
			$mobile_title_attributes = $this->get_render_attribute_string( $tab_title_mobile_setting_key );

			$tabs_title_html .= "<div $title_render_attributes>$tab_title</div>";

			// Tabs content.
			ob_start();
			$this->print_child( $index );
			$tab_content = ob_get_clean();

			$tabs_content_html .= "<div $mobile_title_attributes>$tab_title</div>$tab_content";
		}
		?>
		<div <?php $this->print_render_attribute_string( 'elementor-tabs' ); ?>>
			<div class="elementor-tabs-wrapper" role="tablist">
				<?php echo $tabs_title_html;// phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>
			</div>
			<div class="elementor-tabs-content-wrapper" role="tablist" aria-orientation="vertical">
				<?php echo $tabs_content_html;// phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>
			</div>
		</div>
		<?php
	}

	protected function content_template() {
		?>
		<div class="elementor-tabs" role="tablist" aria-orientation="vertical">
			<# if ( settings['tabs'] ) {
			var elementUid = view.getIDInt().toString().substr( 0, 3 ); #>
			<div class="elementor-tabs-wrapper" role="tablist">
				<# _.each( settings['tabs'], function( item, index ) {
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
				'data-binding-type': 'repeater-item',
				'data-binding-repeater-name': 'tabs',
				'data-binding-setting': 'tab_title',
				'data-binding-index': tabCount,
				} );
				#>
				<div {{{ view.getRenderAttributeString( tabTitleKey ) }}}>{{{ item.tab_title }}}</div>
				<# } ); #>
			</div>
			<div class="elementor-tabs-content-wrapper">
			</div>
			<# } #>
		</div>
		<?php
	}
}
