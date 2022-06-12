<?php
namespace Elementor\Modules\TabsV2\Widgets;

use Elementor\Controls_Manager;
use Elementor\Core\Kits\Documents\Tabs\Global_Colors;
use Elementor\Core\Kits\Documents\Tabs\Global_Typography;
use Elementor\Group_Control_Text_Shadow;
use Elementor\Group_Control_Typography;
use Elementor\Icons_Manager;
use Elementor\Modules\NestedElements\Base\Widget_Nested_Base;
use Elementor\Modules\NestedElements\Controls\Control_Nested_Repeater;
use Elementor\Plugin;
use Elementor\Repeater;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly
}

class TabsV2 extends Widget_Nested_Base {

	public function get_name() {
		return 'tabs-v2';
	}

	public function get_title() {
		return esc_html__( 'Nested Tabs', 'elementor' );
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
			[
				'elType' => 'container',
				'settings' => [
					'_title' => __( 'Tab #3', 'elementor' ),
				],
			],
		];
	}

	protected function get_default_repeater_title_setting_key() {
		return 'tab_title';
	}

	protected function get_default_children_title() {
		return esc_html__( 'Tab #%d', 'elementor' );
	}

	protected function get_default_children_placeholder_selector() {
		return '.elementor-tabs-content-wrapper';
	}

	protected function get_html_wrapper_class() {
		return 'elementor-widget-tabs-v2';
	}

	protected function register_controls() {
		$this->start_controls_section( 'section_tabs', [
			'label' => esc_html__( 'Tabs', 'elementor' ),
		] );

		$repeater = new Repeater();

		$repeater->add_control( 'tab_title', [
			'label' => esc_html__( 'Title', 'elementor' ),
			'type' => Controls_Manager::TEXT,
			'default' => esc_html__( 'Tab Title', 'elementor' ),
			'placeholder' => esc_html__( 'Tab Title', 'elementor' ),
			'label_block' => true,
			'dynamic' => [
				'active' => true,
			],
		] );

		$repeater->add_control(
			'selected_icon',
			[
				'label' => esc_html__( 'Icon', 'elementor' ),
				'type' => Controls_Manager::ICONS,
				'fa4compatibility' => 'icon',
				'skin' => 'inline',
				'label_block' => false,
			]
		);

		$repeater->add_control(
			'active_icon',
			[
				'label' => esc_html__( 'Icon Active', 'elementor' ),
				'type' => Controls_Manager::ICONS,
				'fa4compatibility' => 'icon',
				'skin' => 'inline',
				'label_block' => false,
				'condition' => [
					'selected_icon[value]!' => '',
				],
			]
		);

		$repeater->add_control(
			'_element_id',
			[
				'label' => esc_html__( 'CSS ID', 'elementor' ),
				'type' => Controls_Manager::TEXT,
				'default' => '',
				'dynamic' => [
					'active' => true,
				],
				'title' => esc_html__( 'Add your custom id WITHOUT the Pound key. e.g: my-id', 'elementor' ),
				'style_transfer' => false,
				'classes' => 'elementor-control-direction-ltr',
			]
		);

		$this->add_control( 'tabs', [
			'label' => esc_html__( 'Tabs Items', 'elementor' ),
			'type' => Control_Nested_Repeater::CONTROL_TYPE,
			'fields' => $repeater->get_controls(),
			'default' => [
				[
					'tab_title' => esc_html__( 'Tab #1', 'elementor' ),
				],
				[
					'tab_title' => esc_html__( 'Tab #2', 'elementor' ),
				],
			],
			'title_field' => '{{{ tab_title }}}',
		] );

		$this->add_control( 'position', [
			'label' => esc_html__( 'Position', 'elementor' ),
			'type' => Controls_Manager::SELECT,
			'default' => 'horizontal',
			'options' => [
				'horizontal' => esc_html__( 'Horizontal', 'elementor' ),
				'vertical' => esc_html__( 'Vertical', 'elementor' ),
			],
			'prefix_class' => 'elementor-tabs-view-',
			'separator' => 'before',
		] );

		$this->add_control( 'tabs_align_horizontal', [
			'label' => esc_html__( 'Alignment', 'elementor' ),
			'type' => Controls_Manager::CHOOSE,
			'options' => [
				'' => [
					'title' => esc_html__( 'Start', 'elementor' ),
					'icon' => 'eicon-h-align-left',
				],
				'center' => [
					'title' => esc_html__( 'Center', 'elementor' ),
					'icon' => 'eicon-h-align-center',
				],
				'end' => [
					'title' => esc_html__( 'End', 'elementor' ),
					'icon' => 'eicon-h-align-right',
				],
				'stretch' => [
					'title' => esc_html__( 'Justified', 'elementor' ),
					'icon' => 'eicon-h-align-stretch',
				],
			],
			'selectors_dictionary' => [
				'' => '',
				'center' => '--tabs-v2-wrapper-display: flex; --tabs-v2-wrapper-justify-content: center',
				'end' => '--tabs-v2-wrapper-display: flex; --tabs-v2-wrapper-justify-content: flex-end',
				'stretch' => '--tabs-v2-wrapper-display: flex; --tabs-v2-wrapper-justify-content: stretch; --tabs-v2-wrapper-title-size: 100%;',
			],
			'selectors' => [
				'{{WRAPPER}}' => '{{VALUE}}',
			],
			'prefix_class' => 'elementor-tabs-alignment-',
			'condition' => [
				'position' => 'horizontal',
			],
		] );

		$this->add_control( 'tabs_align_vertical', [
			'label' => esc_html__( 'Alignment', 'elementor' ),
			'type' => Controls_Manager::CHOOSE,
			'options' => [
				'' => [
					'title' => esc_html__( 'Start', 'elementor' ),
					'icon' => 'eicon-v-align-top',
				],
				'center' => [
					'title' => esc_html__( 'Center', 'elementor' ),
					'icon' => 'eicon-v-align-middle',
				],
				'end' => [
					'title' => esc_html__( 'End', 'elementor' ),
					'icon' => 'eicon-v-align-bottom',
				],
				'stretch' => [
					'title' => esc_html__( 'Justified', 'elementor' ),
					'icon' => 'eicon-v-align-stretch',
				],
			],
			'prefix_class' => 'elementor-tabs-alignment-',
			'condition' => [
				'position' => 'vertical',
			],
		] );

		$this->end_controls_section();

		$this->start_controls_section( 'section_tabs_style', [
			'label' => esc_html__( 'Tabs', 'elementor' ),
			'tab' => Controls_Manager::TAB_STYLE,
		] );

		$this->add_control( 'navigation_width', [
			'label' => esc_html__( 'Navigation Width', 'elementor' ),
			'type' => Controls_Manager::SLIDER,
			'default' => [
				'unit' => '%',
			],
			'range' => [
				'%' => [
					'min' => 10,
					'max' => 50,
				],
			],
			'selectors' => [
				'{{WRAPPER}}' => '--tabs-v2-vertical-navigation-width: {{SIZE}}{{UNIT}}',
			],
			'condition' => [
				'type' => 'vertical',
			],
		] );

		$this->add_control( 'border_width', [
			'label' => esc_html__( 'Border Width', 'elementor' ),
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
			'label' => esc_html__( 'Border Color', 'elementor' ),
			'type' => Controls_Manager::COLOR,
			'selectors' => [
				'{{WRAPPER}}' => '--tabs-v2-border-color: {{VALUE}};',
			],
		] );

		$this->add_control( 'background_color', [
			'label' => esc_html__( 'Background Color', 'elementor' ),
			'type' => Controls_Manager::COLOR,
			'selectors' => [
				'{{WRAPPER}}' => '--tabs-v2-background-color: {{VALUE}};',
			],
		] );

		$this->add_control( 'heading_title', [
			'label' => esc_html__( 'Title', 'elementor' ),
			'type' => Controls_Manager::HEADING,
			'separator' => 'before',
		] );

		$this->add_control( 'tab_color', [
			'label' => esc_html__( 'Color', 'elementor' ),
			'type' => Controls_Manager::COLOR,
			'selectors' => [
				'{{WRAPPER}}' => '--tabs-v2-title-color: {{VALUE}};',
			],
			'global' => [
				'default' => Global_Colors::COLOR_PRIMARY,
			],
		] );

		$this->add_control( 'tab_active_color', [
			'label' => esc_html__( 'Active Color', 'elementor' ),
			'type' => Controls_Manager::COLOR,
			'selectors' => [
				'{{WRAPPER}}' => '--tabs-v2-title-active-color: {{VALUE}};',
			],
			'global' => [
				'default' => Global_Colors::COLOR_ACCENT,
			],
		] );

		$this->add_group_control( Group_Control_Typography::get_type(), [
			'name' => 'tab_typography',
			'global' => [
				'default' => Global_Typography::TYPOGRAPHY_PRIMARY,
			],
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

	protected function render() {
		// Copied from tabs.php
		$tabs = $this->get_settings_for_display( 'tabs' );

		$id_int = substr( $this->get_id_int(), 0, 3 );

		$a11y_improvements_experiment = Plugin::$instance->experiments->is_feature_active( 'a11y_improvements' );

		$this->add_render_attribute( 'elementor-tabs', 'class', 'elementor-tabs' );

		$tabs_title_html = '';
		$tabs_content_html = '';
		$icon_html = '';

		foreach ( $tabs as $index => $item ) {
			// Tabs title.
			$tab_count = $index + 1;
			$tab_title_setting_key = $this->get_repeater_setting_key( 'tab_title', 'tabs', $index );
			$tab_title = $a11y_improvements_experiment ? $item['tab_title'] : '<a href="">' . $item['tab_title'] . '</a>';
			$tab_title_mobile_setting_key = $this->get_repeater_setting_key( 'tab_title_mobile', 'tabs', $tab_count );
			$tab_id = $item['_element_id'];

			$this->add_render_attribute( $tab_title_setting_key, [
				'id' => 'elementor-tab-title-' . $id_int . $tab_count,
				'class' => [ 'elementor-tab-title', 'elementor-tab-desktop-title' ],
				'aria-selected' => 1 === $tab_count ? 'true' : 'false',
				'data-tab' => $tab_count,
				'role' => 'tab',
				'tabindex' => 1 === $tab_count ? '0' : '-1',
				'aria-controls' => 'elementor-tab-content-' . $id_int . $tab_count,
				'aria-expanded' => 'false',
				'id' => $tab_id,
			] );

			$this->add_render_attribute( $tab_title_mobile_setting_key, [
				'class' => [ 'elementor-tab-title', 'elementor-tab-mobile-title' ],
				'aria-selected' => 1 === $tab_count ? 'true' : 'false',
				'data-tab' => $tab_count,
				'role' => 'tab',
				'tabindex' => 1 === $tab_count ? '0' : '-1',
				'aria-controls' => 'elementor-tab-content-' . $id_int . $tab_count,
				'aria-expanded' => 'false',
				'id' => $tab_id,
			] );

			$this->add_render_attribute( 'icon-selected', 'class', 'elementor-icon-selected' );
			$this->add_render_attribute( 'icon-active', 'class', 'elementor-icon-active' );

			$title_render_attributes = $this->get_render_attribute_string( $tab_title_setting_key );
			$mobile_title_attributes = $this->get_render_attribute_string( $tab_title_mobile_setting_key );
			$tab_icon_attributes = $this->get_render_attribute_string( 'icon-selected' );
			$tab_icon_active_attributes = $this->get_render_attribute_string( 'icon-active' );

			$icon_html = Icons_Manager::try_get_icon_html( $item['selected_icon'], [ 'aria-hidden' => 'true' ] );
			$icon_active_html = $icon_html;
			if ( $this->is_active_icon_exist( $item ) ) {
				$icon_active_html = Icons_Manager::try_get_icon_html( $item['active_icon'], [ 'aria-hidden' => 'true' ] );
			}

			$tabs_title_html .= "<div $title_render_attributes>";
			$tabs_title_html .= "	<span $tab_icon_attributes> $icon_html</span>";
			$tabs_title_html .= "	<span $tab_icon_active_attributes> $icon_active_html</span>";
			$tabs_title_html .= "	<span>$tab_title</span>";
			$tabs_title_html .= '</div>';

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
				var tabCount = index + 1;
				tabUid = elementUid + tabCount;
				tabTitleKey = 'tab-title-' + tabUid;
				iconSelected = elementor.helpers.renderIcon( view, item.selected_icon, { 'aria-hidden': true }, 'i' , 'object' );
				iconActive = iconSelected;
				if ( '' !== item.active_icon.value ){
					iconActive = elementor.helpers.renderIcon( view, item.active_icon, { 'aria-hidden': true }, 'i' , 'object' );
				}
				tabId= 'elementor-tab-title-' + tabUid;
				if ( '' !== item._element_id ){
					tabId = item._element_id;
				}

				view.addRenderAttribute( tabTitleKey, {
				'id': tabId,
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
				<div {{{ view.getRenderAttributeString( tabTitleKey ) }}}>
					<span class="elementor-icon-selected">{{{ iconSelected.value }}}</span>
					<span class="elementor-icon-active">{{{ iconActive.value }}}</span>
					<span>{{{ item.tab_title }}}</span>
				</div>
				<# } ); #>
			</div>
			<div class="elementor-tabs-content-wrapper">
			</div>
			<# } #>
		</div>
		<?php
	}

	/**
	 * @param $item
	 * @return bool
	 */
	private function is_active_icon_exist( $item ) {
		return array_key_exists( 'active_icon', $item ) && ! empty( $item['active_icon'] ) && ! empty( $item['active_icon']['value'] );
	}
}
