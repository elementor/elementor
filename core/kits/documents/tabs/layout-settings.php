<?php
namespace Elementor\Core\Kits\Documents\Tabs;

use Elementor\DB;
use Elementor\Plugin;
use Elementor\Controls_Manager;
use Elementor\Core\Responsive\Responsive;
use Elementor\Modules\PageTemplates\Module as PageTemplatesModule;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly
}

class Layout_Settings extends Tab_Base {

	public function get_id() {
		return 'layout-settings';
	}

	public function get_title() {
		return __( 'Layout', 'elementor' );
	}

	public function register_tab_controls() {
		$default_breakpoints = Responsive::get_default_breakpoints();

		$this->start_controls_section(
			'section_' . $this->get_id(),
			[
				'label' => $this->get_title(),
				'tab' => $this->get_id(),
			]
		);

		$this->add_control(
			'default_generic_fonts',
			[
				'label' => __( 'Default Generic Fonts', 'elementor' ),
				'type' => Controls_Manager::TEXT,
				'default' => 'Sans-serif',
				'description' => __( 'The list of fonts used if the chosen font is not available.', 'elementor' ),
				'label_block' => true,
			]
		);

		$this->add_responsive_control(
			'container_width',
			[
				'label' => __( 'Content Width', 'elementor' ) . ' (px)',
				'type' => Controls_Manager::SLIDER,
				'default' => [
					'size' => '1140',
				],
				'tablet_default' => [
					'size' => $default_breakpoints['lg'],
				],
				'mobile_default' => [
					'size' => $default_breakpoints['md'],
				],
				'range' => [
					'px' => [
						'min' => 300,
						'max' => 1500,
						'step' => 10,
					],
				],
				'description' => __( 'Sets the default width of the content area (Default: 1140)', 'elementor' ),
				'selectors' => [
					'.elementor-section.elementor-section-boxed > .elementor-container' => 'max-width: {{SIZE}}{{UNIT}}',
				],
			]
		);

		$this->add_control(
			'space_between_widgets',
			[
				'label' => __( 'Widgets Space', 'elementor' ) . ' (px)',
				'type' => Controls_Manager::SLIDER,
				'default' => [
					'size' => 20,
				],
				'range' => [
					'px' => [
						'min' => 0,
						'max' => 40,
					],
				],
				'placeholder' => '20',
				'description' => __( 'Sets the default space between widgets (Default: 20)', 'elementor' ),
				'selectors' => [
					'.elementor-widget:not(:last-child)' => 'margin-bottom: {{SIZE}}{{UNIT}}',
				],
			]
		);

		$this->add_control(
			'page_title_selector',
			[
				'label' => __( 'Page Title Selector', 'elementor' ),
				'type' => Controls_Manager::TEXT,
				'default' => 'h1.entry-title',
				'placeholder' => 'h1.entry-title',
				'description' => __( 'Elementor lets you hide the page title. This works for themes that have "h1.entry-title" selector. If your theme\'s selector is different, please enter it above.', 'elementor' ),
				'label_block' => true,
				'selectors' => [
					// Hack to convert the value into a CSS selector.
					'' => '}{{VALUE}}{display: var(--page-title-display)',
				],
			]
		);

		$this->add_control(
			'stretched_section_container',
			[
				'label' => __( 'Stretched Section Fit To', 'elementor' ),
				'type' => Controls_Manager::TEXT,
				'placeholder' => 'body',
				'description' => __( 'Enter parent element selector to which stretched sections will fit to (e.g. #primary / .wrapper / main etc). Leave blank to fit to page width.', 'elementor' ),
				'label_block' => true,
				'frontend_available' => true,
			]
		);

		/**
		 * @var PageTemplatesModule $page_templates_module
		 */
		$page_templates_module = Plugin::$instance->modules_manager->get_modules( 'page-templates' );

		$page_templates_module->add_template_controls( $this->parent, 'default_page_template', false );

		$this->add_control(
			'breakpoints_heading',
			[
				'label' => __( 'Breakpoints', 'elementor' ),
				'type' => Controls_Manager::HEADING,
				'separator' => 'before',
			]
		);

		$this->add_control(
			'viewport_lg',
			[
				'label' => __( 'Tablet', 'elementor' ),
				'type' => Controls_Manager::SLIDER,
				'default' => [
					'size' => $default_breakpoints['lg'],
				],
				'range' => [
					'px' => [
						'min' => $default_breakpoints['md'] + 1,
						'max' => $default_breakpoints['xl'] - 1,
					],
				],
				/* translators: %d: Breakpoint value */
				'desc' => sprintf( __( 'Sets the breakpoint between desktop and tablet devices. Below this breakpoint tablet layout will appear (Default: %dpx).', 'elementor' ), $default_breakpoints['lg'] ),
			]
		);

		$this->add_control(
			'viewport_md',
			[
				'label' => __( 'Mobile', 'elementor' ),
				'type' => Controls_Manager::SLIDER,
				'default' => [
					'size' => $default_breakpoints['md'],
				],
				'range' => [
					'px' => [
						'min' => $default_breakpoints['sm'] + 1,
						'max' => $default_breakpoints['lg'] - 1,
					],
				],
				/* translators: %d: Breakpoint value */
				'desc' => sprintf( __( 'Sets the breakpoint between tablet and mobile devices. Below this breakpoint mobile layout will appear (Default: %dpx).', 'elementor' ), $default_breakpoints['md'] ),
			]
		);

		$this->end_controls_section();
	}

	public function on_save( $data ) {
		if ( ! isset( $data['settings'] ) || DB::STATUS_PUBLISH !== $data['settings']['post_status'] ) {
			return;
		}

		$should_compile_css = false;

		foreach ( Responsive::get_editable_breakpoints() as $breakpoint_key => $breakpoint ) {
			$setting_key = "viewport_{$breakpoint_key}";
			if ( isset( $data['settings'][ $setting_key ] ) ) {
				$should_compile_css = true;
			}
		}

		if ( $should_compile_css ) {
			Responsive::compile_stylesheet_templates();
		}
	}
}
