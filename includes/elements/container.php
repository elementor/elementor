<?php
namespace Elementor\Includes\Elements;

use Elementor\Controls_Manager;
use Elementor\Core\Breakpoints\Manager as Breakpoints_Manager;
use Elementor\Element_Base;
use Elementor\Embed;
use Elementor\Group_Control_Background;
use Elementor\Group_Control_Border;
use Elementor\Group_Control_Box_Shadow;
use Elementor\Group_Control_Css_Filter;
use Elementor\Group_Control_Flex_Container;
use Elementor\Group_Control_Flex_Item;
use Elementor\Plugin;
use Elementor\Shapes;
use Elementor\Utils;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Container extends Element_Base {

	/**
	 * @var \Elementor\Core\Kits\Documents\Kit
	 */
	private $active_kit;

	/**
	 * Container constructor.
	 *
	 * @param array      $data
	 * @param array|null $args
	 *
	 * @return void
	 */
	public function __construct( array $data = [], array $args = null ) {
		parent::__construct( $data, $args );

		$this->active_kit = Plugin::$instance->kits_manager->get_active_kit();
	}

	/**
	 * Get the element type.
	 *
	 * @return string
	 */
	public static function get_type() {
		return 'container';
	}

	/**
	 * Get the element name.
	 *
	 * @return string
	 */
	public function get_name() {
		return 'container';
	}

	/**
	 * Get the element display name.
	 *
	 * @return string
	 */
	public function get_title() {
		return esc_html__( 'Container', 'elementor' );
	}

	/**
	 * Get the element display icon.
	 *
	 * @return string
	 */
	public function get_icon() {
		return 'eicon-container';
	}

	/**
	 * Override the render attributes to add a custom wrapper class.
	 *
	 * @return void
	 */
	protected function add_render_attributes() {
		parent::add_render_attributes();

		$this->add_render_attribute( '_wrapper', [
			'class' => [
				'e-con',
			],
		] );
	}

	/**
	 * Override the initial element config to display the Container in the panel.
	 *
	 * @return array
	 */
	protected function get_initial_config() {
		$config = parent::get_initial_config();

		$config['controls'] = $this->get_controls();
		$config['tabs_controls'] = $this->get_tabs_controls();
		$config['show_in_panel'] = true;
		$config['categories'] = [ 'layout' ];

		return $config;
	}

	/**
	 * Render the element JS template.
	 *
	 * @return void
	 */
	protected function content_template() {
		?>
		<# if ( 'boxed' === settings.content_width ) { #>
			<div class="e-con-inner">
		<#
		}
		if ( settings.background_video_link ) {
			let videoAttributes = 'autoplay muted playsinline';

			if ( ! settings.background_play_once ) {
				videoAttributes += ' loop';
			}

			view.addRenderAttribute( 'background-video-container', 'class', 'elementor-background-video-container' );

			if ( ! settings.background_play_on_mobile ) {
				view.addRenderAttribute( 'background-video-container', 'class', 'elementor-hidden-phone' );
			}
			#>
			<div {{{ view.getRenderAttributeString( 'background-video-container' ) }}}>
				<div class="elementor-background-video-embed"></div>
				<video class="elementor-background-video-hosted elementor-html5-video" {{ videoAttributes }}></video>
			</div>
		<# } #>
		<div class="elementor-shape elementor-shape-top"></div>
		<div class="elementor-shape elementor-shape-bottom"></div>
		<# if ( 'boxed' === settings.content_width ) { #>
			</div>
		<# } #>
		<?php
	}

	/**
	 * Render the video background markup.
	 *
	 * @return void
	 */
	private function render_video_background() {
		$settings = $this->get_settings_for_display();

		if ( 'video' !== $settings['background_background'] ) {
			return;
		}

		if ( ! $settings['background_video_link'] ) {
			return;
		}

		$video_properties = Embed::get_video_properties( $settings['background_video_link'] );

		$this->add_render_attribute( 'background-video-container', 'class', 'elementor-background-video-container' );

		if ( ! $settings['background_play_on_mobile'] ) {
			$this->add_render_attribute( 'background-video-container', 'class', 'elementor-hidden-phone' );
		}

		?><div <?php $this->print_render_attribute_string( 'background-video-container' ); ?>>
			<?php if ( $video_properties ) : ?>
				<div class="elementor-background-video-embed"></div>
				<?php
			else :
				$video_tag_attributes = 'autoplay muted playsinline';

				if ( 'yes' !== $settings['background_play_once'] ) {
					$video_tag_attributes .= ' loop';
				}
				?>
				<video class="elementor-background-video-hosted elementor-html5-video" <?php echo esc_attr( $video_tag_attributes ); ?>></video>
			<?php endif; ?>
		</div><?php
	}

	/**
	 * Render the Container's shape divider.
	 * TODO: Copied from `section.php`.
	 *
	 * Used to generate the shape dividers HTML.
	 *
	 * @param string $side - Shape divider side, used to set the shape key.
	 *
	 * @return void
	 */
	private function render_shape_divider( $side ) {
		$settings = $this->get_active_settings();
		$base_setting_key = "shape_divider_$side";
		$negative = ! empty( $settings[ $base_setting_key . '_negative' ] );
		$shape_path = Shapes::get_shape_path( $settings[ $base_setting_key ], $negative );

		if ( ! is_file( $shape_path ) || ! is_readable( $shape_path ) ) {
			return;
		}
		?>
		<div class="elementor-shape elementor-shape-<?php echo esc_attr( $side ); ?>" data-negative="<?php
			Utils::print_unescaped_internal_string( $negative ? 'true' : 'false' );
		?>">
			<?php
			// PHPCS - The file content is being read from a strict file path structure.
			echo Utils::file_get_contents( $shape_path ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
			?>
		</div>
		<?php
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

		?><<?php $this->print_html_tag(); ?> <?php $this->print_render_attribute_string( '_wrapper' ); ?>>
		<?php
		if ( $this->is_boxed_container( $settings ) ) { ?>
			<div class="e-con-inner">
		<?php }

		$this->render_video_background();

		if ( ! empty( $settings['shape_divider_top'] ) ) {
			$this->render_shape_divider( 'top' );
		}

		if ( ! empty( $settings['shape_divider_bottom'] ) ) {
			$this->render_shape_divider( 'bottom' );
		}
	}

	/**
	 * After rendering the Container content. (Print the closing tag, etc.)
	 *
	 * @return void
	 */
	public function after_render() {
		$settings = $this->get_settings_for_display();
		if ( $this->is_boxed_container( $settings ) ) { ?>
			</div>
		<?php } ?>
		</<?php $this->print_html_tag(); ?>>
		<?php
	}

	private function is_boxed_container( array $settings ) {
		return ! empty( $settings['content_width'] ) && 'boxed' === $settings['content_width'];
	}

	/**
	 * Override the default child type to allow widgets & containers as children.
	 *
	 * @param array $element_data
	 *
	 * @return \Elementor\Element_Base|\Elementor\Widget_Base|null
	 */
	protected function _get_default_child_type( array $element_data ) {
		if ( 'container' === $element_data['elType'] ) {
			return Plugin::$instance->elements_manager->get_element_types( 'container' );
		}

		return Plugin::$instance->widgets_manager->get_widget_types( $element_data['widgetType'] );
	}

	/**
	 * Register the Container's layout controls.
	 *
	 * @return void
	 */
	protected function register_container_layout_controls() {
		$this->start_controls_section(
			'section_layout_container',
			[
				'label' => esc_html__( 'Container', 'elementor' ),
				'tab' => Controls_Manager::TAB_LAYOUT,
			]
		);

		$active_breakpoints = Plugin::$instance->breakpoints->get_active_breakpoints();

		if ( array_key_exists( Breakpoints_Manager::BREAKPOINT_KEY_MOBILE_EXTRA, $active_breakpoints ) ) {
			$min_affected_device = Breakpoints_Manager::BREAKPOINT_KEY_MOBILE_EXTRA;
		} else {
			$min_affected_device = Breakpoints_Manager::BREAKPOINT_KEY_TABLET;
		}

		$this->add_control(
			'content_width',
			[
				'label' => esc_html__( 'Content Width', 'elementor' ),
				'type' => Controls_Manager::SELECT,
				'default' => 'boxed',
				'options' => [
					'boxed' => esc_html__( 'Boxed', 'elementor' ),
					'full' => esc_html__( 'Full Width', 'elementor' ),
				],
				'render_type' => 'template',
				'prefix_class' => 'e-con-',
				'frontend_available' => true,
			]
		);

		$width_control_settings = [
			'label' => esc_html__( 'Width', 'elementor' ),
			'type' => Controls_Manager::SLIDER,
			'size_units' => [ 'px', '%', 'em', 'rem', 'vw', 'custom' ],
			'range' => [
				'px' => [
					'min' => 500,
					'max' => 1600,
				],
				'%' => [
					'min' => 0,
					'max' => 100,
				],
				'vw' => [
					'min' => 0,
					'max' => 100,
				],
			],
			'default' => [
				'unit' => '%',
			],
			'min_affected_device' => [
				Breakpoints_Manager::BREAKPOINT_KEY_DESKTOP => $min_affected_device,
				Breakpoints_Manager::BREAKPOINT_KEY_LAPTOP => $min_affected_device,
				Breakpoints_Manager::BREAKPOINT_KEY_TABLET_EXTRA => $min_affected_device,
				Breakpoints_Manager::BREAKPOINT_KEY_TABLET => $min_affected_device,
				Breakpoints_Manager::BREAKPOINT_KEY_MOBILE_EXTRA => $min_affected_device,
			],
			'separator' => 'none',
		];

		$this->add_responsive_control(
			'width',
			array_merge( $width_control_settings, [
				'selectors' => [
					'{{WRAPPER}}' => '--width: {{SIZE}}{{UNIT}};',
				],
				'condition' => [
					'content_width' => 'full',
				],
				'device_args' => [
					Breakpoints_Manager::BREAKPOINT_KEY_DESKTOP => [
						'placeholder' => [
							'size' => 100,
							'unit' => '%',
						],
					],
					Breakpoints_Manager::BREAKPOINT_KEY_MOBILE => [
						// The mobile width is not inherited from the higher breakpoint width controls.
						'placeholder' => [
							'size' => 100,
							'unit' => '%',
						],
					],
				],
			] )
		);

		$this->add_responsive_control(
			'boxed_width',
			array_merge( $width_control_settings, [
				'selectors' => [
					'{{WRAPPER}}' => '--content-width: {{SIZE}}{{UNIT}};',
				],
				'condition' => [
					'content_width' => 'boxed',
				],
				'default' => [
					'unit' => 'px',
				],
				'device_args' => [
					Breakpoints_Manager::BREAKPOINT_KEY_DESKTOP => [
						// Use the default width from the kit as a placeholder.
						'placeholder' => $this->active_kit->get_settings_for_display( 'container_width' ),
					],
					Breakpoints_Manager::BREAKPOINT_KEY_MOBILE => [
						// The mobile width is not inherited from the higher breakpoint width controls.
						'placeholder' => [
							'size' => 100,
							'unit' => '%',
						],
					],
				],
			] )
		);

		$this->add_responsive_control(
			'min_height',
			[
				'label' => esc_html__( 'Min Height', 'elementor' ),
				'type' => Controls_Manager::SLIDER,
				'size_units' => [ 'px', 'em', 'rem', 'vh', 'custom' ],
				'range' => [
					'px' => [
						'min' => 0,
						'max' => 1440,
					],
					'vh' => [
						'min' => 0,
						'max' => 100,
					],
				],
				'description' => sprintf(
					esc_html__( 'To achieve full height Container use %s.', 'elementor' ),
					'100vh'
				),
				'selectors' => [
					'{{WRAPPER}}' => '--min-height: {{SIZE}}{{UNIT}};',
				],
			]
		);

		$this->add_group_control(
			Group_Control_Flex_Container::get_type(),
			[
				'name' => 'flex',
				'selector' => '{{WRAPPER}}',
				'fields_options' => [
					'gap' => [
						'label' => esc_html_x( 'Gap between elements', 'Flex Container Control', 'elementor' ),
						'device_args' => [
							Breakpoints_Manager::BREAKPOINT_KEY_DESKTOP => [
								// Use the default gap from the kit as a placeholder.
								'placeholder' => $this->active_kit->get_settings_for_display( 'space_between_widgets' ),
							],
						],
					],
				],
			]
		);

		$this->end_controls_section();
	}

	/**
	 * Register the Container's items layout controls.
	 *
	 * @return void
	 */
	protected function register_items_layout_controls() {
		$this->start_controls_section(
			'section_layout_additional_options',
			[
				'label' => esc_html__( 'Additional Options', 'elementor' ),
				'tab' => Controls_Manager::TAB_LAYOUT,
			]
		);

		$this->add_control(
			'overflow',
			[
				'label' => esc_html__( 'Overflow', 'elementor' ),
				'type' => Controls_Manager::SELECT,
				'default' => '',
				'options' => [
					'' => esc_html__( 'Default', 'elementor' ),
					'hidden' => esc_html__( 'Hidden', 'elementor' ),
					'auto' => esc_html__( 'Auto', 'elementor' ),
				],
				'selectors' => [
					'{{WRAPPER}}' => '--overflow: {{VALUE}}',
				],
			]
		);

		$possible_tags = [
			'div' => 'div',
			'header' => 'header',
			'footer' => 'footer',
			'main' => 'main',
			'article' => 'article',
			'section' => 'section',
			'aside' => 'aside',
			'nav' => 'nav',
			'a' => 'a ' . esc_html__( '(link)', 'elementor' ),
		];

		$options = [
			'' => esc_html__( 'Default', 'elementor' ),
		] + $possible_tags;

		$this->add_control(
			'html_tag',
			[
				'label' => esc_html__( 'HTML Tag', 'elementor' ),
				'type' => Controls_Manager::SELECT,
				'options' => $options,
			]
		);

		$this->add_control(
			'link_note',
			[
				'type' => Controls_Manager::RAW_HTML,
				'content_classes' => 'elementor-panel-alert elementor-panel-alert-warning',
				'raw' => esc_html__( 'Don’t add links to elements nested in this container - it will break the layout.', 'elementor' ),
				'condition' => [
					'html_tag' => 'a',
				],
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
	}

	/**
	 * Register the Container's layout tab.
	 *
	 * @return void
	 */
	protected function register_layout_tab() {
		$this->register_container_layout_controls();

		$this->register_items_layout_controls();
	}

	/**
	 * Register the Container's background controls.
	 *
	 * @return void
	 */
	protected function register_background_controls() {
		$this->start_controls_section(
			'section_background',
			[
				'label' => esc_html__( 'Background', 'elementor' ),
				'tab' => Controls_Manager::TAB_STYLE,
			]
		);

		$this->start_controls_tabs( 'tabs_background' );

		/**
		 * Normal.
		 */
		$this->start_controls_tab(
			'tab_background_normal',
			[
				'label' => esc_html__( 'Normal', 'elementor' ),
			]
		);

		$this->add_group_control(
			Group_Control_Background::get_type(),
			[
				'name' => 'background',
				'types' => [ 'classic', 'gradient', 'video', 'slideshow' ],
				'fields_options' => [
					'background' => [
						'frontend_available' => true,
					],
					'image' => [
						'background_lazyload' => [
							'active' => true,
							'keys' => [ 'background_image', 'url' ],
						],
					],
				],
			]
		);

		$this->end_controls_tab();

		/**
		 * Hover.
		 */
		$this->start_controls_tab(
			'tab_background_hover',
			[
				'label' => esc_html__( 'Hover', 'elementor' ),
			]
		);

		$this->add_group_control(
			Group_Control_Background::get_type(),
			[
				'name' => 'background_hover',
				'selector' => '{{WRAPPER}}:hover',
			]
		);

		$this->add_control(
			'background_hover_transition',
			[
				'label' => esc_html__( 'Transition Duration', 'elementor' ),
				'type' => Controls_Manager::SLIDER,
				'default' => [
					'size' => 0.3,
				],
				'render_type' => 'ui',
				'separator' => 'before',
				'selectors' => [
					'{{WRAPPER}}' => '--background-transition: {{SIZE}}s;',
				],
			]
		);

		$this->end_controls_tab();

		$this->end_controls_tabs();

		$this->end_controls_section();
	}

	/**
	 * Register the Container's background overlay controls.
	 *
	 * @return void
	 */
	protected function register_background_overlay_controls() {
		$this->start_controls_section(
			'section_background_overlay',
			[
				'label' => esc_html__( 'Background Overlay', 'elementor' ),
				'tab' => Controls_Manager::TAB_STYLE,
			]
		);

		$this->start_controls_tabs( 'tabs_background_overlay' );

		/**
		 * Normal.
		 */
		$this->start_controls_tab(
			'tab_background_overlay',
			[
				'label' => esc_html__( 'Normal', 'elementor' ),
			]
		);

		$background_overlay_selector = '{{WRAPPER}}::before, {{WRAPPER}} > .elementor-background-video-container::before, {{WRAPPER}} > .e-con-inner > .elementor-background-video-container::before, {{WRAPPER}} > .elementor-background-slideshow::before, {{WRAPPER}} > .e-con-inner > .elementor-background-slideshow::before, {{WRAPPER}} > .elementor-motion-effects-container > .elementor-motion-effects-layer::before';

		$this->add_group_control(
			Group_Control_Background::get_type(),
			[
				'name' => 'background_overlay',
				'selector' => $background_overlay_selector,
				'fields_options' => [
					'background' => [
						'selectors' => [
							// Hack to set the `::before` content in order to render it only when there is a background overlay.
							$background_overlay_selector => '--background-overlay: \'\';',
						],
					],
					'image' => [
						'background_lazyload' => [
							'active' => true,
							'keys' => [ 'background_overlay_image', 'url' ],
						],
					],
				],
			]
		);

		$this->add_responsive_control(
			'background_overlay_opacity',
			[
				'label' => esc_html__( 'Opacity', 'elementor' ),
				'type' => Controls_Manager::SLIDER,
				'default' => [
					'size' => .5,
				],
				'range' => [
					'px' => [
						'max' => 1,
						'step' => 0.01,
					],
				],
				'selectors' => [
					'{{WRAPPER}}' => '--overlay-opacity: {{SIZE}};',
				],
				'condition' => [
					'background_overlay_background' => [ 'classic', 'gradient' ],
				],
			]
		);

		$this->add_group_control(
			Group_Control_Css_Filter::get_type(),
			[
				'name' => 'css_filters',
				'selector' => '{{WRAPPER}}::before',
				'conditions' => [
					'relation' => 'or',
					'terms' => [
						[
							'name' => 'background_overlay_image[url]',
							'operator' => '!==',
							'value' => '',
						],
						[
							'name' => 'background_overlay_color',
							'operator' => '!==',
							'value' => '',
						],
					],
				],
			]
		);

		$this->add_control(
			'overlay_blend_mode',
			[
				'label' => esc_html__( 'Blend Mode', 'elementor' ),
				'type' => Controls_Manager::SELECT,
				'options' => [
					'' => esc_html__( 'Normal', 'elementor' ),
					'multiply' => esc_html__( 'Multiply', 'elementor' ),
					'screen' => esc_html__( 'Screen', 'elementor' ),
					'overlay' => esc_html__( 'Overlay', 'elementor' ),
					'darken' => esc_html__( 'Darken', 'elementor' ),
					'lighten' => esc_html__( 'Lighten', 'elementor' ),
					'color-dodge' => esc_html__( 'Color Dodge', 'elementor' ),
					'saturation' => esc_html__( 'Saturation', 'elementor' ),
					'color' => esc_html__( 'Color', 'elementor' ),
					'luminosity' => esc_html__( 'Luminosity', 'elementor' ),
				],
				'selectors' => [
					'{{WRAPPER}}' => '--overlay-mix-blend-mode: {{VALUE}}',
				],
				'conditions' => [
					'relation' => 'or',
					'terms' => [
						[
							'name' => 'background_overlay_image[url]',
							'operator' => '!==',
							'value' => '',
						],
						[
							'name' => 'background_overlay_color',
							'operator' => '!==',
							'value' => '',
						],
					],
				],
			]
		);

		$this->end_controls_tab();

		/**
		 * Hover.
		 */
		$this->start_controls_tab(
			'tab_background_overlay_hover',
			[
				'label' => esc_html__( 'Hover', 'elementor' ),
			]
		);

		$background_overlay_hover_selector = '{{WRAPPER}}:hover::before, {{WRAPPER}}:hover > .elementor-background-video-container::before, {{WRAPPER}}:hover > .e-con-inner > .elementor-background-video-container::before, {{WRAPPER}} > .elementor-background-slideshow:hover::before, {{WRAPPER}} > .e-con-inner > .elementor-background-slideshow:hover::before';

		$this->add_group_control(
			Group_Control_Background::get_type(),
			[
				'name' => 'background_overlay_hover',
				'selector' => $background_overlay_hover_selector,
				'fields_options' => [
					'background' => [
						'selectors' => [
							// Hack to set the `::before` content in order to render it only when there is a background overlay.
							$background_overlay_hover_selector => '--background-overlay: \'\';',
						],
					],
				],
			]
		);

		$this->add_responsive_control(
			'background_overlay_hover_opacity',
			[
				'label' => esc_html__( 'Opacity', 'elementor' ),
				'type' => Controls_Manager::SLIDER,
				'default' => [
					'size' => .5,
				],
				'range' => [
					'px' => [
						'max' => 1,
						'step' => 0.01,
					],
				],
				'selectors' => [
					'{{WRAPPER}}:hover' => '--overlay-opacity: {{SIZE}};',
				],
				'condition' => [
					'background_overlay_hover_background' => [ 'classic', 'gradient' ],
				],
			]
		);

		$this->add_group_control(
			Group_Control_Css_Filter::get_type(),
			[
				'name' => 'css_filters_hover',
				'selector' => '{{WRAPPER}}:hover::before',
			]
		);

		$this->add_control(
			'background_overlay_hover_transition',
			[
				'label' => esc_html__( 'Transition Duration', 'elementor' ),
				'type' => Controls_Manager::SLIDER,
				'range' => [
					'px' => [
						'max' => 3,
						'step' => 0.1,
					],
				],
				'render_type' => 'ui',
				'separator' => 'before',
				'selectors' => [
					'{{WRAPPER}}, {{WRAPPER}}::before' => '--overlay-transition: {{SIZE}}s;',
				],
			]
		);

		$this->end_controls_tab();

		$this->end_controls_tabs();

		$this->end_controls_section();
	}

	/**
	 * Register the Container's border controls.
	 *
	 * @return void
	 */
	protected function register_border_controls() {
		$this->start_controls_section(
			'section_border',
			[
				'label' => esc_html__( 'Border', 'elementor' ),
				'tab' => Controls_Manager::TAB_STYLE,
			]
		);

		$this->start_controls_tabs( 'tabs_border' );

		/**
		 * Normal.
		 */
		$this->start_controls_tab(
			'tab_border',
			[
				'label' => esc_html__( 'Normal', 'elementor' ),
			]
		);

		$this->add_group_control(
			Group_Control_Border::get_type(),
			[
				'name' => 'border',
			]
		);

		$this->add_responsive_control(
			'border_radius',
			[
				'label' => esc_html__( 'Border Radius', 'elementor' ),
				'type' => Controls_Manager::DIMENSIONS,
				'size_units' => [ 'px', '%', 'em', 'rem', 'custom' ],
				'selectors' => [
					'{{WRAPPER}}' => '--border-radius: {{TOP}}{{UNIT}} {{RIGHT}}{{UNIT}} {{BOTTOM}}{{UNIT}} {{LEFT}}{{UNIT}};',
				],
			]
		);

		$this->add_group_control(
			Group_Control_Box_Shadow::get_type(),
			[
				'name' => 'box_shadow',
			]
		);

		$this->end_controls_tab();

		/**
		 * Hover.
		 */
		$this->start_controls_tab(
			'tab_border_hover',
			[
				'label' => esc_html__( 'Hover', 'elementor' ),
			]
		);

		$this->add_group_control(
			Group_Control_Border::get_type(),
			[
				'name' => 'border_hover',
				'selector' => '{{WRAPPER}}:hover',
			]
		);

		$this->add_responsive_control(
			'border_radius_hover',
			[
				'label' => esc_html__( 'Border Radius', 'elementor' ),
				'type' => Controls_Manager::DIMENSIONS,
				'size_units' => [ 'px', '%', 'em', 'rem', 'custom' ],
				'selectors' => [
					'{{WRAPPER}}:hover' => '--border-radius: {{TOP}}{{UNIT}} {{RIGHT}}{{UNIT}} {{BOTTOM}}{{UNIT}} {{LEFT}}{{UNIT}};',
				],
			]
		);

		$this->add_group_control(
			Group_Control_Box_Shadow::get_type(),
			[
				'name' => 'box_shadow_hover',
				'selector' => '{{WRAPPER}}:hover',
			]
		);

		$this->add_control(
			'border_hover_transition',
			[
				'label' => esc_html__( 'Transition Duration', 'elementor' ),
				'type' => Controls_Manager::SLIDER,
				'separator' => 'before',
				'default' => [
					'size' => 0.3,
				],
				'range' => [
					'px' => [
						'max' => 3,
						'step' => 0.1,
					],
				],
				'conditions' => [
					'relation' => 'or',
					'terms' => [
						[
							'name' => 'background_background',
							'operator' => '!==',
							'value' => '',
						],
						[
							'name' => 'border_border',
							'operator' => '!==',
							'value' => '',
						],
					],
				],
				'selectors' => [
					'{{WRAPPER}}, {{WRAPPER}}::before' => '--border-transition: {{SIZE}}s;',
				],
			]
		);

		$this->end_controls_tab();

		$this->end_controls_tabs();

		$this->end_controls_section();
	}

	/**
	 * Register the Container's shape dividers controls.
	 * TODO: Copied from `section.php`.
	 *
	 * @return void
	 */
	protected function register_shape_dividers_controls() {
		$this->start_controls_section(
			'section_shape_divider',
			[
				'label' => esc_html__( 'Shape Divider', 'elementor' ),
				'tab' => Controls_Manager::TAB_STYLE,
			]
		);

		$this->start_controls_tabs( 'tabs_shape_dividers' );

		$shapes_options = [
			'' => esc_html__( 'None', 'elementor' ),
		];

		foreach ( Shapes::get_shapes() as $shape_name => $shape_props ) {
			$shapes_options[ $shape_name ] = $shape_props['title'];
		}

		foreach ( [
			'top' => esc_html__( 'Top', 'elementor' ),
			'bottom' => esc_html__( 'Bottom', 'elementor' ),
		] as $side => $side_label ) {
			$base_control_key = "shape_divider_$side";

			$this->start_controls_tab(
				"tab_$base_control_key",
				[
					'label' => $side_label,
				]
			);

			$this->add_control(
				$base_control_key,
				[
					'label' => esc_html__( 'Type', 'elementor' ),
					'type' => Controls_Manager::SELECT,
					'options' => $shapes_options,
					'render_type' => 'none',
					'frontend_available' => true,
				]
			);

			$this->add_control(
				$base_control_key . '_color',
				[
					'label' => esc_html__( 'Color', 'elementor' ),
					'type' => Controls_Manager::COLOR,
					'condition' => [
						"shape_divider_$side!" => '',
					],
					'selectors' => [
						"{{WRAPPER}} > .elementor-shape-$side .elementor-shape-fill, {{WRAPPER}} > .e-con-inner > .elementor-shape-$side .elementor-shape-fill" => 'fill: {{UNIT}};',
					],
				]
			);

			$this->add_responsive_control(
				$base_control_key . '_width',
				[
					'label' => esc_html__( 'Width', 'elementor' ),
					'type' => Controls_Manager::SLIDER,
					'default' => [
						'unit' => '%',
					],
					'tablet_default' => [
						'unit' => '%',
					],
					'mobile_default' => [
						'unit' => '%',
					],
					'range' => [
						'%' => [
							'min' => 100,
							'max' => 300,
						],
					],
					'condition' => [
						"shape_divider_$side" => array_keys( Shapes::filter_shapes( 'height_only', Shapes::FILTER_EXCLUDE ) ),
					],
					'selectors' => [
						"{{WRAPPER}} > .elementor-shape-$side svg, {{WRAPPER}} > .e-con-inner > .elementor-shape-$side svg" => 'width: calc({{SIZE}}{{UNIT}} + 1.3px)',
					],
				]
			);

			$this->add_responsive_control(
				$base_control_key . '_height',
				[
					'label' => esc_html__( 'Height', 'elementor' ),
					'type' => Controls_Manager::SLIDER,
					'range' => [
						'px' => [
							'max' => 500,
						],
					],
					'condition' => [
						"shape_divider_$side!" => '',
					],
					'selectors' => [
						"{{WRAPPER}} > .elementor-shape-$side svg, {{WRAPPER}} > .e-con-inner > .elementor-shape-$side svg" => 'height: {{SIZE}}{{UNIT}};',
					],
				]
			);

			$this->add_control(
				$base_control_key . '_flip',
				[
					'label' => esc_html__( 'Flip', 'elementor' ),
					'type' => Controls_Manager::SWITCHER,
					'condition' => [
						"shape_divider_$side" => array_keys( Shapes::filter_shapes( 'has_flip' ) ),
					],
					'selectors' => [
						"{{WRAPPER}} > .elementor-shape-$side svg, {{WRAPPER}} > .e-con-inner > .elementor-shape-$side svg" => 'transform: translateX(-50%) rotateY(180deg)',
					],
				]
			);

			$this->add_control(
				$base_control_key . '_negative',
				[
					'label' => esc_html__( 'Invert', 'elementor' ),
					'type' => Controls_Manager::SWITCHER,
					'frontend_available' => true,
					'condition' => [
						"shape_divider_$side" => array_keys( Shapes::filter_shapes( 'has_negative' ) ),
					],
					'render_type' => 'none',
				]
			);

			$this->add_control(
				$base_control_key . '_above_content',
				[
					'label' => esc_html__( 'Bring to Front', 'elementor' ),
					'type' => Controls_Manager::SWITCHER,
					'selectors' => [
						"{{WRAPPER}} > .elementor-shape-$side, {{WRAPPER}} > .e-con-inner > .elementor-shape-$side" => 'z-index: 2; pointer-events: none',
					],
					'condition' => [
						"shape_divider_$side!" => '',
					],
				]
			);

			$this->end_controls_tab();
		}

		$this->end_controls_tabs();

		$this->end_controls_section();
	}
	/**
	 * Register the Container's style tab.
	 *
	 * @return void
	 */
	protected function register_style_tab() {
		$this->register_background_controls();

		$this->register_background_overlay_controls();

		$this->register_border_controls();

		$this->register_shape_dividers_controls();
	}

	/**
	 * Register the Container's advanced style controls.
	 *
	 * @return void
	 */
	protected function register_advanced_controls() {
		$this->start_controls_section(
			'section_layout',
			[
				'label' => esc_html__( 'Layout', 'elementor' ),
				'tab' => Controls_Manager::TAB_ADVANCED,
			]
		);

		$this->add_responsive_control(
			'margin',
			[
				'label' => esc_html__( 'Margin', 'elementor' ),
				'type' => Controls_Manager::DIMENSIONS,
				'size_units' => [ 'px', '%', 'em', 'rem', 'vw', 'custom' ],
				'selectors' => [
					'{{WRAPPER}}' => '--margin-top: {{TOP}}{{UNIT}}; --margin-right: {{RIGHT}}{{UNIT}}; --margin-bottom: {{BOTTOM}}{{UNIT}}; --margin-left:{{LEFT}}{{UNIT}};',
				],
			]
		);

		$this->add_responsive_control(
			'padding',
			[
				'label' => esc_html__( 'Padding', 'elementor' ),
				'type' => Controls_Manager::DIMENSIONS,
				'size_units' => [ 'px', '%', 'em', 'rem', 'vw', 'custom' ],
				'selectors' => [
					'{{WRAPPER}}' => '--padding-top: {{TOP}}{{UNIT}}; --padding-right: {{RIGHT}}{{UNIT}}; --padding-bottom: {{BOTTOM}}{{UNIT}}; --padding-left: {{LEFT}}{{UNIT}};',
				],
			]
		);

		$this->add_group_control(
			Group_Control_Flex_Item::get_type(),
			[
				'name' => '_flex',
				'include' => [
					'align_self',
					'order',
					'order_custom',
					'size',
					'grow',
					'shrink',
				],
				'selector' => '{{WRAPPER}}.e-con', // Hack to increase specificity.
				'separator' => 'before',
			]
		);

		$this->add_control(
			'position_description',
			[
				'raw' => '<strong>' . esc_html__( 'Please note!', 'elementor' ) . '</strong> ' . esc_html__( 'Custom positioning is not considered best practice for responsive web design and should not be used too frequently.', 'elementor' ),
				'type' => Controls_Manager::RAW_HTML,
				'content_classes' => 'elementor-panel-alert elementor-panel-alert-warning',
				'render_type' => 'ui',
				'condition' => [
					'position!' => '',
				],
			]
		);

		// TODO: Copied from `common.php` - Extract to group control.
		$this->add_control(
			'position',
			[
				'label' => esc_html__( 'Position', 'elementor' ),
				'type' => Controls_Manager::SELECT,
				'default' => '',
				'options' => [
					'' => esc_html__( 'Default', 'elementor' ),
					'absolute' => esc_html__( 'Absolute', 'elementor' ),
					'fixed' => esc_html__( 'Fixed', 'elementor' ),
				],
				'selectors' => [
					'{{WRAPPER}}' => '--position: {{VALUE}};',
				],
				'frontend_available' => true,
				'separator' => 'before',
			]
		);

		$left = esc_html__( 'Left', 'elementor' );
		$right = esc_html__( 'Right', 'elementor' );

		$start = is_rtl() ? $right : $left;
		$end = ! is_rtl() ? $right : $left;

		$this->add_control(
			'_offset_orientation_h',
			[
				'label' => esc_html__( 'Horizontal Orientation', 'elementor' ),
				'type' => Controls_Manager::CHOOSE,
				'toggle' => false,
				'default' => 'start',
				'options' => [
					'start' => [
						'title' => $start,
						'icon' => 'eicon-h-align-left',
					],
					'end' => [
						'title' => $end,
						'icon' => 'eicon-h-align-right',
					],
				],
				'classes' => 'elementor-control-start-end',
				'render_type' => 'ui',
				'condition' => [
					'position!' => '',
				],
			]
		);

		$this->add_responsive_control(
			'_offset_x',
			[
				'label' => esc_html__( 'Offset', 'elementor' ),
				'type' => Controls_Manager::SLIDER,
				'range' => [
					'px' => [
						'min' => -1000,
						'max' => 1000,
						'step' => 1,
					],
					'%' => [
						'min' => -200,
						'max' => 200,
					],
					'vw' => [
						'min' => -200,
						'max' => 200,
					],
					'vh' => [
						'min' => -200,
						'max' => 200,
					],
				],
				'default' => [
					'size' => '0',
				],
				'size_units' => [ 'px', '%', 'em', 'rem', 'vw', 'vh', 'custom' ],
				'selectors' => [
					'body:not(.rtl) {{WRAPPER}}' => 'left: {{SIZE}}{{UNIT}}',
					'body.rtl {{WRAPPER}}' => 'right: {{SIZE}}{{UNIT}}',
				],
				'condition' => [
					'_offset_orientation_h!' => 'end',
					'position!' => '',
				],
			]
		);

		$this->add_responsive_control(
			'_offset_x_end',
			[
				'label' => esc_html__( 'Offset', 'elementor' ),
				'type' => Controls_Manager::SLIDER,
				'range' => [
					'px' => [
						'min' => -1000,
						'max' => 1000,
						'step' => 0.1,
					],
					'%' => [
						'min' => -200,
						'max' => 200,
					],
					'vw' => [
						'min' => -200,
						'max' => 200,
					],
					'vh' => [
						'min' => -200,
						'max' => 200,
					],
				],
				'default' => [
					'size' => '0',
				],
				'size_units' => [ 'px', '%', 'em', 'rem', 'vw', 'vh', 'custom' ],
				'selectors' => [
					'body:not(.rtl) {{WRAPPER}}' => 'right: {{SIZE}}{{UNIT}}',
					'body.rtl {{WRAPPER}}' => 'left: {{SIZE}}{{UNIT}}',
				],
				'condition' => [
					'_offset_orientation_h' => 'end',
					'position!' => '',
				],
			]
		);

		$this->add_control(
			'_offset_orientation_v',
			[
				'label' => esc_html__( 'Vertical Orientation', 'elementor' ),
				'type' => Controls_Manager::CHOOSE,
				'toggle' => false,
				'default' => 'start',
				'options' => [
					'start' => [
						'title' => esc_html__( 'Top', 'elementor' ),
						'icon' => 'eicon-v-align-top',
					],
					'end' => [
						'title' => esc_html__( 'Bottom', 'elementor' ),
						'icon' => 'eicon-v-align-bottom',
					],
				],
				'render_type' => 'ui',
				'condition' => [
					'position!' => '',
				],
			]
		);

		$this->add_responsive_control(
			'_offset_y',
			[
				'label' => esc_html__( 'Offset', 'elementor' ),
				'type' => Controls_Manager::SLIDER,
				'range' => [
					'px' => [
						'min' => -1000,
						'max' => 1000,
						'step' => 1,
					],
					'%' => [
						'min' => -200,
						'max' => 200,
					],
					'vh' => [
						'min' => -200,
						'max' => 200,
					],
					'vw' => [
						'min' => -200,
						'max' => 200,
					],
				],
				'size_units' => [ 'px', '%', 'em', 'rem', 'vh', 'vw', 'custom' ],
				'default' => [
					'size' => '0',
				],
				'selectors' => [
					'{{WRAPPER}}' => 'top: {{SIZE}}{{UNIT}}',
				],
				'condition' => [
					'_offset_orientation_v!' => 'end',
					'position!' => '',
				],
			]
		);

		$this->add_responsive_control(
			'_offset_y_end',
			[
				'label' => esc_html__( 'Offset', 'elementor' ),
				'type' => Controls_Manager::SLIDER,
				'range' => [
					'px' => [
						'min' => -1000,
						'max' => 1000,
						'step' => 1,
					],
					'%' => [
						'min' => -200,
						'max' => 200,
					],
					'vh' => [
						'min' => -200,
						'max' => 200,
					],
					'vw' => [
						'min' => -200,
						'max' => 200,
					],
				],
				'size_units' => [ 'px', '%', 'em', 'rem', 'vh', 'vw', 'custom' ],
				'default' => [
					'size' => '0',
				],
				'selectors' => [
					'{{WRAPPER}}' => 'bottom: {{SIZE}}{{UNIT}}',
				],
				'condition' => [
					'_offset_orientation_v' => 'end',
					'position!' => '',
				],
			]
		);

		$this->add_responsive_control(
			'z_index',
			[
				'label' => esc_html__( 'Z-Index', 'elementor' ),
				'type' => Controls_Manager::NUMBER,
				'min' => 0,
				'selectors' => [
					'{{WRAPPER}}' => '--z-index: {{VALUE}};',
				],
			]
		);

		$this->add_control(
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

		$this->add_control(
			'css_classes',
			[
				'label' => esc_html__( 'CSS Classes', 'elementor' ),
				'type' => Controls_Manager::TEXT,
				'default' => '',
				'dynamic' => [
					'active' => true,
				],
				'prefix_class' => '',
				'title' => esc_html__( 'Add your custom class WITHOUT the dot. e.g: my-class', 'elementor' ),
				'classes' => 'elementor-control-direction-ltr',
			]
		);

		$this->end_controls_section();
	}

	/**
	 * Register the Container's motion effects controls.
	 *
	 * @return void
	 */
	protected function register_motion_effects_controls() {
		$this->start_controls_section(
			'section_effects',
			[
				'label' => esc_html__( 'Motion Effects', 'elementor' ),
				'tab' => Controls_Manager::TAB_ADVANCED,
			]
		);

		$this->add_responsive_control(
			'animation',
			[
				'label' => esc_html__( 'Entrance Animation', 'elementor' ),
				'type' => Controls_Manager::ANIMATION,
				'frontend_available' => true,
			]
		);

		$this->add_control(
			'animation_duration',
			[
				'label' => esc_html__( 'Animation Duration', 'elementor' ),
				'type' => Controls_Manager::SELECT,
				'default' => '',
				'options' => [
					'slow' => esc_html__( 'Slow', 'elementor' ),
					'' => esc_html__( 'Normal', 'elementor' ),
					'fast' => esc_html__( 'Fast', 'elementor' ),
				],
				'prefix_class' => 'animated-',
				'condition' => [
					'animation!' => '',
				],
			]
		);

		$this->add_control(
			'animation_delay',
			[
				'label' => esc_html__( 'Animation Delay', 'elementor' ) . ' (ms)',
				'type' => Controls_Manager::NUMBER,
				'default' => '',
				'min' => 0,
				'step' => 100,
				'condition' => [
					'animation!' => '',
				],
				'render_type' => 'none',
				'frontend_available' => true,
			]
		);

		$this->end_controls_section();
	}

	/**
	 * Register the Container's responsive controls.
	 *
	 * @return void
	 */
	protected function register_responsive_controls() {
		$this->start_controls_section(
			'_section_responsive',
			[
				'label' => esc_html__( 'Responsive', 'elementor' ),
				'tab' => Controls_Manager::TAB_ADVANCED,
			]
		);

		$this->add_control(
			'heading_visibility',
			[
				'label' => esc_html__( 'Visibility', 'elementor' ),
				'type' => Controls_Manager::HEADING,
			]
		);

		$this->add_control(
			'responsive_description',
			[
				'raw' => esc_html__( 'Responsive visibility will take effect only on preview or live page, and not while editing in Elementor.', 'elementor' ),
				'type' => Controls_Manager::RAW_HTML,
				'content_classes' => 'elementor-descriptor',
			]
		);

		$this->add_hidden_device_controls();

		$this->end_controls_section();
	}

	/**
	 * Register the Container's advanced tab.
	 *
	 * @return void
	 */
	protected function register_advanced_tab() {
		$this->register_advanced_controls();

		$this->register_motion_effects_controls();

		$this->hook_sticky_notice_into_transform_section();

		$this->register_transform_section( 'con' );

		$this->register_responsive_controls();

		Plugin::$instance->controls_manager->add_custom_attributes_controls( $this );

		Plugin::$instance->controls_manager->add_custom_css_controls( $this );
	}

	protected function hook_sticky_notice_into_transform_section() {
		add_action( 'elementor/element/container/_section_transform/after_section_start', function( $container ) {
			$container->add_control(
				'transform_sticky_notice',
				[
					'type' => Controls_Manager::RAW_HTML,
					'raw' => esc_html__( 'Note: Avoid applying transform properties on sticky containers. Doing so might cause unexpected results.', 'elementor' ),
					'content_classes' => 'elementor-panel-alert elementor-panel-alert-warning',
				]
			);
		} );
	}

	/**
	 * Register the Container's controls.
	 *
	 * @return void
	 */
	protected function register_controls() {
		$this->register_layout_tab();
		$this->register_style_tab();
		$this->register_advanced_tab();
	}
}
